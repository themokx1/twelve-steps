import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { getEnv } from "@/lib/db/client";
import { nowUnix } from "@/lib/utils/time";

const TEN_MINUTES_SECONDS = 10 * 60;

export type WebAuthnState =
  | {
      type: "registration";
      challenge: string;
      userId: string;
      email: string;
      createdAt: number;
    }
  | {
      type: "authentication";
      challenge: string;
      createdAt: number;
    };

async function getCookieName() {
  const env = await getEnv();
  return `${env.SESSION_COOKIE_NAME || "aca_twelve_steps_session"}_webauthn`;
}

async function signState(payload: string) {
  const env = await getEnv();
  return createHmac("sha256", env.SESSION_HMAC_SECRET || "aca-dev-secret")
    .update(`webauthn:${payload}`)
    .digest("hex");
}

async function serializeState(state: WebAuthnState) {
  const payload = Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
  const signature = await signState(payload);
  return `${payload}.${signature}`;
}

export async function setWebAuthnStateCookie(state: WebAuthnState) {
  const jar = await cookies();
  const requestHeaders = await headers();
  const secure = requestHeaders.get("x-forwarded-proto") === "https";

  jar.set(await getCookieName(), await serializeState(state), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: TEN_MINUTES_SECONDS
  });
}

export async function clearWebAuthnStateCookie() {
  const jar = await cookies();
  const requestHeaders = await headers();
  const secure = requestHeaders.get("x-forwarded-proto") === "https";

  jar.set(await getCookieName(), "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export async function getWebAuthnStateCookie() {
  const jar = await cookies();
  const value = jar.get(await getCookieName())?.value ?? null;
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = await signState(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as WebAuthnState;
  if (parsed.createdAt + TEN_MINUTES_SECONDS < nowUnix()) return null;

  return parsed;
}

