import type { Metadata } from 'next'
import './globals.css'
import { business } from '@/lib/business'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'

export const metadata: Metadata = {
  title: business.name,
  description: business.tagline,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { accentColor, accentColorDark, accentColorLight } = business.brand
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --accent: ${accentColor};
            --accent-dark: ${accentColorDark};
            --accent-light: ${accentColorLight};
          }
        `}</style>
      </head>
      <body className="bg-white text-gray-900 font-sans">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  )
}
