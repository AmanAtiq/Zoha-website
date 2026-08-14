import { NextResponse } from "next/server";
import { getDataClient } from "../../../lib/supabase-server";

export async function POST(request) {
  const db = getDataClient();
  if (!db) {
    return NextResponse.json({ error: "Reviews are unavailable right now." }, { status: 503 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    // fall through
  }

  const name = String(body.name || "").trim().slice(0, 60);
  const text = String(body.text || "").trim().slice(0, 2000);
  const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
  const bookSlug = String(body.bookSlug || "");
  const episodeSlug = body.episodeSlug ? String(body.episodeSlug) : null;

  if (!text || !bookSlug) {
    return NextResponse.json({ error: "Missing review text or book." }, { status: 400 });
  }

  const { error } = await db.from("reviews").insert({
    book_slug: bookSlug,
    episode_slug: episodeSlug,
    name: name || "Reader",
    when_display: "Just now",
    rating,
    text,
    approved: false,
  });

  if (error) {
    console.error("review insert failed:", error.message);
    return NextResponse.json({ error: "Could not save your review." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    review: {
      name: name || "Reader",
      rating,
      text,
      when: "Just now",
      createdAt: new Date().toISOString(),
    },
  });
}
