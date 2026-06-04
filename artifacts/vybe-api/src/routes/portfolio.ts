import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, portfolioPhotosTable, providersTable, usersTable } from "../db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Public: get portfolio photos for a provider
router.get("/:providerId", async (req, res) => {
  const providerId = req.params.providerId as string;
  const photos = await db
    .select()
    .from(portfolioPhotosTable)
    .where(eq(portfolioPhotosTable.providerId, providerId))
    .orderBy(desc(portfolioPhotosTable.createdAt));
  res.json(photos);
});

// Auth required: upload a portfolio photo URL
router.post("/", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [provider] = await db.select().from(providersTable).where(eq(providersTable.userId, user[0].id)).limit(1);
  if (!provider) { res.status(404).json({ error: "Provider not found" }); return; }

  const { photoUrl, caption } = req.body as { photoUrl?: string; caption?: string };
  if (!photoUrl) { res.status(400).json({ error: "photoUrl is required" }); return; }

  const [photo] = await db.insert(portfolioPhotosTable).values({
    providerId: provider.id,
    photoUrl,
    caption: caption ?? null,
  }).returning();

  res.status(201).json(photo);
});

// Auth required: delete a portfolio photo (only the owning provider)
router.delete("/:id", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [provider] = await db.select().from(providersTable).where(eq(providersTable.userId, user[0].id)).limit(1);
  if (!provider) { res.status(404).json({ error: "Provider not found" }); return; }

  const photoId = req.params.id as string;
  const [photo] = await db
    .select()
    .from(portfolioPhotosTable)
    .where(and(eq(portfolioPhotosTable.id, photoId), eq(portfolioPhotosTable.providerId, provider.id)))
    .limit(1);

  if (!photo) { res.status(404).json({ error: "Photo not found or not authorized" }); return; }

  await db.delete(portfolioPhotosTable).where(eq(portfolioPhotosTable.id, photoId));
  res.status(204).send();
});

export default router;
