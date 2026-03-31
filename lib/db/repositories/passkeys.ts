import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { passkeys } from "@/lib/db/schema";
import { createId } from "@/lib/utils/ids";
import { nowUnix } from "@/lib/utils/time";

type StoredPasskey = typeof passkeys.$inferSelect;

function mapPasskey(row: StoredPasskey) {
  return {
    ...row,
    backedUp: Boolean(row.backedUp),
    transports: JSON.parse(row.transportsJson) as string[]
  };
}

export async function listUserPasskeys(userId: string) {
  const db = await getDb();
  const rows = await db.select().from(passkeys).where(eq(passkeys.userId, userId));
  return rows.map(mapPasskey);
}

export async function getUserPasskeyCount(userId: string) {
  const rows = await listUserPasskeys(userId);
  return rows.length;
}

export async function getPasskeyByCredentialId(credentialId: string) {
  const db = await getDb();
  const [row] = await db.select().from(passkeys).where(eq(passkeys.credentialId, credentialId));
  return row ? mapPasskey(row) : null;
}

export async function createPasskey(input: {
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceType: string;
  backedUp: boolean;
  transports?: string[];
  name?: string | null;
}) {
  const db = await getDb();
  const timestamp = nowUnix();

  await db.insert(passkeys).values({
    id: createId("psk"),
    userId: input.userId,
    credentialId: input.credentialId,
    publicKey: input.publicKey,
    counter: input.counter,
    deviceType: input.deviceType,
    backedUp: input.backedUp ? 1 : 0,
    transportsJson: JSON.stringify(input.transports ?? []),
    name: input.name ?? null,
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function updatePasskeyUsage(credentialId: string, counter: number) {
  const db = await getDb();
  const timestamp = nowUnix();

  await db
    .update(passkeys)
    .set({
      counter,
      lastUsedAt: timestamp,
      updatedAt: timestamp
    })
    .where(eq(passkeys.credentialId, credentialId));
}

