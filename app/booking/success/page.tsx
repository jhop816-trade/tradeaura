'use client'
import { useEffect } from 'react'
import Link from 'next/link'

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

export default function SuccessPage() {
  useEffect(() => {
    window.gtag?.('event', 'conversion', {
      event_category: 'booking',
      event_label: 'deposit_paid',
      value: 1,
    })
  }, [])

  return (
    <div className="bg-black min-h-screen pt-[76px] flex items-center justify-center px-8">
      <div className="max-w-lg w-full text-center py-24">
        <div className="w-16 h-16 bg-[#D4A853]/10 border border-[#D4A853]/30 flex items-center justify-center mx-auto mb-8">
          <span className="text-[#D4A853] text-2xl">✓</span>
        </div>
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-4">Confirmed</p>
        <h1 className="font-playfair font-black text-5xl text-white mb-6">You're booked.</h1>
        <p className="text-white/50 text-[15px] leading-relaxed mb-12">
          Your deposit has been received and your booking is confirmed. Check your email for a confirmation — I'll reach out shortly to finalize pickup details.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="bg-[#D4A853] text-black px-8 py-4 text-[11px] font-bold tracking-[0.14em] uppercase hover:bg-[#e8c278] transition-colors">Back to Home</Link>
          <Link href="/contact" className="border border-white/20 text-white px-8 py-4 text-[11px] font-medium tracking-[0.12em] uppercase hover:border-[#D4A853] hover:text-[#D4A853] transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  )
}
