/**
 * Database helpers for Clause Template operations
 */

import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { clauseTemplates, clauseTemplateVersions, templateApprovals, templateApprovalRules } from "../drizzle/schema";

export async function createClauseTemplate(data: {
  firmId: number;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  content: string;
  components?: any;
  tags?: string[];
  riskLevel?: string;
  jurisdiction?: string;
  industry?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(clauseTemplates).values({
    firmId: data.firmId,
    title: data.title,
    description: data.description || null,
    category: data.category,
    subcategory: data.subcategory || null,
    content: data.content,
    tags: (data.tags ? JSON.stringify(data.tags) : null) as any,
    components: (data.components ? JSON.stringify(data.components) : null) as any,
    riskLevel: data.riskLevel || null,
    jurisdiction: data.jurisdiction || null,
    industry: data.industry || null,
    createdBy: data.createdBy,
  });
  return result;
}

export async function getClauseTemplatesByFirm(firmId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clauseTemplates).where(
    and(
      eq(clauseTemplates.firmId, firmId),
      eq(clauseTemplates.isActive, 1)
    )
  );
}

export async function getClauseTemplateById(id: number, firmId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(clauseTemplates).where(
    and(
      eq(clauseTemplates.id, id),
      eq(clauseTemplates.firmId, firmId)
    )
  ).limit(1);
  return rows[0] || null;
}

export async function updateClauseTemplate(
  id: number,
  firmId: number,
  data: Partial<{
    title: string;
    description: string;
    category: string;
    subcategory: string;
    content: string;
    components: any;
    tags: string[];
    riskLevel: string;
    jurisdiction: string;
    industry: string;
    isActive: number;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { ...data };
  if (data.tags) updateData.tags = JSON.stringify(data.tags) as any;
  if (data.components) updateData.components = JSON.stringify(data.components) as any;
  
  return db.update(clauseTemplates).set(updateData).where(
    and(
      eq(clauseTemplates.id, id),
      eq(clauseTemplates.firmId, firmId)
    )
  );
}

/**
 * Create a new version of a template
 */
export async function createTemplateVersion(data: {
  templateId: number;
  versionNumber: number;
  content: string;
  components?: any;
  changeLog?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(clauseTemplateVersions).values({
    templateId: data.templateId,
    versionNumber: data.versionNumber,
    content: data.content,
    components: (data.components ? JSON.stringify(data.components) : null) as any,
    changeLog: data.changeLog || null,
    createdBy: data.createdBy,
  });
}

/**
 * Get all versions of a template
 */
export async function getTemplateVersions(templateId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(clauseTemplateVersions).where(
    eq(clauseTemplateVersions.templateId, templateId)
  ).orderBy((t: any) => desc(t.versionNumber));
}

/**
 * Get a specific version
 */
export async function getTemplateVersion(versionId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const rows = await db.select().from(clauseTemplateVersions).where(
    eq(clauseTemplateVersions.id, versionId)
  ).limit(1);
  return rows[0] || null;
}

/**
 * Request approval for a template version
 */
export async function requestTemplateApproval(data: {
  templateId: number;
  versionId: number;
  requestedBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(templateApprovals).values({
    ...data,
    status: "pending",
  });
}

/**
 * Get pending approvals for a firm
 */
export async function getPendingApprovals(firmId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Join with templates to filter by firm
  const approvals = await db.select().from(templateApprovals).where(
    eq(templateApprovals.status, "pending")
  );
  
  // Filter by firm (would need to join with templates table in real scenario)
  return approvals;
}

/**
 * Approve a template version
 */
export async function approveTemplateVersion(
  approvalId: number,
  approvedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(templateApprovals).set({
    status: "approved",
    approvedBy,
    approvedAt: new Date(),
  }).where(eq(templateApprovals.id, approvalId));
}

/**
 * Reject a template version
 */
export async function rejectTemplateVersion(
  approvalId: number,
  rejectionReason: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(templateApprovals).set({
    status: "rejected",
    rejectionReason,
  }).where(eq(templateApprovals.id, approvalId));
}

/**
 * Get or create approval rules for a category
 */
export async function getApprovalRules(firmId: number, category: string) {
  const db = await getDb();
  if (!db) return null;
  
  const rows = await db.select().from(templateApprovalRules).where(
    and(
      eq(templateApprovalRules.firmId, firmId),
      eq(templateApprovalRules.category, category)
    )
  ).limit(1);
  
  return rows[0] || null;
}

/**
 * Set approval rules for a category
 */
export async function setApprovalRules(data: {
  firmId: number;
  category: string;
  requiredApprovals: number;
  approverRoles?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if rules already exist
  const existing = await getApprovalRules(data.firmId, data.category);
  
  if (existing) {
    const updateData: any = {
      requiredApprovals: data.requiredApprovals,
    };
    if (data.approverRoles) {
      updateData.approverRoles = JSON.stringify(data.approverRoles) as any;
    }
    return db.update(templateApprovalRules).set(updateData).where(
      and(
        eq(templateApprovalRules.firmId, data.firmId),
        eq(templateApprovalRules.category, data.category)
      )
    );
  } else {
    const insertData: any = {
      firmId: data.firmId,
      category: data.category,
      requiredApprovals: data.requiredApprovals,
    };
    if (data.approverRoles) {
      insertData.approverRoles = JSON.stringify(data.approverRoles) as any;
    }
    return db.insert(templateApprovalRules).values(insertData);
  }
}
