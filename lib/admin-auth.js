import { cookies } from "next/headers";
import { getAdminClient } from "./supabase-server";

export const ADMIN_COOKIE = "za_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function getSessionToken() {
  return cookies().get(ADMIN_COOKIE)?.value || null;
}

export async function createSession() {
  const admin = getAdminClient();
  if (!admin) return null;
  const token = crypto.randomUUID();
  const { error } = await admin.from("admin_sessions").insert({ token });
  if (error) return null;
  return token;
}

export async function validateSession(token) {
  const admin = getAdminClient();
  if (!token || !admin) return false;
  const { data, error } = await admin
    .from("admin_sessions")
    .select("token")
    .eq("token", token)
    .maybeSingle();
  return !error && Boolean(data);
}

export async function deleteSession(token) {
  const admin = getAdminClient();
  if (!token || !admin) return;
  await admin.from("admin_sessions").delete().eq("token", token);
}

export function setSessionCookie(token) {
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie() {
  cookies().set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

// Returns the validated token for an authenticated admin request, or null.
export async function requireAdmin() {
  const token = getSessionToken();
  const ok = await validateSession(token);
  return ok ? token : null;
}
