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
    password: url.password,
    database: url.pathname.slice(1),
    port: Number(url.port || 3306),
    ssl: {
      rejectUnauthorized: false,
    },
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
