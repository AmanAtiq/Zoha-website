import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { getAdminClient } from "../../../../../lib/supabase-server";
import { rowToReview } from "../../../../../lib/serialize";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  let body = {};
  try {
    body = await request.json();
  } catch {
    // fall through
  }

  const patch = {};
  if (typeof body.featured === "boolean") patch.featured = body.featured;
  if (typeof body.approved === "boolean") patch.approved = body.approved;
  if (body.name !== undefined) patch.name = String(body.name || "").trim() || "Reader";
  if (body.text !== undefined) patch.text = String(body.text || "").trim();
  if (body.rating !== undefined) patch.rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
  if (body.when !== undefined) patch.when_display = String(body.when || "").trim();
  if (body.bookSlug !== undefined) patch.book_slug = String(body.bookSlug || "");

  // Allow clients that send `when` via POST-style field name on create path reuse.
  if (body.whenDisplay !== undefined) patch.when_display = String(body.whenDisplay || "").trim();

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }
  if (patch.text !== undefined && !patch.text) {
    return NextResponse.json({ error: "Review text is required." }, { status: 400 });
  }
  if (patch.book_slug !== undefined && !patch.book_slug) {
    return NextResponse.json({ error: "Book is required." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("reviews")
    .update(patch)
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, review: rowToReview(data) });
}

export async function DELETE(_request, { params }) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const { error } = await admin.from("reviews").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
