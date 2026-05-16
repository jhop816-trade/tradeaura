import { createClient } from "@supabase/supabase-js";

// Support both the correct assignment and the common mix-up where URL/key are swapped
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Detect if the values are swapped (URL secret holds a key, key secret holds a URL)
const isUrlActuallyKey = envUrl && !envUrl.startsWith("http");
const isKeyActuallyUrl = envKey && envKey.startsWith("http");

const supabaseUrl = isKeyActuallyUrl ? envKey : envUrl;
const supabaseAnonKey = isUrlActuallyKey ? envUrl : envKey;

if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
  throw new Error(
    `Invalid or missing Supabase project URL. VITE_SUPABASE_URL should be set to your project URL (e.g. https://xxxx.supabase.co). Got: ${supabaseUrl}`
  );
}

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
