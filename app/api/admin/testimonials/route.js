import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getAdminClient } from "../../../../lib/supabase-server";
import { rowToTestimonial } from "../../../../lib/serialize";

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
  const sortOrder = Number(body.sortOrder);
  const order = Number.isFinite(sortOrder) ? sortOrder : 0;

  const { data: existing } = await admin.from("testimonials").select("id, sort_order");
  if ((existing || []).some((row) => Number(row.sort_order) === order)) {
    return NextResponse.json(
      { error: `Order ${order} is already used by another review. Pick a unique order.` },
      { status: 400 }
    );
  }

  // New drafts stay hidden until the admin saves a quote and turns visibility on.
  const { data, error } = await admin
    .from("testimonials")
    .insert({
      quote,
      source: String(body.source || "").trim(),
      active: false,
      sort_order: order,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ testimonial: rowToTestimonial(data) });
}
