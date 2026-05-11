import { eq, desc, and, gte, lte, between } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  contracts,
  cases,
  clients,
  documents,
  riskAlerts,
  contractCollaborators,
  contractVersions,
  workflows,
  auditLogs,
  firms,
  clientCommunications,
  notifications,
  aiChatMessages,
  aiChatConversations,
  documentDrafts,
  eSignatures,
  signatureAuditTrail,
  integrations,
  timeEntries,
  timesheets,
  billableRates,
  timeTrackingSessions,
  invoices,
  invoiceLineItems,
  timeEntryAdjustments,
  timeTrackingAnalytics,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.openId, openId));
  return rows[0] || null;
}

// Contracts queries
export async function getContractsByFirm(firmId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts).where(eq(contracts.firmId, firmId));
}

export async function getContractById(contractId: number, firmId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(contracts).where(
    and(eq(contracts.id, contractId), eq(contracts.firmId, firmId))
  );
  return rows[0] || null;
}

export async function createContract(data: typeof contracts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(contracts).values(data);
}

export async function updateContract(contractId: number, data: Partial<typeof contracts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(contracts).set(data).where(eq(contracts.id, contractId));
}

// Cases queries
export async function getCasesByFirm(firmId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cases).where(eq(cases.firmId, firmId));
}

export async function getCaseById(caseId: number, firmId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(cases).where(
    and(eq(cases.id, caseId), eq(cases.firmId, firmId))
  );
  return rows[0] || null;
}

// Clients queries
export async function getClientsByFirm(firmId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.firmId, firmId));
}

export async function getClientById(clientId: number, firmId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(clients).where(
    and(eq(clients.id, clientId), eq(clients.firmId, firmId))
  );
  return rows[0] || null;
}

// Documents queries
export async function getDocumentsByFirm(firmId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.firmId, firmId));
}

export async function getDocumentsByContract(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.contractId, contractId));
}

export async function createDocument(data: typeof documents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(documents).values(data);
}

// Risk Alerts queries
export async function getRiskAlertsByContract(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(riskAlerts).where(eq(riskAlerts.contractId, contractId));
}

export async function createRiskAlert(data: typeof riskAlerts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(riskAlerts).values(data);
}

// Contract Collaborators queries
export async function getContractCollaborators(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractCollaborators).where(eq(contractCollaborators.contractId, contractId));
}

export async function addContractCollaborator(data: typeof contractCollaborators.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(contractCollaborators).values(data);
}

export async function updateContractCollaborator(collaboratorId: number, data: Partial<typeof contractCollaborators.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(contractCollaborators).set(data).where(eq(contractCollaborators.id, collaboratorId));
}

// Contract Versions queries
export async function getContractVersions(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contractVersions).where(eq(contractVersions.contractId, contractId));
}

export async function createContractVersion(data: typeof contractVersions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(contractVersions).values(data);
}

// Workflows queries
export async function createWorkflow(data: typeof workflows.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(workflows).values(data);
}

export async function getWorkflowById(workflowId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(workflows).where(eq(workflows.id, workflowId));
  return rows[0] || null;
}

export async function updateWorkflow(workflowId: number, data: Partial<typeof workflows.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(workflows).set(data).where(eq(workflows.id, workflowId));
}

// Audit Logs queries
export async function createAuditLog(data: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(auditLogs).values(data);
}

// Firms queries
export async function getFirmById(firmId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(firms).where(eq(firms.id, firmId));
  return rows[0] || null;
}

export async function createFirm(data: typeof firms.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(firms).values(data);
  return { id: result[0].insertId };
}

export async function assignUserToFirm(userId: number, firmId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ firmId }).where(eq(users.id, userId));
}

// Integration functions
export async function createIntegration(data: typeof integrations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(integrations).values(data);
  return { id: result[0].insertId };
}

export async function getIntegration(integrationId: number, firmId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(integrations).where(
    and(eq(integrations.id, integrationId), eq(integrations.firmId, firmId))
  );
  return rows[0] || null;
}

export async function getIntegrationsByFirm(firmId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(integrations).where(eq(integrations.firmId, firmId));
}

export async function updateIntegrationSync(integrationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(integrations)
    .set({ lastSyncAt: new Date() })
    .where(eq(integrations.id, integrationId));
}

export async function deleteIntegration(integrationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(integrations).where(eq(integrations.id, integrationId));
}

// Client Communication queries
export async function getClientCommunications(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientCommunications).where(eq(clientCommunications.clientId, clientId));
}

export async function createClientCommunication(data: typeof clientCommunications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(clientCommunications).values(data);
}

// Notifications queries
export async function getNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function createNotification(data: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(notifications).values(data);
}

// AI Chat queries
export async function createAIChatMessage(data: typeof aiChatMessages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(aiChatMessages).values(data);
}

export async function getAIChatMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiChatMessages)
    .where(eq(aiChatMessages.conversationId, conversationId))
    .orderBy(aiChatMessages.createdAt);
}

export async function createAIChatConversation(data: typeof aiChatConversations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(aiChatConversations).values(data);
}

export async function getAIChatConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiChatConversations)
    .where(eq(aiChatConversations.userId, userId))
    .orderBy(desc(aiChatConversations.updatedAt));
}


// ============================================================================
// TIME TRACKING QUERIES
// ============================================================================

// Time Entries
export async function createTimeEntry(data: typeof timeEntries.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(timeEntries).values(data);
  return { ...data, id: result[0].insertId };
}

export async function getTimeEntryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
  return results[0] || null;
}

export async function getTimeEntriesByDateRange(
  firmId: number,
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timeEntries)
    .where(
      and(
        eq(timeEntries.firmId, firmId),
        eq(timeEntries.userId, userId),
        gte(timeEntries.startTime, startDate),
        lte(timeEntries.startTime, endDate)
      )
    )
    .orderBy(desc(timeEntries.startTime));
}

export async function updateTimeEntry(id: number, data: Partial<typeof timeEntries.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(timeEntries).set(data).where(eq(timeEntries.id, id));
  return getTimeEntryById(id);
}

// Time Tracking Sessions
export async function createTimeTrackingSession(data: typeof timeTrackingSessions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(timeTrackingSessions).values(data);
  return { ...data, id: result[0].insertId };
}

export async function getTimeTrackingSessionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(timeTrackingSessions).where(eq(timeTrackingSessions.id, id));
  return results[0] || null;
}

export async function getTimeTrackingSessionsByUser(
  firmId: number,
  userId: number,
  status?: string
) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    eq(timeTrackingSessions.firmId, firmId),
    eq(timeTrackingSessions.userId, userId),
  ];
  if (status) {
    conditions.push(eq(timeTrackingSessions.status, status as any));
  }
  return db.select().from(timeTrackingSessions)
    .where(and(...conditions))
    .orderBy(desc(timeTrackingSessions.startTime));
}

export async function updateTimeTrackingSession(
  id: number,
  data: Partial<typeof timeTrackingSessions.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(timeTrackingSessions).set(data).where(eq(timeTrackingSessions.id, id));
  return getTimeTrackingSessionById(id);
}

export async function deleteTimeTrackingSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(timeTrackingSessions).where(eq(timeTrackingSessions.id, id));
}

// Billable Rates
export async function createBillableRate(data: typeof billableRates.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(billableRates).values(data);
  return { ...data, id: result[0].insertId };
}

export async function getBillableRateForUser(firmId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(billableRates)
    .where(
      and(
        eq(billableRates.firmId, firmId),
        eq(billableRates.userId, userId),
        eq(billableRates.isActive, "yes")
      )
    )
    .orderBy(desc(billableRates.effectiveDate))
    .limit(1);
  return results[0] || null;
}

// Timesheets
export async function createTimesheet(data: typeof timesheets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(timesheets).values(data);
  return { ...data, id: result[0].insertId };
}

export async function getTimesheetById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(timesheets).where(eq(timesheets.id, id));
  return results[0] || null;
}

export async function updateTimesheet(id: number, data: Partial<typeof timesheets.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(timesheets).set(data).where(eq(timesheets.id, id));
  return getTimesheetById(id);
}

// Invoices
export async function createInvoice(data: typeof invoices.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(invoices).values(data);
  return { ...data, id: result[0].insertId };
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(invoices).where(eq(invoices.id, id));
  return results[0] || null;
}

export async function updateInvoice(id: number, data: Partial<typeof invoices.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
  return getInvoiceById(id);
}

// Invoice Line Items
export async function createInvoiceLineItem(data: typeof invoiceLineItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(invoiceLineItems).values(data);
  return { ...data, id: result[0].insertId };
}

export async function getInvoiceLineItems(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoiceId));
}

// Time Entry Adjustments
export async function createTimeEntryAdjustment(data: typeof timeEntryAdjustments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(timeEntryAdjustments).values(data);
  return { ...data, id: result[0].insertId };
}

// Time Tracking Analytics
export async function createTimeTrackingAnalytics(data: typeof timeTrackingAnalytics.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(timeTrackingAnalytics).values(data);
  return { ...data, id: result[0].insertId };
}

export async function getTimeTrackingAnalytics(
  firmId: number,
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timeTrackingAnalytics)
    .where(
      and(
        eq(timeTrackingAnalytics.firmId, firmId),
        eq(timeTrackingAnalytics.userId, userId),
        gte(timeTrackingAnalytics.date, startDate),
        lte(timeTrackingAnalytics.date, endDate)
      )
    )
    .orderBy(timeTrackingAnalytics.date);
}


// E-Signature functions
export async function createESignature(data: typeof eSignatures.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(eSignatures).values(data);
  return { ...data, id: result[0].insertId };
}

export async function getESignatureById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(eSignatures).where(eq(eSignatures.id, id));
  return rows[0] || null;
}

export async function getESignaturesByDocument(documentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eSignatures).where(eq(eSignatures.documentId, documentId));
}

export async function updateESignature(id: number, data: Partial<typeof eSignatures.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(eSignatures).set(data).where(eq(eSignatures.id, id));
}

export async function createSignatureAuditEntry(data: typeof signatureAuditTrail.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(signatureAuditTrail).values(data);
  return { ...data, id: result[0].insertId };
}

export async function getSignatureAuditTrail(eSignatureId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(signatureAuditTrail)
    .where(eq(signatureAuditTrail.eSignatureId, eSignatureId))
    .orderBy(desc(signatureAuditTrail.createdAt));
}
