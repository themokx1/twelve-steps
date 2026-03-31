import { cookies, headers } from "next/headers";
import { getEnv } from "@/lib/db/client";

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

export async function setSessionCookie(value: string) {
  const env = await getEnv();
  const jar = await cookies();
  const requestHeaders = await headers();
  const secure = requestHeaders.get("x-forwarded-proto") === "https";

  jar.set(env.SESSION_COOKIE_NAME || "aca_twelve_steps_session", value, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS
  });
}

export async function clearSessionCookie() {
  const env = await getEnv();
  const jar = await cookies();
  const requestHeaders = await headers();
  const secure = requestHeaders.get("x-forwarded-proto") === "https";

  jar.set(env.SESSION_COOKIE_NAME || "aca_twelve_steps_session", "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export async function getSessionCookie() {
  const env = await getEnv();
  const jar = await cookies();
  return jar.get(env.SESSION_COOKIE_NAME || "aca_twelve_steps_session")?.value ?? null;
}

