'use client'

import { motion } from 'framer-motion'
import { site } from '@/config/site'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { BookButton } from '@/components/ui/BookButton'
import { trackBookClick } from '@/lib/analytics'

export function Services() {
  return (
    <section id="services" className="relative bg-charcoal py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          kicker="Services & Pricing"
          title="Pick your service"
          intro="Every service is a full private-suite appointment — your time, your chair, no rush."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {site.services.map((s, i) => (
            <motion.a
              key={s.name}
              href={site.booking.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackBookClick(`service-${s.name}`)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative overflow-hidden rounded-2xl border p-6 transition-colors ${
                s.featured
                  ? 'border-gold/40 bg-gradient-to-br from-panel to-gold-dim/10'
                  : 'border-line bg-panel/50 hover:border-gold/40'
              }`}
            >
              {s.featured && (
                <span className="absolute right-4 top-4 rounded-full bg-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                  Most booked
                </span>
              )}
              <div className="flex items-baseline justify-between gap-4 pr-24 md:pr-0">
                <h3 className="text-lg font-semibold text-frost group-hover:text-gold">{s.name}</h3>
              </div>
              <p className="mt-2 max-w-sm text-sm text-smoke">{s.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-smoke/70">{s.duration}</span>
                {/* REPLACE: prices live at config/site.ts → services */}
                <span className="display text-3xl text-chrome-gradient">${s.price}</span>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <BookButton placement="services">Book a Service</BookButton>
        </div>
      </div>
    </section>
  )
}
