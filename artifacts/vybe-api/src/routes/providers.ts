import { Router } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, providersTable, usersTable, servicesTable, workingHoursTable, reviewsTable } from "../db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Public: list providers with optional filters (includes avg rating)
router.get("/", async (req, res) => {
  const { category, search } = req.query as Record<string, string>;
  const conditions = [];
  if (category && category !== "all") conditions.push(eq(providersTable.category, category));
  if (search) conditions.push(ilike(providersTable.displayName, `%${search}%`));

  const providers = await db
    .select()
    .from(providersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(50);

  // Attach review stats to each provider
  const withRatings = await Promise.all(providers.map(async (p) => {
    const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.providerId, p.id));
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;
    return { ...p, reviewCount: reviews.length, avgRating };
  }));

  res.json(withRatings);
});

// Auth required: get my provider profile — MUST be before /:username
router.get("/me", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const provider = await db.select().from(providersTable).where(eq(providersTable.userId, user[0].id)).limit(1);
  if (!provider[0]) { res.status(404).json({ error: "Provider profile not found" }); return; }

  res.json(provider[0]);
});

// Auth required: create provider profile
router.post("/", requireAuth, async (req, res) => {
  const { username, displayName, category, bio, instagramHandle } = req.body as Record<string, string>;
  if (!username || !displayName || !category) {
    res.status(400).json({ error: "username, displayName, and category are required" });
    return;
  }

  let user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) {
    const created = await db.insert(usersTable).values({
      clerkId: req.userId,
      email: req.body.email ?? "",
      role: "provider",
    }).returning();
    user = created;
  }

  const existing = await db.select().from(providersTable).where(eq(providersTable.username, username)).limit(1);
  if (existing[0]) { res.status(409).json({ error: "Username already taken" }); return; }

  const [provider] = await db.insert(providersTable).values({
    userId: user[0].id,
    username,
    displayName,
    category,
    bio: bio ?? null,
    instagramHandle: instagramHandle ?? null,
  }).returning();

  res.status(201).json(provider);
});

// Auth required: update my provider profile
router.patch("/me", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const { displayName, bio, category, avatarUrl, instagramHandle, username } = req.body as Record<string, string>;
  const updates: Partial<typeof providersTable.$inferInsert> = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (bio !== undefined) updates.bio = bio;
  if (category !== undefined) updates.category = category;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (instagramHandle !== undefined) updates.instagramHandle = instagramHandle;
  if (username !== undefined) updates.username = username;

  const [updated] = await db
    .update(providersTable)
    .set(updates)
    .where(eq(providersTable.userId, user[0].id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Provider profile not found" }); return; }
  res.json(updated);
});

// Public: get provider by username with services + working hours
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  const [provider] = await db.select().from(providersTable).where(eq(providersTable.username, username)).limit(1);
  if (!provider) { res.status(404).json({ error: "Provider not found" }); return; }

  const services = await db.select().from(servicesTable)
    .where(and(eq(servicesTable.providerId, provider.id), eq(servicesTable.isActive, true)));

  const hours = await db.select().from(workingHoursTable).where(eq(workingHoursTable.providerId, provider.id));

  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.providerId, provider.id));
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  res.json({ ...provider, services, workingHours: hours, reviewCount: reviews.length, avgRating });
});

export default router;
