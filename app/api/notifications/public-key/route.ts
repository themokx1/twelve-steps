import { NextResponse } from "next/server";
import { getPushPublicKey } from "@/lib/push/service";

export async function GET() {
  const publicKey = await getPushPublicKey();

  if (!publicKey) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ publicKey });
}

