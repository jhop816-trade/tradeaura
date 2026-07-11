import { callClaude } from "./anthropic-client.js";

export interface TradeInput {
  symbol: string;
  direction: "long" | "short";
  entry: number;
  exit: number;
  pnl: number;
  stopLoss?: number | null;
  setup?: string | null;
  mood?: string | null;
  rulesFollowed?: string[];
  notes?: string | null;
  outcome: "win" | "loss" | "breakeven";
}

export interface GradeResult {
  grade: "A" | "B" | "C" | "D" | "F";
  score: number;
  strengths: string[];
  weaknesses: string[];
  lesson: string;
  verdict: string;
  confidence: number;
  confidenceReason: string;
  reviewManually: boolean;
}

const GRADER_SYSTEM = `You are TradeAura's AI trade grader. Grade the provided trade based solely on PROCESS and RULE ADHERENCE — not on whether it made or lost money.

Grading scale:
A — Excellent process. Followed the plan fully, sized correctly, managed risk, exercised patience.
B — Good process with minor deviations. Mostly followed the plan with small lapses.
C — Average. Some rule adherence but notable deviations in entry, sizing, or management.
D — Poor process. Multiple violations, emotional decision-making, or significant plan deviations.
F — No process. Revenge trading, no stop loss, overleveraged, or complete plan abandonment.

Also assess your confidence in the grade:
- confidence: 0–100 integer (how certain you are given the available data)
- confidenceReason: one sentence explaining what makes you confident or uncertain
- Low confidence indicators: no stop loss provided, ambiguous notes, missing setup info, mood suggesting emotion

Return ONLY this JSON — no markdown, no extra text:
{"grade":"A","score":85,"strengths":[""],"weaknesses":[""],"lesson":"","verdict":"","confidence":90,"confidenceReason":""}`;

export async function gradeTrade(trade: TradeInput, signal?: AbortSignal): Promise<GradeResult> {
  const tradeStr = [
    `Symbol: ${trade.symbol}`,
    `Direction: ${trade.direction}`,
    `Entry: ${trade.entry} | Exit: ${trade.exit}`,
    `P&L: $${trade.pnl.toFixed(2)} (${trade.outcome})`,
    `Stop Loss: ${trade.stopLoss ?? "Not set"}`,
    `Setup: ${trade.setup ?? "Not specified"}`,
    `Mood: ${trade.mood ?? "Not specified"}`,
    `Rules Followed: ${trade.rulesFollowed?.join(", ") || "None logged"}`,
    `Notes: ${trade.notes || "None"}`,
  ].join("\n");

  const text = await callClaude({
    system: GRADER_SYSTEM,
    messages: [{ role: "user", content: `Grade this trade:\n\n${tradeStr}` }],
    maxTokens: 600,
    signal,
  });

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in grading response");
  const parsed = JSON.parse(match[0]) as GradeResult;
  parsed.reviewManually = parsed.confidence < 60;
  return parsed;
}
