import { useCallback, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "./api";
import {
  applyRedline,
  documentDisplayName,
  isWordHost,
  readDocumentParagraphs,
  supportsTrackedChanges,
  type ApplyOutcome,
} from "./word";

type RiskLevel = "low" | "medium" | "high";

type AnalysisResult = {
  riskLevel: RiskLevel;
  summary: string;
  risks: Array<{
    level: RiskLevel;
    issue: string;
    exposureEstimate: number;
    recommendation: string;
    clauseExcerpt: string;
  }>;
  redlines: Array<{
    paragraphIndex: number;
    originalText: string;
    suggestedText: string;
    rationale: string;
  }>;
  redlinedText: string;
  totalExposure: number;
};

type SessionUser = { name: string | null; email: string | null };

const currency = (value: number) =>
  value > 0
    ? value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    : "—";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Webview clipboards can block the async API; fall back to execCommand.
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }
}

function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken()) {
        setCheckingSession(false);
        return;
      }
      try {
        const me = await api.auth.me.query();
        if (!cancelled && me) setUser({ name: me.name, email: me.email });
        if (!cancelled && !me) setToken(null);
      } catch {
        if (!cancelled) setToken(null);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <div className="pane">
      <header className="pane-header">
        <div className="brand-lockup">
          {/* The Lens, sitting directly on the navy header — no tile needed. */}
          <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
            <circle
              cx="32" cy="32" r="20" fill="none" stroke="#C6AD7C" strokeWidth="5"
              strokeDasharray="22 9.4" transform="rotate(-90 32 32)"
            />
            <circle cx="32" cy="32" r="5.5" fill="#C6AD7C" />
          </svg>
          <div>
            <p className="brand">Legal OS</p>
            <p className="brand-sub">Contract review</p>
          </div>
        </div>
        {user && (
          <button className="btn-ghost" onClick={signOut} title={user.email ?? undefined}>
            Sign out
          </button>
        )}
      </header>

      {checkingSession ? (
        <p className="muted pad">Checking session…</p>
      ) : user ? (
        <ReviewFlow />
      ) : (
        <LoginView onSignedIn={setUser} />
      )}

      <footer className="pane-footer">
        AI suggestions are decision support for qualified lawyers — not legal advice.
      </footer>
    </div>
  );
}

function LoginView({ onSignedIn }: { onSignedIn: (user: SessionUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { user, token } = await api.auth.tokenLogin.mutate({ email, password });
      setToken(token);
      onSignedIn({ name: user.name, email: user.email });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card pad stack" onSubmit={submit}>
      <h2>Sign in</h2>
      <p className="muted">Use your Legal OS account. New firm? Create the account in the web app first.</p>
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className="error-text">{error}</p>}
      <button className="btn-primary" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function ReviewFlow() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentText, setDocumentText] = useState<string>("");

  const inWord = useMemo(isWordHost, []);
  const tracked = useMemo(supportsTrackedChanges, []);

  const analyze = async () => {
    setError(null);
    setBusy(true);
    setStatus("Reading document…");
    try {
      const allParagraphs = await readDocumentParagraphs();
      // Keep original Word indexes — they anchor the redlines on apply.
      const paragraphs = allParagraphs.filter(paragraph => paragraph.text.length > 0);
      if (paragraphs.length === 0) {
        throw new Error("The document is empty — nothing to review.");
      }
      setDocumentText(paragraphs.map(paragraph => paragraph.text).join("\n\n"));
      setStatus("Analyzing with AI — this can take a minute for long agreements…");
      const result = await api.analysis.analyzeDocument.mutate({
        paragraphs,
        documentName: documentDisplayName(),
      });
      setAnalysis(result as AnalysisResult);
      setStatus(null);
    } catch (err) {
      setError(errorMessage(err));
      setStatus(null);
    } finally {
      setBusy(false);
    }
  };

  if (!inWord) {
    return (
      <div className="card pad stack">
        <h2>Open in Microsoft Word</h2>
        <p className="muted">
          This task pane needs the Word JavaScript API. Sideload the add-in in Word
          (see addin/README.md) — opening this page in a plain browser tab won't work.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="card pad stack">
        <h2>Review this document</h2>
        <p className="muted">
          Legal OS reads the open document, flags risks with estimated exposure, and
          proposes redlines you can apply {tracked ? "as tracked changes with comments" : "inline"}.
        </p>
        {!tracked && (
          <p className="notice">
            This Word version doesn't support tracked changes via add-ins (WordApi 1.4).
            Applied redlines will be highlighted instead.
          </p>
        )}
        {status && <p className="muted">{status}</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="btn-primary" onClick={analyze} disabled={busy}>
          {busy ? "Working…" : "Analyze document"}
        </button>
      </div>
    );
  }

  return (
    <ResultsView
      analysis={analysis}
      documentText={documentText}
      tracked={tracked}
      onReset={() => {
        setAnalysis(null);
        setStatus(null);
        setError(null);
      }}
    />
  );
}

function ResultsView({
  analysis,
  documentText,
  tracked,
  onReset,
}: {
  analysis: AnalysisResult;
  documentText: string;
  tracked: boolean;
  onReset: () => void;
}) {
  const [applyState, setApplyState] = useState<Record<number, ApplyOutcome | "applying">>({});
  const [copied, setCopied] = useState<number | null>(null);

  const apply = async (index: number) => {
    const redline = analysis.redlines[index];
    setApplyState(state => ({ ...state, [index]: "applying" }));
    try {
      const outcome = await applyRedline(redline);
      setApplyState(state => ({ ...state, [index]: outcome }));
    } catch {
      setApplyState(state => ({ ...state, [index]: "not-found" }));
    }
  };

  const copySuggestion = async (index: number) => {
    const ok = await copyText(analysis.redlines[index].suggestedText);
    if (ok) {
      setCopied(index);
      setTimeout(() => setCopied(current => (current === index ? null : current)), 2000);
    }
  };

  return (
    <div className="stack">
      <div className="card pad stack">
        <div className="row-between">
          <h2>Review</h2>
          <span className={`chip chip-${analysis.riskLevel}`}>{analysis.riskLevel.toUpperCase()} RISK</span>
        </div>
        <p>{analysis.summary}</p>
        <p className="muted">Estimated total exposure: {currency(analysis.totalExposure)}</p>
        <button className="btn-ghost" onClick={onReset}>← Analyze again</button>
      </div>

      <div className="card pad stack">
        <h3>Risks ({analysis.risks.length})</h3>
        {analysis.risks.length === 0 && <p className="muted">No material risks identified.</p>}
        {analysis.risks.map((risk, index) => (
          <div className="risk" key={index}>
            <div className="row-between">
              <strong>{risk.issue}</strong>
              <span className={`chip chip-${risk.level}`}>{risk.level.toUpperCase()}</span>
            </div>
            {risk.clauseExcerpt && <p className="excerpt">“{risk.clauseExcerpt}”</p>}
            <p>{risk.recommendation}</p>
            <p className="muted">Exposure: {currency(risk.exposureEstimate)}</p>
          </div>
        ))}
      </div>

      <div className="card pad stack">
        <h3>Redlines ({analysis.redlines.length})</h3>
        {analysis.redlines.length === 0 && <p className="muted">No changes proposed.</p>}
        {analysis.redlines.map((redline, index) => {
          const state = applyState[index];
          return (
            <div className="redline" key={index}>
              <p className="original">{redline.originalText}</p>
              <p className="suggested">{redline.suggestedText}</p>
              <p className="muted">{redline.rationale}</p>
              <div className="row-gap">
                <button
                  className="btn-primary btn-sm"
                  onClick={() => apply(index)}
                  disabled={state === "applying" || state === "applied-tracked" || state === "applied-highlight"}
                >
                  {state === "applying"
                    ? "Applying…"
                    : state === "applied-tracked"
                      ? "Applied ✓ (tracked)"
                      : state === "applied-highlight"
                        ? "Applied ✓ (highlighted)"
                        : tracked
                          ? "Apply as tracked change"
                          : "Apply"}
                </button>
                <button className="btn-ghost btn-sm" onClick={() => copySuggestion(index)}>
                  {copied === index ? "Copied ✓" : "Copy text"}
                </button>
              </div>
              {state === "not-found" && (
                <p className="error-text">
                  Couldn't locate this clause in the document (it may have been edited).
                  Use “Copy text” and paste the change manually.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <AskAssistant documentText={documentText} />
    </div>
  );
}

function AskAssistant({ documentText }: { documentText: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api.aiChat.askAboutContract.mutate({
        contractText: documentText.slice(0, 100_000),
        question: question.trim(),
      });
      setAnswer(result.answer);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card pad stack" onSubmit={ask}>
      <h3>Ask about this document</h3>
      <textarea
        rows={3}
        placeholder="e.g. What happens if we terminate early?"
        value={question}
        onChange={event => setQuestion(event.target.value)}
      />
      {error && <p className="error-text">{error}</p>}
      <button className="btn-primary btn-sm" type="submit" disabled={busy || !question.trim()}>
        {busy ? "Thinking…" : "Ask"}
      </button>
      {answer && <div className="answer">{answer}</div>}
    </form>
  );
}
