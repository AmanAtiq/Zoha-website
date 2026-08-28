import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getAdminClient } from "../../../../lib/supabase-server";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({
      subscribers: [],
      total: 0,
      active: 0,
      warning: "Supabase connection not configured.",
    });
  }

  const { data, error } = await admin
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // If the table doesn't exist yet in Supabase
    return NextResponse.json({
      subscribers: [],
      total: 0,
      active: 0,
      dbNotice: error.message,
    });
  }

  const subscribers = (data || []).map((s) => ({
    id: s.id,
    email: s.email,
    source: s.source || "website",
    status: s.status || "active",
    createdAt: s.created_at,
  }));

  const active = subscribers.filter((s) => s.status === "active").length;

  return NextResponse.json({
    subscribers,
    total: subscribers.length,
    active,
  });
}

export async function POST(request) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("subscribers")
    .upsert({ email, source: "admin", status: "active" }, { onConflict: "email" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    subscriber: {
      id: data.id,
      email: data.email,
      source: data.source,
      status: data.status,
      createdAt: data.created_at,
    },
  });
}
