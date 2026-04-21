import { eq, and } from "drizzle-orm";
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
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Contract queries
export async function getContractsByFirm(firmId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts).where(eq(contracts.firmId, firmId));
}

export async function getContractById(contractId: number, firmId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(contracts)
    .where(and(eq(contracts.id, contractId), eq(contracts.firmId, firmId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createContract(data: typeof contracts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contracts).values(data);
  return result;
}

export async function updateContract(contractId: number, data: Partial<typeof contracts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(contracts).set(data).where(eq(contracts.id, contractId));
}

// Case queries
export async function getCasesByFirm(firmId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cases).where(eq(cases.firmId, firmId));
}

export async function getCaseById(caseId: number, firmId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(cases)
    .where(and(eq(cases.id, caseId), eq(cases.firmId, firmId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Client queries
export async function getClientsByFirm(firmId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.firmId, firmId));
}

export async function getClientById(clientId: number, firmId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.firmId, firmId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Document queries
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

// Risk Alert queries
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

// Workflow queries
export async function createWorkflow(data: typeof workflows.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(workflows).values(data);
}

export async function getWorkflowById(workflowId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(workflows).where(eq(workflows.id, workflowId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateWorkflow(workflowId: number, data: Partial<typeof workflows.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(workflows).set(data).where(eq(workflows.id, workflowId));
}

// Audit Log queries
export async function createAuditLog(data: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(auditLogs).values(data);
}

// Firm queries
export async function getFirmById(firmId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(firms).where(eq(firms.id, firmId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createFirm(data: typeof firms.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(firms).values(data);
}
