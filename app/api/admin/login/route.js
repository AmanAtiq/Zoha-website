import { NextResponse } from "next/server";
import { createSession, setSessionCookie } from "../../../../lib/admin-auth";
import { getAdminClient } from "../../../../lib/supabase-server";

export async function POST(request) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    // fall through
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || body.password !== expected) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createSession();
  if (!token) {
    return NextResponse.json({ error: "Could not start a session." }, { status: 500 });
  }

  setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
