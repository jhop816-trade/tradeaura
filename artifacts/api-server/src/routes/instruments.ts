import { Router, type IRouter } from "express";
import { and, eq, asc } from "drizzle-orm";
import { db, instrumentsTable, tradesTable } from "@workspace/db";

const router: IRouter = Router();

function getUserEmail(req: { headers: Record<string, string | string[] | undefined> }): string | null {
  const raw = req.headers["x-user-email"];
  if (!raw) return null;
  const email = Array.isArray(raw) ? raw[0] : raw;
  return email?.trim() || null;
}

// GET /instruments — list saved instruments for the current user, enriched with trade stats
router.get("/instruments", async (req, res): Promise<void> => {
  const userEmail = getUserEmail(req);
  if (!userEmail) {
    res.status(401).json({ error: "x-user-email header required" });
    return;
  }

  const instruments = await db
    .select()
    .from(instrumentsTable)
    .where(eq(instrumentsTable.userEmail, userEmail))
    .orderBy(asc(instrumentsTable.createdAt));

  // Enrich with trade stats per symbol
  const allTrades = await db.select().from(tradesTable);
  const tradesBySymbol = new Map<string, { pnl: number; total: number; wins: number }>();
  for (const t of allTrades) {
    const pnl = Number(t.pnl ?? 0);
    const existing = tradesBySymbol.get(t.symbol);
    if (existing) {
      existing.pnl += pnl;
      existing.total += 1;
      if (t.outcome === "win") existing.wins += 1;
    } else {
      tradesBySymbol.set(t.symbol, { pnl, total: 1, wins: t.outcome === "win" ? 1 : 0 });
    }
  }

  const result = instruments.map((inst) => {
    const stats = tradesBySymbol.get(inst.symbol);
    return {
      id: inst.id,
      symbol: inst.symbol,
      userEmail: inst.userEmail,
      createdAt: inst.createdAt.toISOString(),
      totalTrades: stats?.total ?? 0,
      totalPnl: stats?.pnl ?? 0,
      winRate: stats && stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
    };
  });

  res.json(result);
});

// POST /instruments — add an instrument
router.post("/instruments", async (req, res): Promise<void> => {
  const userEmail = getUserEmail(req);
  if (!userEmail) {
    res.status(401).json({ error: "x-user-email header required" });
    return;
  }

  const rawSymbol = (req.body as Record<string, unknown>)?.symbol;
  if (typeof rawSymbol !== "string" || !rawSymbol.trim()) {
    res.status(400).json({ error: "symbol is required" });
    return;
  }
  const symbol = rawSymbol.trim().toUpperCase().slice(0, 20);

  const existing = await db
    .select()
    .from(instrumentsTable)
    .where(and(eq(instrumentsTable.userEmail, userEmail), eq(instrumentsTable.symbol, symbol)));

  if (existing.length > 0) {
    res.status(409).json({ error: "Instrument already exists" });
    return;
  }

  const [row] = await db
    .insert(instrumentsTable)
    .values({ userEmail, symbol })
    .returning();

  res.status(201).json({
    id: row.id,
    symbol: row.symbol,
    userEmail: row.userEmail,
    createdAt: row.createdAt.toISOString(),
    totalTrades: 0,
    totalPnl: 0,
    winRate: 0,
  });
});

// DELETE /instruments/:symbol — remove an instrument
router.delete("/instruments/:symbol", async (req, res): Promise<void> => {
  const userEmail = getUserEmail(req);
  if (!userEmail) {
    res.status(401).json({ error: "x-user-email header required" });
    return;
  }

  const symbol = req.params.symbol?.toUpperCase();
  if (!symbol) {
    res.status(400).json({ error: "Symbol required" });
    return;
  }

  const [deleted] = await db
    .delete(instrumentsTable)
    .where(and(eq(instrumentsTable.userEmail, userEmail), eq(instrumentsTable.symbol, symbol)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Instrument not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
