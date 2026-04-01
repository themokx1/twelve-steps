import { desc, eq } from "drizzle-orm";
import type { BrowserPushSubscription } from "@/lib/push/service";
import { getDb } from "@/lib/db/client";
import { pushSubscriptions } from "@/lib/db/schema";
import { createId } from "@/lib/utils/ids";
import { nowUnix } from "@/lib/utils/time";

type StoredPushKeys = BrowserPushSubscription["keys"];

function parseSubscriptionKeys(keysJson: string): StoredPushKeys {
  const parsed = JSON.parse(keysJson) as Partial<StoredPushKeys>;

  if (!parsed.p256dh || !parsed.auth) {
    throw new Error("Stored push subscription keys are invalid.");
  }

  return {
    p256dh: parsed.p256dh,
    auth: parsed.auth
  };
}

export async function upsertPushSubscription({
  userId,
  endpoint,
  keysJson,
  locale,
  userAgent
}: {
  userId: string;
  endpoint: string;
  keysJson: string;
  locale?: string | null;
  userAgent?: string | null;
}) {
  const db = await getDb();
  const timestamp = nowUnix();

  await db
    .insert(pushSubscriptions)
    .values({
      id: createId("push"),
      userId,
      endpoint,
      keysJson,
      locale: locale ?? null,
      userAgent: userAgent ?? null,
      createdAt: timestamp,
      updatedAt: timestamp
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId,
        keysJson,
        locale: locale ?? null,
        userAgent: userAgent ?? null,
        updatedAt: timestamp
      }
    });
}

export async function getLatestPushSubscriptionForUser(userId: string): Promise<BrowserPushSubscription | null> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId))
    .orderBy(desc(pushSubscriptions.updatedAt))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    endpoint: row.endpoint,
    expirationTime: null,
    keys: parseSubscriptionKeys(row.keysJson)
  };
}
