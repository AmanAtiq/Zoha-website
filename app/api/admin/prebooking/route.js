import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getAdminClient } from "../../../../lib/supabase-server";
import { rowToPrebooking, TYPE_LABELS } from "../../../../lib/serialize";
import { getSeedBooksForAdmin, getSeedEditionForAdmin } from "../../../../lib/data";

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
  const [booksRes, preRes] = await Promise.all([
    admin.from("books").select("slug, title, cover, type, type_label, prebook_only, home_visible, home_order").order("home_order", { ascending: true }),
    admin.from("prebooking").select("*"),
  ]);

  const preMap = {};
  for (const p of preRes.data || []) preMap[p.book_slug] = rowToPrebooking(p);

  const toItemBook = (b) => ({
    slug: b.slug,
    title: b.title,
    cover: b.cover,
    type: b.type,
    type_label: b.type_label || b.typeLabel || "",
    prebookOnly: !!b.prebook_only || (b.home_visible === false && Number(b.home_order) >= 999),
  });

  let dbBooks = [];
  if (!booksRes.error) {
    dbBooks = (booksRes.data || []).map(toItemBook);
  } else if (/prebook_only/i.test(booksRes.error.message)) {
    const retry = await admin
      .from("books")
      .select("slug, title, cover, type, type_label, home_visible, home_order")
      .order("home_order", { ascending: true });
    dbBooks = (retry.data || []).map(toItemBook);
  }

  const books = dbBooks.length ? dbBooks : getSeedBooksForAdmin().map((b) => ({
    slug: b.slug,
    title: b.title,
    cover: b.cover,
    type: b.type,
    type_label: b.typeLabel || "",
    prebookOnly: false,
  }));

  const items = books.map((b) => {
    const edition = preMap[b.slug] || getSeedEditionForAdmin(b.slug);
    return { book: b, edition };
  });

  return NextResponse.json({ items });
}

// Create a prebook-only title (not listed in reading collections).
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

  const title = String(body.title || "").trim();
  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const type = ["episodic", "short-novel", "afsana"].includes(body.type) ? body.type : "short-novel";
  const slug = slugify(body.slug || title);
  const comingSoon = body.isComingSoon !== false && (body.price == null || body.price === "");

  const bookRow = {
    slug,
    title,
    title_urdu: String(body.titleUrdu || "").trim(),
    type,
    type_label: TYPE_LABELS[type] || "",
    badge: String(body.badge || "Preorder").trim(),
    cover: String(body.cover || "").trim(),
    hero: String(body.cover || "").trim(),
    tagline: String(body.tagline || body.pitch || "").trim(),
    description: String(body.description || "").trim(),
    home_visible: false,
    home_order: 999,
    prebook_only: true,
  };

  let book;
  let warning = "";
  const insert = await admin.from("books").insert(bookRow).select().single();
  if (insert.error) {
    if (/prebook_only/i.test(insert.error.message)) {
      delete bookRow.prebook_only;
      const retry = await admin.from("books").insert(bookRow).select().single();
      if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 500 });
      book = retry.data;
      warning = "Run: alter table public.books add column if not exists prebook_only boolean default false;";
    } else {
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }
  } else {
    book = insert.data;
  }

  const edition = {
    book_slug: book.slug,
    price: comingSoon ? null : Number(body.price) || 0,
    status: comingSoon ? "coming-soon" : "prebooking",
    note: String(body.note || "").trim(),
    pitch: String(body.pitch || "").trim(),
    points: Array.isArray(body.points) ? body.points.filter(Boolean) : [],
    show_on_store: body.showOnStore !== false,
  };

  const { error: preError } = await admin.from("prebooking").upsert(edition, { onConflict: "book_slug" });
  if (preError) return NextResponse.json({ error: preError.message }, { status: 500 });

  return NextResponse.json({
    item: {
      book: {
        slug: book.slug,
        title: book.title,
        cover: book.cover,
        type: book.type,
        type_label: book.type_label || "",
        prebookOnly: true,
      },
      edition: rowToPrebooking(edition),
    },
    warning: warning || undefined,
  });
}
