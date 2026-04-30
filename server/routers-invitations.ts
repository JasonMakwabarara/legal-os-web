import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
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

      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create invitations",
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

        // Send invitation email if email provided
        if (input.email) {
          await sendInvitationEmail({
            recipientEmail: input.email,
            recipientName: input.recipientName || "Team Member",
            firmName: ctx.user.name || "Our Firm",
            invitationLink: inviteUrl,
            inviterName: ctx.user.name || "Your colleague",
          });
        }

        return {
          success: true,
          inviteCode: invitation.inviteCode,
          inviteUrl,
          expiresAt: invitation.expiresAt,
        };
      } catch (error) {
        console.error("Error creating invitation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create invitation",
        });
      }
    }),

  /**
   * Accept an invitation
   */
  accept: protectedProcedure
    .input(z.object({ inviteCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await acceptInvitation(input.inviteCode, ctx.user.id);
        return {
          success: true,
          firmId: result.firmId,
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to accept invitation",
        });
      }
    }),

  /**
   * Get invitation details by code
   */
  getByCode: publicProcedure
    .input(z.object({ inviteCode: z.string() }))
    .query(async ({ input }) => {
      const invitation = await getInvitationByCode(input.inviteCode);
      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }
      return invitation;
    }),

  /**
   * List pending invitations for a firm
   */
  listPending: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.firmId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User not assigned to a firm",
      });
    }

    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view invitations",
      });
    }

    return listFirmInvitations(ctx.user.firmId);
  }),

  /**
   * Revoke an invitation
   */
  revoke: protectedProcedure
    .input(z.object({ invitationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not assigned to a firm",
        });
      }

      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can revoke invitations",
        });
      }

      try {
        await revokeInvitation(input.invitationId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to revoke invitation",
        });
      }
    }),
});
