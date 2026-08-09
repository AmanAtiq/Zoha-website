import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getAdminClient } from "../../../../lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  let body = {};
  try {
    body = await request.json();
  } catch {
    // fall through
  }

  const quote = String(body.quote || "").trim();
  if (!quote) {
    return NextResponse.json({ error: "Quote is required." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("testimonials")
    .insert({
      quote,
      source: String(body.source || "").trim(),
      active: body.active !== false,
      sort_order: Number(body.sortOrder) || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ testimonial: data });
}
