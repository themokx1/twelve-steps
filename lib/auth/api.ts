import { NextResponse } from "next/server";
import {
  getCurrentSession,
  invalidateSession,
  parseSignedSession,
  rotateSessionIfNeeded,
  serializeSignedSession
} from "@/lib/auth/session";
import { clearSessionCookie, getSessionCookie, setSessionCookie } from "@/lib/auth/cookies";

export async function requireApiUser() {
  const session = await getCurrentSession();

  if (!session) {
    return {
      error: NextResponse.json({ error: "Ehhez be kell jelentkezned." }, { status: 401 })
    };
  }

  const signed = await getSessionCookie();
  const currentSessionId = await parseSignedSession(signed);

  if (currentSessionId) {
    const rotated = await rotateSessionIfNeeded(currentSessionId);

    if (rotated && rotated !== currentSessionId) {
      await setSessionCookie(await serializeSignedSession(rotated));
    }
  }

  return { session };
}

export function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function logoutCurrentSession() {
  const signed = await getSessionCookie();
  const sessionId = await parseSignedSession(signed);
  if (sessionId) await invalidateSession(sessionId);
  await clearSessionCookie();
}

