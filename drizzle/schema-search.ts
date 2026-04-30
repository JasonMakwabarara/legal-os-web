import { mysqlTable, int, varchar, text, timestamp, json, mysqlEnum, decimal } from "drizzle-orm/mysql-core";

/**
 * Document OCR Content table - stores extracted text from documents via OCR
 * Used for full-text search and clause analysis
 */
export const documentOcrContent = mysqlTable("documentOcrContent", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  firmId: int("firmId").notNull(),
  extractedText: text("extractedText").notNull(), // Full text extracted via OCR
  pageCount: int("pageCount"),
  ocrConfidence: decimal("ocrConfidence", { precision: 5, scale: 2 }), // 0-100 confidence score
  language: varchar("language", { length: 10 }).default("en"), // ISO 639-1 language code
  processingStatus: mysqlEnum("processingStatus", ["pending", "processing", "completed", "failed"]).default("pending"),
  processingError: text("processingError"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentOcrContent = typeof documentOcrContent.$inferSelect;
export type InsertDocumentOcrContent = typeof documentOcrContent.$inferInsert;

/**
 * Full-Text Search Index table - stores searchable content with metadata
 * Optimized for fast searching across documents
 */
export const searchIndex = mysqlTable("searchIndex", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  firmId: int("firmId").notNull(),
  documentType: varchar("documentType", { length: 50 }).notNull(), // contract, brief, memo, etc.
  documentName: varchar("documentName", { length: 255 }).notNull(),
  searchableContent: text("searchableContent").notNull(), // Indexed content for FTS
  keywords: json("keywords"), // Array of extracted keywords
  summary: text("summary"), // Brief summary of document
  relevanceScore: decimal("relevanceScore", { precision: 5, scale: 2 }).default("0"), // 0-100
  lastIndexedAt: timestamp("lastIndexedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SearchIndex = typeof searchIndex.$inferSelect;
export type InsertSearchIndex = typeof searchIndex.$inferInsert;

/**
 * Clause Categories table - predefined legal clause categories for classification
 */
export const clauseCategories = mysqlTable("clauseCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // e.g., "Limitation of Liability", "Indemnification"
  description: text("description"),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("medium"),
  jurisdiction: varchar("jurisdiction", { length: 100 }), // e.g., "US", "UK", "EU"
  industry: varchar("industry", { length: 100 }), // e.g., "Technology", "Healthcare", "Finance"
  keywords: json("keywords"), // Array of keywords to identify this clause type
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClauseCategory = typeof clauseCategories.$inferSelect;
export type InsertClauseCategory = typeof clauseCategories.$inferInsert;

/**
 * Extracted Clauses table - individual clauses extracted and categorized from documents
 */
export const extractedClauses = mysqlTable("extractedClauses", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  firmId: int("firmId").notNull(),
  categoryId: int("categoryId"),
  clauseText: text("clauseText").notNull(), // The actual clause text
  startPage: int("startPage"),
  endPage: int("endPage"),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("medium"),
  aiConfidence: decimal("aiConfidence", { precision: 5, scale: 2 }).default("0"), // 0-100 confidence
  flaggedIssues: json("flaggedIssues"), // Array of identified issues
  suggestedRevision: text("suggestedRevision"), // AI-suggested revision
  extractedAt: timestamp("extractedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExtractedClause = typeof extractedClauses.$inferSelect;
export type InsertExtractedClause = typeof extractedClauses.$inferInsert;

/**
 * Search History table - tracks user searches for analytics and suggestions
 */
export const searchHistory = mysqlTable("searchHistory", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  userId: int("userId").notNull(),
  searchQuery: varchar("searchQuery", { length: 500 }).notNull(),
  resultCount: int("resultCount").default(0),
  filters: json("filters"), // Applied filters
  searchType: mysqlEnum("searchType", ["full_text", "clause", "document", "advanced"]).default("full_text"),
  resultClicked: int("resultClicked"), // ID of result clicked if any
  durationMs: int("durationMs"), // Search duration in milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;

/**
 * Saved Searches table - allows users to save and reuse searches
 */
export const savedSearches = mysqlTable("savedSearches", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  searchQuery: varchar("searchQuery", { length: 500 }).notNull(),
  filters: json("filters"), // Saved filters
  searchType: mysqlEnum("searchType", ["full_text", "clause", "document", "advanced"]).default("full_text"),
  isPublic: mysqlEnum("isPublic", ["yes", "no"]).default("no"),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

/**
 * Search Analytics table - aggregated search analytics for insights
 */
export const searchAnalytics = mysqlTable("searchAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  firmId: int("firmId").notNull(),
  date: timestamp("date").notNull(),
  totalSearches: int("totalSearches").default(0),
  uniqueUsers: int("uniqueUsers").default(0),
  averageResultsPerSearch: decimal("averageResultsPerSearch", { precision: 8, scale: 2 }).default("0"),
  topSearchQueries: json("topSearchQueries"), // Array of top 10 queries
  averageSearchDurationMs: int("averageSearchDurationMs").default(0),
  clauseSearchPercentage: decimal("clauseSearchPercentage", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SearchAnalytics = typeof searchAnalytics.$inferSelect;
export type InsertSearchAnalytics = typeof searchAnalytics.$inferInsert;
