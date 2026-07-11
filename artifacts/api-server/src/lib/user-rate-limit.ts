import type { Request, Response, NextFunction } from "express";

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const WINDOW_MS = 60_000;
const MAX_CALLS = 20;

// Clean up expired windows every minute to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, w] of windows) {
    if (now >= w.resetAt) windows.delete(key);
  }
}, WINDOW_MS).unref();

export function userLlmLimiter(req: Request, res: Response, next: NextFunction): void {
  const userId = req.userId;
  if (!userId) {
    next();
    return;
  }

  const now = Date.now();
  let w = windows.get(userId);
  if (!w || now >= w.resetAt) {
    w = { count: 0, resetAt: now + WINDOW_MS };
    windows.set(userId, w);
  }

  if (w.count >= MAX_CALLS) {
    const retryAfterSec = Math.ceil((w.resetAt - now) / 1000);
    res.set("Retry-After", String(retryAfterSec));
    res.status(429).json({ error: `LLM rate limit exceeded — try again in ${retryAfterSec}s` });
    return;
  }

  w.count++;
  next();
}
