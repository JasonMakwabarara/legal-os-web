import { getDb } from "./db";
import {
  documentOcrContent,
  searchIndex,
  clauseCategories,
  extractedClauses,
  searchHistory,
  savedSearches,
  searchAnalytics,
} from "../drizzle/schema";
import { eq, and, like, desc, sql } from "drizzle-orm";

const getDatabase = async () => {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  return db;
};

/**
 * OCR Content Management
 */
export async function createOcrContent(data: typeof documentOcrContent.$inferInsert) {
  const db = await getDatabase();
  return db.insert(documentOcrContent).values(data);
}

export async function getOcrContentByDocumentId(documentId: number, firmId: number) {
  const db = await getDatabase();
  const rows = await db
    .select()
    .from(documentOcrContent)
    .where(and(eq(documentOcrContent.documentId, documentId), eq(documentOcrContent.firmId, firmId)));
  return rows[0] || null;
}

export async function updateOcrContent(id: number, data: Partial<typeof documentOcrContent.$inferInsert>) {
  const db = await getDatabase();
  return db.update(documentOcrContent).set(data).where(eq(documentOcrContent.id, id));
}

/**
 * Search Index Management
 */
export async function createSearchIndex(data: typeof searchIndex.$inferInsert) {
  const db = await getDatabase();
  return db.insert(searchIndex).values(data);
}

export async function getSearchIndexByDocumentId(documentId: number, firmId: number) {
  const db = await getDatabase();
  const rows = await db
    .select()
    .from(searchIndex)
    .where(and(eq(searchIndex.documentId, documentId), eq(searchIndex.firmId, firmId)));
  return rows[0] || null;
}

export async function updateSearchIndex(id: number, data: Partial<typeof searchIndex.$inferInsert>) {
  const db = await getDatabase();
  return db.update(searchIndex).set(data).where(eq(searchIndex.id, id));
}

/**
 * Full-Text Search across documents
 */
export async function searchDocuments(
  firmId: number,
  searchQuery: string,
  filters?: {
    documentType?: string;
    minRelevance?: number;
    limit?: number;
    offset?: number;
  }
) {
  const db = await getDatabase();
  let whereConditions = and(
    eq(searchIndex.firmId, firmId),
    sql`MATCH(${searchIndex.searchableContent}) AGAINST(${searchQuery} IN BOOLEAN MODE)`
  );

  if (filters?.documentType) {
    whereConditions = and(whereConditions, eq(searchIndex.documentType, filters.documentType));
  }

  if (filters?.minRelevance) {
    whereConditions = and(whereConditions, sql`${searchIndex.relevanceScore} >= ${filters.minRelevance}`);
  }

  let query = db
    .select()
    .from(searchIndex)
    .where(whereConditions)
    .orderBy(desc(searchIndex.relevanceScore)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return query;
}

/**
 * Clause Categories Management
 */
export async function createClauseCategory(data: typeof clauseCategories.$inferInsert) {
  const db = await getDatabase();
  return db.insert(clauseCategories).values(data);
}

export async function getClauseCategoryByName(name: string) {
  const db = await getDatabase();
  const rows = await db
    .select()
    .from(clauseCategories)
    .where(eq(clauseCategories.name, name));
  return rows[0] || null;
}

export async function listClauseCategories() {
  const db = await getDatabase();
  return db.select().from(clauseCategories).orderBy(clauseCategories.name);
}

/**
 * Extracted Clauses Management
 */
export async function createExtractedClause(data: typeof extractedClauses.$inferInsert) {
  const db = await getDatabase();
  return db.insert(extractedClauses).values(data);
}

export async function getExtractedClausesByDocumentId(documentId: number, firmId: number) {
  const db = await getDatabase();
  return db
    .select()
    .from(extractedClauses)
    .where(and(eq(extractedClauses.documentId, documentId), eq(extractedClauses.firmId, firmId)))
    .orderBy(extractedClauses.startPage);
}

export async function getExtractedClausesByCategory(categoryId: number, firmId: number) {
  const db = await getDatabase();
  return db
    .select()
    .from(extractedClauses)
    .where(and(eq(extractedClauses.categoryId, categoryId), eq(extractedClauses.firmId, firmId)))
    .orderBy(desc(extractedClauses.aiConfidence));
}

export async function getHighRiskClauses(firmId: number, limit = 10) {
  const db = await getDatabase();
  return db
    .select()
    .from(extractedClauses)
    .where(and(eq(extractedClauses.firmId, firmId), eq(extractedClauses.riskLevel, "high")))
    .orderBy(desc(extractedClauses.aiConfidence))
    .limit(limit);
}

/**
 * Search History Management
 */
export async function recordSearchQuery(data: typeof searchHistory.$inferInsert) {
  const db = await getDatabase();
  return db.insert(searchHistory).values(data);
}

export async function getUserSearchHistory(userId: number, firmId: number, limit = 20) {
  const db = await getDatabase();
  return db
    .select()
    .from(searchHistory)
    .where(and(eq(searchHistory.userId, userId), eq(searchHistory.firmId, firmId)))
    .orderBy(desc(searchHistory.createdAt))
    .limit(limit);
}

export async function getTopSearchQueries(firmId: number, limit = 10) {
  const db = await getDatabase();
  return db
    .select({
      query: searchHistory.searchQuery,
      count: sql<number>`COUNT(*) as count`,
    })
    .from(searchHistory)
    .where(eq(searchHistory.firmId, firmId))
    .groupBy(searchHistory.searchQuery)
    .orderBy(sql`count DESC`)
    .limit(limit);
}

/**
 * Saved Searches Management
 */
export async function createSavedSearch(data: typeof savedSearches.$inferInsert) {
  const db = await getDatabase();
  return db.insert(savedSearches).values(data);
}

export async function getUserSavedSearches(userId: number, firmId: number) {
  const db = await getDatabase();
  return db
    .select()
    .from(savedSearches)
    .where(and(eq(savedSearches.userId, userId), eq(savedSearches.firmId, firmId)))
    .orderBy(desc(savedSearches.createdAt));
}

export async function getSavedSearchById(id: number, firmId: number) {
  const db = await getDatabase();
  const rows = await db
    .select()
    .from(savedSearches)
    .where(and(eq(savedSearches.id, id), eq(savedSearches.firmId, firmId)));
  return rows[0] || null;
}

export async function updateSavedSearch(id: number, data: Partial<typeof savedSearches.$inferInsert>) {
  const db = await getDatabase();
  return db.update(savedSearches).set(data).where(eq(savedSearches.id, id));
}

export async function deleteSavedSearch(id: number) {
  const db = await getDatabase();
  return db.delete(savedSearches).where(eq(savedSearches.id, id));
}

/**
 * Search Analytics
 */
export async function recordSearchAnalytics(data: typeof searchAnalytics.$inferInsert) {
  const db = await getDatabase();
  return db.insert(searchAnalytics).values(data);
}

export async function getSearchAnalytics(firmId: number, date: Date) {
  const db = await getDatabase();
  const rows = await db
    .select()
    .from(searchAnalytics)
    .where(and(eq(searchAnalytics.firmId, firmId), eq(searchAnalytics.date, date)));
  return rows[0] || null;
}

export async function getSearchAnalyticsRange(firmId: number, startDate: Date, endDate: Date) {
  const db = await getDatabase();
  return db
    .select()
    .from(searchAnalytics)
    .where(
      and(
        eq(searchAnalytics.firmId, firmId),
        sql`${searchAnalytics.date} >= ${startDate} AND ${searchAnalytics.date} <= ${endDate}`
      )
    )
    .orderBy(searchAnalytics.date);
}
