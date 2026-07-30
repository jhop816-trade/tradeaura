'use client'

import { motion } from 'framer-motion'
import { Moon } from 'lucide-react'
import { site } from '@/config/site'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { BookSticker } from '@/components/ui/Sticker'
import { trackBookClick } from '@/lib/analytics'

export function Services() {
  return (
    <section id="services" className="relative bg-charcoal py-28">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeading
          kicker="Services & Pricing"
          title="The Menu"
          intro="Every service is a full private-suite appointment — your time, your chair, no rush."
        />

        {/* Flyer menu */}
        <div className="flyer-bg rounded-lg border-2 border-gold p-4 sm:p-8">
          {site.services.map((s, i) => (
            <motion.a
              key={s.name}
              href={site.booking.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackBookClick(`service-${s.name}`)}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`group flex items-center justify-between gap-4 py-5 ${
                i < site.services.length - 1 ? 'border-b-2 border-dashed border-line' : ''
              }`}
            >
              <div>
                <h3 className="display text-3xl text-frost transition-colors group-hover:text-gold sm:text-4xl">
                  {s.name}
                </h3>
                <p className="mt-1 text-sm text-smoke">
                  {s.duration ? `${s.duration} · ` : ''}
                  {s.description}
                </p>
              </div>
              {/* REPLACE: prices live at config/site.ts → services */}
              <span className="price-tag shrink-0 text-2xl sm:text-3xl">${s.price}</span>
            </motion.a>
          ))}
        </div>

        {/* After-hours up-charge */}
        <div className="mt-8 rounded-lg border-2 border-dashed border-gold/50 bg-charcoal p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-gold">
            <Moon size={16} />
            <span className="display text-xl sm:text-2xl">After Hours</span>
            <span className="text-xs uppercase tracking-[0.2em] text-smoke">— {site.afterHours.note}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {site.afterHours.services.map((s) => (
              <div key={s.name} className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-frost">{s.name}</span>
                <span className="price-tag text-sm">${s.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <BookSticker placement="services" size="lg">
            Book a Service
          </BookSticker>
        </div>
      </div>
    </section>
  )
}
