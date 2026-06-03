import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, clientsTable, usersTable } from "../db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.userId, user[0].id)).limit(1);
  if (!client) { res.status(404).json({ error: "Client profile not found" }); return; }

  res.json(client);
});

router.post("/", requireAuth, async (req, res) => {
  const { displayName, email } = req.body as Record<string, string>;
  if (!displayName) { res.status(400).json({ error: "displayName is required" }); return; }

  let user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) {
    const created = await db.insert(usersTable).values({
      clerkId: req.userId,
      email: email ?? "",
      role: "client",
    }).returning();
    user = created;
  }

  const [client] = await db.insert(clientsTable).values({
    userId: user[0].id,
    displayName,
  }).returning();

  res.status(201).json(client);
});

router.patch("/me", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const { displayName, avatarUrl } = req.body as Record<string, string>;
  const updates: Partial<typeof clientsTable.$inferInsert> = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

  const [updated] = await db.update(clientsTable).set(updates)
    .where(eq(clientsTable.userId, user[0].id)).returning();

  if (!updated) { res.status(404).json({ error: "Client profile not found" }); return; }
  res.json(updated);
});

export default router;
