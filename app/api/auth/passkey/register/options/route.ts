import { NextResponse } from "next/server";
import { badRequest, requireApiUser } from "@/lib/auth/api";
import { createPasskeyRegistrationOptions } from "@/lib/auth/passkeys";
import { setWebAuthnStateCookie } from "@/lib/auth/webauthn-state";
import { getUserById } from "@/lib/db/repositories/users";
import { nowUnix } from "@/lib/utils/time";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const user = await getUserById(auth.session.userId);
  if (!user) {
    return badRequest("Nem találom a felhasználót.", 404);
  }

  const options = await createPasskeyRegistrationOptions(request, user);

  await setWebAuthnStateCookie({
    type: "registration",
    challenge: options.challenge,
    userId: user.id,
    email: user.email,
    createdAt: nowUnix()
  });

  return NextResponse.json(options);
}

