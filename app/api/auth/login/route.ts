import { NextResponse } from "next/server";
import { z } from "zod";
import { setSessionCookie } from "@/lib/auth/cookies";
import { hashPassphrase, verifyPassphrase } from "@/lib/auth/hash";
import { createSession, serializeSignedSession } from "@/lib/auth/session";
import { getUserByEmail, updateUserPasswordCredentials } from "@/lib/db/repositories/users";

const schema = z.object({
  email: z.string().trim().email().max(320),
  passphrase: z.string().min(12).max(200)
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const user = await getUserByEmail(body.email);

  if (!user) {
    return NextResponse.json({ error: "Hibás email vagy jelszó." }, { status: 401 });
  }

  const verification = await verifyPassphrase(body.passphrase, user.passwordSalt, user.passwordHash);

  if (!verification.valid) {
    return NextResponse.json({ error: "Hibás email vagy jelszó." }, { status: 401 });
  }

  if (verification.needsRehash) {
    const { hashHex, saltHex } = await hashPassphrase(body.passphrase);
    await updateUserPasswordCredentials(user.id, {
      passwordHash: hashHex,
      passwordSalt: saltHex
    });
  }

  const sessionId = await createSession({
    userId: user.id,
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("cf-connecting-ip")
  });

  await setSessionCookie(await serializeSignedSession(sessionId));

  return NextResponse.json({
    ok: true,
    redirectTo: "/"
  });
}

