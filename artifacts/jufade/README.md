# JuFade — Premium Private Suite Barber Landing Page

Cinematic single-page site: 3D barber chair hero (React Three Fiber + Three.js),
GSAP + Framer Motion scroll experience, Lenis smooth scrolling, Tailwind CSS 4,
Next.js 15 App Router.

## Run it

```bash
pnpm install
pnpm --filter @workspace/jufade dev    # http://localhost:3004
pnpm --filter @workspace/jufade build  # production build
```

## Make it yours — everything lives in `config/site.ts`

Open **`config/site.ts`** and search for `REPLACE`. That one file controls:

| What | Where in `config/site.ts` |
| --- | --- |
| **Booking link** | `booking.url` (+ `booking.embed`/`embedUrl` for an embedded widget) |
| **Cancellation / late policies** | `booking.cancellationPolicy`, `booking.latePolicy` |
| **Prices & services** | `services` array |
| **Address, map, hours, parking** | `location.*` (map uses `location.mapQuery`) |
| **Phone / email / Instagram** | `contact.*` |
| **Bio, years, specialties** | `about.*` |
| **Portfolio photos + categories** | `portfolio` array (`src: '/images/work/…'`) |
| **Before/after photos** | `beforeAfter` |
| **Reviews** | `reviews` array |
| **Suite photos + highlights** | `suite.*` |
| **Sample time slots (hero cards)** | `sampleSlots` |
| **Google Ads / GA4 tracking** | `analytics.googleAdsId`, `analytics.conversionLabel`, `analytics.ga4Id` |
| **SEO (city, domain, title)** | `seo.*` |

Photos go in `public/images/` (`work/`, `suite/`, `reviews/`, plus
`barber.jpg`). Any photo path left as `''` renders a styled placeholder, so the
site never shows a broken image.

## Structure

```
app/            layout (SEO, fonts, JSON-LD, gtag), page, robots, sitemap
config/site.ts  ALL editable content
components/
  three/        lazy-loaded 3D scene (chair, tools, particles, suite backdrop)
  sections/     CinematicStage, About, Work, Services, Booking, Reviews, Suite, Location, FinalCta
  ui/           MagneticButton, BookButton, Reveal/TextReveal, SectionHeading
  providers/    Lenis + GSAP ScrollTrigger smooth scroll
lib/            analytics (Google Ads conversions), shared scroll state
```

## Performance & accessibility notes

- The Three.js bundle is code-split and only loads after first paint, on
  capable devices. Reduced-motion users and devices without WebGL get a static
  hero fallback automatically.
- All "Book" buttons fire a Google Ads conversion once `analytics` IDs are set.
