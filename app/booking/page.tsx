import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarRange } from 'lucide-react'
import Section from '@/components/ui/Section'

export const metadata: Metadata = {
  title: 'Reserve',
  description: 'Online reservations open once the booking and payment systems are connected.',
}

/**
 * Deliberately not a form. Collecting driver details or payment information
 * before the backend exists would imply a reservation that cannot be honoured.
 */
export default function BookingPage() {
  return (
    <div className="pt-[74px]">
      <Section eyebrow="Reserve" title="Online booking opens soon">
        <div className="glass p-8 sm:p-12 max-w-2xl">
          <CalendarRange size={22} className="text-amber mb-5" aria-hidden="true" />
          <p className="text-white/60 text-[15px] leading-relaxed">
            The reservation flow — date selection, driver details, document upload,
            the rental agreement and payment — is built in the next phases. It is
            not collecting information yet.
          </p>
          <p className="text-white/40 text-[14px] leading-relaxed mt-4">
            Until then, browse the collection and note the vehicle you have in
            mind. Contact details will be published here before launch.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/fleet"
              className="bg-amber text-black px-8 py-3.5 text-[11px] font-bold tracking-[0.16em] uppercase hover:bg-amber-bright transition-colors"
            >
              View the fleet
            </Link>
            <button
              type="button"
              data-concierge-open
              className="border hairline text-white px-8 py-3.5 text-[11px] font-bold tracking-[0.16em] uppercase hover:border-amber/50 hover:text-amber transition-colors"
            >
              Ask the concierge
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}
