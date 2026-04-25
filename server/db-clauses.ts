/**
 * Database helpers for Legal Clauses Library
 */

import { eq, like, and, desc } from "drizzle-orm";
import { legalClauses, clauseUsageAnalytics, realtimeNotifications } from "../drizzle/schema";
import { getDb } from "./db";

export async function createLegalClause(data: {
  firmId: number;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  description?: string;
  tags?: string[];
  riskLevel?: "low" | "medium" | "high";
  jurisdiction?: string;
  industry?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(legalClauses).values({
    ...data,
    tags: data.tags ? JSON.stringify(data.tags) : null,
  });
  return result;
}

export async function getLegalClausesByFirm(firmId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(legalClauses).where(eq(legalClauses.firmId, firmId));
}

export async function searchLegalClauses(
  firmId: number,
  searchTerm: string,
  filters?: {
    category?: string;
    riskLevel?: "low" | "medium" | "high";
    jurisdiction?: string;
    industry?: string;
  }
) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(legalClauses.firmId, firmId), like(legalClauses.title, `%${searchTerm}%`)];
  
  if (filters?.category) {
    conditions.push(eq(legalClauses.category, filters.category));
  }
  if (filters?.riskLevel) {
    conditions.push(eq(legalClauses.riskLevel, filters.riskLevel));
  }
  if (filters?.jurisdiction) {
    conditions.push(eq(legalClauses.jurisdiction, filters.jurisdiction));
  }
  if (filters?.industry) {
    conditions.push(eq(legalClauses.industry, filters.industry));
  }

  return db.select().from(legalClauses).where(and(...conditions));
}

export async function getLegalClauseById(id: number, firmId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(legalClauses)
    .where(and(eq(legalClauses.id, id), eq(legalClauses.firmId, firmId)))
    .limit(1);
  return rows[0] || null;
}

export async function updateLegalClause(
  id: number,
  firmId: number,
  data: Partial<{
    title: string;
    category: string;
    subcategory: string;
    content: string;
    description: string;
    tags: string[];
    riskLevel: "low" | "medium" | "high";
    jurisdiction: string;
    industry: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(legalClauses)
    .set({
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
    })
    .where(and(eq(legalClauses.id, id), eq(legalClauses.firmId, firmId)));
}

export async function trackClauseUsage(data: {
  firmId: number;
  clauseId: number;
  documentId?: number;
  contractId?: number;
  userId: number;
  usageType: "created" | "copied" | "modified" | "viewed";
  context?: any;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Track usage
  await db.insert(clauseUsageAnalytics).values({
    ...data,
    context: data.context ? JSON.stringify(data.context) : null,
  });

  // Increment usage count
  const clause = await getLegalClauseById(data.clauseId, data.firmId);
  if (clause) {
    await db
      .update(legalClauses)
      .set({ usageCount: (clause.usageCount || 0) + 1 })
      .where(eq(legalClauses.id, data.clauseId));
  }
}

export async function getClauseUsageAnalytics(firmId: number, clauseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(clauseUsageAnalytics)
    .where(
      and(
        eq(clauseUsageAnalytics.firmId, firmId),
        eq(clauseUsageAnalytics.clauseId, clauseId)
      )
    );
}

export async function getTopUsedClauses(firmId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(legalClauses)
    .where(eq(legalClauses.firmId, firmId))
    .orderBy((t: any) => desc(t.usageCount))
    .limit(limit);
}

export async function createRealtimeNotification(data: {
  firmId: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(realtimeNotifications).values(data);
}

export async function getUserRealtimeNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(realtimeNotifications)
    .where(eq(realtimeNotifications.userId, userId))
    .orderBy((t: any) => desc(t.createdAt));
}

export async function markRealtimeNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(realtimeNotifications)
    .set({ isRead: 1, readAt: new Date() })
    .where(eq(realtimeNotifications.id, notificationId));
}
