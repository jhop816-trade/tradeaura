import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl && "VITE_SUPABASE_URL",
    !supabaseAnonKey && "VITE_SUPABASE_ANON_KEY",
  ].filter(Boolean).join(", ");
  throw new Error(`Missing Supabase environment variables: ${missing}. Make sure they are set in Replit Secrets with the VITE_ prefix.`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
