import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, tradesTable } from "@workspace/db";
import {
  ListTradesQueryParams,
  CreateTradeBody,
  GetTradeParams,
  GetTradeResponse,
  UpdateTradeParams,
  UpdateTradeBody,
  UpdateTradeResponse,
  DeleteTradeParams,
  ListTradesResponse,
  GetStatsSummaryResponse,
  GetStatsBySymbolResponse,
  GetEquityCurveResponse,
  GetStatsByDayResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function computeOutcome(pnl: number): "win" | "loss" | "breakeven" {
  if (pnl > 0) return "win";
  if (pnl < 0) return "loss";
  return "breakeven";
}

function computePnl(
  direction: string,
  entryPrice: number,
  exitPrice: number,
  quantity: number,
): number {
  if (direction === "long") {
    return (exitPrice - entryPrice) * quantity;
  }
  return (entryPrice - exitPrice) * quantity;
}

function toNum(val: unknown): number {
  return Number(val ?? 0);
}

function serializeJson(val: unknown): string | null {
  if (val == null) return null;
  return JSON.stringify(val);
}

function parseJson(val: string | null): unknown {
  if (val == null) return null;
  try { return JSON.parse(val); } catch { return null; }
}

function mapRow(r: typeof tradesTable.$inferSelect) {
  return {
    ...r,
    entryPrice: toNum(r.entryPrice),
    exitPrice: toNum(r.exitPrice),
    quantity: toNum(r.quantity),
    pnl: toNum(r.pnl),
    pnlPercent: r.pnlPercent != null ? toNum(r.pnlPercent) : null,
    riskRewardRatio: r.riskRewardRatio != null ? toNum(r.riskRewardRatio) : null,
    stopLoss: r.stopLoss != null ? toNum(r.stopLoss) : null,
    takeProfit: r.takeProfit != null ? toNum(r.takeProfit) : null,
    manualPnl: r.manualPnl != null ? toNum(r.manualPnl) : null,
    entryDate: r.entryDate.toISOString(),
    exitDate: r.exitDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
    rulesFollowed: parseJson(r.rulesFollowed) as string[] | null,
    aiFeedback: parseJson(r.aiFeedback) as Record<string, unknown> | null,
  };
}

// List trades with optional filters
router.get("/trades", async (req, res): Promise<void> => {
  const query = ListTradesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { symbol, direction, outcome, accountId, limit = 50, offset = 0 } = query.data;

  const conditions = [eq(tradesTable.userId, req.userId)];
  if (symbol) conditions.push(eq(tradesTable.symbol, symbol.toUpperCase()));
  if (direction) conditions.push(eq(tradesTable.direction, direction));
  if (outcome) conditions.push(eq(tradesTable.outcome, outcome));
  if (accountId) conditions.push(eq(tradesTable.accountId, accountId));

  const rows = await db
    .select()
    .from(tradesTable)
    .where(and(...conditions))
    .orderBy(desc(tradesTable.entryDate))
    .limit(limit)
    .offset(offset);

  res.json(ListTradesResponse.parse(rows.map(mapRow)));
});

// Create trade
router.post("/trades", async (req, res): Promise<void> => {
  const parsed = CreateTradeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const d = parsed.data;
  const entryPrice = Number(d.entryPrice);
  const exitPrice = Number(d.exitPrice);
  const quantity = Number(d.quantity);
  const computedPnl = computePnl(d.direction, entryPrice, exitPrice, quantity);
  const pnl = d.manualPnl != null ? d.manualPnl : computedPnl;
  const pnlPercent = entryPrice !== 0 ? ((exitPrice - entryPrice) / entryPrice) * 100 : 0;
  const outcome = computeOutcome(pnl);

  let riskRewardRatio: number | null = null;
  if (d.stopLoss != null && d.takeProfit != null) {
    const risk = Math.abs(entryPrice - Number(d.stopLoss));
    const reward = Math.abs(Number(d.takeProfit) - entryPrice);
    if (risk !== 0) riskRewardRatio = reward / risk;
  }

  const [row] = await db
    .insert(tradesTable)
    .values({
      userId: req.userId,
      accountId: d.accountId ?? null,
      symbol: d.symbol.toUpperCase(),
      direction: d.direction,
      entryPrice: String(entryPrice),
      exitPrice: String(exitPrice),
      quantity: String(quantity),
      entryDate: new Date(d.entryDate),
      exitDate: new Date(d.exitDate),
      pnl: String(pnl),
      pnlPercent: String(pnlPercent),
      riskRewardRatio: riskRewardRatio != null ? String(riskRewardRatio) : null,
      stopLoss: d.stopLoss != null ? String(d.stopLoss) : null,
      takeProfit: d.takeProfit != null ? String(d.takeProfit) : null,
      manualPnl: d.manualPnl != null ? String(d.manualPnl) : null,
      outcome,
      setup: d.setup ?? null,
      session: d.session ?? null,
      mood: d.mood ?? null,
      rulesFollowed: serializeJson(d.rulesFollowed),
      notes: d.notes ?? null,
      tags: d.tags ?? null,
      screenshot: d.screenshot ?? null,
      accountType: d.accountType ?? null,
      aiGrade: d.aiGrade ?? null,
      aiFeedback: serializeJson(d.aiFeedback),
    })
    .returning();

  res.status(201).json(GetTradeResponse.parse(mapRow(row)));
});

// Get single trade
router.get("/trades/:id", async (req, res): Promise<void> => {
  const params = GetTradeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(tradesTable)
    .where(and(eq(tradesTable.id, params.data.id), eq(tradesTable.userId, req.userId)));

  if (!row) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }

  res.json(GetTradeResponse.parse(mapRow(row)));
});

// Update trade
router.patch("/trades/:id", async (req, res): Promise<void> => {
  const params = UpdateTradeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTradeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(tradesTable)
    .where(and(eq(tradesTable.id, params.data.id), eq(tradesTable.userId, req.userId)));

  if (!existing) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }

  const d = parsed.data;
  const entryPrice = d.entryPrice != null ? Number(d.entryPrice) : toNum(existing.entryPrice);
  const exitPrice = d.exitPrice != null ? Number(d.exitPrice) : toNum(existing.exitPrice);
  const quantity = d.quantity != null ? Number(d.quantity) : toNum(existing.quantity);
  const direction = d.direction ?? existing.direction;
  const computedPnl = computePnl(direction, entryPrice, exitPrice, quantity);
  const manualPnlRaw = d.manualPnl !== undefined ? d.manualPnl : (existing.manualPnl != null ? toNum(existing.manualPnl) : null);
  const pnl = manualPnlRaw != null ? manualPnlRaw : computedPnl;
  const pnlPercent = entryPrice !== 0 ? ((exitPrice - entryPrice) / entryPrice) * 100 : 0;
  const outcome = computeOutcome(pnl);

  const stopLossRaw = d.stopLoss !== undefined ? d.stopLoss : existing.stopLoss;
  const takeProfitRaw = d.takeProfit !== undefined ? d.takeProfit : existing.takeProfit;
  let riskRewardRatio: number | null = null;
  if (stopLossRaw != null && takeProfitRaw != null) {
    const risk = Math.abs(entryPrice - Number(stopLossRaw));
    const reward = Math.abs(Number(takeProfitRaw) - entryPrice);
    if (risk !== 0) riskRewardRatio = reward / risk;
  }

  const updateValues: Record<string, unknown> = {
    pnl: String(pnl),
    pnlPercent: String(pnlPercent),
    outcome,
    riskRewardRatio: riskRewardRatio != null ? String(riskRewardRatio) : null,
    entryPrice: String(entryPrice),
    exitPrice: String(exitPrice),
    quantity: String(quantity),
    direction,
    stopLoss: stopLossRaw != null ? String(stopLossRaw) : null,
    takeProfit: takeProfitRaw != null ? String(takeProfitRaw) : null,
    manualPnl: manualPnlRaw != null ? String(manualPnlRaw) : null,
  };

  if (d.accountId !== undefined) updateValues.accountId = d.accountId;
  if (d.symbol != null) updateValues.symbol = d.symbol.toUpperCase();
  if (d.entryDate != null) updateValues.entryDate = new Date(d.entryDate);
  if (d.exitDate != null) updateValues.exitDate = new Date(d.exitDate);
  if (d.setup !== undefined) updateValues.setup = d.setup;
  if (d.session !== undefined) updateValues.session = d.session;
  if (d.mood !== undefined) updateValues.mood = d.mood;
  if (d.rulesFollowed !== undefined) updateValues.rulesFollowed = serializeJson(d.rulesFollowed);
  if (d.notes !== undefined) updateValues.notes = d.notes;
  if (d.tags !== undefined) updateValues.tags = d.tags;
  if (d.screenshot !== undefined) updateValues.screenshot = d.screenshot;
  if (d.accountType !== undefined) updateValues.accountType = d.accountType;
  if (d.aiGrade !== undefined) updateValues.aiGrade = d.aiGrade;
  if (d.aiFeedback !== undefined) updateValues.aiFeedback = serializeJson(d.aiFeedback);

  const [row] = await db
    .update(tradesTable)
    .set(updateValues)
    .where(and(eq(tradesTable.id, params.data.id), eq(tradesTable.userId, req.userId)))
    .returning();

  res.json(UpdateTradeResponse.parse(mapRow(row)));
});

// Delete trade
router.delete("/trades/:id", async (req, res): Promise<void> => {
  const params = DeleteTradeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(tradesTable)
    .where(and(eq(tradesTable.id, params.data.id), eq(tradesTable.userId, req.userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }

  res.sendStatus(204);
});

// Stats: summary
router.get("/stats/summary", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.userId, req.userId));

  const totalTrades = rows.length;
  const totalPnl = rows.reduce((s, r) => s + toNum(r.pnl), 0);
  const wins = rows.filter((r) => r.outcome === "win");
  const losses = rows.filter((r) => r.outcome === "loss");
  const breakevenRows = rows.filter((r) => r.outcome === "breakeven");
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, r) => s + toNum(r.pnl), 0) / wins.length : 0;
  const avgLoss =
    losses.length > 0 ? losses.reduce((s, r) => s + toNum(r.pnl), 0) / losses.length : 0;
  const totalWinAmount = wins.reduce((s, r) => s + toNum(r.pnl), 0);
  const totalLossAmount = Math.abs(losses.reduce((s, r) => s + toNum(r.pnl), 0));
  const profitFactor =
    totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? 999 : 0;
  const rrRows = rows.filter((r) => r.riskRewardRatio != null);
  const avgRiskReward =
    rrRows.length > 0
      ? rrRows.reduce((s, r) => s + toNum(r.riskRewardRatio), 0) / rrRows.length
      : 0;

  res.json(GetStatsSummaryResponse.parse({
    totalTrades,
    totalPnl,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    avgRiskReward,
    winCount: wins.length,
    lossCount: losses.length,
    breakevenCount: breakevenRows.length,
  }));
});

// Stats: by symbol
router.get("/stats/by-symbol", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.userId, req.userId));

  const map: Record<string, { pnl: number; total: number; wins: number }> = {};
  for (const r of rows) {
    if (!map[r.symbol]) map[r.symbol] = { pnl: 0, total: 0, wins: 0 };
    map[r.symbol].pnl += toNum(r.pnl);
    map[r.symbol].total += 1;
    if (r.outcome === "win") map[r.symbol].wins += 1;
  }

  const result = Object.entries(map)
    .map(([symbol, s]) => ({
      symbol,
      totalTrades: s.total,
      totalPnl: s.pnl,
      winRate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);

  res.json(GetStatsBySymbolResponse.parse(result));
});

// Stats: equity curve
router.get("/stats/equity-curve", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.userId, req.userId))
    .orderBy(tradesTable.exitDate);

  const dateMap: Record<string, number> = {};
  for (const r of rows) {
    const date = r.exitDate.toISOString().split("T")[0];
    dateMap[date] = (dateMap[date] ?? 0) + toNum(r.pnl);
  }

  let cumulative = 0;
  const curve = Object.entries(dateMap).map(([date, pnl]) => {
    cumulative += pnl;
    return { date, pnl, cumulativePnl: cumulative };
  });

  res.json(GetEquityCurveResponse.parse(curve));
});

// Stats: by day of week
router.get("/stats/by-day", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.userId, req.userId));

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const map: Record<string, { pnl: number; total: number; wins: number }> = {};
  for (const day of days) map[day] = { pnl: 0, total: 0, wins: 0 };

  for (const r of rows) {
    const day = days[r.exitDate.getDay()];
    map[day].pnl += toNum(r.pnl);
    map[day].total += 1;
    if (r.outcome === "win") map[day].wins += 1;
  }

  const result = days.map((day) => ({
    day,
    totalTrades: map[day].total,
    totalPnl: map[day].pnl,
    winRate: map[day].total > 0 ? (map[day].wins / map[day].total) * 100 : 0,
  }));

  res.json(GetStatsByDayResponse.parse(result));
});

export default router;
