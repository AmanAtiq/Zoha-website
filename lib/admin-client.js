// Client-side helpers for the admin panel (imported only from client components).

export class AuthError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "AuthError";
  }
}

export async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) throw new AuthError();

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const fmtPrice = (n) => (n == null ? "—" : `PKR ${Number(n).toLocaleString()}`);

// Read a file as a base64 data URL (legacy helper for tiny payloads).
export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Upload a File (or Blob) via a signed URL so large PDFs never pass through
// the Next.js / Vercel request body (which used to 413 above ~3–4MB).
export const uploadFile = async (fileOrDataUrl, filename, folder) => {
  // Legacy: still accept a data URL string for callers that already encoded it.
  if (typeof fileOrDataUrl === "string") {
    const { url } = await api("/api/admin/upload", {
      method: "POST",
      body: JSON.stringify({ dataUrl: fileOrDataUrl, filename, folder }),
    });
    return url;
  }

  const file = fileOrDataUrl;
  const name = filename || file.name || "file";
  const contentType = file.type || "application/octet-stream";

  const signed = await api("/api/admin/upload", {
    method: "POST",
    body: JSON.stringify({
      filename: name,
      folder,
      contentType,
      size: file.size,
    }),
  });

  if (signed.signedUrl) {
    const put = await fetch(signed.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        ...(signed.token ? { "x-upsert": "false" } : {}),
      },
      body: file,
    });
    if (!put.ok) {
      const detail = await put.text().catch(() => "");
      throw new Error(detail || `Upload failed (${put.status})`);
    }
    return signed.url;
  }

  // Fallback if the API returned a completed upload URL only.
  return signed.url;
};
