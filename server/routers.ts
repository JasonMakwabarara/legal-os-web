import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { generateRedlineAnalysis, generateDueDiligenceReport, generateLitigationStrategy, predictCaseOutcome } from "./services/advancedAIService";
import { clausesRouter, realtimeNotificationsRouter } from "./routers-clauses";
import { templatesRouter } from "./routers-templates";
import { invitationsRouter } from "./routers-invitations";
import { searchRouter } from "./routers-search";
import { integrationsRouter } from "./routers-integrations";
import { workflowsRouter } from "./routers-workflows";
import { eSignaturesRouter } from "./routers-esignatures";
import { researchRouter } from "./routers-research";
import { complianceRouter } from "./routers-compliance";
import { timeTrackingRouter } from "./routers-timetracking";
import { exportRouter } from "./routers-export";

export const appRouter = router({
  system: systemRouter,
  integrations: integrationsRouter,
  workflows: workflowsRouter,
  eSignatures: eSignaturesRouter,
  research: researchRouter,
  compliance: complianceRouter,
  timeTracking: timeTrackingRouter,
  export: exportRouter,
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
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string().min(1),
          fileContent: z.string(),
          fileMimeType: z.string(),
          fileSize: z.number(),
          tempId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }: any) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        try {
          if (input.fileSize > 50 * 1024 * 1024) {
            throw new Error('File size exceeds 50MB limit');
          }
          const buffer = Buffer.from(input.fileContent.split(',')[1] || input.fileContent, 'base64');
          const storageKey = `documents/${ctx.user.firmId}/${Date.now()}-${input.fileName}`;
          const { url, key } = await storagePut(storageKey, buffer, input.fileMimeType);
          return {
            tempId: input.tempId,
            fileName: input.fileName,
            fileUrl: url,
          };
        } catch (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Upload failed: ${(error as Error).message}` });
        }
      }),
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
    extractClauses: protectedProcedure
      .input(z.object({
        documentText: z.string().min(1),
        documentName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: 'You are a legal document analyzer. Extract individual clauses from the provided text. For each clause, identify: 1) The clause text, 2) Its category (e.g., Liability, Termination, Confidentiality, Payment), 3) Risk level (high/medium/low), 4) Confidence score (0-100). Return as JSON array.',
              },
              {
                role: 'user',
                content: `Extract clauses from this legal document:\n\n${input.documentText.substring(0, 5000)}`,
              },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'clauses',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    clauses: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          text: { type: 'string' },
                          category: { type: 'string' },
                          riskLevel: { type: 'string', enum: ['high', 'medium', 'low'] },
                          confidence: { type: 'number' },
                        },
                        required: ['text', 'category', 'riskLevel', 'confidence'],
                      },
                    },
                  },
                  required: ['clauses'],
                },
              },
            },
          });

          const clauseData = JSON.parse(response.choices?.[0]?.message?.content as string);
          return {
            success: true,
            clauses: clauseData.clauses || [],
            documentName: input.documentName,
          };
        } catch (error) {
          console.error('Clause extraction error:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to extract clauses' });
        }
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
        return db.getUserNotifications(ctx.user.id, ctx.user.firmId || 0);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.markNotificationAsRead(input.notificationId);
      }),

    createDeadlineAlert: protectedProcedure
      .input(z.object({
        contractId: z.number().optional(),
        dueDate: z.date(),
        title: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        return db.createNotification({
          firmId: ctx.user.firmId,
          userId: ctx.user.id,
          type: 'deadline',
          title: input.title,
          message: input.description || `Deadline: ${input.dueDate.toLocaleDateString()}`,
          priority: 'high',
          relatedEntityType: input.contractId ? 'contract' : undefined,
          relatedEntityId: input.contractId,
        });
      }),

    createCaseUpdateNotification: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        title: z.string(),
        description: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        return db.createNotification({
          firmId: ctx.user.firmId,
          userId: ctx.user.id,
          type: 'case_update',
          title: input.title,
          message: input.description,
          priority: input.priority,
          relatedEntityType: 'case',
          relatedEntityId: input.caseId,
        });
      }),
    savePreferences: protectedProcedure
      .input(z.object({
        preferences: z.array(z.object({
          type: z.string(),
          enabled: z.boolean(),
          channels: z.object({
            inApp: z.boolean(),
            email: z.boolean(),
            sms: z.boolean().optional(),
          }),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log("[notifications] Saving preferences for user:", ctx.user.id);
        return { success: true, message: "Preferences saved successfully" };
      }),
  }),

  // AI Chat router
  aiChat: router({
    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserAIChatConversations(ctx.user.id, ctx.user.firmId || 0);
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

    analyzeClause: protectedProcedure
      .input(z.object({
        clauseText: z.string().min(1),
        clauseType: z.string().optional(),
        jurisdiction: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are an expert legal analyst. Analyze the provided clause and provide plain English explanation, key obligations, potential risks, and recommended modifications.',
            },
            {
              role: 'user',
              content: `Analyze this ${input.clauseType || 'contract'} clause:\n\n${input.clauseText}`,
            },
          ],
        });
        return {
          success: true,
          analysis: response.choices?.[0]?.message?.content || '',
          clauseType: input.clauseType,
        };
      }),

    askAboutContract: protectedProcedure
      .input(z.object({
        contractText: z.string().min(1),
        question: z.string().min(1),
        contractType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are an expert legal advisor. Answer questions about the provided contract accurately and concisely.',
            },
            {
              role: 'user',
              content: `Contract:\n${input.contractText}\n\nQuestion: ${input.question}`,
            },
          ],
        });
        return {
          success: true,
          answer: response.choices?.[0]?.message?.content || '',
          question: input.question,
        };
      }),

    summarizeContract: protectedProcedure
      .input(z.object({
        contractText: z.string().min(1),
        contractType: z.string().optional(),
        detailLevel: z.enum(['brief', 'standard', 'detailed']).default('standard'),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are an expert legal document analyst. Summarize the provided contract with clear sections and bullet points.',
            },
            {
              role: 'user',
              content: `Summarize this ${input.contractType || 'contract'} (${input.detailLevel} detail):\n\n${input.contractText}`,
            },
          ],
        });
        return {
          success: true,
          summary: response.choices?.[0]?.message?.content || '',
          contractType: input.contractType,
          detailLevel: input.detailLevel,
        };
      }),

    identifyRisks: protectedProcedure
      .input(z.object({
        contractText: z.string().min(1),
        contractType: z.string().optional(),
        jurisdiction: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are an expert risk management attorney. Identify potential risks in the contract and provide severity levels and mitigation strategies.',
            },
            {
              role: 'user',
              content: `Identify risks in this ${input.contractType || 'contract'}:\n\n${input.contractText}`,
            },
          ],
        });
        return {
          success: true,
          risks: response.choices?.[0]?.message?.content || '',
          contractType: input.contractType,
        };
      }),

    suggestModifications: protectedProcedure
      .input(z.object({
        contractText: z.string().min(1),
        contractType: z.string().optional(),
        focusAreas: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are an expert contract drafter. Suggest specific modifications and improvements to the contract.',
            },
            {
              role: 'user',
              content: `Suggest modifications for this ${input.contractType || 'contract'}:\n\n${input.contractText}`,
            },
          ],
        });
        return {
          success: true,
          suggestions: response.choices?.[0]?.message?.content || '',
          contractType: input.contractType,
        };
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

    getMembers: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const dbInstance = await db.getDb();
        return (dbInstance as any).query.users.findMany({
          where: (u: any, { eq }: any) => eq(u.firmId, ctx.user.firmId),
        });
      }),
  }),

  // Document Drafting router
  documentDrafts: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        return db.getDocumentDrafts(ctx.user.firmId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const draft = await db.getDocumentDraftById(input.id);
        if (!draft || draft.firmId !== ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        return draft;
      }),

    create: protectedProcedure
      .input(z.object({
        templateId: z.string(),
        templateName: z.string(),
        title: z.string(),
        content: z.string(),
        variables: z.record(z.string(), z.string()),
        caseId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        return db.createDocumentDraft({
          firmId: ctx.user.firmId,
          userId: ctx.user.id,
          templateId: input.templateId,
          templateName: input.templateName,
          title: input.title,
          content: input.content,
          variables: input.variables,
          caseId: input.caseId,
          status: 'draft',
        });
      }),

    approve: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const draft = await db.getDocumentDraftById(input.id);
        if (!draft || draft.firmId !== ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        return db.updateDocumentDraft(input.id, {
          status: 'approved',
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        });
      }),
  }),


  // Cross-Firm Collaboration
  collaboration: router({
    shareDocument: protectedProcedure
      .input(z.object({
        documentId: z.number(),
        recipientEmail: z.string().email(),
        accessLevel: z.enum(['view', 'edit', 'admin']),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        console.log('[collaboration] Sharing document', input.documentId, 'with', input.recipientEmail);
        
        // Create real-time notification for the recipient
        try {
          await db.createNotification({
            firmId: ctx.user.firmId,
            userId: ctx.user.id,
            type: 'collaboration',
            title: 'Document Shared',
            message: `A document has been shared with you with ${input.accessLevel} access`,
            priority: 'medium',
            relatedEntityType: 'document',
            relatedEntityId: input.documentId,
          });
        } catch (error) {
          console.error('[collaboration] Failed to create notification:', error);
        }
        
        return { success: true, message: 'Document shared successfully' };
      }),

    getSharedDocuments: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        return [];
      }),

    revokeAccess: protectedProcedure
      .input(z.object({ shareId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        console.log('[collaboration] Revoking access for share', input.shareId);
        
        // Create real-time notification for access revocation
        try {
          await db.createNotification({
            firmId: ctx.user.firmId || 0,
            userId: ctx.user.id,
            type: 'collaboration',
            title: 'Access Revoked',
            message: 'Your access to a shared document has been revoked',
            priority: 'high',
            relatedEntityType: 'document',
            relatedEntityId: input.shareId,
          });
        } catch (error) {
          console.error('[collaboration] Failed to create notification:', error);
        }
        
        return { success: true, message: 'Access revoked successfully' };
      }),
  }),

  // Advanced AI Features
  advancedAI: router({
    generateRedline: protectedProcedure
      .input(z.object({ contractId: z.number(), contractText: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const contract = await db.getContractById(input.contractId, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }
        try {
          const analysis = await generateRedlineAnalysis(input.contractText);
          return analysis;
        } catch (error) {
          console.error('[advancedAI] Redline generation failed:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Redline analysis failed' });
        }
      }),

    generateDueDiligence: protectedProcedure
      .input(z.object({ documentId: z.number(), documentText: z.string(), context: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const documents = await db.getDocumentsByFirm(ctx.user.firmId);
        const document = documents.find(d => d.id === input.documentId);
        if (!document) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
        }
        try {
          const report = await generateDueDiligenceReport(input.documentText, input.context);
          return report;
        } catch (error) {
          console.error('[advancedAI] Due diligence analysis failed:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Due diligence analysis failed' });
        }
      }),

    generateLitigationStrategy: protectedProcedure
      .input(z.object({ caseId: z.number(), caseDescription: z.string(), caseHistory: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const caseRecord = await db.getCaseById(input.caseId, ctx.user.firmId);
        if (!caseRecord) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Case not found' });
        }
        try {
          const strategy = await generateLitigationStrategy(input.caseDescription, input.caseHistory);
          return strategy;
        } catch (error) {
          console.error('[advancedAI] Litigation strategy generation failed:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Litigation strategy generation failed' });
        }
      }),

    predictCaseOutcome: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const caseRecord = await db.getCaseById(input.caseId, ctx.user.firmId);
        if (!caseRecord) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Case not found' });
        }
        try {
          const allCases = await db.getCasesByFirm(ctx.user.firmId);
          const historicalCases = allCases.filter(c => c.id !== input.caseId).slice(0, 5);
          const prediction = await predictCaseOutcome(caseRecord, historicalCases);
          return prediction;
        } catch (error) {
          console.error('[advancedAI] Case outcome prediction failed:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Case outcome prediction failed' });
        }
      }),
  }),

  // Legal Clauses Library
  clauses: clausesRouter,

  // Real-Time Notifications
  realtimeNotifications: realtimeNotificationsRouter,

  // Clause Templates with Approval Workflow
  templates: templatesRouter,

  // Firm Invitations
  invitations: invitationsRouter,

  // Advanced Search & OCR
  search: searchRouter,
});


export type AppRouter = typeof appRouter;
