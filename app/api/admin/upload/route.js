import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getAdminClient, storagePublicUrl } from "../../../../lib/supabase-server";

export const dynamic = "force-dynamic";

// Uploads a base64 data URL to the public "assets" bucket and returns its URL.
// Body: { filename?: string, dataUrl: "data:<mime>;base64,...." }
export async function POST(request) {
  const token = await requireAdmin();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });

  let body = {};
  try {
    body = await request.json();
  } catch {
    // fall through
  }

  const dataUrl = String(body.dataUrl || "");
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "Invalid data URL." }, { status: 400 });
  }

  const contentType = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, "base64");
  const MAX = 8 * 1024 * 1024; // 8MB
  if (buffer.length > MAX) {
    return NextResponse.json({ error: "File too large (max 8MB)." }, { status: 400 });
  }

  const ext = (contentType.split("/")[1] || "bin").replace("jpeg", "jpg");
  const safeName = String(body.filename || "file")
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .slice(0, 80);
  const base = safeName.split(".")[0] || "file";
  const folder = body.folder === "pdf" ? "pdfs" : "images";
  const path = `${folder}/${Date.now()}-${base}.${ext}`;

  const { error } = await admin.storage.from("assets").upload(path, buffer, {
    contentType,
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: storagePublicUrl(`assets/${path}`) });
}
