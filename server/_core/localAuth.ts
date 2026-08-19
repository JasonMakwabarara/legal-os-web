import crypto from "crypto";
import mysql, { type RowDataPacket } from "mysql2/promise";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const HASH_PREFIX = "scrypt";

function parseDatabaseUrl() {
  if (!ENV.databaseUrl) {
    throw new Error("DATABASE_URL is required for local auth");
  }

  const url = new URL(ENV.databaseUrl);
  return {
    host: url.hostname,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    port: Number(url.port || 3306),
    // TLS with self-signed certs (TiDB/Railway MySQL). Set DATABASE_SSL=false
    // for servers without TLS support.
    ...(process.env.DATABASE_SSL === "false"
      ? {}
      : { ssl: { rejectUnauthorized: false } }),
  };
}

async function getPasswordHash(email: string) {
  const connection = await mysql.createConnection(parseDatabaseUrl());
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "select passwordHash from localAuthCredentials where email = ? limit 1",
      [email]
    );
    const row = rows[0] as { passwordHash?: string } | undefined;
    return row?.passwordHash ?? null;
  } finally {
    await connection.end();
  }
}

/** Same scrypt format as seed-test-accounts.mjs: `scrypt:<salt>:<hash>`. */
export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${HASH_PREFIX}:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [prefix, salt, hash] = storedHash.split(":");
  if (prefix !== HASH_PREFIX || !salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = crypto.scryptSync(password, salt, expected.length);

  return (
    actual.length === expected.length &&
    crypto.timingSafeEqual(actual, expected)
  );
}

/**
 * Create a new email/password account. Returns the created user, or null when
 * the email is already taken. New registrants become admins of their own
 * (not-yet-created) firm; teammates join via firm invitations instead.
 */
export async function registerLocalUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<User | null> {
  const email = input.email.trim().toLowerCase();

  const [existingUser, existingHash] = await Promise.all([
    db.getUserByEmail(email),
    getPasswordHash(email),
  ]);
  if (existingUser || existingHash) return null;

  const openId = `local:${crypto.randomUUID()}`;
  await db.upsertUser({
    openId,
    email,
    name: input.name.trim() || email,
    loginMethod: "local",
    role: "admin",
    lastSignedIn: new Date(),
  });

  const connection = await mysql.createConnection(parseDatabaseUrl());
  try {
    const user = await db.getUserByOpenId(openId);
    if (!user) return null;
    await connection.execute(
      `INSERT INTO localAuthCredentials (userId, email, passwordHash)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE userId = VALUES(userId), passwordHash = VALUES(passwordHash), updatedAt = CURRENT_TIMESTAMP`,
      [user.id, email, hashPassword(input.password)]
    );
    return user;
  } finally {
    await connection.end();
  }
}

export async function authenticateLocalUser(
  email: string,
  password: string
): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const [user, passwordHash] = await Promise.all([
    db.getUserByEmail(normalizedEmail),
    getPasswordHash(normalizedEmail),
  ]);

  if (!user || !passwordHash) return null;
  if (!verifyPassword(password, passwordHash)) return null;

  await db.upsertUser({
    openId: user.openId,
    lastSignedIn: new Date(),
  });

  return db.getUserByOpenId(user.openId);
}
