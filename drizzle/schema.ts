import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, tinyint, boolean } from "drizzle-orm/mysql-core";

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

/**
 * Client Communication History table - tracks all communications with clients
 */
export const clientCommunications = mysqlTable("clientCommunications", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["email", "call", "meeting", "note", "document"]).notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  participants: json("participants"), // Array of participant names/emails
  duration: int("duration"), // Duration in minutes for calls/meetings
  attachments: json("attachments"), // Array of file URLs
  followUpDate: timestamp("followUpDate"),
  tags: json("tags"), // Array of tags for categorization
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientCommunication = typeof clientCommunications.$inferSelect;
export type InsertClientCommunication = typeof clientCommunications.$inferInsert;

/**
 * Notifications table - stores user notifications for deadlines and updates
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["deadline", "case_update", "contract_review", "collaboration", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }), // contract, case, document, etc.
  relatedEntityId: int("relatedEntityId"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  isRead: tinyint("isRead").default(0).notNull(),
  actionUrl: varchar("actionUrl", { length: 255 }),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * AI Chat Messages table - stores conversation history for AI legal assistant
 */
export const aiChatMessages = mysqlTable("aiChatMessages", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  userId: int("userId").notNull(),
  conversationId: varchar("conversationId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  model: varchar("model", { length: 50 }).default("qwen-3.5").notNull(),
  tokens: int("tokens"),
  metadata: json("metadata"), // Additional context like referenced documents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertAIChatMessage = typeof aiChatMessages.$inferInsert;

/**
 * AI Chat Conversations table - groups messages into conversations
 */
export const aiChatConversations = mysqlTable("aiChatConversations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  firmId: int("firmId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  model: varchar("model", { length: 50 }).default("qwen-3.5").notNull(),
  context: json("context"), // Firm data, documents, etc. for context
  messageCount: int("messageCount").default(0).notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIChatConversation = typeof aiChatConversations.$inferSelect;
export type InsertAIChatConversation = typeof aiChatConversations.$inferInsert;


/**
 * Document Drafts table - stores AI-generated document drafts
 */
export const documentDrafts = mysqlTable("documentDrafts", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  userId: int("userId").notNull(),
  documentId: int("documentId"),
  caseId: int("caseId"),
  templateId: varchar("templateId", { length: 50 }).notNull(),
  templateName: varchar("templateName", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  variables: json("variables"), // Template variables used
  status: mysqlEnum("status", ["draft", "review", "approved", "rejected"]).default("draft").notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentDraft = typeof documentDrafts.$inferSelect;
export type InsertDocumentDraft = typeof documentDrafts.$inferInsert;

/**
 * E-Signatures table - stores digital signatures for documents
 */
export const eSignatures = mysqlTable("eSignatures", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  documentId: int("documentId").notNull(),
  signerId: int("signerId").notNull(),
  signerName: varchar("signerName", { length: 255 }).notNull(),
  signerEmail: varchar("signerEmail", { length: 320 }).notNull(),
  signatureImage: text("signatureImage"), // Base64 encoded signature
  signatureHash: varchar("signatureHash", { length: 255 }).notNull(), // SHA-256 hash
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  userAgent: text("userAgent"),
  status: mysqlEnum("status", ["pending", "signed", "rejected"]).default("pending").notNull(),
  signedAt: timestamp("signedAt"),
  rejectionReason: text("rejectionReason"),
  verificationToken: varchar("verificationToken", { length: 255 }).notNull(),
  isVerified: tinyint("isVerified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ESignature = typeof eSignatures.$inferSelect;
export type InsertESignature = typeof eSignatures.$inferInsert;

/**
 * Signature Audit Trail table - tracks all signature events for compliance
 */
export const signatureAuditTrail = mysqlTable("signatureAuditTrail", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  signatureId: int("signatureId").notNull(),
  event: varchar("event", { length: 100 }).notNull(), // "created", "viewed", "signed", "verified", etc.
  details: json("details"), // Additional event details
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SignatureAuditTrail = typeof signatureAuditTrail.$inferSelect;
export type InsertSignatureAuditTrail = typeof signatureAuditTrail.$inferInsert;


/**
 * Legal Clauses Library - stores reusable legal clauses with categorization
 */
export const legalClauses = mysqlTable("legalClauses", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "liability", "payment", "termination", "indemnification", etc.
  subcategory: varchar("subcategory", { length: 100 }),
  content: text("content").notNull(),
  description: text("description"),
  tags: json("tags"), // Array of tags for search
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("medium"),
  jurisdiction: varchar("jurisdiction", { length: 100 }), // "US", "UK", "EU", etc.
  industry: varchar("industry", { length: 100 }), // "tech", "finance", "healthcare", etc.
  createdBy: int("createdBy").notNull(),
  usageCount: int("usageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegalClause = typeof legalClauses.$inferSelect;
export type InsertLegalClause = typeof legalClauses.$inferInsert;

/**
 * Clause Usage Analytics - tracks when clauses are used in documents
 */
export const clauseUsageAnalytics = mysqlTable("clauseUsageAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  clauseId: int("clauseId").notNull(),
  documentId: int("documentId"),
  contractId: int("contractId"),
  userId: int("userId").notNull(),
  usageType: varchar("usageType", { length: 50 }).notNull(), // "created", "copied", "modified", "viewed"
  context: json("context"), // Additional context about usage
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClauseUsageAnalytic = typeof clauseUsageAnalytics.$inferSelect;
export type InsertClauseUsageAnalytic = typeof clauseUsageAnalytics.$inferInsert;

/**
 * Real-Time Notifications - for WebSocket-based notifications
 */
export const realtimeNotifications = mysqlTable("realtimeNotifications", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "document_shared", "access_revoked", "collaboration_invite", etc.
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }), // "document", "collaboration", "contract", etc.
  relatedEntityId: int("relatedEntityId"),
  isRead: tinyint("isRead").default(0).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RealtimeNotification = typeof realtimeNotifications.$inferSelect;
export type InsertRealtimeNotification = typeof realtimeNotifications.$inferInsert;

/**
 * Clause Templates - reusable templates for creating clauses
 */
export const clauseTemplates = mysqlTable("clauseTemplates", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  content: text("content").notNull(),
  components: json("components").$type<any>(), // Array of template components
  tags: json("tags").$type<string[]>(),
  riskLevel: varchar("riskLevel", { length: 20 }), // low, medium, high
  jurisdiction: varchar("jurisdiction", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  isActive: tinyint("isActive").default(1),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClauseTemplate = typeof clauseTemplates.$inferSelect;
export type InsertClauseTemplate = typeof clauseTemplates.$inferInsert;

/**
 * Clause Template Versions - tracks versions of templates
 */
export const clauseTemplateVersions = mysqlTable("clauseTemplateVersions", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  versionNumber: int("versionNumber").notNull(),
  content: text("content").notNull(),
  components: json("components").$type<any>(),
  changeLog: text("changeLog"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClauseTemplateVersion = typeof clauseTemplateVersions.$inferSelect;
export type InsertClauseTemplateVersion = typeof clauseTemplateVersions.$inferInsert;

/**
 * Template Approvals - tracks approval workflow for template changes
 */
export const templateApprovals = mysqlTable("templateApprovals", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  versionId: int("versionId").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // pending, approved, rejected
  requestedBy: int("requestedBy").notNull(),
  approvedBy: int("approvedBy"),
  rejectionReason: text("rejectionReason"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
});

export type TemplateApproval = typeof templateApprovals.$inferSelect;
export type InsertTemplateApproval = typeof templateApprovals.$inferInsert;

/**
 * Template Approval Rules - defines approval requirements per category
 */
export const templateApprovalRules = mysqlTable("templateApprovalRules", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  requiredApprovals: int("requiredApprovals").notNull().default(1),
  approverRoles: json("approverRoles").$type<string[]>(), // Array of roles that can approve
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TemplateApprovalRule = typeof templateApprovalRules.$inferSelect;
export type InsertTemplateApprovalRule = typeof templateApprovalRules.$inferInsert;


/**
 * Firm Invitations - manages user invitations to join firms
 */
export const firmInvitations = mysqlTable("firmInvitations", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  inviteCode: varchar("inviteCode", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  invitedBy: int("invitedBy").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "expired"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt"),
  acceptedAt: timestamp("acceptedAt"),
  acceptedBy: int("acceptedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FirmInvitation = typeof firmInvitations.$inferSelect;
export type InsertFirmInvitation = typeof firmInvitations.$inferInsert;
