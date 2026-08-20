import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_EMAIL, DEMO_PASSWORD, isDemoMode } from "@/lib/demo-mode";
import { trpc } from "@/lib/trpc";
import type { FormEvent } from "react";
import { useState } from "react";
import { useLocation } from "wouter";

type AuthTab = "signin" | "register";

const serif = { fontFamily: "'Playfair Display', serif" };

/* Archival Cream input fields on the Midnight Sapphire backdrop — the
   bridge between the Phantom Sapphire landing and the Yacht Club interior. */
const fieldClasses =
  "border-[#D9D0BC] bg-[#F1EDE1] text-[#151E29] placeholder:text-[#6B7280] focus-visible:ring-[#C6AD7C]/60 focus-visible:border-[#C6AD7C]";

const initialTab = (): AuthTab => {
  if (isDemoMode()) return "signin";
  if (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("tab") === "register"
  ) {
    return "register";
  }
  return "signin";
};

export default function Login() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(isDemoMode() ? DEMO_EMAIL : "");
  const [password, setPassword] = useState(isDemoMode() ? DEMO_PASSWORD : "");
  const [error, setError] = useState<string | null>(null);

  const onAuthenticated = async (user: { firmId: number | null }) => {
    utils.auth.me.setData(undefined, user as never);
    await utils.auth.me.invalidate();
    setLocation(user.firmId ? "/dashboard" : "/firm-setup");
  };

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: onAuthenticated,
    onError: err => setError(err.message || "Unable to sign in"),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: onAuthenticated,
    onError: err => setError(err.message || "Unable to create account"),
  });

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      if (tab === "register") {
        await registerMutation.mutateAsync({ name, email, password });
      } else {
        await loginMutation.mutateAsync({ email, password });
      }
    } catch {
      // Error state is set by the mutation callbacks.
    }
  };

  const switchTab = (next: AuthTab) => {
    setTab(next);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#0B1320] text-[#FDFBF7] flex flex-col items-center justify-center px-4 py-12">
      {/* The Lens on the midnight backdrop — the brand moment of the
          Sapphire-to-Yacht-Club transition. Decorative: the card title names
          the product, so it is hidden from assistive tech. */}
      <img src="/logo.svg" alt="" aria-hidden="true" className="w-14 h-14 shrink-0 mb-6" />
      <Card className="w-full max-w-md border-[#2A3A4E] bg-[#1C2A3A] text-[#FDFBF7] shadow-2xl shadow-black/40">
        <CardHeader>
          <CardTitle className="text-2xl text-[#FDFBF7]" style={serif}>
            {tab === "register" ? "Create your Legal OS account" : "Sign in to Legal OS"}
          </CardTitle>
          <CardDescription className="text-[#A9B0BC]">
            {isDemoMode()
              ? `Demo login is prefilled: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`
              : tab === "register"
                ? "Set up your firm's workspace in minutes."
                : "Welcome back to your firm's cockpit."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isDemoMode() && (
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-[#0E1826] p-1">
              <button
                type="button"
                onClick={() => switchTab("signin")}
                className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                  tab === "signin"
                    ? "bg-[#C6AD7C] text-[#0B1320]"
                    : "text-[#A9B0BC] hover:text-[#FDFBF7]"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchTab("register")}
                className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                  tab === "register"
                    ? "bg-[#C6AD7C] text-[#0B1320]"
                    : "text-[#A9B0BC] hover:text-[#FDFBF7]"
                }`}
              >
                Create account
              </button>
            </div>
          )}

          <form className="space-y-5" onSubmit={submit}>
            {tab === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#D8D2C4]">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  className={fieldClasses}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#D8D2C4]">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={event => setEmail(event.target.value)}
                className={fieldClasses}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#D8D2C4]">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={tab === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={event => setPassword(event.target.value)}
                className={fieldClasses}
                required
                minLength={tab === "register" ? 8 : undefined}
              />
              {tab === "register" && (
                <p className="text-xs text-[#A9B0BC]">At least 8 characters.</p>
              )}
            </div>

            {error && <p className="text-sm text-[#E08D7C]">{error}</p>}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#C6AD7C] text-[#0B1320] hover:bg-[#D4BE92] font-semibold"
            >
              {tab === "register"
                ? registerMutation.isPending ? "Creating account..." : "Create account"
                : loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
