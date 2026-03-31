import { NextResponse } from "next/server";
import { createPasskeyAuthenticationOptions } from "@/lib/auth/passkeys";
import { setWebAuthnStateCookie } from "@/lib/auth/webauthn-state";
import { nowUnix } from "@/lib/utils/time";

export async function POST(request: Request) {
  const options = await createPasskeyAuthenticationOptions(request);

  await setWebAuthnStateCookie({
    type: "authentication",
    challenge: options.challenge,
    createdAt: nowUnix()
  });

  return NextResponse.json(options);
}

