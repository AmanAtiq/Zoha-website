import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { getAdminClient } from "../../../../../lib/supabase-server";
import { prebookingToRow } from "../../../../../lib/serialize";

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

  const edition = body.edition || {};
  const isComingSoon = edition.status === "coming-soon" || edition.price == null;

  const row = prebookingToRow({
    bookSlug: params.slug,
    price: isComingSoon ? null : Number(edition.price) || 0,
    status: isComingSoon ? "coming-soon" : "prebooking",
    note: edition.note || "",
    pitch: edition.pitch || "",
    points: edition.points || [],
    showOnStore: edition.showOnStore ?? true,
  });

  const { error } = await admin.from("prebooking").upsert(row, { onConflict: "book_slug" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
