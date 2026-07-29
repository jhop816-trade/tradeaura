# 38 Exotics

Private car rental site for South Florida — owner-operated, direct booking, no
platform fees. Next.js 15, Supabase, Stripe, Resend.

## Run

```bash
pnpm install
pnpm dev          # http://localhost:3002
pnpm typecheck
pnpm build
```

Requires Node 20+ and pnpm 10. Copy `.env.example` to `.env.local` and fill in
the values before the site will load vehicles or take a booking.

## Database

Run `supabase_setup.sql` in the Supabase Dashboard → SQL Editor. It creates
`vehicles`, `bookings`, `inquiries` and `vehicle_blackouts`, applies row-level
security, adds the availability indexes, and seeds the two vehicles.

Row-level security is deliberately strict: anonymous visitors may insert
bookings and inquiries but never read them, and may only read vehicles that are
`active`. Everything else goes through the service role, server-side.

## The fleet

Two personally owned vehicles — a 2026 Tesla Model Y and a 2020 Mercedes-Benz
CLA 35 AMG. The site's positioning is that you deal with the owner directly, so
there is intentionally no chatbot and no support-ticket layer.

## Availability

`lib/availability.ts` is the single source of truth for whether a vehicle is
free on a given range. A vehicle is blocked by:

- confirmed bookings
- pending bookings still inside their 30-minute checkout hold
- owner blackout dates set from the admin dashboard

Every surface reads from it — the fleet date search, the vehicle page calendar,
the booking form, and the checkout conflict guard — so they cannot disagree.

Dates are stored as Postgres `date` and compared as `YYYY-MM-DD` strings, which
avoids timezone drift entirely. Overlap is `aStart <= bEnd && bStart <= aEnd`.

## Admin

`/admin` is password-gated by `ADMIN_PASSWORD` and holds:

- **Bookings** — approve, decline, complete
- **Vehicles** — create, edit, retire, manage photos and pricing
- **Blocked dates** — block a range; blocking over a confirmed booking returns
  a 409 naming the clash instead of silently double-committing the car

Retiring a vehicle sets `active = false` rather than deleting it, because
bookings hold a foreign key to it and rental history has to survive.

## Payments

Stripe Checkout captures the full rental total plus the refundable security
deposit up front. No card details touch this application. The webhook at
`app/api/webhooks/stripe` confirms the booking server-side.

## Before further launch work

The booking page states deposits are refundable if cancelled 48+ hours ahead.
Since checkout now captures the full rental amount, that wording should be
reviewed to say what happens to the rental charge too. That is a business and
legal decision, not a code change.
