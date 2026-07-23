import type { Metadata, Viewport } from 'next'
import { Archivo_Black, Inter } from 'next/font/google'
import { site } from '@/config/site'
import { Analytics } from '@/components/Analytics'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import './globals.css'

const display = Archivo_Black({
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
  },
  twitter: {
    card: 'summary_large_image',
    title: site.seo.title,
    description: site.seo.description,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#06070a',
  width: 'device-width',
  initialScale: 1,
}

/** LocalBusiness structured data so Google shows JuFade as a local barber. */
function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Barbershop',
    name: site.name,
    description: site.seo.description,
    url: site.seo.url,
    telephone: site.contact.phone,
    email: site.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.location.addressLine1,
      addressLocality: site.seo.city,
      addressRegion: site.seo.region,
    },
    sameAs: [site.contact.instagram],
    priceRange: '$$',
    openingHoursSpecification: site.location.hours
      .filter((h) => h.hours !== 'Closed')
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.day,
        opens: h.hours.split('–')[0]?.trim(),
        closes: h.hours.split('–')[1]?.trim(),
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
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <ThemeSwitcher />
        </ThemeProvider>
        <Analytics />
        <JsonLd />
      </body>
    </html>
  )
}
