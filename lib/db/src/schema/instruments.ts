import { pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export const instrumentsTable = pgTable(
  "instruments",
  {
    id: serial("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    symbol: text("symbol").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userEmail, t.symbol)],
);

export type Instrument = typeof instrumentsTable.$inferSelect;
