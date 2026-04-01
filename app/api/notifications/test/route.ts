import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api";
import { getLatestPushSubscriptionForUser } from "@/lib/db/repositories/push-subscriptions";
import { sendPushNotification } from "@/lib/push/service";

export async function POST() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const subscription = await getLatestPushSubscriptionForUser(auth.session.userId);

  if (!subscription) {
    return NextResponse.json(
      {
        ok: false,
        error: "Ehhez a fiókhoz még nincs eltárolt push feliratkozás."
      },
      { status: 404 }
    );
  }

  const result = await sendPushNotification(subscription, {
    title: "ACA társ",
    body: "Itt az ideje egy kedves, de komoly visszatérésnek önmagadhoz.",
    url: "/"
  });

  return NextResponse.json({
    ok: true,
    delivered: result.delivered,
    message: result.enabled
      ? result.delivered
        ? "Kiküldtem egy teszt emlékeztetőt."
        : `A feliratkozás ment, de a teszt push még nem: ${result.reason}`
      : "A push-hoz még hiányoznak a VAPID kulcsok, de a kliensoldali engedély már megvan."
  });
}
