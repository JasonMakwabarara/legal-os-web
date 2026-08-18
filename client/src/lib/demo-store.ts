import { DEMO_EMAIL, DEMO_STORAGE_KEY, DEMO_SESSION_KEY } from "./demo-mode";

const now = () => new Date();
const iso = (d: Date) => d;
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export const TECHCORP_ORIGINAL = `MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of 1 March 2026 ("Effective Date") by and between TechCorp Inc. ("Client") and Rivera & Hale LLP's client vendor ("Provider").

1. SERVICES
Provider shall perform the professional services described in each Statement of Work.

2. LIABILITY
Provider's liability under this Agreement shall be unlimited. Provider shall indemnify Client against all claims, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or related to the Services, whether or not caused by Provider's negligence.

3. INDEMNIFICATION
Provider shall defend, indemnify, and hold harmless Client and its affiliates from any third-party claim arising from the Services, including indirect, incidental, and consequential damages.

4. TERMINATION
Either party may terminate this Agreement. Notice requirements and wind-down obligations are not specified.

5. CONFIDENTIALITY
Each party shall keep confidential information of the other party confidential for a period of two (2) years.

6. GOVERNING LAW
This Agreement shall be governed by the laws of England and Wales. This is not legal advice; demo text only.

7. FEES
Fees are as set out in each SOW. Late payments accrue interest at 2% per month.`;

export const TECHCORP_REDLINED = `MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of 1 March 2026 ("Effective Date") by and between TechCorp Inc. ("Client") and Rivera & Hale LLP's client vendor ("Provider").

1. SERVICES
Provider shall perform the professional services described in each Statement of Work.

2. LIABILITY
[REDLINE] Provider's aggregate liability under this Agreement shall not exceed the fees paid by Client in the twelve (12) months preceding the claim. Neither party shall be liable for indirect, incidental, special, or consequential damages.

3. INDEMNIFICATION
[REDLINE] Provider shall indemnify Client only for third-party claims arising from Provider's gross negligence or willful misconduct, limited to direct damages.

4. TERMINATION
[REDLINE] Either party may terminate this Agreement for convenience on thirty (30) days' written notice, or immediately for material breach if not cured within fifteen (15) days of notice.

5. CONFIDENTIALITY
Each party shall keep confidential information of the other party confidential for a period of two (2) years.

6. GOVERNING LAW
This Agreement shall be governed by the laws of England and Wales. This is not legal advice; demo text only.

7. FEES
Fees are as set out in each SOW. Late payments accrue interest at 2% per month.`;

export type DemoUser = {
  id: number;
  openId: string;
  name: string;
  email: string;
  loginMethod: string;
  role: "admin" | "lawyer" | "paralegal" | "user";
  firmId: number | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

export type DemoContract = {
  id: number;
  firmId: number;
  clientId: number | null;
  caseId: number | null;
  name: string;
  description: string | null;
  status: "draft" | "review" | "approved" | "executed" | "archived";
  riskLevel: "low" | "medium" | "high";
  fileKey: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileMimeType: string | null;
  fileSize: number | null;
  reviewProgress: number;
  totalExposure: string;
  uploadedBy: number | null;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  originalText: string;
  redlinedText: string;
};

export type DemoRisk = {
  id: number;
  contractId: number;
  level: "low" | "medium" | "high";
  issue: string;
  exposure: string;
  recommendation: string | null;
  status: "open" | "resolved" | "ignored";
  createdAt: Date;
  updatedAt: Date;
};

export type DemoCase = {
  id: number;
  firmId: number;
  clientId: number | null;
  name: string;
  caseNumber: string | null;
  description: string | null;
  status: "active" | "closed" | "on_hold" | "pending";
  priority: "low" | "medium" | "high";
  assignedTo: number | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DemoClient = {
  id: number;
  firmId: number;
  name: string;
  type: "individual" | "corporate";
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
};

export type DemoDocument = {
  id: number;
  firmId: number;
  contractId: number | null;
  caseId: number | null;
  name: string;
  type: "contract" | "brief" | "memo" | "discovery" | "other";
  fileKey: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileMimeType: string | null;
  fileSize: number | null;
  status: "active" | "archived" | "draft";
  uploadedBy: number | null;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type DemoTemplate = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  content: string;
  tags: string[];
  riskLevel: "low" | "medium" | "high";
  jurisdiction: string;
  industry: string;
  isActive: number;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DemoCommunication = {
  id: number;
  clientId: number;
  type: string;
  subject: string;
  body: string;
  createdAt: Date;
};

export type DemoInvitation = {
  id: number;
  email: string;
  role: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
};

export type DemoState = {
  nextIds: { contract: number; risk: number; document: number; conversation: number; template: number; communication: number; invitation: number };
  user: DemoUser;
  firm: { id: number; name: string; email: string | null; phone: string | null; address: string | null; website: string | null; createdAt: Date; updatedAt: Date };
  members: DemoUser[];
  clients: DemoClient[];
  cases: DemoCase[];
  contracts: DemoContract[];
  risks: DemoRisk[];
  documents: DemoDocument[];
  templates: DemoTemplate[];
  communications: DemoCommunication[];
  invitations: DemoInvitation[];
  conversations: { id: string; title: string; messages: { id: number; role: string; content: string; createdAt: Date }[] }[];
};

function seedTemplates(createdAt: Date): DemoTemplate[] {
  const base = { subcategory: null, tags: ["playbook"], jurisdiction: "England and Wales", industry: "professional-services", isActive: 1, createdBy: 1, createdAt, updatedAt: createdAt };
  return [
    { id: 1, title: "Liability cap — 12 months of fees", description: "Standard SMB position: cap aggregate liability and exclude consequential damages.", category: "Liability", content: "Provider's aggregate liability under this Agreement shall not exceed the fees paid in the twelve (12) months preceding the claim. Neither party is liable for indirect, incidental, special, or consequential damages.", riskLevel: "high", ...base },
    { id: 2, title: "Termination for convenience — 30 days", description: "Notice plus cure period for material breach.", category: "Termination", content: "Either party may terminate this Agreement for convenience on thirty (30) days' written notice, or immediately for material breach not cured within fifteen (15) days of notice.", riskLevel: "medium", ...base },
    { id: 3, title: "Narrow indemnity", description: "Third-party claims from gross negligence or willful misconduct only.", category: "Indemnity", content: "Indemnity is limited to third-party claims arising from the indemnifying party's gross negligence or willful misconduct, and to direct damages only.", riskLevel: "medium", ...base },
    { id: 4, title: "Mutual NDA — 3-year term", description: "Confidentiality with standard carve-outs and no residuals overreach.", category: "Confidentiality", content: "Each party shall keep the other party's confidential information secret for three (3) years from disclosure, subject to standard carve-outs (public knowledge, independent development, legal compulsion).", riskLevel: "low", ...base },
    { id: 5, title: "Payment terms — 30 days, capped interest", description: "Late-payment interest limited to a lawful, modest rate.", category: "Payment", content: "Invoices are payable within thirty (30) days. Late payments accrue interest at 4% per annum above the Bank of England base rate, not compounded.", riskLevel: "low", ...base },
    { id: 6, title: "IP ownership — client owns deliverables", description: "Deliverables assign on payment; provider retains pre-existing tools.", category: "Intellectual Property", content: "Upon full payment, all right, title, and interest in the deliverables assigns to Client. Provider retains ownership of pre-existing materials and general know-how, licensed to Client as needed to use the deliverables.", riskLevel: "medium", ...base },
    { id: 7, title: "Data processing — no training on client data", description: "Processor limits, confidentiality, and an explicit no-AI-training clause.", category: "Data Protection", content: "Provider shall process personal data only on documented instructions, keep it confidential, and shall not use Client data to train machine-learning models. Sub-processors require prior written consent.", riskLevel: "high", ...base },
    { id: 8, title: "Governing law — England and Wales", description: "Default choice of law and exclusive jurisdiction.", category: "Boilerplate", content: "This Agreement is governed by the laws of England and Wales, and the parties submit to the exclusive jurisdiction of the courts of England and Wales.", riskLevel: "low", ...base },
    { id: 9, title: "Audit rights — annual, 10 days' notice", description: "Bounded audit scope to avoid open-ended disruption.", category: "Audit", content: "Client may audit Provider's compliance no more than once per year, on ten (10) business days' notice, during business hours, at Client's cost.", riskLevel: "low", ...base },
  ];
}

function seed(): DemoState {
  const createdAt = daysAgo(4);
  const user: DemoUser = {
    id: 1,
    openId: "demo-admin",
    name: "Alex Rivera",
    email: DEMO_EMAIL,
    loginMethod: "local",
    role: "admin",
    firmId: 1,
    createdAt,
    updatedAt: createdAt,
    lastSignedIn: now(),
  };

  return {
    nextIds: { contract: 4, risk: 5, document: 4, conversation: 2, template: 10, communication: 2, invitation: 1 },
    user,
    firm: {
      id: 1,
      name: "Rivera & Hale LLP",
      email: "hello@riverahale.demo",
      phone: "+44 20 7946 0958",
      address: "14 Chancery Lane, London",
      website: "https://riverahale.demo",
      createdAt,
      updatedAt: createdAt,
    },
    members: [
      user,
      { ...user, id: 2, openId: "demo-lawyer", name: "Priya Hale", email: "priya@riverahale.demo", role: "lawyer" },
      { ...user, id: 3, openId: "demo-paralegal", name: "Jonah West", email: "jonah@riverahale.demo", role: "paralegal" },
    ],
    clients: [
      { id: 1, firmId: 1, name: "TechCorp Inc", type: "corporate", email: "legal@techcorp.demo", phone: "+1 415 555 0142", address: "100 Market St", city: "San Francisco", state: "CA", zipCode: "94105", country: "United States", status: "active", createdAt, updatedAt: createdAt },
      { id: 2, firmId: 1, name: "Global Partners LLC", type: "corporate", email: "counsel@globalpartners.demo", phone: "+44 20 7946 0100", address: "1 Canada Square", city: "London", state: null, zipCode: "E14 5AB", country: "United Kingdom", status: "active", createdAt, updatedAt: createdAt },
      { id: 3, firmId: 1, name: "DataFlow Systems", type: "corporate", email: "contracts@dataflow.demo", phone: "+1 646 555 0199", address: "200 Park Ave", city: "New York", state: "NY", zipCode: "10166", country: "United States", status: "active", createdAt, updatedAt: createdAt },
    ],
    cases: [
      { id: 1, firmId: 1, clientId: 1, name: "TechCorp MSA negotiation", caseNumber: "RH-2026-041", description: "Review and redline of master services agreement before signature.", status: "active", priority: "high", assignedTo: 1, dueDate: daysFromNow(12), createdAt, updatedAt: createdAt },
      { id: 2, firmId: 1, clientId: 2, name: "Global Partners acquisition diligence", caseNumber: "RH-2026-038", description: "Corporate diligence on proposed acquisition of a logistics target.", status: "active", priority: "medium", assignedTo: 2, dueDate: daysFromNow(24), createdAt, updatedAt: createdAt },
      { id: 3, firmId: 1, clientId: 3, name: "DataFlow licence review", caseNumber: "RH-2026-029", description: "Software licence and data processing terms.", status: "pending", priority: "medium", assignedTo: 3, dueDate: daysFromNow(17), createdAt, updatedAt: createdAt },
    ],
    contracts: [
      {
        id: 1,
        firmId: 1,
        clientId: 1,
        caseId: 1,
        name: "Service Agreement — TechCorp Inc",
        description: "Master services agreement under negotiation. Unlimited liability and broad indemnity flagged.",
        status: "review",
        riskLevel: "high",
        fileKey: "demo/techcorp-msa.txt",
        fileUrl: null,
        fileName: "TechCorp-MSA-v3.docx",
        fileMimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileSize: 184320,
        reviewProgress: 78,
        totalExposure: "2100000.00",
        uploadedBy: 1,
        uploadedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
        originalText: TECHCORP_ORIGINAL,
        redlinedText: TECHCORP_REDLINED,
      },
      {
        id: 2,
        firmId: 1,
        clientId: 2,
        caseId: 2,
        name: "NDA — Global Partners LLC",
        description: "Mutual NDA for acquisition discussions.",
        status: "draft",
        riskLevel: "low",
        fileKey: "demo/gp-nda.txt",
        fileUrl: null,
        fileName: "GlobalPartners-NDA.pdf",
        fileMimeType: "application/pdf",
        fileSize: 92160,
        reviewProgress: 45,
        totalExposure: "150000.00",
        uploadedBy: 1,
        uploadedAt: daysAgo(3),
        createdAt,
        updatedAt: createdAt,
        originalText: "MUTUAL NON-DISCLOSURE AGREEMENT\n\nThe parties agree to keep confidential information secret for three years. Residuals clause is standard. No non-solicit.",
        redlinedText: "MUTUAL NON-DISCLOSURE AGREEMENT\n\nThe parties agree to keep confidential information secret for three years. Residuals clause is standard. No non-solicit.",
      },
      {
        id: 3,
        firmId: 1,
        clientId: 3,
        caseId: 3,
        name: "Licence Agreement — DataFlow Systems",
        description: "Software licence; termination rights are ambiguous.",
        status: "approved",
        riskLevel: "medium",
        fileKey: "demo/dataflow-licence.txt",
        fileUrl: null,
        fileName: "DataFlow-Licence-2026.docx",
        fileMimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileSize: 143360,
        reviewProgress: 100,
        totalExposure: "750000.00",
        uploadedBy: 2,
        uploadedAt: daysAgo(5),
        createdAt,
        updatedAt: createdAt,
        originalText: "SOFTWARE LICENCE AGREEMENT\n\nLicence is perpetual unless terminated. Termination for convenience is not defined. Audit rights are broad.",
        redlinedText: "SOFTWARE LICENCE AGREEMENT\n\n[REDLINE] Either party may terminate for convenience on 60 days' notice. Audit limited to once per year on 10 days' notice.",
      },
    ],
    risks: [
      { id: 1, contractId: 1, level: "high", issue: "Unlimited liability clause", exposure: "2100000.00", recommendation: "Cap aggregate liability at 12 months of fees and exclude consequential damages.", status: "open", createdAt, updatedAt: createdAt },
      { id: 2, contractId: 1, level: "medium", issue: "Broad indemnification obligations", exposure: "500000.00", recommendation: "Narrow indemnity to third-party claims caused by gross negligence or willful misconduct.", status: "open", createdAt, updatedAt: createdAt },
      { id: 3, contractId: 1, level: "medium", issue: "Ambiguous termination rights", exposure: "180000.00", recommendation: "Add 30-day convenience termination and a 15-day cure period for material breach.", status: "open", createdAt, updatedAt: createdAt },
      { id: 4, contractId: 3, level: "medium", issue: "Ambiguous termination rights", exposure: "300000.00", recommendation: "Clarify termination for convenience and audit frequency.", status: "open", createdAt, updatedAt: createdAt },
    ],
    documents: [
      { id: 1, firmId: 1, contractId: 1, caseId: 1, name: "TechCorp-MSA-v3.docx", type: "contract", fileKey: "demo/techcorp-msa.txt", fileUrl: null, fileName: "TechCorp-MSA-v3.docx", fileMimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileSize: 184320, status: "active", uploadedBy: 1, uploadedAt: createdAt, createdAt, updatedAt: createdAt },
      { id: 2, firmId: 1, contractId: 2, caseId: 2, name: "GlobalPartners-NDA.pdf", type: "contract", fileKey: "demo/gp-nda.txt", fileUrl: null, fileName: "GlobalPartners-NDA.pdf", fileMimeType: "application/pdf", fileSize: 92160, status: "active", uploadedBy: 1, uploadedAt: createdAt, createdAt, updatedAt: createdAt },
      { id: 3, firmId: 1, contractId: 3, caseId: 3, name: "DataFlow-Licence-2026.docx", type: "contract", fileKey: "demo/dataflow-licence.txt", fileUrl: null, fileName: "DataFlow-Licence-2026.docx", fileMimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileSize: 143360, status: "active", uploadedBy: 2, uploadedAt: createdAt, createdAt, updatedAt: createdAt },
    ],
    templates: seedTemplates(createdAt),
    communications: [
      { id: 1, clientId: 1, type: "email", subject: "MSA redline sent", body: "Sent v3 redline for review.", createdAt: daysAgo(3) },
    ],
    invitations: [],
    conversations: [],
  };
}

function revive(raw: DemoState): DemoState {
  const asDate = (value: unknown) => (value ? new Date(value as string) : now());
  const fresh = seed();
  return {
    ...raw,
    nextIds: { ...fresh.nextIds, ...raw.nextIds },
    templates: (raw.templates ?? fresh.templates).map(t => ({ ...t, createdAt: asDate(t.createdAt), updatedAt: asDate(t.updatedAt) })),
    communications: (raw.communications ?? fresh.communications).map(c => ({ ...c, createdAt: asDate(c.createdAt) })),
    invitations: (raw.invitations ?? []).map(i => ({ ...i, createdAt: asDate(i.createdAt), expiresAt: asDate(i.expiresAt) })),
    user: { ...raw.user, createdAt: asDate(raw.user.createdAt), updatedAt: asDate(raw.user.updatedAt), lastSignedIn: asDate(raw.user.lastSignedIn) },
    firm: { ...raw.firm, createdAt: asDate(raw.firm.createdAt), updatedAt: asDate(raw.firm.updatedAt) },
    members: raw.members.map(m => ({ ...m, createdAt: asDate(m.createdAt), updatedAt: asDate(m.updatedAt), lastSignedIn: asDate(m.lastSignedIn) })),
    clients: raw.clients.map(c => ({ ...c, createdAt: asDate(c.createdAt), updatedAt: asDate(c.updatedAt) })),
    cases: raw.cases.map(c => ({ ...c, dueDate: c.dueDate ? asDate(c.dueDate) : null, createdAt: asDate(c.createdAt), updatedAt: asDate(c.updatedAt) })),
    contracts: raw.contracts.map(c => ({ ...c, uploadedAt: asDate(c.uploadedAt), createdAt: asDate(c.createdAt), updatedAt: asDate(c.updatedAt) })),
    risks: raw.risks.map(r => ({ ...r, createdAt: asDate(r.createdAt), updatedAt: asDate(r.updatedAt) })),
    documents: raw.documents.map(d => ({ ...d, uploadedAt: asDate(d.uploadedAt), createdAt: asDate(d.createdAt), updatedAt: asDate(d.updatedAt) })),
    conversations: (raw.conversations ?? []).map(conv => ({
      ...conv,
      messages: conv.messages.map(m => ({ ...m, createdAt: asDate(m.createdAt) })),
    })),
  };
}

let memory: DemoState | null = null;
let memorySession = false;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadDemoState(): DemoState {
  if (memory) return memory;
  if (canUseStorage()) {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      try {
        memory = revive(JSON.parse(raw) as DemoState);
        return memory;
      } catch {
        /* fall through to seed */
      }
    }
  }
  memory = seed();
  persistDemoState();
  return memory;
}

export function persistDemoState() {
  if (!memory) return;
  if (canUseStorage()) {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(memory));
  }
}

export function resetDemoState() {
  memory = seed();
  persistDemoState();
  return memory;
}

export function isDemoLoggedIn() {
  if (canUseStorage()) {
    return window.localStorage.getItem(DEMO_SESSION_KEY) === "1";
  }
  return memorySession;
}

export function setDemoLoggedIn(value: boolean) {
  memorySession = value;
  if (!canUseStorage()) return;
  if (value) window.localStorage.setItem(DEMO_SESSION_KEY, "1");
  else window.localStorage.removeItem(DEMO_SESSION_KEY);
}

export function getDemoUser() {
  return loadDemoState().user;
}

export function analyzeUploadedFile(fileName: string): { riskLevel: DemoContract["riskLevel"]; exposure: string; risks: Omit<DemoRisk, "id" | "contractId" | "createdAt" | "updatedAt">[]; originalText: string; redlinedText: string } {
  const lower = fileName.toLowerCase();
  if (lower.includes("nda")) {
    return {
      riskLevel: "low",
      exposure: "50000.00",
      originalText: `NON-DISCLOSURE AGREEMENT — ${fileName}\n\nMutual confidentiality for 3 years. Standard residuals. Demo text only — not legal advice.`,
      redlinedText: `NON-DISCLOSURE AGREEMENT — ${fileName}\n\nMutual confidentiality for 3 years. Standard residuals. Demo text only — not legal advice.`,
      risks: [{ level: "low", issue: "Standard mutual NDA", exposure: "50000.00", recommendation: "Confirm residuals and residual-knowledge carve-outs match firm playbook.", status: "open" }],
    };
  }
  return {
    riskLevel: "high",
    exposure: "900000.00",
    originalText: `AGREEMENT — ${fileName}\n\n1. LIABILITY\nVendor liability is unlimited.\n\n2. INDEMNITY\nVendor indemnifies the counterparty for all claims, including consequential damages.\n\n3. TERMINATION\nTermination rights are unspecified.\n\nDemo text only — not legal advice.`,
    redlinedText: `AGREEMENT — ${fileName}\n\n1. LIABILITY\n[REDLINE] Aggregate liability capped at 12 months of fees. No consequential damages.\n\n2. INDEMNITY\n[REDLINE] Indemnity limited to third-party claims from gross negligence or willful misconduct.\n\n3. TERMINATION\n[REDLINE] 30 days' notice for convenience; 15-day cure for material breach.\n\nDemo text only — not legal advice.`,
    risks: [
      { level: "high", issue: "Unlimited liability clause", exposure: "900000.00", recommendation: "Cap liability at 12 months of fees paid.", status: "open" },
      { level: "medium", issue: "Broad indemnification", exposure: "250000.00", recommendation: "Limit indemnity to direct third-party claims.", status: "open" },
    ],
  };
}

export function groundedAnswer(question: string, contract?: DemoContract | null): string {
  const q = question.toLowerCase();
  const name = contract?.name ?? "the TechCorp master services agreement";
  const disclaimer = "\n\nThis is a demo assistant grounded in the documents loaded in this workspace. It is not legal advice.";

  if (q.includes("liab") || q.includes("unlimited") || q.includes("cap")) {
    return `In ${name}, liability is currently **unlimited** (clause 2). Firm playbook for SMB counterparties is a cap at **12 months of fees** plus a bar on consequential damages. The redline already proposes that cap.${disclaimer}`;
  }
  if (q.includes("indemni")) {
    return `The indemnity in ${name} covers “all claims” including consequential loss. Recommend narrowing it to third-party claims caused by gross negligence or willful misconduct, and to direct damages only.${disclaimer}`;
  }
  if (q.includes("terminat") || q.includes("notice")) {
    return `${name} lets either party terminate without notice or a cure period. The redline adds 30 days’ convenience notice and a 15-day cure for material breach.${disclaimer}`;
  }
  if (q.includes("risk") || q.includes("summar")) {
    const risks = loadDemoState().risks.filter(r => !contract || r.contractId === contract.id);
    const lines = risks.map(r => `- **${r.level.toUpperCase()}**: ${r.issue} — ${r.recommendation}`).join("\n");
    return `Grounded review of ${name}:\n\n${lines || "No open risks."}${disclaimer}`;
  }
  if (q.includes("client") || q.includes("matter") || q.includes("case")) {
    const state = loadDemoState();
    const client = state.clients.find(c => c.id === contract?.clientId);
    const matter = state.cases.find(c => c.id === contract?.caseId);
    return `${name} is attached to client **${client?.name ?? "unassigned"}** and matter **${matter?.name ?? "unassigned"}** (${matter?.caseNumber ?? "no matter number"}). You can change the attachment from the contract cockpit.${disclaimer}`;
  }
  return `I can only answer from the contracts in this demo firm. For ${name}, the highest-priority issue is unlimited liability; next is the broad indemnity; then missing termination mechanics. Ask about liability, indemnity, termination, or risks for a clause-level answer.${disclaimer}`;
}

export function createDemoContract(input: {
  name: string;
  fileName: string;
  fileMimeType?: string;
  fileSize?: number;
  clientId?: number | null;
  caseId?: number | null;
}) {
  const state = loadDemoState();
  const analysis = analyzeUploadedFile(input.fileName);
  const id = state.nextIds.contract++;
  const stamp = now();
  const contract: DemoContract = {
    id,
    firmId: 1,
    clientId: input.clientId ?? null,
    caseId: input.caseId ?? null,
    name: input.name,
    description: `Uploaded in demo cockpit from ${input.fileName}.`,
    status: "review",
    riskLevel: analysis.riskLevel,
    fileKey: `demo/${id}-${input.fileName}`,
    fileUrl: null,
    fileName: input.fileName,
    fileMimeType: input.fileMimeType ?? "application/octet-stream",
    fileSize: input.fileSize ?? 0,
    reviewProgress: 82,
    totalExposure: analysis.exposure,
    uploadedBy: 1,
    uploadedAt: stamp,
    createdAt: stamp,
    updatedAt: stamp,
    originalText: analysis.originalText,
    redlinedText: analysis.redlinedText,
  };
  state.contracts.unshift(contract);
  for (const risk of analysis.risks) {
    state.risks.push({
      ...risk,
      id: state.nextIds.risk++,
      contractId: id,
      createdAt: stamp,
      updatedAt: stamp,
    });
  }
  state.documents.unshift({
    id: state.nextIds.document++,
    firmId: 1,
    contractId: id,
    caseId: input.caseId ?? null,
    name: input.fileName,
    type: "contract",
    fileKey: contract.fileKey,
    fileUrl: null,
    fileName: input.fileName,
    fileMimeType: contract.fileMimeType,
    fileSize: contract.fileSize,
    status: "active",
    uploadedBy: 1,
    uploadedAt: stamp,
    createdAt: stamp,
    updatedAt: stamp,
  });
  persistDemoState();
  return contract;
}

export function updateDemoContractStatus(id: number, status: DemoContract["status"]) {
  const state = loadDemoState();
  const contract = state.contracts.find(c => c.id === id);
  if (!contract) return null;
  contract.status = status;
  if (status === "approved") contract.reviewProgress = 100;
  contract.updatedAt = now();
  persistDemoState();
  return contract;
}

export function createDemoTemplate(input: {
  title: string;
  description?: string | null;
  category?: string;
  content?: string;
  tags?: string[];
  riskLevel?: DemoTemplate["riskLevel"];
  jurisdiction?: string;
  industry?: string;
}) {
  const state = loadDemoState();
  const stamp = now();
  const template: DemoTemplate = {
    id: state.nextIds.template++,
    title: input.title,
    description: input.description ?? null,
    category: input.category ?? "General",
    subcategory: null,
    content: input.content ?? "",
    tags: input.tags ?? ["playbook"],
    riskLevel: input.riskLevel ?? "medium",
    jurisdiction: input.jurisdiction ?? "England and Wales",
    industry: input.industry ?? "professional-services",
    isActive: 1,
    createdBy: state.user.id,
    createdAt: stamp,
    updatedAt: stamp,
  };
  state.templates.unshift(template);
  persistDemoState();
  return template;
}

export function addDemoCommunication(input: { clientId: number; type?: string; subject?: string; body?: string }) {
  const state = loadDemoState();
  const communication: DemoCommunication = {
    id: state.nextIds.communication++,
    clientId: input.clientId,
    type: input.type ?? "note",
    subject: input.subject ?? "Note",
    body: input.body ?? "",
    createdAt: now(),
  };
  state.communications.unshift(communication);
  persistDemoState();
  return communication;
}

export function createDemoInvitation(input: { email: string; role?: string; expiresInDays?: number }) {
  const state = loadDemoState();
  const invitation: DemoInvitation = {
    id: state.nextIds.invitation++,
    email: input.email,
    role: input.role ?? "user",
    code: `demo-invite-${state.nextIds.invitation}`,
    createdAt: now(),
    expiresAt: daysFromNow(input.expiresInDays ?? 7),
  };
  state.invitations.unshift(invitation);
  persistDemoState();
  return invitation;
}

export function revokeDemoInvitation(id: number) {
  const state = loadDemoState();
  state.invitations = state.invitations.filter(i => i.id !== id);
  persistDemoState();
  return { success: true };
}

export function attachDemoContract(id: number, clientId?: number | null, caseId?: number | null) {
  const state = loadDemoState();
  const contract = state.contracts.find(c => c.id === id);
  if (!contract) return null;
  if (clientId !== undefined) contract.clientId = clientId;
  if (caseId !== undefined) contract.caseId = caseId;
  contract.updatedAt = now();
  const doc = state.documents.find(d => d.contractId === id);
  if (doc) {
    if (clientId !== undefined) {
      /* client lives on the contract */
    }
    if (caseId !== undefined) doc.caseId = caseId;
  }
  persistDemoState();
  return contract;
}

void iso;
