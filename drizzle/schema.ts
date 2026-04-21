import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "lawyer", "paralegal"]).default("user").notNull(),
  firmId: int("firmId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Law Firm table - represents each law firm using the platform
 */
export const firms = mysqlTable("firms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Firm = typeof firms.$inferSelect;
export type InsertFirm = typeof firms.$inferInsert;

/**
 * Contracts table - stores contract documents and metadata
 */
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  clientId: int("clientId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "review", "approved", "executed", "archived"]).default("draft").notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("medium").notNull(),
  fileKey: varchar("fileKey", { length: 255 }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileName: varchar("fileName", { length: 255 }),
  fileMimeType: varchar("fileMimeType", { length: 100 }),
  fileSize: int("fileSize"),
  reviewProgress: int("reviewProgress").default(0).notNull(),
  totalExposure: decimal("totalExposure", { precision: 15, scale: 2 }).default("0"),
  uploadedBy: int("uploadedBy"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

/**
 * Contract Versions - tracks versions of contracts for collaboration
 */
export const contractVersions = mysqlTable("contractVersions", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  versionNumber: int("versionNumber").notNull(),
  fileKey: varchar("fileKey", { length: 255 }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  createdBy: int("createdBy").notNull(),
  changesSummary: text("changesSummary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContractVersion = typeof contractVersions.$inferSelect;
export type InsertContractVersion = typeof contractVersions.$inferInsert;

/**
 * Contract Collaborators - tracks who is editing a contract in real-time
 */
export const contractCollaborators = mysqlTable("contractCollaborators", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["viewer", "editor", "owner"]).default("viewer").notNull(),
  lastActiveAt: timestamp("lastActiveAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContractCollaborator = typeof contractCollaborators.$inferSelect;
export type InsertContractCollaborator = typeof contractCollaborators.$inferInsert;

/**
 * Cases table - stores legal cases
 */
export const cases = mysqlTable("cases", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  clientId: int("clientId"),
  name: varchar("name", { length: 255 }).notNull(),
  caseNumber: varchar("caseNumber", { length: 100 }).unique(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "closed", "on_hold", "pending"]).default("active").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  assignedTo: int("assignedTo"),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;

/**
 * Clients table - stores client information
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["individual", "corporate"]).default("individual").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zipCode", { length: 20 }),
  country: varchar("country", { length: 100 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Documents table - stores documents for cases and contracts
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  contractId: int("contractId"),
  caseId: int("caseId"),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["contract", "brief", "memo", "discovery", "other"]).default("other").notNull(),
  fileKey: varchar("fileKey", { length: 255 }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileName: varchar("fileName", { length: 255 }),
  fileMimeType: varchar("fileMimeType", { length: 100 }),
  fileSize: int("fileSize"),
  status: mysqlEnum("status", ["active", "archived", "draft"]).default("active").notNull(),
  uploadedBy: int("uploadedBy"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Risk Alerts table - stores identified risks in contracts
 */
export const riskAlerts = mysqlTable("riskAlerts", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  level: mysqlEnum("level", ["low", "medium", "high"]).default("medium").notNull(),
  issue: text("issue").notNull(),
  exposure: decimal("exposure", { precision: 15, scale: 2 }).default("0"),
  recommendation: text("recommendation"),
  status: mysqlEnum("status", ["open", "resolved", "ignored"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RiskAlert = typeof riskAlerts.$inferSelect;
export type InsertRiskAlert = typeof riskAlerts.$inferInsert;

/**
 * Workflows table - tracks AI agent processing workflows
 */
export const workflows = mysqlTable("workflows", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  contractId: int("contractId"),
  caseId: int("caseId"),
  type: mysqlEnum("type", ["contract_review", "due_diligence", "litigation_prep", "risk_analysis"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  progress: int("progress").default(0).notNull(),
  result: json("result"),
  error: text("error"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

/**
 * Audit Log table - tracks all changes for compliance and security
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId"),
  changes: json("changes"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;