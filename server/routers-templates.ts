/**
 * tRPC router for Clause Templates and Approval Workflow
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import * as templateDb from "./db-templates";

export const templatesRouter = router({
  // Create a new template
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.string().min(1),
        subcategory: z.string().optional(),
        content: z.string().min(1),
        components: z.any().optional(),
        tags: z.array(z.string()).optional(),
        riskLevel: z.enum(["low", "medium", "high"]).optional(),
        jurisdiction: z.string().optional(),
        industry: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        await templateDb.createClauseTemplate({
          firmId: ctx.user.firmId,
          ...input,
          createdBy: ctx.user.id,
        });
        return { success: true, message: "Template created successfully" };
      } catch (error) {
        console.error("[templates] Failed to create template:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create template" });
      }
    }),

  // List all templates for firm
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.firmId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
    }
    try {
      return await templateDb.getClauseTemplatesByFirm(ctx.user.firmId);
    } catch (error) {
      console.error("[templates] Failed to list templates:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to list templates" });
    }
  }),

  // Get single template
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        const template = await templateDb.getClauseTemplateById(input.id, ctx.user.firmId);
        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }
        return template;
      } catch (error) {
        console.error("[templates] Failed to get template:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get template" });
      }
    }),

  // Update template
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        content: z.string().optional(),
        components: z.any().optional(),
        tags: z.array(z.string()).optional(),
        riskLevel: z.enum(["low", "medium", "high"]).optional(),
        jurisdiction: z.string().optional(),
        industry: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        const { id, ...updateData } = input;
        await templateDb.updateClauseTemplate(id, ctx.user.firmId, updateData);
        return { success: true, message: "Template updated successfully" };
      } catch (error) {
        console.error("[templates] Failed to update template:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update template" });
      }
    }),

  // Get template versions
  getVersions: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        return await templateDb.getTemplateVersions(input.templateId);
      } catch (error) {
        console.error("[templates] Failed to get versions:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get versions" });
      }
    }),

  // Create new version (for approval workflow)
  createVersion: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        content: z.string().min(1),
        components: z.any().optional(),
        changeLog: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        // Get current template to determine next version number
        const template = await templateDb.getClauseTemplateById(input.templateId, ctx.user.firmId);
        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }

        const versions = await templateDb.getTemplateVersions(input.templateId);
        const nextVersion = (versions.length || 0) + 1;

        await templateDb.createTemplateVersion({
          templateId: input.templateId,
          versionNumber: nextVersion,
          content: input.content,
          components: input.components,
          changeLog: input.changeLog,
          createdBy: ctx.user.id,
        });

        return { success: true, versionNumber: nextVersion };
      } catch (error) {
        console.error("[templates] Failed to create version:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create version" });
      }
    }),

  // Request approval for a version
  requestApproval: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        versionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        await templateDb.requestTemplateApproval({
          templateId: input.templateId,
          versionId: input.versionId,
          requestedBy: ctx.user.id,
        });
        return { success: true, message: "Approval requested successfully" };
      } catch (error) {
        console.error("[templates] Failed to request approval:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to request approval" });
      }
    }),

  // Get pending approvals
  getPendingApprovals: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.firmId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
    }
    try {
      return await templateDb.getPendingApprovals(ctx.user.firmId);
    } catch (error) {
      console.error("[templates] Failed to get pending approvals:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get approvals" });
    }
  }),

  // Approve a version
  approve: protectedProcedure
    .input(z.object({ approvalId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      // Check if user has approval permission (must be admin or lawyer)
      if (!['admin', 'lawyer'].includes(ctx.user.role || '')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to approve templates' });
      }
      try {
        await templateDb.approveTemplateVersion(input.approvalId, ctx.user.id);
        return { success: true, message: "Template approved successfully" };
      } catch (error) {
        console.error("[templates] Failed to approve:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to approve" });
      }
    }),

  // Reject a version
  reject: protectedProcedure
    .input(
      z.object({
        approvalId: z.number(),
        rejectionReason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      // Check if user has approval permission (must be admin or lawyer)
      if (!['admin', 'lawyer'].includes(ctx.user.role || '')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to reject templates' });
      }
      try {
        await templateDb.rejectTemplateVersion(input.approvalId, input.rejectionReason);
        return { success: true, message: "Template rejected successfully" };
      } catch (error) {
        console.error("[templates] Failed to reject:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to reject" });
      }
    }),

  // Set approval rules for a category
  setApprovalRules: protectedProcedure
    .input(
      z.object({
        category: z.string(),
        requiredApprovals: z.number().min(1),
        approverRoles: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can set approval rules' });
      }
      try {
        await templateDb.setApprovalRules({
          firmId: ctx.user.firmId,
          ...input,
        });
        return { success: true, message: "Approval rules updated successfully" };
      } catch (error) {
        console.error("[templates] Failed to set rules:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to set rules" });
      }
    }),
});
