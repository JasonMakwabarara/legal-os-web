import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Contracts router
  contracts: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        return db.getContractsByFirm(ctx.user.firmId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const contract = await db.getContractById(input.id, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }
        return contract;
      }),

    getRisks: protectedProcedure
      .input(z.object({ contractId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const contract = await db.getContractById(input.contractId, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }
        return db.getRiskAlertsByContract(input.contractId);
      }),

    getCollaborators: protectedProcedure
      .input(z.object({ contractId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const contract = await db.getContractById(input.contractId, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }
        return db.getContractCollaborators(input.contractId);
      }),
  }),

  // Cases router
  cases: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        return db.getCasesByFirm(ctx.user.firmId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const caseRecord = await db.getCaseById(input.id, ctx.user.firmId);
        if (!caseRecord) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Case not found' });
        }
        return caseRecord;
      }),
  }),

  // Clients router
  clients: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        return db.getClientsByFirm(ctx.user.firmId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const client = await db.getClientById(input.id, ctx.user.firmId);
        if (!client) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Client not found' });
        }
        return client;
      }),
  }),

  // Documents router
  documents: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        return db.getDocumentsByFirm(ctx.user.firmId);
      }),

    getByContract: protectedProcedure
      .input(z.object({ contractId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const contract = await db.getContractById(input.contractId, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }
        return db.getDocumentsByContract(input.contractId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
