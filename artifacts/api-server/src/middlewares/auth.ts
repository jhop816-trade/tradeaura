import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Request, Response, NextFunction } from "express";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    }
    _supabase = createClient(url, key, { auth: { persistSession: false } });
  }
  return _supabase;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const { data, error } = await getSupabase().auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    req.userId = data.user.id;
    next();
  } catch (err) {
    req.log.error(err, "Auth middleware error");
    res.status(500).json({ error: "Auth configuration error" });
  }
}
