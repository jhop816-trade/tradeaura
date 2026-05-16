import { createClient } from "@supabase/supabase-js";

// Project URL is public and hardcoded to avoid misconfiguration
const supabaseUrl = "https://sjpltlbuxycwgehgxsul.supabase.co";

// The anon key is a long JWT token starting with "eyJ..."
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseAnonKey || supabaseAnonKey.trim().startsWith("http")) {
  throw new Error(
    "VITE_SUPABASE_ANON_KEY is missing or set to a URL. " +
    "Go to Supabase → Settings → API → copy the 'anon public' JWT token (starts with eyJ...)"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey.trim());
