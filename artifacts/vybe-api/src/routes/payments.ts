import { Router, type Request } from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, bookingsTable, servicesTable, usersTable } from "../db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Auth required: create a PaymentIntent for a booking
router.post("/intent", requireAuth, async (req, res) => {
  const { bookingId } = req.body as { bookingId?: string };
  if (!bookingId) { res.status(400).json({ error: "bookingId is required" }); return; }

  const [row] = await db
    .select({ booking: bookingsTable, service: servicesTable })
    .from(bookingsTable)
    .innerJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
    .where(eq(bookingsTable.id, bookingId))
    .limit(1);

  if (!row) { res.status(404).json({ error: "Booking not found" }); return; }

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: row.service.price, // price is already in cents
    currency: "usd",
    metadata: { bookingId },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

// No auth: Stripe webhook (raw body, verified by signature)
router.post("/webhook", async (req: Request, res) => {
  const sig = req.headers["stripe-signature"];
  if (!sig) { res.status(400).json({ error: "Missing stripe-signature header" }); return; }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) { res.status(500).json({ error: "STRIPE_WEBHOOK_SECRET not configured" }); return; }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    res.status(400).json({ error: message });
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const bookingId = paymentIntent.metadata?.bookingId;
    if (bookingId) {
      await db
        .update(bookingsTable)
        .set({ status: "confirmed" })
        .where(eq(bookingsTable.id, bookingId));
    }
  }

  res.json({ received: true });
});

export default router;
