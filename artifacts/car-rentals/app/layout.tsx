import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Playfair_Display } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Script from 'next/script'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
  weight: ['400', '600', '700', '900'],
})

export const metadata: Metadata = {
  title: {
    default: '38 Exotics | Private Car Rentals — South Florida',
    template: '%s | 38 Exotics',
  },
  description: 'Rent a Tesla Model Y or Mercedes CLA 35 AMG in South Florida. Private owner rental — no Turo fees, no agency, no nonsense. Book online.',
  openGraph: {
    type: 'website',
    siteName: '38 Exotics',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: '38 Exotics',
    description: 'Private car rental in South Florida — 2026 Tesla Model Y and 2020 Mercedes-Benz CLA 35 AMG.',
    '@id': process.env.NEXT_PUBLIC_SITE_URL,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    telephone: '+19546543485',
    sameAs: ['https://www.instagram.com/38exotics_'],
    areaServed: 'South Florida',
    priceRange: '$$',
    serviceType: 'Car Rental',
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className={`${geist.variable} ${playfair.variable} bg-black text-white antialiased`}>
        {ga4Id && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}');
            `}</Script>
          </>
        )}
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
