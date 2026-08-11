import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getAdminClient, storagePublicUrl } from "../../../../lib/supabase-server";

export const dynamic = "force-dynamic";

const MAX_BYTES = 50 * 1024 * 1024; // 50MB — matches typical Supabase bucket limit

function buildPath(filename, folder, contentType) {
  const extFromName = String(filename || "").split(".").pop();
  const extFromType = (contentType.split("/")[1] || "bin").replace("jpeg", "jpg");
  const ext = (extFromName && extFromName.length <= 8 ? extFromName : extFromType)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "bin";
  const safeName = String(filename || "file")
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .slice(0, 80);
  const base = safeName.split(".")[0] || "file";
  const dir = folder === "pdf" ? "pdfs" : "images";
  return `${dir}/${Date.now()}-${base}.${ext}`;
}

// Creates a signed upload URL so the browser can PUT the file straight to
// Supabase Storage — avoids Vercel's request body size limit (which caused 413
// for PDFs over ~3–4MB when sent as base64 JSON).
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

  // Legacy path: small files may still arrive as a base64 data URL.
  if (body.dataUrl) {
    const dataUrl = String(body.dataUrl || "");
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid data URL." }, { status: 400 });
    }

    const contentType = match[1];
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 50MB)." }, { status: 400 });
    }

    const path = buildPath(body.filename, body.folder, contentType);
    const { error } = await admin.storage.from("assets").upload(path, buffer, {
      contentType,
      upsert: false,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ url: storagePublicUrl(`assets/${path}`) });
  }

  // Preferred path: return a signed upload URL for direct-to-storage PUT.
  const filename = String(body.filename || "file");
  const contentType = String(body.contentType || "application/octet-stream");
  const size = Number(body.size) || 0;
  if (size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 50MB)." }, { status: 400 });
  }

  const path = buildPath(filename, body.folder, contentType);
  const { data, error } = await admin.storage.from("assets").createSignedUploadUrl(path);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
    url: storagePublicUrl(`assets/${path}`),
  });
}
