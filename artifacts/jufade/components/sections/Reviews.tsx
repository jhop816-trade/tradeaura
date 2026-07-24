'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { site, type ReviewItem } from '@/config/site'
import { SectionHeading } from '@/components/ui/SectionHeading'

function Stars() {
  return (
    <div className="flex gap-1" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className="fill-gold text-gold" />
      ))}
    </div>
  )
}

function ReviewCard({ review, index }: { review: ReviewItem; index: number }) {
  const initials = review.name
    .split(' ')
    .map((w) => w[0])
    .join('')
  return (
    <motion.blockquote
      initial={{ opacity: 0, y: 40, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="flex break-inside-avoid flex-col gap-4 rounded-2xl border border-line bg-panel/60 p-6"
    >
      <Stars />
      <p className="text-sm leading-relaxed text-frost/90">“{review.text}”</p>
      <footer className="mt-auto flex items-center gap-3">
        {review.photo ? (
          <Image src={review.photo} alt={review.name} width={36} height={36} className="rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-xs font-bold text-gold">
            {initials}
          </span>
        )}
        <div>
          <p className="text-sm font-semibold text-frost">{review.name}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-smoke">Verified client</p>
        </div>
      </footer>
    </motion.blockquote>
  )
}

export function Reviews() {
  return (
    <section id="reviews" className="relative bg-charcoal py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          kicker="Reviews"
          title="Word travels fast"
          intro="Five stars isn't the goal — it's the baseline. Real reviews from clients in the chair."
        />
        {/* Verified rating stat */}
        <div className="mb-10 flex flex-wrap items-center gap-4 border-y-2 border-gold/40 py-5">
          <span className="display text-5xl text-gold sm:text-6xl">{site.reviewStats.rating}</span>
          <Stars />
          <span className="text-sm text-smoke">
            <span className="font-semibold text-frost">{site.reviewStats.count} reviews</span> · Verified on{' '}
            {site.reviewStats.source}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {site.reviews.map((r, i) => (
            <ReviewCard key={r.name} review={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
