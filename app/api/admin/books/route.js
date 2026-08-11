import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getAdminClient } from "../../../../lib/supabase-server";
import { getSeedBooksForAdmin } from "../../../../lib/data";
import { bookToRow, episodeToRow } from "../../../../lib/serialize";

export const dynamic = "force-dynamic";

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export async function GET() {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const [booksRes, epRes, revRes] = await Promise.all([
    admin.from("books").select("*").order("home_order", { ascending: true }),
    admin.from("episodes").select("book_slug, id"),
    admin.from("reviews").select("book_slug, id"),
  ]);

  if (booksRes.error) {
    return NextResponse.json({ error: booksRes.error.message }, { status: 500 });
  }

  const epCounts = {};
  for (const ep of epRes.data || []) epCounts[ep.book_slug] = (epCounts[ep.book_slug] || 0) + 1;
  const revCounts = {};
  for (const r of revRes.data || []) revCounts[r.book_slug] = (revCounts[r.book_slug] || 0) + 1;

  const dbBooks = (booksRes.data || []).map((b) => ({
    slug: b.slug,
    title: b.title,
    titleUrdu: b.title_urdu,
    type: b.type,
    typeLabel: b.type_label,
    badge: b.badge,
    cover: b.cover,
    homeVisible: b.home_visible,
    homeOrder: b.home_order,
    episodeCount: epCounts[b.slug] || 0,
    reviewCount: revCounts[b.slug] || 0,
    prebookOnly: !!b.prebook_only,
    inDb: true,
  })).filter((b) => !b.prebookOnly);

  // Empty (or not-yet-seeded) database: show the static catalog so the admin
  // can edit it. Saving any book upserts it into Supabase.
  const books = dbBooks.length ? dbBooks : getSeedBooksForAdmin();

  return NextResponse.json({ books });
}

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

  const row = bookToRow(body.book || {});
  if (!row.title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (!row.slug) row.slug = slugify(row.title);

  let data;
  let insert = await admin.from("books").insert(row).select().single();
  if (insert.error && /prebook_only/i.test(insert.error.message)) {
    const { prebook_only: _drop, ...without } = row;
    insert = await admin.from("books").insert(without).select().single();
  }
  if (insert.error) {
    return NextResponse.json({ error: insert.error.message }, { status: 500 });
  }
  data = insert.data;

  // Episodes (for episodic novels) can be supplied at creation time too.
  if (Array.isArray(body.episodes) && body.episodes.length) {
    const rows = body.episodes.map((ep, i) => episodeToRow(ep, data.slug, i + 1));
    await admin.from("episodes").insert(rows);
  }

  // Every book gets a prebooking row so the store page always has one.
  await admin.from("prebooking").upsert(
    {
      book_slug: data.slug,
      price: null,
      status: "coming-soon",
      note: "",
      pitch: "",
      points: [],
      show_on_store: true,
    },
    { onConflict: "book_slug" }
  );

  return NextResponse.json({ book: data });
}
