import type { Metadata, Viewport } from 'next'
import { Anton, Inter } from 'next/font/google'
import { site } from '@/config/site'
import { Analytics } from '@/components/Analytics'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

const display = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.seo.url),
  title: {
    default: site.seo.title,
    template: `%s | ${site.name}`,
  },
  description: site.seo.description,
  keywords: [
    `barber ${site.seo.city}`,
    `fade ${site.seo.city}`,
    'private suite barber',
    'skin fade',
    'taper',
    'beard sculpting',
    site.name,
  ],
  openGraph: {
    title: site.seo.title,
    description: site.seo.description,
    url: site.seo.url,
    siteName: site.name,
    type: 'website',
    locale: 'en_US',
    // Preview card shown when the link is texted or dropped in an IG bio.
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: `${site.name} — private barber suite` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.seo.title,
    description: site.seo.description,
    images: ['/og.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: site.seo.url },
}

export const viewport: Viewport = {
  themeColor: '#06070a',
  width: 'device-width',
  initialScale: 1,
}

/** Converts "10:00 AM" → "10:00" / "8:00 PM" → "20:00" for schema.org. */
function to24h(label: string): string {
  const m = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return label.trim()
  let hour = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') hour += 12
  return `${String(hour).padStart(2, '0')}:${m[2]}`
}

/**
 * LocalBusiness structured data. This is what lets Google show JuFade as a
 * local barber with the ★5.0 rating and hours directly in search results.
 */
function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': `${site.seo.url}/#business`,
    name: site.name,
    alternateName: 'JuFadedd',
    description: site.seo.description,
    url: site.seo.url,
    telephone: site.contact.phone,
    ...(site.contact.email ? { email: site.contact.email } : {}),
    image: `${site.seo.url}/images/suite/suite-01.jpg`,
    logo: `${site.seo.url}/images/logo.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.location.addressLine1,
      addressLocality: site.seo.city,
      addressRegion: site.seo.region,
      postalCode: site.location.addressLine2.split(' ').pop(),
      addressCountry: 'US',
    },
    areaServed: [site.seo.city, 'Broward County', 'Fort Lauderdale', 'Deerfield Beach'],
    sameAs: [site.contact.instagram, site.booking.url],
    priceRange: '$$',
    currenciesAccepted: 'USD',
    // Verified aggregate from Booksy — keep in sync with config → reviewStats.
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: site.reviewStats.rating,
      reviewCount: site.reviewStats.count,
      bestRating: '5',
      worstRating: '1',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Barber Services',
      itemListElement: site.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, description: s.description },
        price: s.price,
        priceCurrency: 'USD',
      })),
    },
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: site.booking.url,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      result: { '@type': 'Reservation', name: 'Book an appointment' },
    },
    openingHoursSpecification: site.location.hours
      .filter((h) => h.hours !== 'Closed')
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${h.day}`,
        opens: to24h(h.hours.split('–')[0] ?? ''),
        closes: to24h(h.hours.split('–')[1] ?? ''),
      })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="grain bg-ink text-frost">
        {/* Theme stays switchable via DEFAULT_THEME_ID in config/themes.ts.
            The floating picker (components/ui/ThemeSwitcher) is intentionally not
            mounted — it's a preview tool, not something clients should see. */}
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
        <Analytics />
        <JsonLd />
      </body>
    </html>
  )
}
