import { AcaHome } from "@/components/aca-home";
import { getTodayMeetingDateKey } from "@/lib/aca/state";
import { requireUser } from "@/lib/auth/guards";
import { getDeskStateForDay } from "@/lib/db/repositories/meeting-sessions";
import { listUserPasskeys } from "@/lib/db/repositories/passkeys";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await requireUser();
  const meetingDate = getTodayMeetingDateKey();
  const [initialDeskState, passkeys] = await Promise.all([
    getDeskStateForDay(session.userId, meetingDate),
    listUserPasskeys(session.userId)
  ]);

  return (
    <AcaHome
      initialDeskState={initialDeskState}
      meetingDate={meetingDate}
      email={session.email}
      passkeys={passkeys}
    />
  );
}
