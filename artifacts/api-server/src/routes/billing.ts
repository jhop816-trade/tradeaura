import { Router } from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middlewares/auth";

const PRICE_ID = "price_1TfvkDArAboJmSGAQN1QYgTc";
const TRIAL_DAYS = 7;

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key);
}

function supabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function frontendUrl() {
  return (process.env.FRONTEND_URL || "https://tradeauraapp.com").replace(/\/$/, "");
}

// ── Public router (no auth) — webhook only ──────────────────────────────────
export const billingPublicRouter = Router();

billingPublicRouter.post("/billing/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) { res.status(500).json({ error: "Webhook secret not configured" }); return; }

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(req.body, sig!, secret);
  } catch {
    res.status(400).json({ error: "Invalid signature" }); return;
  }

  const db = supabaseAdmin();

  async function updateUserByCustomer(customerId: string, metadata: Record<string, string>) {
    const customer = await stripe().customers.retrieve(customerId) as Stripe.Customer;
    const userId = customer.metadata?.supabase_user_id;
    if (!userId) return;
    const { data: { user } } = await db.auth.admin.getUserById(userId);
    if (!user) return;
    await db.auth.admin.updateUserById(userId, {
      user_metadata: { ...user.user_metadata, ...metadata },
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await updateUserByCustomer(session.customer as string, { subscription_status: "active" });
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status === "active" ? "active"
          : sub.status === "past_due" ? "past_due"
          : sub.status === "trialing" ? "active"
          : "canceled";
        await updateUserByCustomer(sub.customer as string, { subscription_status: status });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await updateUserByCustomer(sub.customer as string, { subscription_status: "canceled" });
        break;
      }
    }
    res.json({ received: true });
  } catch {
    res.status(500).json({ error: "Webhook handling failed" });
  }
});

// ── Protected router (requires auth) ────────────────────────────────────────
export const billingRouter = Router();

billingRouter.get("/billing/status", requireAuth, async (req, res) => {
  try {
    const db = supabaseAdmin();
    const { data: { user } } = await db.auth.admin.getUserById(req.userId);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const subStatus = user.user_metadata?.subscription_status as string | undefined;

    if (subStatus === "active") { res.json({ status: "active" }); return; }
    if (subStatus === "past_due") { res.json({ status: "past_due" }); return; }

    // Check in-app trial window
    const createdAt = new Date(user.created_at);
    const trialEnd = new Date(createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();

    if (now < trialEnd) {
      const daysLeft = Math.max(1, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      res.json({ status: "trial", daysLeft }); return;
    }

    res.json({ status: "expired" });
  } catch {
    res.status(500).json({ error: "Failed to get billing status" });
  }
});

billingRouter.post("/billing/checkout", requireAuth, async (req, res) => {
  try {
    const db = supabaseAdmin();
    const { data: { user } } = await db.auth.admin.getUserById(req.userId);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    let customerId = user.user_metadata?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe().customers.create({
        email: user.email,
        metadata: { supabase_user_id: req.userId },
      });
      customerId = customer.id;
      await db.auth.admin.updateUserById(req.userId, {
        user_metadata: { ...user.user_metadata, stripe_customer_id: customerId },
      });
    }

    const session = await stripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      subscription_data: { trial_period_days: TRIAL_DAYS },
      success_url: `${frontendUrl()}/?subscribed=true`,
      cancel_url: `${frontendUrl()}/`,
    });

    res.json({ url: session.url });
  } catch {
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

billingRouter.post("/billing/portal", requireAuth, async (req, res) => {
  try {
    const db = supabaseAdmin();
    const { data: { user } } = await db.auth.admin.getUserById(req.userId);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const customerId = user.user_metadata?.stripe_customer_id as string | undefined;
    if (!customerId) { res.status(400).json({ error: "No subscription found" }); return; }

    const session = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${frontendUrl()}/`,
    });

    res.json({ url: session.url });
  } catch {
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

billingRouter.post("/billing/redeem", requireAuth, async (req, res) => {
  try {
    const { code } = req.body as { code?: string };
    if (!code) { res.status(400).json({ error: "No code provided" }); return; }

    const normalize = (s: string) => s.replace(/[\s\-_]/g, "").toLowerCase();
    const validCodes = (process.env.BETA_CODES || "").split(",").map(normalize).filter(Boolean);
    if (!validCodes.includes(normalize(code))) {
      res.status(400).json({ error: "Invalid code" }); return;
    }

    const db = supabaseAdmin();
    const { data: { user } } = await db.auth.admin.getUserById(req.userId);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    await db.auth.admin.updateUserById(req.userId, {
      user_metadata: { ...user.user_metadata, subscription_status: "active", beta_access: true },
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to redeem code" });
  }
});
