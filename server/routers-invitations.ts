import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createFirmInvitation,
  acceptInvitation,
  listFirmInvitations,
  revokeInvitation,
  getInvitationByCode,
} from "./db-invitations";
import { sendInvitationEmail } from "./services/emailService";

export const invitationsRouter = router({
  /**
   * Create a new firm invitation
   */
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        expiresInDays: z.number().int().min(1).max(365).optional(),
        recipientName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not assigned to a firm",
        });
      }

      try {
        const invitation = await createFirmInvitation(
          ctx.user.firmId,
          ctx.user.id,
          input.email,
          input.expiresInDays
        );

        const inviteUrl = `${process.env.VITE_APP_URL || "http://localhost:5173"}/accept-invitation/${invitation.inviteCode}`;

        // Send invitation email
        const emailResult = await sendInvitationEmail({
          recipientEmail: input.email || "",
          recipientName: input.recipientName || "Team Member",
          firmName: ctx.user.firmId?.toString() || "Our Firm",
          invitationLink: inviteUrl,
          inviterName: ctx.user.name || "Your colleague",
        });

        if (!emailResult.success) {
          console.warn("Failed to send invitation email:", emailResult.error);
        }

        return {
          ...invitation,
          inviteUrl,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to create invitation",
        });
      }
    }),

  /**
   * Accept a firm invitation
   */
  accept: protectedProcedure
    .input(z.object({ inviteCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await acceptInvitation(input.inviteCode, ctx.user.id);
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to accept invitation",
        });
      }
    }),

  /**
   * List firm invitations
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.firmId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User not assigned to a firm",
      });
    }

    try {
      const invitations = await listFirmInvitations(ctx.user.firmId);
      return invitations;
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to list invitations",
      });
    }
  }),

  /**
   * Revoke a firm invitation
   */
  revoke: protectedProcedure
    .input(z.object({ inviteCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not assigned to a firm",
        });
      }

      try {
        // Get invitation by code to get the ID
        const invitation = await getInvitationByCode(input.inviteCode);
        if (!invitation || invitation.firmId !== ctx.user.firmId) {
          throw new Error('Invitation not found or unauthorized');
        }
        await revokeInvitation(invitation.id);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to revoke invitation",
        });
      }
    }),
});
