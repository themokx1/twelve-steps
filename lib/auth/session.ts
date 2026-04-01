import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq, lt } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { getSessionHmacSecret } from "@/lib/auth/secrets";
import { sessions, users } from "@/lib/db/schema";
import { createId } from "@/lib/utils/ids";
import { daysFromNow, nowUnix } from "@/lib/utils/time";

async function signSessionId(sessionId: string) {
  return createHmac("sha256", await getSessionHmacSecret()).update(sessionId).digest("hex");
}

export async function serializeSignedSession(sessionId: string) {
  return `${sessionId}.${await signSessionId(sessionId)}`;
}

export async function parseSignedSession(value: string | null) {
  if (!value) return null;

  const [sessionId, signature] = value.split(".");
  if (!sessionId || !signature) return null;

  const expected = await signSessionId(sessionId);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return null;

  return timingSafeEqual(a, b) ? sessionId : null;
}

function hashOptional(value: string | null) {
  if (!value) return null;
  return createHmac("sha256", "aca-twelve-steps-metadata").update(value).digest("hex");
}

export async function createSession({
  userId,
  userAgent,
  ip
}: {
  userId: string;
  userAgent?: string | null;
  ip?: string | null;
}) {
  const db = await getDb();
  const timestamp = nowUnix();
  const sessionId = createId("sess");

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt: daysFromNow(30),
    rotatesAt: daysFromNow(7),
    createdAt: timestamp,
    lastSeenAt: timestamp,
    userAgentHash: hashOptional(userAgent ?? null),
    ipHash: hashOptional(ip ?? null)
  });

  return sessionId;
}

export async function invalidateSession(sessionId: string) {
  const db = await getDb();
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function getCurrentSession() {
  const { getSessionCookie } = await import("@/lib/auth/cookies");
  const signed = await getSessionCookie();
  const sessionId = await parseSignedSession(signed);
  if (!sessionId) return null;

  const db = await getDb();
  const [row] = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      rotatesAt: sessions.rotatesAt,
      userId: users.id,
      email: users.email,
      displayName: users.displayName,
      locale: users.locale
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), eq(users.id, sessions.userId)));

  if (!row || row.expiresAt < nowUnix()) {
    if (row) await invalidateSession(sessionId);
    return null;
  }

  await db
    .update(sessions)
    .set({
      lastSeenAt: nowUnix(),
      expiresAt: daysFromNow(30)
    })
    .where(eq(sessions.id, sessionId));

  return row;
}

export async function rotateSessionIfNeeded(sessionId: string) {
  const db = await getDb();
  const [existing] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  if (!existing) return null;
  if (existing.rotatesAt >= nowUnix()) return sessionId;

  const rotated = createId("sess");

  await db.delete(sessions).where(eq(sessions.id, sessionId));
  await db.insert(sessions).values({
    ...existing,
    id: rotated,
    createdAt: nowUnix(),
    lastSeenAt: nowUnix(),
    expiresAt: daysFromNow(30),
    rotatesAt: daysFromNow(7)
  });

  return rotated;
}

export async function purgeExpiredSessions() {
  const db = await getDb();
  await db.delete(sessions).where(lt(sessions.expiresAt, nowUnix()));
}
