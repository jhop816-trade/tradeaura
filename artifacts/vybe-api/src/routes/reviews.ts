import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, reviewsTable, bookingsTable, clientsTable, usersTable, providersTable } from "../db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Public: get reviews for a provider
router.get("/provider/:providerId", async (req, res) => {
  const reviews = await db
    .select({ review: reviewsTable, client: clientsTable })
    .from(reviewsTable)
    .innerJoin(clientsTable, eq(reviewsTable.clientId, clientsTable.id))
    .where(eq(reviewsTable.providerId, req.params.providerId as string))
    .orderBy(reviewsTable.createdAt);
  res.json(reviews);
});

// Auth required: submit a review for a completed booking
router.post("/", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.userId, user[0].id)).limit(1);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  const { bookingId, rating, comment } = req.body as { bookingId: string; rating: number; comment?: string };
  if (!bookingId || !rating) { res.status(400).json({ error: "bookingId and rating are required" }); return; }
  if (rating < 1 || rating > 5) { res.status(400).json({ error: "rating must be between 1 and 5" }); return; }

  const [booking] = await db.select().from(bookingsTable)
    .where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.clientId, client.id), eq(bookingsTable.status, "completed")))
    .limit(1);
  if (!booking) { res.status(404).json({ error: "Completed booking not found" }); return; }

  // Prevent duplicate reviews
  const existing = await db.select().from(reviewsTable).where(eq(reviewsTable.bookingId, bookingId)).limit(1);
  if (existing[0]) { res.status(409).json({ error: "Review already submitted for this booking" }); return; }

  const [review] = await db.insert(reviewsTable).values({
    bookingId,
    providerId: booking.providerId,
    clientId: client.id,
    rating,
    comment: comment ?? null,
  }).returning();

  res.status(201).json(review);
});

export default router;
