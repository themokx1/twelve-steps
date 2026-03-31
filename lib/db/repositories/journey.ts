import { getDb } from "@/lib/db/client";
import { aiRuns, pushSubscriptions } from "@/lib/db/schema";
import { createId } from "@/lib/utils/ids";
import { nowUnix } from "@/lib/utils/time";

export async function safeLogAiRun({
  userId,
  kind,
  model,
  inputExcerpt,
  outputExcerpt,
  status
}: {
  userId?: string | null;
  kind: string;
  model?: string | null;
  inputExcerpt?: string | null;
  outputExcerpt?: string | null;
  status: string;
}) {
  try {
    const db = await getDb();
    await db.insert(aiRuns).values({
      id: createId("airun"),
      userId: userId ?? null,
      kind,
      model: model ?? null,
      inputExcerpt: inputExcerpt ?? null,
      outputExcerpt: outputExcerpt ?? null,
      status,
      createdAt: nowUnix()
    });
  } catch (error) {
    console.error("Failed to log AI run", error);
  }
}

export async function safeUpsertPushSubscription({
  userId,
  endpoint,
  keysJson,
  locale,
  userAgent
}: {
  userId?: string | null;
  endpoint: string;
  keysJson: string;
  locale?: string | null;
  userAgent?: string | null;
}) {
  try {
    const db = await getDb();
    const timestamp = nowUnix();

    await db
      .insert(pushSubscriptions)
      .values({
        id: createId("push"),
        userId: userId ?? null,
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
          userId: userId ?? null,
          keysJson,
          locale: locale ?? null,
          userAgent: userAgent ?? null,
          updatedAt: timestamp
        }
      });
  } catch (error) {
    console.error("Failed to upsert push subscription", error);
  }
}

