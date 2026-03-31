import { NextResponse } from "next/server";
import { z } from "zod";
import { safeUpsertPushSubscription } from "@/lib/db/repositories/journey";

const subscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().min(1),
    expirationTime: z.number().nullable().optional(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1)
    })
  }),
  locale: z.string().optional()
});

export async function POST(request: Request) {
  const payload = subscriptionSchema.parse(await request.json());

  await safeUpsertPushSubscription({
    endpoint: payload.subscription.endpoint,
    keysJson: JSON.stringify(payload.subscription.keys),
    locale: payload.locale ?? null,
    userAgent: request.headers.get("user-agent")
  });

  return NextResponse.json({
    ok: true
  });
}

