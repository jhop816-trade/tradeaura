import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, bookingsTable, providersTable, clientsTable, usersTable, servicesTable } from "../db";
import { requireAuth } from "../middlewares/auth";
import { SMS } from "../lib/sms";

const router = Router();

// Auth required: get provider's bookings — MUST be before /:id
router.get("/provider", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [provider] = await db.select().from(providersTable).where(eq(providersTable.userId, user[0].id)).limit(1);
  if (!provider) { res.status(404).json({ error: "Provider not found" }); return; }

  const bookings = await db
    .select({
      booking: bookingsTable,
      service: servicesTable,
      client: clientsTable,
    })
    .from(bookingsTable)
    .innerJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
    .innerJoin(clientsTable, eq(bookingsTable.clientId, clientsTable.id))
    .where(eq(bookingsTable.providerId, provider.id))
    .orderBy(desc(bookingsTable.appointmentAt));

  res.json(bookings);
});

// Auth required: get client's bookings — MUST be before /:id
router.get("/client", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.userId, user[0].id)).limit(1);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  const bookings = await db
    .select({
      booking: bookingsTable,
      service: servicesTable,
      provider: providersTable,
    })
    .from(bookingsTable)
    .innerJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
    .innerJoin(providersTable, eq(bookingsTable.providerId, providersTable.id))
    .where(eq(bookingsTable.clientId, client.id))
    .orderBy(desc(bookingsTable.appointmentAt));

  res.json(bookings);
});

// Auth required: create a booking (client)
router.post("/", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.userId, user[0].id)).limit(1);
  if (!client) { res.status(404).json({ error: "Client profile not found" }); return; }

  const { providerId, serviceId, appointmentAt, inspoPhotoUrl, notes } = req.body as Record<string, string>;
  if (!providerId || !serviceId || !appointmentAt) {
    res.status(400).json({ error: "providerId, serviceId, and appointmentAt are required" });
    return;
  }

  const [booking] = await db.insert(bookingsTable).values({
    providerId,
    clientId: client.id,
    serviceId,
    appointmentAt: new Date(appointmentAt),
    inspoPhotoUrl: inspoPhotoUrl ?? null,
    notes: notes ?? null,
  }).returning();

  // Best-effort SMS notification to provider
  try {
    const [providerUser] = await db
      .select({ phone: usersTable.phone, displayName: providersTable.displayName })
      .from(providersTable)
      .innerJoin(usersTable, eq(providersTable.userId, usersTable.id))
      .where(eq(providersTable.id, providerId))
      .limit(1);
    const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceId)).limit(1);
    if (providerUser?.phone && service) {
      const dateStr = new Date(appointmentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      SMS.newBooking(providerUser.phone, client.displayName, service.name, dateStr).catch(() => {});
    }
  } catch { /* best-effort */ }

  res.status(201).json(booking);
});

// Auth required: cancel booking (client only, pending/confirmed bookings)
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.userId, user[0].id)).limit(1);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  const bookingId = req.params.id as string;
  const [booking] = await db.select().from(bookingsTable)
    .where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.clientId, client.id))).limit(1);
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }

  if (!["pending", "confirmed"].includes(booking.status)) {
    res.status(400).json({ error: "Only pending or confirmed bookings can be cancelled" });
    return;
  }

  const [updated] = await db.update(bookingsTable).set({ status: "cancelled" })
    .where(eq(bookingsTable.id, bookingId)).returning();
  res.json(updated);
});

// Auth required: update booking status (provider accepts/declines)
router.patch("/:id/status", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.userId)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const [provider] = await db.select().from(providersTable).where(eq(providersTable.userId, user[0].id)).limit(1);
  if (!provider) { res.status(404).json({ error: "Provider not found" }); return; }

  const bookingId = req.params.id as string;
  const [booking] = await db.select().from(bookingsTable)
    .where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.providerId, provider.id))).limit(1);
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }

  const { status } = req.body as { status: "confirmed" | "declined" | "completed" };
  if (!["confirmed", "declined", "completed"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [updated] = await db.update(bookingsTable).set({ status })
    .where(eq(bookingsTable.id, bookingId)).returning();

  // Best-effort SMS notification to client
  try {
    if (status === "confirmed" || status === "declined") {
      const [clientUser] = await db
        .select({ phone: usersTable.phone })
        .from(clientsTable)
        .innerJoin(usersTable, eq(clientsTable.userId, usersTable.id))
        .where(eq(clientsTable.id, booking.clientId))
        .limit(1);
      const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, booking.serviceId)).limit(1);
      if (clientUser?.phone && service) {
        const dateStr = new Date(booking.appointmentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        if (status === "confirmed") {
          SMS.bookingConfirmed(clientUser.phone, provider.displayName, service.name, dateStr).catch(() => {});
        } else {
          SMS.bookingDeclined(clientUser.phone, provider.displayName).catch(() => {});
        }
      }
    }
  } catch { /* best-effort */ }

  res.json(updated);
});

// Auth required: get single booking
router.get("/:id", requireAuth, async (req, res) => {
  const [booking] = await db
    .select({
      booking: bookingsTable,
      service: servicesTable,
      provider: providersTable,
    })
    .from(bookingsTable)
    .innerJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
    .innerJoin(providersTable, eq(bookingsTable.providerId, providersTable.id))
    .where(eq(bookingsTable.id, req.params.id as string))
    .limit(1);

  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(booking);
});

export default router;
