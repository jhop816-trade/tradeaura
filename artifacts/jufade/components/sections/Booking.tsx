'use client'

import { useState } from 'react'
import { AlarmClock, CalendarX2 } from 'lucide-react'
import { site } from '@/config/site'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { openBooking } from '@/lib/analytics'

const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat']
const times = ['9:00 AM', '10:30 AM', '12:00 PM', '2:15 PM', '4:30 PM', '6:00 PM']

/**
 * Mobile-first booking flow. The picker below is a quick-select that hands off
 * to the real booking platform (config/site.ts → booking.url). If your
 * platform provides an embeddable widget, set booking.embed = true and paste
 * the widget URL in booking.embedUrl — it will render in place of the picker.
 */
export function Booking() {
  const [service, setService] = useState(site.services[0].name)
  const [day, setDay] = useState(days[0])
  const [time, setTime] = useState(times[3])

  return (
    <section id="booking" className="relative mx-auto max-w-6xl px-5 py-28">
      <SectionHeading
        kicker="Booking"
        title="Lock in the chair"
        intro="Pick a service and a time that works — you'll finish the booking on my booking page in under a minute."
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
            <div className="rounded-3xl border border-line bg-panel/60 p-6 backdrop-blur sm:p-8">
              <Step label="1 · Service">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {site.services.map((s) => (
                    <Chip key={s.name} active={service === s.name} onClick={() => setService(s.name)}>
                      {s.name}
                      <span className="ml-1 text-electric">${s.price}</span>
                    </Chip>
                  ))}
                </div>
              </Step>
              <Step label="2 · Day">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {days.map((d) => (
                    <Chip key={d} active={day === d} onClick={() => setDay(d)}>
                      {d}
                    </Chip>
                  ))}
                </div>
              </Step>
              <Step label="3 · Time">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {times.map((t) => (
                    <Chip key={t} active={time === t} onClick={() => setTime(t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </Step>

              <button
                type="button"
                onClick={() => openBooking('booking-section')}
                className="glow-electric mt-8 w-full rounded-full bg-frost py-5 text-sm font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-electric hover:text-frost"
              >
                Book Now — {service} · {day} · {time}
              </button>
              <p className="mt-3 text-center text-xs text-smoke/70">
                You'll confirm the exact slot on the booking page.
              </p>
            </div>
          </Reveal>
        )}

        {/* Policies */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Reveal delay={0.1}>
            <div className="flex gap-4 rounded-2xl border border-line bg-panel/40 p-5">
              <CalendarX2 size={20} className="mt-0.5 shrink-0 text-electric" />
              <div>
                <p className="text-sm font-semibold text-frost">Cancellations</p>
                <p className="mt-1 text-sm leading-relaxed text-smoke">{site.booking.cancellationPolicy}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex gap-4 rounded-2xl border border-line bg-panel/40 p-5">
              <AlarmClock size={20} className="mt-0.5 shrink-0 text-electric" />
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
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-electric">{label}</p>
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
        active ? 'bg-frost text-ink' : 'border border-line bg-ink/40 text-smoke hover:border-electric/50 hover:text-frost'
      }`}
    >
      {children}
    </button>
  )
}
