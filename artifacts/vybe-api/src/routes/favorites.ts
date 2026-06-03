import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, favoritesTable, clientsTable, providersTable, usersTable } from "../db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Auth required: get my favorites
router.get("/", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.userId, user[0].id)).limit(1);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  const favorites = await db
    .select({ favorite: favoritesTable, provider: providersTable })
    .from(favoritesTable)
    .innerJoin(providersTable, eq(favoritesTable.providerId, providersTable.id))
    .where(eq(favoritesTable.clientId, client.id));

  res.json(favorites);
});

// Auth required: add a favorite
router.post("/:providerId", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.userId, user[0].id)).limit(1);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  const providerId = req.params.providerId as string;
  const existing = await db.select().from(favoritesTable)
    .where(and(eq(favoritesTable.clientId, client.id), eq(favoritesTable.providerId, providerId)))
    .limit(1);
  if (existing[0]) { res.json(existing[0]); return; }

  const [fav] = await db.insert(favoritesTable)
    .values({ clientId: client.id, providerId })
    .returning();
  res.status(201).json(fav);
});

// Auth required: remove a favorite
router.delete("/:providerId", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.userId, user[0].id)).limit(1);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  await db.delete(favoritesTable)
    .where(and(eq(favoritesTable.clientId, client.id), eq(favoritesTable.providerId, req.params.providerId as string)));
  res.status(204).send();
});

export default router;
