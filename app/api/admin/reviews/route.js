import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getAdminClient } from "../../../../lib/supabase-server";
import { rowToReview } from "../../../../lib/serialize";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const bookSlug = searchParams.get("book_slug");

  let query = admin.from("reviews").select("*").order("created_at", { ascending: false });
  if (bookSlug) query = query.eq("book_slug", bookSlug);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: books } = await admin.from("books").select("slug, title");
  const titleBySlug = {};
  for (const b of books || []) titleBySlug[b.slug] = b.title;

  const reviews = (data || []).map((r) => ({
    ...rowToReview(r),
    bookTitle: titleBySlug[r.book_slug] || r.book_slug || "",
  }));

  return NextResponse.json({
    reviews,
    bookOptions: (books || []).map((book) => ({ slug: book.slug, title: book.title })),
  });
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

  const text = String(body.text || "").trim();
  const bookSlug = String(body.bookSlug || "");
  if (!text || !bookSlug) {
    return NextResponse.json({ error: "Review text and book are required." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("reviews")
    .insert({
      book_slug: bookSlug,
      episode_slug: body.episodeSlug || null,
      name: String(body.name || "Reader").trim(),
      when_display: "Just now",
      rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
      text,
      approved: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: rowToReview(data) });
}
