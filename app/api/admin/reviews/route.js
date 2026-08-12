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

  const [{ data: books }, { data: episodes }] = await Promise.all([
    admin.from("books").select("slug, title"),
    admin.from("episodes").select("book_slug, slug, title, episode_number").order("episode_number", { ascending: true }),
  ]);
  const titleBySlug = {};
  for (const b of books || []) titleBySlug[b.slug] = b.title;
  const episodesByBook = {};
  const episodeTitleByKey = {};
  for (const ep of episodes || []) {
    (episodesByBook[ep.book_slug] ||= []).push({
      slug: ep.slug,
      title: ep.title || ep.slug,
      episodeNumber: ep.episode_number || 0,
    });
    episodeTitleByKey[`${ep.book_slug}:${ep.slug}`] = ep.title || ep.slug;
  }

  const reviews = (data || []).map((r) => ({
    ...rowToReview(r),
    bookTitle: titleBySlug[r.book_slug] || r.book_slug || "",
    episodeTitle: r.episode_slug ? episodeTitleByKey[`${r.book_slug}:${r.episode_slug}`] || r.episode_slug : "",
  }));

  return NextResponse.json({
    reviews,
    bookOptions: (books || []).map((book) => ({
      slug: book.slug,
      title: book.title,
      episodes: episodesByBook[book.slug] || [],
    })),
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
      when_display: String(body.when || body.whenDisplay || "Just now").trim() || "Just now",
      rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
      text,
      approved: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: rowToReview(data) });
}
