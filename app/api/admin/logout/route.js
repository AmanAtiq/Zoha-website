import { NextResponse } from "next/server";
import { deleteSession, getSessionToken, clearSessionCookie } from "../../../../lib/admin-auth";

export async function POST() {
  const token = getSessionToken();
  if (token) await deleteSession(token);
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
