'use client'

import { useState } from 'react'
import { AlarmClock, CalendarX2 } from 'lucide-react'
import { site } from '@/config/site'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { openBooking } from '@/lib/analytics'

/**
 * Mobile-first booking hand-off. Pick a service here, then finish on Booksy
 * where the real calendar and payment live (config/site.ts → booking.url).
 *
 * Deliberately does NOT show day/time chips: this page has no access to the
 * Booksy calendar, so any times rendered here would be invented — and a client
 * who picks "2:15 PM" only to find it was never available loses trust instantly.
 */
export function Booking() {
  const [service, setService] = useState(site.services[0].name)
  const selected = site.services.find((s) => s.name === service) ?? site.services[0]

  return (
    <section id="booking" className="relative mx-auto max-w-6xl px-5 py-28">
      <SectionHeading
        kicker="Booking"
        title="Lock in the chair"
        intro="Pick your service, then grab a live time on Booksy — takes under a minute."
        align="center"
      />

      <div className="mx-auto max-w-2xl">
        {site.booking.embed && site.booking.embedUrl ? (
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-line">
              <iframe
                src={site.booking.embedUrl}
                title="Book an appointment with JuFade"
                className="h-[720px] w-full bg-panel"
                loading="lazy"
              />
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="rounded-3xl border-2 border-line bg-panel/60 p-6 backdrop-blur sm:p-8">
              <Step label="Choose your service">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {site.services.map((s) => (
                    <Chip key={s.name} active={service === s.name} onClick={() => setService(s.name)}>
                      {s.name}
                      <span className="ml-1 text-gold">${s.price}</span>
                    </Chip>
                  ))}
                </div>
              </Step>

              <div className="mt-6 flex items-baseline justify-between border-t-2 border-dashed border-line pt-5">
                <div>
                  <p className="display text-2xl text-frost">{selected.name}</p>
                  <p className="text-sm text-smoke">{selected.duration ?? selected.description}</p>
                </div>
                <span className="price-tag text-2xl">${selected.price}</span>
              </div>

              <button
                type="button"
                onClick={() => openBooking('booking-section')}
                className="display glow-gold mt-6 w-full bg-gold py-5 text-xl uppercase tracking-[0.03em] text-ink shadow-[4px_4px_0_#000] transition-colors hover:bg-frost"
              >
                See Live Times & Book
              </button>
              <p className="mt-3 text-center text-xs text-smoke/70">
                Opens Booksy — pick your day and time there, and pay if a deposit is required.
              </p>
            </div>
          </Reveal>
        )}

        {/* Policies */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Reveal delay={0.1}>
            <div className="flex gap-4 rounded-2xl border border-line bg-panel/40 p-5">
              <CalendarX2 size={20} className="mt-0.5 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-semibold text-frost">Cancellations</p>
                <p className="mt-1 text-sm leading-relaxed text-smoke">{site.booking.cancellationPolicy}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex gap-4 rounded-2xl border border-line bg-panel/40 p-5">
              <AlarmClock size={20} className="mt-0.5 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-semibold text-frost">Running late?</p>
                <p className="mt-1 text-sm leading-relaxed text-smoke">{site.booking.latePolicy}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Step({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold">{label}</p>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-3 text-xs font-medium transition-colors ${
        active ? 'bg-frost text-ink' : 'border border-line bg-ink/40 text-smoke hover:border-gold/50 hover:text-frost'
      }`}
    >
      {children}
    </button>
  )
}
