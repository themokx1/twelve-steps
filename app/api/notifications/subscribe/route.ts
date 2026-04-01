import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api";
import { upsertPushSubscription } from "@/lib/db/repositories/push-subscriptions";

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
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const payload = subscriptionSchema.parse(await request.json());

  await upsertPushSubscription({
    userId: auth.session.userId,
    endpoint: payload.subscription.endpoint,
    keysJson: JSON.stringify(payload.subscription.keys),
    locale: payload.locale ?? null,
    userAgent: request.headers.get("user-agent")
  });

  return NextResponse.json({
    ok: true
  });
}
