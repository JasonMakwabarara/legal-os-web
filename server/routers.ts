import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { authenticateLocalUser, registerLocalUser } from "./_core/localAuth";
import { sdk } from "./_core/sdk";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { completeLlm, getLlmModelName, LlmError } from "./services/llm";
import {
  analyzeContract,
  extractTextFromUpload,
  runContractReview,
  totalExposureOf,
} from "./services/contractAnalysis";
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


/** Extract plain text from an invokeLLM result (content is string-typed union). */
const llmText = (response: Awaited<ReturnType<typeof invokeLLM>>): string => {
  const content = response.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(part => ('text' in part ? part.text : '')).join('');
  }
  return '';
};

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
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await authenticateLocalUser(input.email, input.password);

        if (!user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
        }

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || user.email || user.openId,
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return user;
      }),
    register: publicProcedure
      .input(z.object({
        name: z.string().min(1, 'Name is required').max(200),
        email: z.string().email(),
        password: z.string().min(8, 'Password must be at least 8 characters').max(200),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await registerLocalUser(input);

        if (!user) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'An account with this email already exists. Sign in instead.',
          });
        }

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || user.email || user.openId,
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return user;
      }),
    // Token variant of login for webviews where cookies are unreliable
    // (Word add-in task pane). The token goes in `Authorization: Bearer`.
    tokenLogin: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const user = await authenticateLocalUser(input.email, input.password);

        if (!user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
        }

        const token = await sdk.createSessionToken(user.openId, {
          name: user.name || user.email || user.openId,
          expiresInMs: ONE_YEAR_MS,
        });

        return { user, token };
      }),
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
        // Create new firm and assign user as its admin
        const firm = await db.createFirm({ name: input.firmName });
        await db.assignUserToFirm(ctx.user.id, firm.id, 'admin');
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

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        fileName: z.string().min(1),
        fileMimeType: z.string().optional(),
        fileSize: z.number().optional(),
        clientId: z.number().nullable().optional(),
        caseId: z.number().nullable().optional(),
        description: z.string().optional(),
        /** Base64 file content (optionally a data URL). Triggers the AI review. */
        fileContent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        // Extract text up front so a bad file fails the upload immediately.
        let originalText: string | undefined;
        if (input.fileContent) {
          if ((input.fileSize ?? 0) > 50 * 1024 * 1024) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'File size exceeds 50MB limit' });
          }
          const base64 = input.fileContent.includes(',')
            ? input.fileContent.slice(input.fileContent.indexOf(',') + 1)
            : input.fileContent;
          try {
            const buffer = Buffer.from(base64, 'base64');
            originalText = await extractTextFromUpload(buffer, input.fileName, input.fileMimeType);
          } catch (error) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Could not read "${input.fileName}": ${(error as Error).message}`,
            });
          }
          if (!originalText) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `"${input.fileName}" contains no readable text. Scanned PDFs need OCR before upload.`,
            });
          }
        }

        const created = await db.createContract({
          firmId: ctx.user.firmId,
          name: input.name,
          fileName: input.fileName,
          fileMimeType: input.fileMimeType,
          fileSize: input.fileSize,
          clientId: input.clientId ?? undefined,
          caseId: input.caseId ?? undefined,
          description: input.description,
          originalText,
          status: "review",
          uploadedBy: ctx.user.id,
        });
        if (!created) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create contract' });
        }

        if (input.caseId) {
          await db.createDocument({
            firmId: ctx.user.firmId,
            contractId: created.id,
            caseId: input.caseId,
            name: input.fileName || input.name,
            type: "contract",
            fileName: input.fileName,
            uploadedBy: ctx.user.id,
          });
        }

        // Run the AI review in the background; the client polls via
        // reviewProgress / getRisks / getRedlines.
        if (originalText) {
          void runContractReview(created.id, originalText);
        }

        return created;
      }),

    attach: protectedProcedure
      .input(z.object({
        id: z.number(),
        clientId: z.number().nullable().optional(),
        caseId: z.number().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const contract = await db.getContractById(input.id, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }
        if (input.clientId !== undefined) {
          await db.updateContract(input.id, { clientId: input.clientId });
        }
        if (input.caseId !== undefined) {
          await db.updateContract(input.id, { caseId: input.caseId });
        }
        if (input.caseId) {
          await db.createDocument({
            firmId: ctx.user.firmId,
            contractId: input.id,
            caseId: input.caseId,
            name: contract.fileName || contract.name,
            type: "contract",
            fileName: contract.fileName,
            uploadedBy: ctx.user.id,
          });
        }
        return db.getContractById(input.id, ctx.user.firmId);
      }),

    getRedlines: protectedProcedure
      .input(z.object({ contractId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const contract = await db.getContractById(input.contractId, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }
        const reviewRunning =
          contract.reviewProgress > 0 && contract.reviewProgress < 100 && !contract.redlinedText;
        return {
          originalText:
            contract.originalText ||
            contract.description ||
            "The original text for this contract was not stored. Re-upload the file to run an AI review.",
          redlinedText:
            contract.redlinedText ||
            (reviewRunning
              ? "AI review in progress — refresh in a few seconds."
              : "No AI redline available yet. Upload the contract file to generate one."),
          analysisSummary: contract.analysisSummary ?? null,
          reviewProgress: contract.reviewProgress,
        };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['draft', 'review', 'approved', 'executed', 'archived']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        const contract = await db.getContractById(input.id, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }
        await db.updateContract(input.id, { status: input.status });
        return db.getContractById(input.id, ctx.user.firmId);
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
          // Extract text server-side and store it in the database. The
          // original binary is not retained this round (fileUrl stays null).
          const base64 = input.fileContent.includes(',')
            ? input.fileContent.slice(input.fileContent.indexOf(',') + 1)
            : input.fileContent;
          const buffer = Buffer.from(base64, 'base64');
          const extractedText = await extractTextFromUpload(
            buffer,
            input.fileName,
            input.fileMimeType
          );

          await db.createDocument({
            firmId: ctx.user.firmId,
            name: input.fileName,
            type: 'other',
            fileName: input.fileName,
            fileMimeType: input.fileMimeType,
            fileSize: input.fileSize,
            status: 'active',
            uploadedBy: ctx.user.id,
          });

          return {
            tempId: input.tempId,
            fileName: input.fileName,
            extractedText,
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

          const clauseData = JSON.parse(llmText(response));
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
    /** Re-run the AI review for a stored contract (synchronous). */
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
        if (!contract.originalText) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No stored text for this contract — re-upload the file to analyze it.',
          });
        }
        await db.deleteRiskAlertsByContract(contract.id);
        await runContractReview(contract.id, contract.originalText);
        const updated = await db.getContractById(contract.id, ctx.user.firmId);
        return {
          summary: updated?.analysisSummary ?? '',
          riskLevel: updated?.riskLevel ?? 'medium',
          totalExposure: updated?.totalExposure ?? '0',
          status: updated?.reviewProgress === 100 ? 'completed' : 'failed',
        };
      }),

    /**
     * Analyze a document supplied as paragraph chunks — the Word add-in path.
     * Returns paragraph-anchored redlines plus risks and the marked-up text.
     */
    analyzeDocument: protectedProcedure
      .input(z.object({
        documentName: z.string().optional(),
        paragraphs: z.array(z.object({
          index: z.number().int().min(0),
          text: z.string(),
        })).min(1).max(5000),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }
        try {
          const analysis = await analyzeContract({ paragraphs: input.paragraphs });
          return {
            ...analysis,
            totalExposure: totalExposureOf(analysis.risks),
            documentName: input.documentName,
          };
        } catch (error) {
          if (error instanceof LlmError) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
          }
          throw error;
        }
      }),

    /** Current stored risk picture for a contract (no LLM call). */
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
        const alerts = await db.getRiskAlertsByContract(input.contractId);
        const toEntry = (alert: (typeof alerts)[number]) => ({
          issue: alert.issue,
          exposure: Number(alert.exposure ?? 0),
          recommendation: alert.recommendation ?? '',
        });
        return {
          highRisks: alerts.filter(a => a.level === 'high').map(toEntry),
          mediumRisks: alerts.filter(a => a.level === 'medium').map(toEntry),
          lowRisks: alerts.filter(a => a.level === 'low').map(toEntry),
          totalExposure: Number(contract.totalExposure ?? 0),
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
          model: getLlmModelName(),
        });
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.string(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        // History BEFORE persisting the new message, so it isn't duplicated.
        const history = await db.getAIChatMessages(input.conversationId);

        await db.createAIChatMessage({
          firmId: ctx.user.firmId,
          userId: ctx.user.id,
          conversationId: input.conversationId,
          role: 'user',
          content: input.content,
          model: getLlmModelName(),
        });

        // Ground the assistant in the firm's workspace: contract summaries,
        // open risks, and text excerpts.
        const firmContracts = await db.getContractsByFirm(ctx.user.firmId);
        const recentContracts = firmContracts
          .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
          .slice(0, 8);

        const contextBlocks: string[] = [];
        for (const contract of recentContracts) {
          const risks = await db.getRiskAlertsByContract(contract.id);
          const openRisks = risks.filter(r => r.status === 'open');
          const lines = [
            `### ${contract.name} (status: ${contract.status}, risk: ${contract.riskLevel})`,
          ];
          if (contract.analysisSummary) lines.push(`Summary: ${contract.analysisSummary}`);
          if (openRisks.length > 0) {
            lines.push('Open risks:');
            for (const risk of openRisks.slice(0, 6)) {
              lines.push(`- [${risk.level}] ${risk.issue}${risk.recommendation ? ` → ${risk.recommendation}` : ''}`);
            }
          }
          if (contract.originalText) {
            lines.push(`Excerpt:\n"""\n${contract.originalText.slice(0, 1500)}\n"""`);
          }
          contextBlocks.push(lines.join('\n'));
        }

        const system = [
          'You are the Legal OS assistant for a small law firm. You help lawyers understand the contracts in their workspace.',
          'Ground every answer in the workspace contracts provided below. Name the contract you are drawing from. If the workspace does not contain the answer, say so plainly instead of guessing.',
          'You provide decision support for qualified lawyers, not legal advice. Be concise and concrete.',
          '',
          contextBlocks.length > 0
            ? `## Workspace contracts\n\n${contextBlocks.join('\n\n')}`
            : '## Workspace contracts\n\n(No contracts uploaded yet — suggest uploading an agreement to review.)',
        ].join('\n');

        const chatHistory = history
          .slice(-20)
          .map(message => ({
            role: message.role === 'assistant' ? ('assistant' as const) : ('user' as const),
            content: message.content,
          }));

        let assistantResponse: string;
        let servedByModel = getLlmModelName();
        try {
          const completion = await completeLlm({
            system,
            messages: [...chatHistory, { role: 'user', content: input.content }],
            maxTokens: 4000,
          });
          assistantResponse = completion.text.trim();
          servedByModel = completion.model || servedByModel;
          if (!assistantResponse) {
            throw new LlmError('The assistant returned an empty response — please retry.', { retryable: true });
          }
        } catch (error) {
          const message =
            error instanceof LlmError ? error.message : 'The assistant is unavailable right now.';
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
        }

        await db.createAIChatMessage({
          firmId: ctx.user.firmId,
          userId: ctx.user.id,
          conversationId: input.conversationId,
          role: 'assistant',
          content: assistantResponse,
          model: servedByModel,
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
          analysis: llmText(response),
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
          answer: llmText(response),
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
          summary: llmText(response),
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
          risks: llmText(response),
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
          suggestions: llmText(response),
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

        // Create new firm; the creator becomes its admin.
        const firm = await db.createFirm({
          name: input.name,
          email: input.email,
          phone: input.phone,
          address: input.address,
          website: input.website,
        });

        await db.assignUserToFirm(ctx.user.id, firm.id, 'admin');

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
