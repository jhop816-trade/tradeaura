# StrictlyBread Rentals

Exotic and luxury car rental platform. Separate client and separate codebase
from `artifacts/car-rentals` (38 Exotics) — the two share nothing.

## Run

```bash
pnpm --filter @workspace/strictlybread run dev        # http://localhost:3003
pnpm --filter @workspace/strictlybread run typecheck
pnpm --filter @workspace/strictlybread run build
```

## Status: Phase 1 (frontend only)

What exists: design system, homepage, navigation, cinematic hero, fleet
preview and listing, vehicle detail pages, reviews, how-it-works, trust
section, concierge interface, footer, mobile layout.

**Nothing is connected to a backend.** There is no database, no payment
processing, no AI concierge, no document storage and no email. The UI states
this rather than implying otherwise:

- `components/ui/DemoDataBanner.tsx` — site-wide notice, driven by
  `IS_DEMO_DATA` in `lib/demo-data.ts`.
- `components/concierge/ConciergePanel.tsx` — labels its transcript a preview
  and shows a "not connected yet" input state.
- `app/booking/page.tsx` — deliberately collects nothing.

Set `IS_DEMO_DATA` to `false` only once real inventory is actually served.

## Where things live

| Path | Purpose |
| --- | --- |
| `lib/brand.ts` | Single source of truth for name, contact details, colours |
| `lib/types.ts` | Domain types, shaped to match the Phase 2 database schema |
| `lib/demo-data.ts` | Fictional placeholder fleet and reviews |
| `app/globals.css` | Design tokens, entrance animations, reduced-motion rules |
| `components/ui/` | Reusable primitives (`Section`, `Reveal`, `VehicleCard`) |
| `components/home/` | Homepage sections |
| `components/concierge/` | Concierge launcher and panel |

## Architecture decisions

- **Brand strings are centralised.** Every name, phone number and handle comes
  from `lib/brand.ts`. Contact fields are placeholders (`TODO`); `isPlaceholder`
  gates the UI so the footer, schema.org output and concierge render a
  "to be confirmed" state instead of a link that goes nowhere.
- **Entrance animation is CSS, not JS.** A JavaScript `prefers-reduced-motion`
  branch renders different markup on the server than the client and breaks
  hydration. CSS animations plus the `@media (prefers-reduced-motion)` block in
  `globals.css` keep server and client output identical. Framer Motion is used
  only for interaction-driven UI (mobile menu, concierge panel) where there is
  no server render to match.
- **`Reveal` degrades safely.** Content is visible in the server HTML and
  hidden in a layout effect before first paint, so it reads fine with
  JavaScript disabled and never flashes.
- **Sections take data as props.** Pages pass `demoFleet` / `demoReviews` in;
  swapping to database queries in Phase 2 changes the page files only.
- **The hero has no fake car.** It is lighting on an empty stage, with the
  media slot positioned and sized for the client's cutout photography or a
  Three.js scene. A CSS-drawn silhouette read as an unidentified dark shape.
- **Fog canvas is cost-controlled.** Renders at 0.35× and is upscaled by CSS
  blur, stops when off-screen or the tab is hidden, and never starts under
  reduced motion.
- **`robots` is set to `noindex`.** Phase 1 is demo content; indexing is
  enabled in Phase 5 alongside the real fleet and legal pages.

## Before launch

- Replace the placeholder contact details in `lib/brand.ts`.
- Supply real vehicle photography — cards and detail pages already reserve the
  space and label it.
- Have the rental terms reviewed by the client's legal counsel. No legal copy
  has been written; the footer says so.
- Confirm the real fleet. The demo list is fictional and must not go live.

## Assets

The logo was extracted from a supplied phone screenshot of an Instagram
profile, cropped to the 869×869 avatar disc and masked to a circle. It is
therefore a **raster image of limited resolution** — good enough for the
current sizes, not for print or large hero use. Request the original vector or
high-resolution export from the client's designer.
