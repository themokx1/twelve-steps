import { NextResponse } from "next/server";
import { logoutCurrentSession } from "@/lib/auth/api";

export async function POST() {
  await logoutCurrentSession();
  return NextResponse.json({ ok: true });
}

