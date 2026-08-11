import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { getAdminClient } from "../../../../../lib/supabase-server";
import { rowToTestimonial } from "../../../../../lib/serialize";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
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
  const active = body.active !== false;
  const sortOrder = Number(body.sortOrder);
  const order = Number.isFinite(sortOrder) ? sortOrder : 0;

  if (active && !quote) {
    return NextResponse.json(
      { error: "Add review text before making it visible on the homepage." },
      { status: 400 }
    );
  }

  const { data: existing } = await admin.from("testimonials").select("id, sort_order");
  const clash = (existing || []).find(
    (row) => String(row.id) !== String(params.id) && Number(row.sort_order) === order
  );
  if (clash) {
    return NextResponse.json(
      { error: `Order ${order} is already used by another review. Pick a unique order.` },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("testimonials")
    .update({
      quote,
      source: String(body.source || "").trim(),
      active,
      sort_order: order,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, testimonial: rowToTestimonial(data) });
}

export async function DELETE(_request, { params }) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const { error } = await admin.from("testimonials").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
