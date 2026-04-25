/**
 * tRPC router for Legal Clauses Library
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import * as clauseDb from "./db-clauses";

export const clausesRouter = router({
  // Create a new legal clause
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        category: z.string().min(1),
        subcategory: z.string().optional(),
        content: z.string().min(1),
        description: z.string().optional(),
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
        await clauseDb.createLegalClause({
          firmId: ctx.user.firmId,
          ...input,
          createdBy: ctx.user.id,
        });
        return { success: true, message: "Clause created successfully" };
      } catch (error) {
        console.error("[clauses] Failed to create clause:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create clause" });
      }
    }),

  // Search clauses
  search: protectedProcedure
    .input(
      z.object({
        searchTerm: z.string(),
        category: z.string().optional(),
        riskLevel: z.enum(["low", "medium", "high"]).optional(),
        jurisdiction: z.string().optional(),
        industry: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        const clauses = await clauseDb.searchLegalClauses(ctx.user.firmId, input.searchTerm, {
          category: input.category,
          riskLevel: input.riskLevel,
          jurisdiction: input.jurisdiction,
          industry: input.industry,
        });
        return clauses;
      } catch (error) {
        console.error("[clauses] Search failed:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Search failed" });
      }
    }),

  // Get all clauses for firm
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.firmId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
    }
    try {
      return await clauseDb.getLegalClausesByFirm(ctx.user.firmId);
    } catch (error) {
      console.error("[clauses] Failed to list clauses:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to list clauses" });
    }
  }),

  // Get single clause
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        const clause = await clauseDb.getLegalClauseById(input.id, ctx.user.firmId);
        if (!clause) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Clause not found" });
        }
        // Track view usage
        await clauseDb.trackClauseUsage({
          firmId: ctx.user.firmId,
          clauseId: input.id,
          userId: ctx.user.id,
          usageType: "viewed",
        });
        return clause;
      } catch (error) {
        console.error("[clauses] Failed to get clause:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get clause" });
      }
    }),

  // Update clause
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        content: z.string().optional(),
        description: z.string().optional(),
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
        await clauseDb.updateLegalClause(id, ctx.user.firmId, updateData);
        return { success: true, message: "Clause updated successfully" };
      } catch (error) {
        console.error("[clauses] Failed to update clause:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update clause" });
      }
    }),

  // Track clause usage
  trackUsage: protectedProcedure
    .input(
      z.object({
        clauseId: z.number(),
        usageType: z.enum(["created", "copied", "modified", "viewed"]),
        documentId: z.number().optional(),
        contractId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        await clauseDb.trackClauseUsage({
          firmId: ctx.user.firmId,
          clauseId: input.clauseId,
          userId: ctx.user.id,
          usageType: input.usageType,
          documentId: input.documentId,
          contractId: input.contractId,
        });
        return { success: true };
      } catch (error) {
        console.error("[clauses] Failed to track usage:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to track usage" });
      }
    }),

  // Get usage analytics
  getUsageAnalytics: protectedProcedure
    .input(z.object({ clauseId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        return await clauseDb.getClauseUsageAnalytics(ctx.user.firmId, input.clauseId);
      } catch (error) {
        console.error("[clauses] Failed to get usage analytics:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get analytics" });
      }
    }),

  // Get top used clauses
  getTopUsed: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        return await clauseDb.getTopUsedClauses(ctx.user.firmId, input.limit);
      } catch (error) {
        console.error("[clauses] Failed to get top clauses:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get top clauses" });
      }
    }),
});

// Real-time Notifications Router
export const realtimeNotificationsRouter = router({
  // Get user notifications
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await clauseDb.getUserRealtimeNotifications(ctx.user.id);
    } catch (error) {
      console.error("[notifications] Failed to list notifications:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to list notifications" });
    }
  }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await clauseDb.markRealtimeNotificationAsRead(input.notificationId);
        return { success: true };
      } catch (error) {
        console.error("[notifications] Failed to mark as read:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to mark as read" });
      }
    }),

  // Create notification (internal use)
  create: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        title: z.string(),
        message: z.string(),
        relatedEntityType: z.string().optional(),
        relatedEntityId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not assigned to a firm" });
      }
      try {
        await clauseDb.createRealtimeNotification({
          firmId: ctx.user.firmId,
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      } catch (error) {
        console.error("[notifications] Failed to create notification:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create notification" });
      }
    }),
});
