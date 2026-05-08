import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

/**
 * E-Signature Integration Router
 * Handles DocuSign and HelloSign/Dropbox Sign integration for contract signing
 */

// DocuSign envelope input
const DocuSignEnvelopeInput = z.object({
  contractId: z.number(),
  signers: z.array(z.object({
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['signer', 'cc', 'approver']),
    order: z.number(),
  })),
  reminderDays: z.number().default(3),
  expirationDays: z.number().default(30),
});

// HelloSign signing request input
const HelloSignRequestInput = z.object({
  contractId: z.number(),
  signers: z.array(z.object({
    email: z.string().email(),
    name: z.string(),
  })),
  ccEmails: z.array(z.string().email()).optional(),
  subject: z.string(),
  message: z.string().optional(),
});

export const eSignaturesRouter = router({
  // Send contract for DocuSign signing
  sendDocuSign: protectedProcedure
    .input(DocuSignEnvelopeInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        const contract = await db.getContractById(input.contractId, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }

        // Simulate DocuSign API call
        const envelopeId = `DSAPI_${Math.random().toString(36).substring(7)}`;

        // Create e-signature record
        await db.createESignature({
          contractId: input.contractId,
          firmId: ctx.user.firmId,
          provider: 'docusign',
          envelopeId,
          status: 'sent',
          signers: input.signers as any,
          sentBy: ctx.user.id,
          sentAt: new Date(),
          expiresAt: new Date(Date.now() + input.expirationDays * 24 * 60 * 60 * 1000),
        });

        return {
          success: true,
          envelopeId,
          message: 'Contract sent for DocuSign signing',
          signingUrl: `https://docusign.com/envelope/${envelopeId}`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send contract for DocuSign signing',
        });
      }
    }),

  // Send contract for HelloSign signing
  sendHelloSign: protectedProcedure
    .input(HelloSignRequestInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        const contract = await db.getContractById(input.contractId, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }

        // Simulate HelloSign API call
        const signatureRequestId = `HS_${Math.random().toString(36).substring(7)}`;

        // Create e-signature record
        await db.createESignature({
          contractId: input.contractId,
          firmId: ctx.user.firmId,
          provider: 'hellosign',
          envelopeId: signatureRequestId,
          status: 'sent',
          signers: input.signers as any,
          sentBy: ctx.user.id,
          sentAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        return {
          success: true,
          signatureRequestId,
          message: 'Contract sent for HelloSign signing',
          signingUrl: `https://hellosign.com/signature_request/${signatureRequestId}`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send contract for HelloSign signing',
        });
      }
    }),

  // Get signature status
  getStatus: protectedProcedure
    .input(z.object({ envelopeId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        // Mock signature status
        return {
          envelopeId: input.envelopeId,
          status: 'in_progress',
          signers: [
            {
              email: 'john@example.com',
              name: 'John Doe',
              status: 'signed',
              signedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            {
              email: 'jane@example.com',
              name: 'Jane Smith',
              status: 'sent',
              sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            },
            {
              email: 'bob@example.com',
              name: 'Bob Johnson',
              status: 'pending',
            },
          ],
          completionPercentage: 33,
          expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch signature status',
        });
      }
    }),

  // Get all signatures for contract
  getContractSignatures: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        const contract = await db.getContractById(input.contractId, ctx.user.firmId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }

        // Mock signature history
        return [
          {
            id: 1,
            provider: 'docusign',
            envelopeId: 'DSAPI_abc123',
            status: 'completed',
            sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            signerCount: 3,
            completedSignerCount: 3,
          },
          {
            id: 2,
            provider: 'hellosign',
            envelopeId: 'HS_def456',
            status: 'in_progress',
            sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            completedAt: null,
            signerCount: 2,
            completedSignerCount: 1,
          },
        ];
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch contract signatures',
        });
      }
    }),

  // Resend signing request
  resend: protectedProcedure
    .input(z.object({
      envelopeId: z.string(),
      signerEmail: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        // Simulate resend API call
        return {
          success: true,
          message: `Signing request resent to ${input.signerEmail}`,
          sentAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to resend signing request',
        });
      }
    }),

  // Void/cancel signing request
  void: protectedProcedure
    .input(z.object({ envelopeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        // Simulate void API call
        return {
          success: true,
          message: 'Signing request cancelled',
          voidedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to void signing request',
        });
      }
    }),

  // Download signed document
  downloadSigned: protectedProcedure
    .input(z.object({ envelopeId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        // Return mock download URL
        return {
          success: true,
          downloadUrl: `/api/esignatures/download/${input.envelopeId}`,
          fileName: 'contract_signed.pdf',
          fileSize: 245000,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to download signed document',
        });
      }
    }),

  // Get audit trail
  getAuditTrail: protectedProcedure
    .input(z.object({ envelopeId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        // Mock audit trail
        return [
          {
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            action: 'sent',
            actor: 'admin@firm.com',
            details: 'Envelope sent to 3 signers',
          },
          {
            timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
            action: 'viewed',
            actor: 'john@example.com',
            details: 'Document viewed',
          },
          {
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            action: 'signed',
            actor: 'john@example.com',
            details: 'Document signed',
          },
          {
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            action: 'viewed',
            actor: 'jane@example.com',
            details: 'Document viewed',
          },
        ];
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit trail',
        });
      }
    }),

  // Get signing statistics
  getStatistics: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      return {
        totalSent: 156,
        totalCompleted: 142,
        completionRate: 91.0,
        averageSigningTime: 4.2, // days
        pendingSignatures: 14,
        expiringSoon: 3,
        docuSignCount: 98,
        helloSignCount: 58,
        topSigner: 'john@example.com',
        topSigningTime: 'Tuesday 2:00 PM',
      };
    }),
});

// Helper function to create e-signature record
async function createESignature(data: any) {
  const db_instance = await db.getDb();
  if (!db_instance) throw new Error("Database not available");
  return db_instance.insert(db.eSignatures).values(data);
}
