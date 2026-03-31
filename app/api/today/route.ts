import { NextResponse } from "next/server";
import { z } from "zod";
import { getTodayMeetingDateKey, type DeskState } from "@/lib/aca/state";
import { requireApiUser } from "@/lib/auth/api";
import { getDeskStateForDay, upsertDeskStateForDay } from "@/lib/db/repositories/meeting-sessions";

const deskStateSchema = z.object({
  activeStep: z.number().int().min(1).max(12),
  checkIn: z.object({
    feeling: z.string().max(4000),
    body: z.string().max(4000),
    need: z.string().max(4000),
    promise: z.string().max(1000)
  }),
  notes: z.record(z.string(), z.string().max(12000)),
  completedActions: z.array(z.string().max(120)).max(200)
});

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const meetingDate = getTodayMeetingDateKey();
  const deskState = await getDeskStateForDay(auth.session.userId, meetingDate);

  return NextResponse.json({
    ok: true,
    meetingDate,
    deskState
  });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const body = z.object({ deskState: deskStateSchema }).parse(await request.json()) as {
    deskState: DeskState;
  };

  const meetingDate = getTodayMeetingDateKey();
  const saved = await upsertDeskStateForDay(auth.session.userId, meetingDate, body.deskState);

  return NextResponse.json({
    ok: true,
    meetingDate,
    deskState: saved
  });
}

