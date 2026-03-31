import { NextResponse } from "next/server";
import { z } from "zod";
import { sendPushNotification } from "@/lib/push/service";

const requestSchema = z.object({
  subscription: z.object({
    endpoint: z.string().min(1),
    expirationTime: z.number().nullable().optional(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1)
    })
  })
});

export async function POST(request: Request) {
  const body = requestSchema.parse(await request.json());
  const result = await sendPushNotification(body.subscription, {
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

