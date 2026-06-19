# Local Business Starter Template

A production-ready Next.js 15 website for local businesses — restaurants, salons, dental offices, contractors, and more. Built as a portfolio/template piece using "Sunset Dental" as the placeholder.

**Includes:**
- 4-page responsive website (Home, Services, About, Contact)
- Booking/contact form that writes leads to Supabase
- AI chatbot (Claude) that answers FAQs and captures leads
- Single config file — swap `business.json` per client

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Styling | Tailwind CSS v3 |
| Database | Supabase (leads table) |
| AI Chatbot | Anthropic Claude (claude-haiku) |
| Deploy | Vercel |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase + Anthropic keys

# 3. Set up the database
# Run supabase_setup.sql in Supabase Dashboard → SQL Editor

# 4. Start the dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

---

## Customizing for a New Client (< 30 minutes)

**Step 1 — Edit `config/business.json`**

This is the single source of truth. Update:
- `name`, `tagline`, `phone`, `email`, `address`
- `hours` — days/times the business is open
- `services` — list of services with name, description, price
- `faqs` — common questions the chatbot should answer
- `about` — paragraph about the business history
- `team` — team member names, roles, bios
- `brand.accentColor` — the primary brand color (hex)

That's it. All pages, the chatbot system prompt, and brand colors update automatically.

**Step 2 — Swap the logo**

Replace `public/logo.svg` (or add a `public/logo.png`) and update the Navbar component to use an `<Image>` tag.

**Step 3 — Set up a new Supabase project**

1. Create a new Supabase project for the client
2. Run `supabase_setup.sql` in the SQL editor
3. Copy the project URL and anon key into a new `.env.local`

**Step 4 — Deploy to Vercel**

```bash
vercel --prod
# Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY
# in Vercel project settings → Environment Variables
```

---

## Viewing Leads

Go to **Supabase Dashboard → Table Editor → leads** to see all form submissions and chatbot-captured contacts.

Fields: `name`, `phone`, `email`, `message`, `requested_date`, `source` (form/chat), `created_at`.

---

## Chatbot Notes

The chatbot system prompt is in `app/api/chat/route.ts` inside `buildSystemPrompt()`. It reads from `business.json` automatically. Edit the instructions section at the bottom of that function to customize behavior per client (e.g., change lead capture wording, add specific policies, restrict topics).

Model: `claude-haiku-4-5-20251001` — fast and affordable for FAQ/lead capture use cases.
