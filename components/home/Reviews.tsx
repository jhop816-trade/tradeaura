'use client'
import { useEffect, useState } from 'react'
import { BadgeCheck, ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import Section from '@/components/ui/Section'
import { prefersReducedMotion } from '@/lib/motion'
import type { Review } from '@/lib/types'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          aria-hidden="true"
          className={i < rating ? 'fill-amber text-amber' : 'text-white/15'}
        />
      ))}
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * One large quote at a time rather than three cramped into equal cards — the
 * words are the point, so they get the room a magazine pull-quote would.
 *
 * Auto-advances slowly and pauses entirely under reduced motion, where
 * content that changes on its own without the visitor asking is exactly the
 * kind of thing that setting is meant to suppress. The arrows and dots give
 * full manual control regardless.
 */
export default function Reviews({ reviews }: { reviews: readonly Review[] }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion() || reviews.length <= 1) return
    const id = setInterval(() => setActive(a => (a + 1) % reviews.length), 6500)
    return () => clearInterval(id)
  }, [reviews.length])

  if (reviews.length === 0) return null
  const review = reviews[active]
  if (!review) return null

  return (
    <Section
      id="reviews"
      eyebrow="Reviews"
      title="What renters say"
      intro="Placeholder entries below. Real reviews are collected after a completed rental and published once approved."
      className="bg-ink-050 border-y hairline"
    >
      <div className="relative glass p-8 sm:p-14 lg:p-20 overflow-hidden">
        <Quote
          size={140}
          strokeWidth={1}
          className="absolute -top-6 -left-4 text-amber/[0.07] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative">
          <Stars rating={review.rating} />

          <blockquote
            key={review.id}
            className="anim-rise mt-8 font-display normal-case tracking-normal text-2xl sm:text-3xl lg:text-4xl text-white leading-[1.2] max-w-3xl"
          >
            “{review.body}”
          </blockquote>

          <figcaption className="mt-10">
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-white">
                {review.author}
              </span>
              {review.verified && (
                <span className="inline-flex items-center gap-1 text-amber">
                  <BadgeCheck size={13} aria-hidden="true" />
                  <span className="text-[9px] font-bold tracking-[0.12em] uppercase">
                    Verified rental
                  </span>
                </span>
              )}
            </div>
            <p className="text-[12px] text-white/30 mt-1.5">
              {review.vehicleName} · {formatDate(review.date)}
            </p>
          </figcaption>

          {reviews.length > 1 && (
            <div className="flex items-center gap-5 mt-12 pt-8 border-t hairline">
              <button
                type="button"
                onClick={() => setActive(a => (a - 1 + reviews.length) % reviews.length)}
                aria-label="Previous review"
                className="text-white/40 hover:text-amber transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-2">
                {reviews.map((r, i) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show review ${i + 1} of ${reviews.length}`}
                    aria-current={i === active}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active ? 'w-7 bg-amber' : 'w-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActive(a => (a + 1) % reviews.length)}
                aria-label="Next review"
                className="text-white/40 hover:text-amber transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
