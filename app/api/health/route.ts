import { NextResponse } from "next/server";
import { getEnv } from "@/lib/db/client";

export async function GET() {
  try {
    const env = await getEnv();

    return NextResponse.json({
      ok: true,
      appName: env.APP_NAME,
      environment: env.APP_ENV,
      aiConfigured: Boolean(env.OPENAI_API_KEY),
      pushConfigured: Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY)
    });
  } catch {
    return NextResponse.json({
      ok: true,
      appName: "ACA Tizenkét Lépés",
      environment: "unknown",
      aiConfigured: false,
      pushConfigured: false
    });
  }
}

