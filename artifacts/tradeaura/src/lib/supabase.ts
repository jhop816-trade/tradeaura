import { createClient } from "@supabase/supabase-js";

// Clean and normalize the URL (trim whitespace, remove trailing slash/path)
function normalizeSupabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("http")) return undefined;
  try {
    const url = new URL(trimmed);
    return `${url.protocol}//${url.host}`;
  } catch {
    return undefined;
  }
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabaseUrl = normalizeSupabaseUrl(rawUrl);
// If rawKey looks like a URL (user entered URL in both fields), fall back to rawUrl normalized
const supabaseAnonKey =
  rawKey && !rawKey.trim().startsWith("http") ? rawKey.trim() : undefined;

if (!supabaseUrl) {
  throw new Error(
    `Invalid VITE_SUPABASE_URL: "${rawUrl}". Must be a URL like https://xxxx.supabase.co`
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    `Missing or invalid VITE_SUPABASE_ANON_KEY: it appears to be a URL instead of the anon/public JWT key. ` +
    `Go to Supabase → Settings → API → "anon public" and copy that long JWT token.`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
