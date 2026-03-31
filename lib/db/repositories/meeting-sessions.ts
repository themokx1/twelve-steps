import { and, eq } from "drizzle-orm";
import { DEFAULT_DESK_STATE, type DeskState, parseDeskState, serializeDeskState } from "@/lib/aca/state";
import { getDb } from "@/lib/db/client";
import { meetingSessions } from "@/lib/db/schema";
import { createId } from "@/lib/utils/ids";
import { nowUnix } from "@/lib/utils/time";

export async function getMeetingSnapshot(userId: string, meetingDate: string) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(meetingSessions)
    .where(and(eq(meetingSessions.userId, userId), eq(meetingSessions.meetingDate, meetingDate)));

  return row ?? null;
}

export async function getDeskStateForDay(userId: string, meetingDate: string) {
  const row = await getMeetingSnapshot(userId, meetingDate);
  return parseDeskState(row);
}

export async function upsertDeskStateForDay(userId: string, meetingDate: string, deskState: DeskState) {
  const db = await getDb();
  const timestamp = nowUnix();
  const serialized = serializeDeskState(deskState);

  await db
    .insert(meetingSessions)
    .values({
      id: createId("mtg"),
      userId,
      meetingDate,
      affirmationShown: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...serialized
    })
    .onConflictDoUpdate({
      target: [meetingSessions.userId, meetingSessions.meetingDate],
      set: {
        ...serialized,
        updatedAt: timestamp
      }
    });

  return getDeskStateForDay(userId, meetingDate);
}

export function getDefaultDeskState() {
  return DEFAULT_DESK_STATE;
}

