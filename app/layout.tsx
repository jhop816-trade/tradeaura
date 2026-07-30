import type { Metadata } from 'next'
import { Anton, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ConciergeLauncher from '@/components/concierge/ConciergeLauncher'
import DemoDataBanner from '@/components/ui/DemoDataBanner'
import PageLoader from '@/components/layout/PageLoader'
import { brand, isPlaceholder, socialProfiles } from '@/lib/brand'

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: `${brand.name} | Exotic & Luxury Car Rental`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  openGraph: {
    type: 'website',
    siteName: brand.name,
    title: `${brand.name} | Exotic & Luxury Car Rental`,
    description: brand.description,
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    // Phase 1 is demo content. Indexing is enabled in Phase 5 once the real
    // fleet, contact details and legal pages are in place.
    index: false,
    follow: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /** Omit fields that are still placeholders rather than publish "TODO". */
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: brand.name,
    description: brand.description,
    ...(siteUrl ? { '@id': siteUrl, url: siteUrl } : {}),
    ...(isPlaceholder(brand.contact.phoneE164) ? {} : { telephone: brand.contact.phoneE164 }),
    ...(isPlaceholder(brand.contact.email) ? {} : { email: brand.contact.email }),
    ...(isPlaceholder(brand.location.region) ? {} : { areaServed: brand.location.region }),
    ...(socialProfiles.length > 0 ? { sameAs: socialProfiles } : {}),
    priceRange: '$$$',
  }

  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="antialiased">
        <PageLoader />
        <DemoDataBanner />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-amber focus:text-black focus:px-5 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <ConciergeLauncher />
      </body>
    </html>
  )
}
