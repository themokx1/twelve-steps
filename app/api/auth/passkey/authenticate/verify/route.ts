import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest } from "@/lib/auth/api";
import { setSessionCookie } from "@/lib/auth/cookies";
import { createSession, serializeSignedSession } from "@/lib/auth/session";
import { verifyPasskeyAuthentication } from "@/lib/auth/passkeys";
import { clearWebAuthnStateCookie, getWebAuthnStateCookie } from "@/lib/auth/webauthn-state";
import { updatePasskeyUsage } from "@/lib/db/repositories/passkeys";
import { getUserById } from "@/lib/db/repositories/users";

const schema = z.object({
  credential: z.any()
});

export async function POST(request: Request) {
  const state = await getWebAuthnStateCookie();

  if (!state || state.type !== "authentication") {
    await clearWebAuthnStateCookie();
    return badRequest("A passkey bejelentkezési munkamenet lejárt.");
  }

  const body = schema.parse(await request.json());

  try {
    const verification = await verifyPasskeyAuthentication(request, state.challenge, body.credential);

    if (!verification.verified) {
      await clearWebAuthnStateCookie();
      return badRequest("A passkey bejelentkezés nem sikerült.", 401);
    }

    const user = await getUserById(verification.userId);

    if (!user) {
      await clearWebAuthnStateCookie();
      return badRequest("Nem találom a felhasználót.", 401);
    }

    await updatePasskeyUsage(verification.credentialId, verification.newCounter);

    const sessionId = await createSession({
      userId: user.id,
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("cf-connecting-ip")
    });

    await setSessionCookie(await serializeSignedSession(sessionId));
    await clearWebAuthnStateCookie();

    return NextResponse.json({
      ok: true,
      redirectTo: "/"
    });
  } catch {
    await clearWebAuthnStateCookie();
    return badRequest("A passkey bejelentkezés nem sikerült.", 401);
  }
}

