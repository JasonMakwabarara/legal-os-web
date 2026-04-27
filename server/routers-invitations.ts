import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createFirmInvitation,
  getInvitationByCode,
  acceptInvitation,
  listFirmInvitations,
  revokeInvitation,
} from "./db-invitations";

export const invitationsRouter = router({
  /**
   * Create a new firm invitation
   */
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        expiresInDays: z.number().int().min(1).max(365).optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
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

        return {
          ...invitation,
          inviteUrl: `${process.env.VITE_APP_URL || "http://localhost:5173"}/accept-invitation/${invitation.inviteCode}`,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to create invitation",
        });
      }
    }),

  /**
   * Get invitation details by code
   */
  getByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }: any) => {
      try {
        const invitation = await getInvitationByCode(input.code);

        if (!invitation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invitation not found",
          });
        }

        return invitation;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to get invitation",
        });
      }
    }),

  /**
   * Accept an invitation and join a firm
   */
  accept: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }: any) => {
      try {
        const invitation = await acceptInvitation(input.code, ctx.user.id);

        return {
          success: true,
          firmId: invitation.firmId,
          message: "Successfully joined the firm",
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to accept invitation",
        });
      }
    }),

  /**
   * List pending invitations for a firm
   */
  listPending: protectedProcedure.query(async ({ ctx }: any) => {
    if (!ctx.user.firmId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User not assigned to a firm",
      });
    }

    try {
      return await listFirmInvitations(ctx.user.firmId);
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to list invitations",
      });
    }
  }),

  /**
   * Revoke an invitation
   */
  revoke: protectedProcedure
    .input(z.object({ invitationId: z.number() }))
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not assigned to a firm",
        });
      }

      try {
        await revokeInvitation(input.invitationId);

        return {
          success: true,
          message: "Invitation revoked",
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to revoke invitation",
        });
      }
    }),
});
