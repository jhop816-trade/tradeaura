import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const weeklyRecapsTable = pgTable("weekly_recaps", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  weekStart: text("week_start").notNull(),
  recap: text("recap").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WeeklyRecap = typeof weeklyRecapsTable.$inferSelect;
