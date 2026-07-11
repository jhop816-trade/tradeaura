import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/api/health", async (_req, res) => {
  const checks: Record<string, { status: "ok" | "error"; message?: string }> = {};

  checks.anthropic = process.env.ANTHROPIC_API_KEY
    ? { status: "ok" }
    : { status: "error", message: "ANTHROPIC_API_KEY not set" };

  try {
    await db.execute(sql`select 1`);
    checks.database = { status: "ok" };
  } catch (err) {
    checks.database = { status: "error", message: (err as Error).message };
  }

  const allOk = Object.values(checks).every((c) => c.status === "ok");
  res.status(allOk ? 200 : 503).json({
    status: allOk ? "healthy" : "degraded",
    checks,
  });
});

export default router;
