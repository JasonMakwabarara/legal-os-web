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
    initializeFirm: protectedProcedure
      .input(z.object({ firmName: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can initialize firms
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can create firms' });
        }
        // If user already has a firm, return it
        if (ctx.user.firmId) {
          return { firmId: ctx.user.firmId, message: 'User already assigned to firm' };
        }
        // Create new firm and assign user
        const firm = await db.createFirm({ name: input.firmName });
        await db.assignUserToFirm(ctx.user.id, firm.id);
        return { firmId: firm.id, message: 'Firm created and user assigned' };
      }),
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

    search: protectedProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const contracts = await db.getContractsByFirm(ctx.user.firmId);
        const searchLower = input.query.toLowerCase();
        return contracts.filter(c => 
          c.name.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
        );
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

    search: protectedProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const cases = await db.getCasesByFirm(ctx.user.firmId);
        const searchLower = input.query.toLowerCase();
        return cases.filter(c => 
          c.name.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
        );
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

    search: protectedProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const clients = await db.getClientsByFirm(ctx.user.firmId);
        const searchLower = input.query.toLowerCase();
        return clients.filter(c => 
          c.name.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.phone?.toLowerCase().includes(searchLower)
        );
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

  // AI Analysis router
  analysis: router({
    analyzeContract: protectedProcedure
      .input(z.object({ contractId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const contract = await db.getContractById(input.contractId, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }
        // TODO: Implement AI contract analysis using LLM
        return {
          summary: 'Contract analysis in progress...',
          keyTerms: ['Payment Terms', 'Liability', 'Termination'],
          recommendations: ['Review liability clause', 'Clarify payment terms'],
          status: 'analyzing',
        };
      }),

    assessRisks: protectedProcedure
      .input(z.object({ contractId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const contract = await db.getContractById(input.contractId, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }
        // TODO: Implement AI risk assessment using LLM
        return {
          highRisks: [
            { issue: 'Unlimited liability clause', exposure: 500000, recommendation: 'Add cap on liability' },
            { issue: 'Vague termination clause', exposure: 250000, recommendation: 'Define termination conditions' },
          ],
          mediumRisks: [
            { issue: 'Payment terms unclear', exposure: 100000, recommendation: 'Specify payment schedule' },
          ],
          totalExposure: 850000,
          status: 'assessed',
        };
      }),
  }),

  // Communications router
  communications: router({
    getClientCommunications: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        return db.getClientCommunications(input.clientId);
      }),

    addCommunication: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        type: z.enum(['email', 'call', 'meeting', 'note', 'document']),
        subject: z.string().optional(),
        content: z.string(),
        participants: z.array(z.string()).optional(),
        duration: z.number().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        return db.createClientCommunication({
          firmId: ctx.user.firmId,
          clientId: input.clientId,
          userId: ctx.user.id,
          type: input.type,
          subject: input.subject,
          content: input.content,
          participants: input.participants,
          duration: input.duration,
          tags: input.tags,
        });
      }),
  }),

  // Notifications router
  notifications: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserNotifications(ctx.user.id);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.markNotificationAsRead(input.notificationId);
      }),
  }),

  // AI Chat router
  aiChat: router({
    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserAIChatConversations(ctx.user.id);
      }),

    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getAIChatMessages(input.conversationId);
      }),

    startConversation: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return db.createAIChatConversation({
          id: conversationId,
          firmId: ctx.user.firmId,
          userId: ctx.user.id,
          title: input.title || 'New Conversation',
          model: 'qwen-3.5',
        });
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        // Store user message
        await db.createAIChatMessage({
          firmId: ctx.user.firmId,
          userId: ctx.user.id,
          conversationId: input.conversationId,
          role: 'user',
          content: input.content,
          model: 'qwen-3.5',
        });
        // TODO: Call Qwen 3.5 LLM API and store assistant response
        // For now, return mock response
        const assistantResponse = 'This is a mock AI response. Integration with Qwen 3.5 coming soon.';
        await db.createAIChatMessage({
          firmId: ctx.user.firmId,
          userId: ctx.user.id,
          conversationId: input.conversationId,
          role: 'assistant',
          content: assistantResponse,
          model: 'qwen-3.5',
        });
        return { success: true, response: assistantResponse };
      }),
  }),

  // Firms router
  firms: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, 'Firm name is required'),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        website: z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already has a firm
        if (ctx.user.firmId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'User already assigned to a firm' });
        }

        // Create new firm
        const firm = await db.createFirm({
          name: input.name,
          email: input.email,
          phone: input.phone,
          address: input.address,
          website: input.website,
        });

        // Assign user to firm
        await db.assignUserToFirm(ctx.user.id, firm.id);

        return firm;
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        if (ctx.user.firmId !== input.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        return db.getFirmById(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
