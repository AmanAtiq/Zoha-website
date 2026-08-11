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

export async function DELETE(_request, { params }) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const slug = params.slug;

  let book = null;
  let isPrebookOnly = false;

  const withFlag = await admin
    .from("books")
    .select("slug, prebook_only, home_visible, home_order, title")
    .eq("slug", slug)
    .maybeSingle();

  if (withFlag.error && /prebook_only/i.test(withFlag.error.message)) {
    const retry = await admin
      .from("books")
      .select("slug, home_visible, home_order, title")
      .eq("slug", slug)
      .maybeSingle();
    if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 500 });
    book = retry.data;
    isPrebookOnly = book?.home_visible === false && Number(book?.home_order) >= 999;
  } else if (withFlag.error) {
    return NextResponse.json({ error: withFlag.error.message }, { status: 500 });
  } else {
    book = withFlag.data;
    isPrebookOnly =
      !!book?.prebook_only ||
      (book?.home_visible === false && Number(book?.home_order) >= 999);
  }

  if (!book) {
    await admin.from("prebooking").delete().eq("book_slug", slug);
    return NextResponse.json({ ok: true });
  }

  if (!isPrebookOnly) {
    return NextResponse.json(
      {
        error:
          "This title is a full site book. Turn off “Show on prebooking store” to hide it, or delete it from Books.",
      },
      { status: 400 }
    );
  }

  // Cascades to prebooking / episodes / reviews via FK.
  const { error } = await admin.from("books").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
