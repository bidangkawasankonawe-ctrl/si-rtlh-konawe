import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLog, users, type User } from "@/db/schema";

export const COOKIE_NAME = "si-rtlh-session";
const SECRET = process.env.SESSION_SECRET || "si-rtlh-konawe-2026";
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 jam

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createSessionToken(userId: number): string {
  const payload = `${userId}|${Date.now() + MAX_AGE_MS}`;
  const p = Buffer.from(payload).toString("base64url");
  return `${p}.${sign(payload)}`;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(MAX_AGE_MS / 1000),
};

/** Ambil user dari cookie sesi (null jika tidak login). */
export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const p = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let payload: string;
  try {
    payload = Buffer.from(p, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [idStr, expStr] = payload.split("|");
  const id = Number(idStr);
  if (!Number.isInteger(id) || Date.now() > Number(expStr)) return null;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const u = rows[0];
  if (!u || !u.active) return null;
  return u;
}

export async function verifyLogin(username: string, password: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  const u = rows[0];
  if (!u || !u.active) return null;
  const ok = await bcrypt.compare(password, u.passwordHash);
  return ok ? u : null;
}

export function hashPassword(p: string): string {
  return bcrypt.hashSync(p, 8);
}

export async function logAudit(
  username: string,
  action: string,
  entity: string | null,
  entityId: string | null,
  details: string | null,
): Promise<void> {
  try {
    await db.insert(auditLog).values({ username, action, entity, entityId, details });
  } catch {
    // audit tidak boleh mengganggu alur utama
  }
}
