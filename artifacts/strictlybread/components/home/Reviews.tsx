import { BadgeCheck, Star } from 'lucide-react'
import Section from '@/components/ui/Section'
import Reveal from '@/components/ui/Reveal'
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

export default function Reviews({ reviews }: { reviews: readonly Review[] }) {
  return (
    <Section
      id="reviews"
      eyebrow="Reviews"
      title="What renters say"
      intro="Placeholder entries below. Real reviews are collected after a completed rental and published once approved."
      className="bg-ink-050 border-y hairline"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reviews.map((review, i) => (
          <Reveal key={review.id} index={i} className="h-full">
            <figure className="h-full glass p-7 flex flex-col hover:border-amber/25 transition-colors">
              <Stars rating={review.rating} />
              <blockquote className="mt-5 text-[15px] text-white/70 leading-relaxed flex-1">
                {review.body}
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t hairline">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white">
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
                <p className="text-[11px] text-white/30 mt-1.5">
                  {review.vehicleName} · {formatDate(review.date)}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
