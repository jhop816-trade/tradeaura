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

function Tile({ item, index }: { item: PortfolioItem; index: number }) {
  const tilt = index % 2 === 0 ? '-rotate-1' : 'rotate-1'
  return (
    <motion.figure
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative mb-4 break-inside-avoid overflow-hidden border-2 border-line transition-transform duration-300 hover:z-10 hover:!rotate-0 hover:border-gold ${tilt} ${item.tall ? 'aspect-[3/4]' : 'aspect-square'}`}
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
      <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-ink/95 to-transparent p-3">
        <span className="display text-lg text-frost">{item.title}</span>
        <span className="poster-tag !text-xs opacity-0 transition-opacity group-hover:opacity-100">
          {item.category}
        </span>
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
        title="The Portfolio"
        intro="Fades, tapers, beard sculpting, designs — every photo below left the suite looking exactly like this."
      />

      {/* Filters */}
      <Reveal className="mb-10 flex flex-wrap gap-2.5">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`display -rotate-1 px-4 py-2 text-sm uppercase tracking-[0.02em] transition-all hover:-translate-y-0.5 ${
              filter === f.id
                ? 'bg-gold text-ink shadow-[3px_3px_0_#000]'
                : 'border-2 border-line text-smoke hover:border-gold hover:text-frost'
            }`}
          >
            {f.label}
          </button>
        ))}
      </Reveal>

      {/* Collage */}
      <div className="columns-2 gap-4 lg:columns-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <Tile key={item.title} item={item} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* Before / after */}
      <div className="mt-20">
        <Reveal>
          <span className="poster-tag mb-6 inline-block">Before / After — drag it</span>
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
          className="display inline-flex -rotate-1 items-center gap-3 border-2 border-gold px-7 py-4 text-lg uppercase text-gold transition-all hover:rotate-0 hover:bg-gold hover:text-ink"
        >
          <Instagram size={20} />
          {site.contact.instagramHandle}
        </a>
      </Reveal>
    </section>
  )
}
