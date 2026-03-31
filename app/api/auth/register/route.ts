import { NextResponse } from "next/server";
import { z } from "zod";
import { setSessionCookie } from "@/lib/auth/cookies";
import { hashPassphrase } from "@/lib/auth/hash";
import { createSession, serializeSignedSession } from "@/lib/auth/session";
import { getUserByEmail, createUser } from "@/lib/db/repositories/users";

const schema = z.object({
  email: z.string().trim().email().max(320),
  passphrase: z.string().min(12).max(200)
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const existing = await getUserByEmail(body.email);

  if (existing) {
    return NextResponse.json({ error: "Ehhez az emailhez már tartozik fiók." }, { status: 409 });
  }

  const { hashHex, saltHex } = await hashPassphrase(body.passphrase);
  const userId = await createUser({
    email: body.email,
    passwordHash: hashHex,
    passwordSalt: saltHex,
    locale: "hu"
  });

  const sessionId = await createSession({
    userId,
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("cf-connecting-ip")
  });

  await setSessionCookie(await serializeSignedSession(sessionId));

  return NextResponse.json({
    ok: true,
    redirectTo: "/"
  });
}

