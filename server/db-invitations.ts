import { getDb } from "./db";
import { firmInvitations, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

const db = getDb();

/**
 * Generate a unique invite code
 */
export function generateInviteCode(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a firm invitation
 */
export async function createFirmInvitation(
  firmId: number,
  invitedBy: number,
  email?: string,
  expiresInDays: number = 30
) {
  const inviteCode = generateInviteCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const database = await getDb();
  if (!database) throw new Error('Database not initialized');

  const result = await database.insert(firmInvitations).values({
    firmId,
    inviteCode,
    email: email || null,
    invitedBy,
    status: "pending",
    expiresAt,
  });

  return {
    id: result[0].insertId,
    inviteCode,
    expiresAt,
  };
}

/**
 * Get invitation by code
 */
export async function getInvitationByCode(inviteCode: string) {
  const database = await getDb();
  if (!database) throw new Error('Database not initialized');
  
  const result = await database
    .select()
    .from(firmInvitations)
    .where(eq(firmInvitations.inviteCode, inviteCode))
    .limit(1);

  return result[0] || null;
}

/**
 * Accept an invitation and associate user with firm
 */
export async function acceptInvitation(
  inviteCode: string,
  userId: number
) {
  const invitation = await getInvitationByCode(inviteCode);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "pending") {
    throw new Error("Invitation is no longer valid");
  }

  if (invitation.expiresAt && new Date() > invitation.expiresAt) {
    throw new Error("Invitation has expired");
  }

  const database = await getDb();
  if (!database) throw new Error('Database not initialized');

  // Update user with firmId
  await database
    .update(users)
    .set({ firmId: invitation.firmId })
    .where(eq(users.id, userId));

  // Mark invitation as accepted
  await database
    .update(firmInvitations)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
      acceptedBy: userId,
    })
    .where(eq(firmInvitations.id, invitation.id));

  return invitation;
}

/**
 * List pending invitations for a firm
 */
export async function listFirmInvitations(firmId: number) {
  const database = await getDb();
  if (!database) throw new Error('Database not initialized');
  
  return database
    .select()
    .from(firmInvitations)
    .where(
      and(
        eq(firmInvitations.firmId, firmId),
        eq(firmInvitations.status, "pending")
      )
    );
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(invitationId: number) {
  const database = await getDb();
  if (!database) throw new Error('Database not initialized');
  
  return database
    .update(firmInvitations)
    .set({ status: "expired" })
    .where(eq(firmInvitations.id, invitationId));
}
