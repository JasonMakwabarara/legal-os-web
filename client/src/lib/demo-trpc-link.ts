import { TRPCClientError, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { AppRouter } from "../../../server/routers";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./demo-mode";
import {
  addDemoCommunication,
  attachDemoContract,
  createDemoContract,
  createDemoInvitation,
  createDemoTemplate,
  getDemoUser,
  groundedAnswer,
  isDemoLoggedIn,
  loadDemoState,
  persistDemoState,
  revokeDemoInvitation,
  setDemoLoggedIn,
  updateDemoContractStatus,
  type DemoContract,
} from "./demo-store";

function unauthorized(message = "Invalid email or password"): never {
  throw new TRPCClientError(message);
}

function notFound(message: string): never {
  throw new TRPCClientError(message);
}

function requireSession() {
  if (!isDemoLoggedIn()) unauthorized("Unauthorized");
  return loadDemoState();
}

function contractForQuestion(input: Record<string, unknown> | undefined): DemoContract | null {
  const state = loadDemoState();
  const text = String(input?.contractText ?? input?.clauseText ?? "");
  if (text) {
    const match = state.contracts.find(
      c => text.includes(c.name) || (c.fileName && text.includes(c.fileName)) || text.includes(c.originalText.slice(0, 40)),
    );
    if (match) return match;
  }
  return state.contracts[0] ?? null;
}

export function dispatchDemoProcedure(path: string, rawInput: unknown): unknown {
  const input = (rawInput ?? {}) as Record<string, unknown>;

  switch (path) {
    case "auth.me":
      return isDemoLoggedIn() ? getDemoUser() : null;
    case "auth.login": {
      const email = String(input.email ?? "").toLowerCase();
      const password = String(input.password ?? "");
      const allowedEmail = email === DEMO_EMAIL || email === "superadmin@legalos.local";
      if (!allowedEmail || password !== DEMO_PASSWORD) {
        unauthorized("Invalid email or password");
      }
      setDemoLoggedIn(true);
      const user = getDemoUser();
      user.lastSignedIn = new Date();
      persistDemoState();
      return user;
    }
    case "auth.logout":
      setDemoLoggedIn(false);
      return { success: true };
    case "auth.initializeFirm":
      return { firmId: 1, message: "User already assigned to firm" };
    case "contracts.list":
      return requireSession().contracts;
    case "contracts.getById": {
      const contract = requireSession().contracts.find(c => c.id === Number(input.id));
      if (!contract) notFound("Contract not found");
      return contract;
    }
    case "contracts.getRisks":
      return requireSession().risks.filter(r => r.contractId === Number(input.contractId));
    case "contracts.getCollaborators":
      return requireSession().members.map((m, index) => ({
        id: m.id,
        contractId: Number(input.contractId),
        userId: m.id,
        role: index === 0 ? "owner" : "editor",
        lastActiveAt: new Date(),
        createdAt: m.createdAt,
        name: m.name,
        email: m.email,
      }));
    case "contracts.search": {
      const q = String(input.query ?? "").toLowerCase();
      return requireSession().contracts.filter(
        c => c.name.toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q),
      );
    }
    case "contracts.create":
      return createDemoContract({
        name: String(input.name ?? input.fileName ?? "Uploaded contract"),
        fileName: String(input.fileName ?? "contract.docx"),
        fileMimeType: input.fileMimeType ? String(input.fileMimeType) : undefined,
        fileSize: typeof input.fileSize === "number" ? input.fileSize : undefined,
        clientId: input.clientId == null ? null : Number(input.clientId),
        caseId: input.caseId == null ? null : Number(input.caseId),
      });
    case "contracts.attach": {
      const updated = attachDemoContract(
        Number(input.id),
        input.clientId === undefined ? undefined : input.clientId == null ? null : Number(input.clientId),
        input.caseId === undefined ? undefined : input.caseId == null ? null : Number(input.caseId),
      );
      if (!updated) notFound("Contract not found");
      return updated;
    }
    case "contracts.updateStatus": {
      const updated = updateDemoContractStatus(
        Number(input.id ?? input.contractId),
        String(input.status ?? "review") as DemoContract["status"],
      );
      if (!updated) notFound("Contract not found");
      return updated;
    }
    case "contracts.getRedlines": {
      const contract = requireSession().contracts.find(c => c.id === Number(input.contractId ?? input.id));
      if (!contract) notFound("Contract not found");
      return {
        originalText: contract.originalText,
        redlinedText: contract.redlinedText,
      };
    }
    case "cases.list":
      return requireSession().cases;
    case "cases.getById": {
      const record = requireSession().cases.find(c => c.id === Number(input.id));
      if (!record) notFound("Case not found");
      return record;
    }
    case "cases.search": {
      const q = String(input.query ?? "").toLowerCase();
      return requireSession().cases.filter(
        c => c.name.toLowerCase().includes(q) || (c.caseNumber ?? "").toLowerCase().includes(q),
      );
    }
    case "clients.list":
      return requireSession().clients;
    case "clients.getById": {
      const record = requireSession().clients.find(c => c.id === Number(input.id));
      if (!record) notFound("Client not found");
      return record;
    }
    case "clients.search": {
      const q = String(input.query ?? "").toLowerCase();
      return requireSession().clients.filter(
        c => c.name.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q),
      );
    }
    case "documents.list":
      return requireSession().documents;
    case "documents.getByContract":
      return requireSession().documents.filter(d => d.contractId === Number(input.contractId));
    case "documents.upload": {
      const contract = createDemoContract({
        name: String(input.fileName ?? "Uploaded document").replace(/\.[^.]+$/, ""),
        fileName: String(input.fileName ?? "upload.docx"),
        fileMimeType: input.fileMimeType ? String(input.fileMimeType) : undefined,
        fileSize: typeof input.fileSize === "number" ? input.fileSize : undefined,
        clientId: input.clientId == null ? null : Number(input.clientId),
        caseId: input.caseId == null ? null : Number(input.caseId),
      });
      return {
        tempId: String(input.tempId ?? contract.id),
        fileName: contract.fileName,
        fileUrl: `/demo-files/${contract.fileName}`,
        fileKey: contract.fileKey,
        contractId: contract.id,
      };
    }
    case "documents.extractClauses":
      return {
        success: true,
        documentName: input.documentName,
        clauses: [
          { text: "Provider's liability under this Agreement shall be unlimited.", category: "Liability", riskLevel: "high", confidence: 0.94 },
          { text: "Provider shall indemnify Client against all claims, including consequential damages.", category: "Indemnity", riskLevel: "medium", confidence: 0.88 },
          { text: "Either party may terminate this Agreement.", category: "Termination", riskLevel: "medium", confidence: 0.81 },
        ],
      };
    case "firms.create":
      return requireSession().firm;
    case "firms.getById":
      return requireSession().firm;
    case "firms.getMembers":
      return requireSession().members;
    case "invitations.listPending":
      return requireSession().invitations;
    case "invitations.create":
      return createDemoInvitation({
        email: String(input.email ?? ""),
        role: input.role ? String(input.role) : undefined,
        expiresInDays: typeof input.expiresInDays === "number" ? input.expiresInDays : undefined,
      });
    case "invitations.revoke":
      return revokeDemoInvitation(Number(input.invitationId ?? input.id));
    case "invitations.getByCode":
      return null;
    case "templates.list":
      return requireSession().templates;
    case "templates.create":
      return createDemoTemplate({
        title: String(input.title ?? "Untitled playbook"),
        description: input.description == null ? null : String(input.description),
        category: input.category ? String(input.category) : undefined,
        content: input.content ? String(input.content) : undefined,
        tags: Array.isArray(input.tags) ? input.tags.map(String) : undefined,
        riskLevel: input.riskLevel ? (String(input.riskLevel) as "low" | "medium" | "high") : undefined,
        jurisdiction: input.jurisdiction ? String(input.jurisdiction) : undefined,
        industry: input.industry ? String(input.industry) : undefined,
      });
    case "templates.getPendingApprovals":
      return [];
    case "clauses.list":
    case "clauses.search":
      return [
        { id: 1, title: "Liability cap", text: "Aggregate liability shall not exceed 12 months of fees.", category: "Liability", usageCount: 14 },
        { id: 2, title: "Consequential damages waiver", text: "Neither party is liable for consequential, incidental, or special damages.", category: "Liability", usageCount: 11 },
      ];
    case "clauses.getTopUsed":
      return [
        { id: 1, title: "Liability cap", text: "Aggregate liability shall not exceed 12 months of fees.", category: "Liability", usageCount: 14 },
      ];
    case "clauses.trackUsage":
      return { success: true };
    case "notifications.list":
    case "realtimeNotifications.list":
      return [
        { id: 1, title: "High-risk clause in TechCorp MSA", body: "Unlimited liability detected.", read: false, createdAt: new Date() },
      ];
    case "notifications.markAsRead":
    case "realtimeNotifications.markAsRead":
    case "notifications.savePreferences":
      return { success: true };
    case "communications.getClientCommunications":
      return requireSession().communications.filter(c => c.clientId === Number(input.clientId));
    case "communications.addCommunication":
      return addDemoCommunication({
        clientId: Number(input.clientId),
        type: input.type ? String(input.type) : undefined,
        subject: input.subject ? String(input.subject) : undefined,
        body: input.body ? String(input.body) : undefined,
      });
    case "aiChat.getConversations":
      return requireSession().conversations;
    case "aiChat.getMessages": {
      const conv = requireSession().conversations.find(c => c.id === String(input.conversationId));
      return conv?.messages ?? [];
    }
    case "aiChat.startConversation": {
      const state = requireSession();
      const id = `conv_${state.nextIds.conversation++}`;
      const conversation = { id, title: String(input.title ?? "TechCorp MSA"), messages: [] as { id: number; role: string; content: string; createdAt: Date }[] };
      state.conversations.unshift(conversation);
      persistDemoState();
      return conversation;
    }
    case "aiChat.sendMessage": {
      const state = requireSession();
      let conv = state.conversations.find(c => c.id === String(input.conversationId));
      if (!conv) {
        conv = { id: String(input.conversationId), title: "Demo chat", messages: [] };
        state.conversations.unshift(conv);
      }
      const question = String(input.content ?? "");
      conv.messages.push({ id: Date.now(), role: "user", content: question, createdAt: new Date() });
      const grounded = contractForQuestion({ contractText: question }) ?? state.contracts[0];
      const response = groundedAnswer(question, grounded);
      conv.messages.push({ id: Date.now() + 1, role: "assistant", content: response, createdAt: new Date() });
      persistDemoState();
      return { success: true, response };
    }
    case "aiChat.analyzeClause":
    case "aiChat.askAboutContract":
    case "aiChat.summarizeContract":
    case "aiChat.identifyRisks":
    case "aiChat.suggestModifications": {
      const contract = contractForQuestion(input);
      const question = String(input.question ?? input.clauseText ?? input.focusAreas ?? "summarize risks");
      const answer = groundedAnswer(question, contract);
      return {
        success: true,
        analysis: answer,
        answer,
        summary: answer,
        risks: answer,
        suggestions: answer,
        clauseType: input.clauseType,
        question: input.question,
        contractType: input.contractType,
        detailLevel: input.detailLevel,
      };
    }
    case "timeTracking.getTimeEntries":
      return [];
    case "timeTracking.getActiveSession":
      return null;
    case "timeTracking.getBillableRate":
      return { rate: 350, currency: "USD" };
    case "timeTracking.startTimer":
      return { success: true, id: Date.now() };
    case "timeTracking.pauseTimer":
    case "timeTracking.resumeTimer":
    case "timeTracking.stopTimer":
    case "timeTracking.submitTimesheet":
      return { success: true };
    case "workflows.list":
      return [
        { id: 1, title: "Contract Review — TechCorp Service Agreement", status: "processing", progress: 78 },
        { id: 2, title: "Due Diligence — Global Partners Acquisition", status: "processing", progress: 45 },
      ];
    default: {
      if (path.endsWith(".list") || path.includes(".search") || path.endsWith("Approvals")) return [];
      if (path.startsWith("export.")) return { success: true, url: "#" };
      return { success: true };
    }
  }
}

export const demoTrpcLink: TRPCLink<AppRouter> = () => {
  return ({ op }) => {
    return observable(observer => {
      try {
        const data = dispatchDemoProcedure(op.path, op.input);
        observer.next({ result: { type: "data", data } });
        observer.complete();
      } catch (error) {
        observer.error(
          error instanceof TRPCClientError
            ? error
            : new TRPCClientError(error instanceof Error ? error.message : String(error)),
        );
      }
    });
  };
};
