import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, workingHoursTable, providersTable, usersTable } from "../db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Public: get working hours for a provider
router.get("/:providerId", async (req, res) => {
  const hours = await db.select().from(workingHoursTable)
    .where(eq(workingHoursTable.providerId, req.params.providerId as string))
    .orderBy(workingHoursTable.dayOfWeek);
  res.json(hours);
});

// Auth required: upsert working hours for my provider profile
router.put("/", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [provider] = await db.select().from(providersTable).where(eq(providersTable.userId, user[0].id)).limit(1);
  if (!provider) { res.status(404).json({ error: "Provider not found" }); return; }

  const { hours } = req.body as {
    hours: Array<{ dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean }>;
  };

  if (!Array.isArray(hours) || hours.length === 0) {
    res.status(400).json({ error: "hours array is required" });
    return;
  }

  // Upsert each day
  const results = await Promise.all(
    hours.map(async (h) => {
      const existing = await db.select().from(workingHoursTable)
        .where(and(eq(workingHoursTable.providerId, provider.id), eq(workingHoursTable.dayOfWeek, h.dayOfWeek)))
        .limit(1);

      if (existing[0]) {
        const [updated] = await db.update(workingHoursTable)
          .set({ openTime: h.openTime, closeTime: h.closeTime, isClosed: h.isClosed })
          .where(eq(workingHoursTable.id, existing[0].id))
          .returning();
        return updated;
      } else {
        const [created] = await db.insert(workingHoursTable)
          .values({ providerId: provider.id, dayOfWeek: h.dayOfWeek, openTime: h.openTime, closeTime: h.closeTime, isClosed: h.isClosed })
          .returning();
        return created;
      }
    }),
  );

  res.json(results);
});

export default router;
export { DAYS };
