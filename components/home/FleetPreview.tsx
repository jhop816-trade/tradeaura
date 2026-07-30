'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ArrowRight, Gauge, Timer, Route } from 'lucide-react'
import Section from '@/components/ui/Section'
import StaggerGrid from '@/components/ui/StaggerGrid'
import VehicleCard from '@/components/ui/VehicleCard'
import { AVAILABILITY_LABELS, type Vehicle } from '@/lib/types'
import { prefersReducedMotion } from '@/lib/motion'

/**
 * The fleet as a scene, not a grid.
 *
 * The first vehicle gets a full-bleed spotlight — image dominant, specs as
 * large graphic numerals rather than a small stat block — and the rest
 * follow in the standard card grid via `StaggerGrid`, arriving together as
 * the group crosses into view instead of firing all at once. Both are
 * skipped entirely under reduced motion, in which case everything is simply
 * present from the first paint (no hidden-then-revealed state to get stuck
 * in).
 */
export default function FleetPreview({ vehicles }: { vehicles: readonly Vehicle[] }) {
  const [featured, ...rest] = vehicles
  const spotlightRef = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !spotlightRef.current) return
      gsap.from(spotlightRef.current, {
        opacity: 0,
        scale: 0.97,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: spotlightRef.current, start: 'top 80%' },
      })
    },
    { scope: spotlightRef }
  )

  if (!featured) return null

  const spotlightStats = [
    { icon: Gauge, value: `${featured.specs.horsepower}`, label: 'Horsepower' },
    { icon: Timer, value: `${featured.specs.zeroToSixty}s`, label: '0–60 mph' },
    { icon: Route, value: `${featured.specs.milesPerDay}`, label: 'Miles / day' },
  ]

  return (
    <Section
      id="fleet"
      eyebrow="The Collection"
      title="A fleet worth the occasion"
      intro="Each vehicle is inspected, detailed and delivered ready. Availability updates in real time once the booking system is connected."
      className="sheen bg-ink-050 border-y hairline"
    >
      <div>
        {/* Spotlight — full-bleed breakout from the section's own max-width,
            the one deliberately edge-to-edge moment in this scene. */}
        <div className="relative left-1/2 -ml-[50vw] w-screen mb-16 lg:mb-20">
          <div
            ref={spotlightRef}
            className="grid grid-cols-1 lg:grid-cols-2 border-y hairline"
          >
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[520px] overflow-hidden">
              {featured.photos[0] ? (
                <Image
                  src={featured.photos[0]}
                  alt={`${featured.year} ${featured.make} ${featured.model}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="plate absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="font-display text-5xl text-white/10">{featured.make}</span>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/20">
                    Photography to be supplied
                  </span>
                </div>
              )}
              <div className="absolute top-5 left-5 flex items-center gap-2 glass px-3 py-2">
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/80">
                  {AVAILABILITY_LABELS[featured.availability]}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-ink-100/60">
              <p className="eyebrow mb-4">Featured Vehicle</p>
              <h3 className="font-display text-display-lg text-white mb-4">
                {featured.make} {featured.model}
              </h3>
              <p className="text-white/50 text-[15px] leading-relaxed max-w-md mb-8">
                {featured.description}
              </p>

              <div className="grid grid-cols-3 gap-6 mb-10 pb-10 border-b hairline">
                {spotlightStats.map(stat => (
                  <div key={stat.label}>
                    <stat.icon size={16} className="text-amber/70 mb-2" aria-hidden="true" />
                    <p className="text-numeral text-3xl sm:text-4xl text-white">{stat.value}</p>
                    <p className="text-[9px] tracking-[0.12em] uppercase text-white/30 mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-numeral text-5xl text-amber">
                  ${featured.dailyRate.toLocaleString()}
                </span>
                <span className="text-[11px] tracking-[0.14em] uppercase text-white/35">Per day</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/booking?vehicle=${featured.slug}`}
                  className="group inline-flex items-center justify-center gap-2 bg-amber text-black px-8 py-4 text-[11px] font-bold tracking-[0.16em] uppercase hover:bg-amber-bright transition-colors"
                >
                  Reserve This Vehicle
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={`/fleet/${featured.slug}`}
                  className="inline-flex items-center justify-center border hairline text-white px-8 py-4 text-[11px] font-bold tracking-[0.16em] uppercase hover:border-amber/50 hover:text-amber transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* The rest of the fleet, staggered in as it crosses into view. */}
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rest.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </StaggerGrid>

        <div className="mt-14 flex justify-center">
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2 border hairline text-white px-10 py-4 text-[11px] font-bold tracking-[0.16em] uppercase hover:border-amber/50 hover:text-amber transition-colors"
          >
            Browse the full fleet
          </Link>
        </div>
      </div>
    </Section>
  )
}
