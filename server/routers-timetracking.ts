import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import {
  timeEntries,
  timesheets,
  billableRates,
  timeTrackingSessions,
  invoices,
  invoiceLineItems,
  timeEntryAdjustments,
  timeTrackingAnalytics,
} from "../drizzle/schema";


/**
 * Time Tracking Router - Comprehensive billable hours and time entry management
 */
export const timeTrackingRouter = router({
  /**
   * Start a new timer session
   */
  startTimer: protectedProcedure
    .input(
      z.object({
        taskType: z.enum([
          "research",
          "drafting",
          "review",
          "client_meeting",
          "court_appearance",
          "negotiation",
          "filing",
          "consultation",
          "administrative",
          "other",
        ]),
        description: z.string().min(1),
        caseId: z.number().optional(),
        contractId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User must be associated with a firm",
        });
      }

      const session = await db.createTimeTrackingSession({
        firmId: ctx.user.firmId,
        userId: ctx.user.id,
        taskType: input.taskType,
        description: input.description,
        caseId: input.caseId,
        contractId: input.contractId,
        startTime: new Date(),
        status: "running",
      });

      return session;
    }),

  /**
   * Pause current timer session
   */
  pauseTimer: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await db.getTimeTrackingSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      return await db.updateTimeTrackingSession(input.sessionId, {
        status: "paused",
        pausedAt: new Date(),
      });
    }),

  /**
   * Resume paused timer session
   */
  resumeTimer: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await db.getTimeTrackingSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      const pausedMinutes = session.totalPausedMinutes || 0;
      const pausedAt = session.pausedAt;
      const additionalPausedMinutes = pausedAt
        ? Math.floor((new Date().getTime() - pausedAt.getTime()) / 60000)
        : 0;

      return await db.updateTimeTrackingSession(input.sessionId, {
        status: "running",
        pausedAt: null,
        totalPausedMinutes: pausedMinutes + additionalPausedMinutes,
      });
    }),

  /**
   * Stop timer and create time entry
   */
  stopTimer: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        isBillable: z.enum(["yes", "no"]).optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await db.getTimeTrackingSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      const endTime = new Date();
      const startTime = session.startTime;
      const pausedMinutes = session.totalPausedMinutes || 0;
      const totalMinutes = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 60000 - pausedMinutes
      );

      // Get billable rate
      const rate = await db.getBillableRateForUser(
        ctx.user.firmId!,
        ctx.user.id
      );
      const hourlyRate = rate?.hourlyRate || 0;
      const billableMinutes = input.isBillable === "no" ? 0 : totalMinutes;
      const billableAmount =
        (billableMinutes / 60) * parseFloat(hourlyRate.toString());

      // Create time entry
      const timeEntry = await db.createTimeEntry({
        firmId: ctx.user.firmId!,
        userId: ctx.user.id,
        caseId: session.caseId,
        contractId: session.contractId,
        taskType: session.taskType,
        description: session.description || "",
        startTime,
        endTime,
        durationMinutes: totalMinutes,
        billableMinutes,
        isBillable: input.isBillable || "yes",
        hourlyRate,
        billableAmount,
        status: "draft",
        notes: input.notes,
        tags: input.tags,
      });

      // Delete the session
      await db.deleteTimeTrackingSession(input.sessionId);

      return timeEntry;
    }),

  /**
   * Get active timer session for user
   */
  getActiveSession: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.firmId) return null;

    const sessions = await db.getTimeTrackingSessionsByUser(
      ctx.user.firmId,
      ctx.user.id,
      "running"
    );

    return sessions.length > 0 ? sessions[0] : null;
  }),

  /**
   * Get time entries for date range
   */
  getTimeEntries: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        userId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User must be associated with a firm",
        });
      }

      const userId = input.userId || ctx.user.id;

      // Check authorization
      if (input.userId && input.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to view other user's time entries",
        });
      }

      return await db.getTimeEntriesByDateRange(
        ctx.user.firmId,
        userId,
        input.startDate,
        input.endDate
      );
    }),

  /**
   * Create manual time entry
   */
  createTimeEntry: protectedProcedure
    .input(
      z.object({
        taskType: z.enum([
          "research",
          "drafting",
          "review",
          "client_meeting",
          "court_appearance",
          "negotiation",
          "filing",
          "consultation",
          "administrative",
          "other",
        ]),
        description: z.string().min(1),
        startTime: z.date(),
        endTime: z.date(),
        isBillable: z.enum(["yes", "no"]),
        notes: z.string().optional(),
        caseId: z.number().optional(),
        contractId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User must be associated with a firm",
        });
      }

      const durationMinutes = Math.floor(
        (input.endTime.getTime() - input.startTime.getTime()) / 60000
      );

      const rate = await db.getBillableRateForUser(
        ctx.user.firmId,
        ctx.user.id
      );
      const hourlyRate = rate?.hourlyRate || 0;
      const billableMinutes = input.isBillable === "yes" ? durationMinutes : 0;
      const billableAmount =
        (billableMinutes / 60) * parseFloat(hourlyRate.toString());

      return await db.createTimeEntry({
        firmId: ctx.user.firmId,
        userId: ctx.user.id,
        taskType: input.taskType,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        durationMinutes,
        billableMinutes,
        isBillable: input.isBillable,
        hourlyRate,
        billableAmount,
        status: "draft",
        notes: input.notes,
        caseId: input.caseId,
        contractId: input.contractId,
      });
    }),

  /**
   * Update time entry
   */
  updateTimeEntry: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        description: z.string().optional(),
        isBillable: z.enum(["yes", "no"]).optional(),
        notes: z.string().optional(),
        billableMinutes: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await db.getTimeEntryById(input.id);
      if (!entry || entry.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Time entry not found" });
      }

      if (entry.status !== "draft") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Can only edit draft time entries",
        });
      }

      const billableMinutes = input.billableMinutes ?? entry.billableMinutes;
      const billableAmount =
        (billableMinutes / 60) * parseFloat(entry.hourlyRate?.toString() || "0");

      return await db.updateTimeEntry(input.id, {
        description: input.description,
        isBillable: input.isBillable,
        notes: input.notes,
        billableMinutes,
        billableAmount,
      });
    }),

  /**
   * Submit timesheet for approval
   */
  submitTimesheet: protectedProcedure
    .input(
      z.object({
        timesheetId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const timesheet = await db.getTimesheetById(input.timesheetId);
      if (!timesheet || timesheet.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Timesheet not found" });
      }

      if (timesheet.status !== "draft") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Can only submit draft timesheets",
        });
      }

      return await db.updateTimesheet(input.timesheetId, {
        status: "submitted",
        submittedAt: new Date(),
        notes: input.notes,
      });
    }),

  /**
   * Approve timesheet (admin only)
   */
  approveTimesheet: protectedProcedure
    .input(z.object({ timesheetId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can approve timesheets",
        });
      }

      const timesheet = await db.getTimesheetById(input.timesheetId);
      if (!timesheet) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Timesheet not found" });
      }

      return await db.updateTimesheet(input.timesheetId, {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: ctx.user.id,
      });
    }),

  /**
   * Get billable rate for user
   */
  getBillableRate: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.firmId) return null;

    return await db.getBillableRateForUser(ctx.user.firmId, ctx.user.id);
  }),

  /**
   * Set billable rate for user
   */
  setBillableRate: protectedProcedure
    .input(
      z.object({
        hourlyRate: z.number().positive(),
        practiceArea: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User must be associated with a firm",
        });
      }

      return await db.createBillableRate({
        firmId: ctx.user.firmId,
        userId: ctx.user.id,
        hourlyRate: input.hourlyRate,
        practiceArea: input.practiceArea,
        effectiveDate: new Date(),
        isActive: "yes",
      });
    }),

  /**
   * Get timesheet summary for period
   */
  getTimesheetSummary: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) return null;

      const entries = await db.getTimeEntriesByDateRange(
        ctx.user.firmId,
        ctx.user.id,
        input.startDate,
        input.endDate
      );

      const totalMinutes = entries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
      const billableMinutes = entries.reduce((sum, e) => sum + (e.billableMinutes || 0), 0);
      const totalAmount = entries.reduce(
        (sum, e) => sum + parseFloat(e.billableAmount?.toString() || "0"),
        0
      );

      return {
        totalHours: totalMinutes / 60,
        billableHours: billableMinutes / 60,
        totalAmount,
        billabilityPercentage: totalMinutes > 0 ? (billableMinutes / totalMinutes) * 100 : 0,
        entryCount: entries.length,
      };
    }),

  /**
   * Generate invoice from timesheet
   */
  generateInvoice: protectedProcedure
    .input(
      z.object({
        timesheetId: z.number(),
        clientId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can generate invoices",
        });
      }

      const timesheet = await db.getTimesheetById(input.timesheetId);
      if (!timesheet || timesheet.status !== "approved") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Can only invoice approved timesheets",
        });
      }

      // Create invoice
      const invoice = await db.createInvoice({
        firmId: ctx.user.firmId!,
        clientId: input.clientId,
        invoiceNumber: `INV-${Date.now()}`,
        periodStartDate: timesheet.periodStartDate,
        periodEndDate: timesheet.periodEndDate,
        totalAmount: timesheet.totalAmount || 0,
        totalHours: timesheet.totalBillableHours || 0,
        status: "draft",
        issuedDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Create line items from time entries
      const entries = await db.getTimeEntriesByDateRange(
        ctx.user.firmId!,
        timesheet.userId,
        timesheet.periodStartDate,
        timesheet.periodEndDate
      );

      for (const entry of entries) {
        if (entry.billableAmount && entry.billableAmount > 0) {
          await db.createInvoiceLineItem({
            invoiceId: invoice.id,
            timeEntryId: entry.id,
            description: entry.description,
            taskType: entry.taskType,
            hours: (entry.billableMinutes || 0) / 60,
            hourlyRate: entry.hourlyRate || 0,
            amount: entry.billableAmount,
          });
        }
      }

      // Update timesheet status
      await db.updateTimesheet(input.timesheetId, { status: "billed" });

      return invoice;
    }),
});
