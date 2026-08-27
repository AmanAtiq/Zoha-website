import { NextResponse } from "next/server";
import { getAdminClient } from "../../../lib/supabase-server";
import { rowToAssetStats } from "../../../lib/serialize";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Stats are unavailable right now." }, { status: 503 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    // fall through
  }

  const bookSlug = String(body.bookSlug || "").trim();
  const episodeSlug = body.episodeSlug ? String(body.episodeSlug).trim() : "";
  const action = body.action === "download" ? "download" : "read";

  if (!bookSlug) {
    return NextResponse.json({ error: "Missing book." }, { status: 400 });
  }

  const rpc = await admin.rpc("increment_book_asset_stat", {
    p_book_slug: bookSlug,
    p_episode_slug: episodeSlug,
    p_action: action,
  });

  if (!rpc.error && rpc.data) {
    return NextResponse.json({ ok: true, stats: rowToAssetStats(rpc.data) });
  }

  const { data: current } = await admin
    .from("book_asset_stats")
    .select("*")
    .eq("book_slug", bookSlug)
    .eq("episode_slug", episodeSlug)
    .maybeSingle();

  const next = {
    book_slug: bookSlug,
    episode_slug: episodeSlug,
    read_count: Number(current?.read_count || 0) + (action === "read" ? 1 : 0),
    download_count: Number(current?.download_count || 0) + (action === "download" ? 1 : 0),
  };

  const { data, error } = await admin
    .from("book_asset_stats")
    .upsert(next, { onConflict: "book_slug,episode_slug" })
    .select()
    .single();

  if (error) {
    if (/book_asset_stats|increment_book_asset_stat/i.test(error.message)) {
      return NextResponse.json({ ok: true, tracked: false });
    }
    console.error("asset stats update failed:", error.message);
    return NextResponse.json({ error: "Could not update stats." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stats: rowToAssetStats(data) });
}
