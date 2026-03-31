import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, requireApiUser } from "@/lib/auth/api";
import { verifyPasskeyRegistration } from "@/lib/auth/passkeys";
import { clearWebAuthnStateCookie, getWebAuthnStateCookie } from "@/lib/auth/webauthn-state";
import { createPasskey, getPasskeyByCredentialId } from "@/lib/db/repositories/passkeys";

const schema = z.object({
  credential: z.any(),
  name: z.string().trim().min(1).max(80).optional()
});

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const state = await getWebAuthnStateCookie();

  if (!state || state.type !== "registration" || state.userId !== auth.session.userId) {
    await clearWebAuthnStateCookie();
    return badRequest("A passkey regisztrációs munkamenet lejárt.");
  }

  const body = schema.parse(await request.json());

  try {
    const verification = await verifyPasskeyRegistration(request, state.challenge, body.credential);

    if (!verification.verified) {
      await clearWebAuthnStateCookie();
      return badRequest("A passkey regisztráció nem sikerült.");
    }

    const existing = await getPasskeyByCredentialId(verification.credentialId);
    if (existing) {
      await clearWebAuthnStateCookie();
      return badRequest("Ez a passkey már regisztrálva van.", 409);
    }

    await createPasskey({
      userId: state.userId,
      credentialId: verification.credentialId,
      publicKey: verification.publicKey,
      counter: verification.counter,
      deviceType: verification.deviceType,
      backedUp: verification.backedUp,
      transports: verification.transports,
      name: body.name
    });

    await clearWebAuthnStateCookie();

    return NextResponse.json({
      ok: true
    });
  } catch {
    await clearWebAuthnStateCookie();
    return badRequest("A passkey regisztráció nem sikerült.");
  }
}

