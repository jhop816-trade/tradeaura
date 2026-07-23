'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Instagram, Scissors } from 'lucide-react'
import { site, type PortfolioItem } from '@/config/site'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { BeforeAfterSlider } from './BeforeAfterSlider'

const filters = [
  { id: 'all', label: 'All' },
  { id: 'fades', label: 'Fades' },
  { id: 'tapers', label: 'Tapers' },
  { id: 'beard', label: 'Beard Work' },
  { id: 'designs', label: 'Designs' },
  { id: 'kids', label: 'Kids’ Cuts' },
] as const

type FilterId = (typeof filters)[number]['id']

function Tile({ item }: { item: PortfolioItem }) {
  return (
    <motion.figure
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-xl border border-line ${item.tall ? 'aspect-[3/4]' : 'aspect-square'}`}
    >
      {item.src ? (
        <Image
          src={item.src}
          alt={item.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <div className="photo-placeholder absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
          <div className="flex h-full items-center justify-center">
            <Scissors size={22} className="text-smoke/30" />
          </div>
        </div>
      )}
      {/* Hover overlay */}
      <figcaption className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/95 via-ink/20 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div>
          <p className="text-sm font-semibold text-frost">{item.title}</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold">{item.category}</p>
        </div>
      </figcaption>
    </motion.figure>
  )
}

export function Work() {
  const [filter, setFilter] = useState<FilterId>('all')
  const items = site.portfolio.filter((p) => filter === 'all' || p.category === filter)

  return (
    <section id="work" className="relative mx-auto max-w-6xl px-5 py-28">
      <SectionHeading
        kicker="My Work"
        title="The portfolio"
        intro="Fades, tapers, beard sculpting, designs — every photo below left the suite looking exactly like this."
      />

      {/* Filters */}
      <Reveal className="mb-10 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
              filter === f.id
                ? 'bg-frost text-ink'
                : 'border border-line bg-panel/40 text-smoke hover:border-gold/50 hover:text-frost'
            }`}
          >
            {f.label}
          </button>
        ))}
      </Reveal>

      {/* Masonry gallery */}
      <div className="columns-2 gap-4 lg:columns-3">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <Tile key={item.title} item={item} />
          ))}
        </AnimatePresence>
      </div>

      {/* Before / after */}
      <div className="mt-20">
        <Reveal>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Before / After — drag the handle
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <BeforeAfterSlider />
        </Reveal>
      </div>

      {/* Instagram */}
      <Reveal delay={0.15} className="mt-14 text-center">
        <a
          href={site.contact.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-full border border-line bg-panel/50 px-7 py-4 text-sm font-semibold text-frost transition-colors hover:border-gold/60 hover:text-gold"
        >
          <Instagram size={18} />
          Daily cuts on Instagram — {site.contact.instagramHandle}
        </a>
      </Reveal>
    </section>
  )
}
