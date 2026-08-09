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

// Read a file as a base64 data URL (used for the image upload field).
export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const uploadFile = async (dataUrl, filename, folder) => {
  const { url } = await api("/api/admin/upload", {
    method: "POST",
    body: JSON.stringify({ dataUrl, filename, folder }),
  });
  return url;
};
