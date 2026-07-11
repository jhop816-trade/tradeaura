import { Router, type IRouter } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, tradesTable, weeklyRecapsTable } from "@workspace/db";
import { callClaude } from "../lib/anthropic-client.js";

const RECAP_SYSTEM = `You are TradeAura's performance analyst. Given a trader's last 7 days of trade data, produce a structured weekly recap.

Return ONLY this JSON:
{
  "summary": "2-3 sentence overall assessment",
  "stats": {
    "totalTrades": 0,
    "winRate": 0,
    "netPnl": 0,
    "avgGrade": "B"
  },
  "bestPattern": "what's working well with specific setup/behavior",
  "worstHabit": "top recurring mistake or weakness",
  "tiltDetected": false,
  "tiltEvidence": "if tilt detected, describe the pattern; otherwise empty string",
  "focusForNextWeek": "one concrete, actionable focus area"
}`;

const router: IRouter = Router();

router.get("/api/recap/weekly", async (req, res): Promise<void> => {
  const now = new Date();
  const day = now.getUTCDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(monday.getUTCDate() - daysToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  const weekStart = monday.toISOString().slice(0, 10);
  const weekEnd = new Date(monday);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);

  const cached = await db
    .select()
    .from(weeklyRecapsTable)
    .where(
      and(
        eq(weeklyRecapsTable.userId, req.userId),
        eq(weeklyRecapsTable.weekStart, weekStart),
      ),
    )
    .limit(1);

  if (cached.length > 0) {
    res.json({ weekStart, ...JSON.parse(cached[0].recap), cached: true });
    return;
  }

  const trades = await db
    .select()
    .from(tradesTable)
    .where(
      and(
        eq(tradesTable.userId, req.userId),
        gte(tradesTable.exitDate, monday),
        lte(tradesTable.exitDate, weekEnd),
      ),
    );

  if (trades.length === 0) {
    res.json({
      weekStart,
      summary: "No trades this week.",
      stats: { totalTrades: 0, winRate: 0, netPnl: 0, avgGrade: null },
      bestPattern: "",
      worstHabit: "",
      tiltDetected: false,
      tiltEvidence: "",
      focusForNextWeek: "Log trades to get your weekly recap.",
    });
    return;
  }

  const tradeSummary = trades
    .map((t) => {
      return `${t.symbol} ${t.direction} | setup: ${t.setup || "?"} | P&L: $${parseFloat(t.pnl).toFixed(2)} | grade: ${t.aiGrade || "?"} | mood: ${t.mood || "?"} | outcome: ${t.outcome}`;
    })
    .join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const text = await callClaude({
      system: RECAP_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Week of ${weekStart} — ${trades.length} trades:\n\n${tradeSummary}`,
        },
      ],
      maxTokens: 1000,
      signal: controller.signal,
    });

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      res.status(502).json({ error: "Failed to generate recap" });
      return;
    }
    const recap = JSON.parse(match[0]) as Record<string, unknown>;

    await db.insert(weeklyRecapsTable).values({
      userId: req.userId,
      weekStart,
      recap: JSON.stringify(recap),
    });

    res.json({ weekStart, ...recap, cached: false });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      res.status(504).json({ error: "Recap generation timed out" });
      return;
    }
    req.log.error(err, "Weekly recap error");
    res.status(502).json({ error: "Failed to generate recap" });
  } finally {
    clearTimeout(timeout);
  }
});

export default router;
