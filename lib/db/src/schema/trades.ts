import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tradesTable = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  symbol: text("symbol").notNull(),
  direction: text("direction").notNull(), // "long" | "short"
  entryPrice: numeric("entry_price", { precision: 18, scale: 8 }).notNull(),
  exitPrice: numeric("exit_price", { precision: 18, scale: 8 }).notNull(),
  quantity: numeric("quantity", { precision: 18, scale: 8 }).notNull(),
  entryDate: timestamp("entry_date", { withTimezone: true }).notNull(),
  exitDate: timestamp("exit_date", { withTimezone: true }).notNull(),
  pnl: numeric("pnl", { precision: 18, scale: 8 }).notNull(),
  pnlPercent: numeric("pnl_percent", { precision: 10, scale: 4 }),
  riskRewardRatio: numeric("risk_reward_ratio", { precision: 10, scale: 4 }),
  stopLoss: numeric("stop_loss", { precision: 18, scale: 8 }),
  takeProfit: numeric("take_profit", { precision: 18, scale: 8 }),
  outcome: text("outcome").notNull(), // "win" | "loss" | "breakeven"
  strategy: text("strategy"),
  notes: text("notes"),
  tags: text("tags"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTradeSchema = createInsertSchema(tradesTable).omit({ id: true, createdAt: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof tradesTable.$inferSelect;
