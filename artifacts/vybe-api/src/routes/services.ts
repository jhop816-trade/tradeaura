import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, servicesTable, providersTable, usersTable } from "../db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Public: list services for a provider
router.get("/", async (req, res) => {
  const { providerId } = req.query as Record<string, string>;
  if (!providerId) { res.status(400).json({ error: "providerId is required" }); return; }

  const services = await db.select().from(servicesTable)
    .where(and(eq(servicesTable.providerId, providerId), eq(servicesTable.isActive, true)));
  res.json(services);
});

// Auth required: create a service
router.post("/", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [provider] = await db.select().from(providersTable).where(eq(providersTable.userId, user[0].id)).limit(1);
  if (!provider) { res.status(404).json({ error: "Provider profile not found" }); return; }

  const { name, description, price, durationMinutes, photoUrl } = req.body as Record<string, any>;
  if (!name || price == null || !durationMinutes) {
    res.status(400).json({ error: "name, price, and durationMinutes are required" });
    return;
  }

  const [service] = await db.insert(servicesTable).values({
    providerId: provider.id,
    name,
    description: description ?? null,
    price: Number(price),
    durationMinutes: Number(durationMinutes),
    photoUrl: photoUrl ?? null,
  }).returning();

  res.status(201).json(service);
});

// Auth required: update a service
router.patch("/:id", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [provider] = await db.select().from(providersTable).where(eq(providersTable.userId, user[0].id)).limit(1);
  if (!provider) { res.status(404).json({ error: "Provider profile not found" }); return; }

  const serviceId = req.params.id as string;
  const [service] = await db.select().from(servicesTable)
    .where(and(eq(servicesTable.id, serviceId), eq(servicesTable.providerId, provider.id))).limit(1);
  if (!service) { res.status(404).json({ error: "Service not found" }); return; }

  const { name, description, price, durationMinutes, photoUrl, isActive } = req.body as Record<string, any>;
  const updates: Partial<typeof servicesTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = Number(price);
  if (durationMinutes !== undefined) updates.durationMinutes = Number(durationMinutes);
  if (photoUrl !== undefined) updates.photoUrl = photoUrl;
  if (isActive !== undefined) updates.isActive = Boolean(isActive);

  const [updated] = await db.update(servicesTable).set(updates)
    .where(eq(servicesTable.id, serviceId)).returning();
  res.json(updated);
});

// Auth required: delete a service
router.delete("/:id", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [provider] = await db.select().from(providersTable).where(eq(providersTable.userId, user[0].id)).limit(1);
  if (!provider) { res.status(404).json({ error: "Provider profile not found" }); return; }

  await db.delete(servicesTable)
    .where(and(eq(servicesTable.id, req.params.id as string), eq(servicesTable.providerId, provider.id)));
  res.status(204).send();
});

export default router;
