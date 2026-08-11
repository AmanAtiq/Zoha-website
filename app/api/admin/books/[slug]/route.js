import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { getAdminClient } from "../../../../../lib/supabase-server";
import { bookToRow, episodeToRow, rowToBook } from "../../../../../lib/serialize";
import { getSeedBookForAdmin } from "../../../../../lib/data";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const slug = params.slug;

  const { data: row, error } = await admin
    .from("books")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Not in the database yet? Show the static catalog entry so the editor is
  // never blank; saving it (PUT) upserts it into Supabase.
  if (!row) {
    const seedBook = getSeedBookForAdmin(slug);
    if (!seedBook) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ book: seedBook });
  }

  const [epRes, revRes] = await Promise.all([
    admin.from("episodes").select("*").eq("book_slug", slug).order("episode_number", { ascending: true }),
    admin.from("reviews").select("*").eq("book_slug", slug).order("created_at", { ascending: false }),
  ]);

  const book = rowToBook(row, epRes.data || [], revRes.data || []);
  return NextResponse.json({ book });
}

export async function PUT(request, { params }) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const slug = params.slug;

  let body = {};
  try {
    body = await request.json();
  } catch {
    // fall through
  }

  const incoming = { ...(body.book || {}), slug };
  const row = bookToRow(incoming);

  // Upsert so editing a static-catalog book (not yet in the DB) creates it.
  let { error } = await admin.from("books").upsert(row, { onConflict: "slug" });
  if (error && /prebook_only/i.test(error.message)) {
    const { prebook_only: _drop, ...without } = row;
    ({ error } = await admin.from("books").upsert(without, { onConflict: "slug" }));
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace episodes wholesale.
  await admin.from("episodes").delete().eq("book_slug", slug);
  if (Array.isArray(body.episodes) && body.episodes.length) {
    const rows = body.episodes.map((ep, i) => episodeToRow(ep, slug, i + 1));
    const { error: epError } = await admin.from("episodes").insert(rows);
    if (epError) return NextResponse.json({ error: epError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

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
  if (typeof body.homeVisible === "boolean") patch.home_visible = body.homeVisible;
  if (typeof body.homeOrder === "number") patch.home_order = body.homeOrder;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await admin.from("books").update(patch).eq("slug", params.slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const { error } = await admin.from("books").delete().eq("slug", params.slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
