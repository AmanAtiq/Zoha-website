import { createClient } from "@supabase/supabase-js";

// Node 18/20 have no native WebSocket, which makes @supabase/supabase-js throw
// at client construction. The site never uses realtime, so a no-op transport
// keeps client creation safe in plain-node scripts (Next server polyfills it).
const NOOP_TRANSPORT = class NoopTransport {
  constructor() {}
};

// Supabase queries must always hit the live database: Next.js otherwise caches
// these fetch() responses in its Data Cache and serves stale rows long after an
// admin edit. A no-store fetch keeps the public site in sync with admin saves.
const NO_STORE_FETCH = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

const CLIENT_OPTIONS = {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: NOOP_TRANSPORT },
  global: { fetch: NO_STORE_FETCH },
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// True once Supabase env vars exist. Until then the site runs on seed data
// (see lib/data.js) so it still builds and renders locally.
export const hasSupabase = Boolean(url && (anonKey || serviceKey));

let dataClient = null;
let adminClient = null;

// Reads public data (respects Row Level Security). Uses the anon key when
// available, otherwise the service role key.
export function getDataClient() {
  if (!hasSupabase) return null;
  if (dataClient) return dataClient;
  dataClient = createClient(url, anonKey || serviceKey, CLIENT_OPTIONS);
  return dataClient;
}

// Server-only admin client (service role). Bypasses RLS — never import this
// into client components.
export function getAdminClient() {
  if (!serviceKey) return null;
  if (adminClient) return adminClient;
  adminClient = createClient(url, serviceKey, CLIENT_OPTIONS);
  return adminClient;
}

export function storagePublicUrl(path) {
  return `${url}/storage/v1/object/public/${path}`;
}
