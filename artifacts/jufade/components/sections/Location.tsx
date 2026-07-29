import { Clock, MapPin, Phone, SquareParking } from 'lucide-react'
import { site } from '@/config/site'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'

export function Location() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.location.mapQuery)}&output=embed`

  return (
    <section id="location" className="relative bg-charcoal py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          kicker="Location & Hours"
          title="Pull up"
          intro="Easy to find, easy to park, easy to be on time."
        />
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Embedded map — address comes from config/site.ts → location.mapQuery */}
          <Reveal>
            <div className="h-80 overflow-hidden rounded-2xl border border-line grayscale-[0.4] invert-[0.02] lg:h-full">
              <iframe
                src={mapSrc}
                title={`Map to ${site.location.suiteName}`}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>

          <div className="flex flex-col gap-4">
            <Reveal delay={0.1}>
              <div className="flex gap-4 rounded-2xl border border-line bg-panel/50 p-6">
                <MapPin size={20} className="mt-1 shrink-0 text-gold" />
                <div>
                  <p className="font-semibold text-frost">{site.location.suiteName}</p>
                  <p className="mt-1 text-sm text-smoke">
                    {site.location.addressLine1}
                    <br />
                    {site.location.addressLine2}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="flex gap-4 rounded-2xl border border-line bg-panel/50 p-6">
                <Clock size={20} className="mt-1 shrink-0 text-gold" />
                <div className="w-full">
                  <p className="mb-3 font-semibold text-frost">Hours</p>
                  <dl className="space-y-1.5">
                    {site.location.hours.map((h) => (
                      <div key={h.day} className="flex justify-between gap-6 text-sm">
                        <dt className="text-smoke">{h.day}</dt>
                        <dd className={h.hours === 'Closed' ? 'text-smoke/50' : 'text-frost'}>{h.hours}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex gap-4 rounded-2xl border border-line bg-panel/50 p-6">
                <SquareParking size={20} className="mt-1 shrink-0 text-gold" />
                <div>
                  <p className="font-semibold text-frost">Parking</p>
                  <p className="mt-1 text-sm text-smoke">{site.location.parking}</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <a
                href={`tel:${site.contact.phone.replace(/\D/g, '')}`}
                className="flex items-center justify-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-5 text-sm font-bold uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-ink"
              >
                <Phone size={16} />
                Contact — {site.contact.phone}
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
