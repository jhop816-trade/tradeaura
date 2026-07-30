import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Gauge, Timer, Users, Cog, Route, ShieldCheck } from 'lucide-react'
import Section from '@/components/ui/Section'
import Reveal from '@/components/ui/Reveal'
import StaggerGrid from '@/components/ui/StaggerGrid'
import VehicleCard from '@/components/ui/VehicleCard'
import { demoFleet } from '@/lib/demo-data'
import { AVAILABILITY_LABELS, type Vehicle } from '@/lib/types'

/**
 * Phase 1 detail page. The gallery, live availability calendar, per-vehicle
 * reviews and FAQ arrive in Phase 2 — the layout already reserves their space
 * so adding them does not reflow the page.
 */

function findVehicle(slug: string): Vehicle | undefined {
  return demoFleet.find(v => v.slug === slug)
}

export function generateStaticParams() {
  return demoFleet.map(v => ({ slug: v.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const vehicle = findVehicle(slug)
  if (!vehicle) return {}
  return {
    title: `${vehicle.make} ${vehicle.model}`,
    description: vehicle.description,
  }
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const vehicle = findVehicle(slug)
  if (!vehicle) notFound()

  const related = demoFleet.filter(v => v.slug !== vehicle.slug).slice(0, 3)
  const bookable = vehicle.availability === 'available'

  const specs = [
    { icon: Gauge, value: `${vehicle.specs.horsepower}`, label: 'Horsepower' },
    { icon: Timer, value: `${vehicle.specs.zeroToSixty}s`, label: '0–60 mph' },
    { icon: Users, value: `${vehicle.specs.seats}`, label: 'Seats' },
    { icon: Cog, value: vehicle.specs.transmission, label: 'Transmission' },
    { icon: Route, value: `${vehicle.specs.milesPerDay} mi`, label: 'Miles per day' },
    { icon: ShieldCheck, value: `$${vehicle.depositAmount.toLocaleString()}`, label: 'Deposit' },
  ]

  return (
    <div className="pt-[74px]">
      <Section>
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-white/30">
            <li>
              <Link href="/fleet" className="hover:text-amber transition-colors">
                Fleet
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-white/60">
              {vehicle.make} {vehicle.model}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Gallery slot — sized now so client photography drops straight in. */}
          <Reveal>
            <div className="plate relative aspect-[4/3] glass overflow-hidden flex flex-col items-center justify-center gap-3">
              <span className="font-display text-5xl text-white/10">{vehicle.make}</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/20">
                Photography to be supplied
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="plate aspect-square glass" aria-hidden="true" style={{ animationDelay: `${i * 400}ms` }} />
              ))}
            </div>
          </Reveal>

          <Reveal index={1}>
            <p className="eyebrow mb-3">{vehicle.category}</p>
            <h1 className="font-display text-display-lg text-white">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-white/35 mt-2">{vehicle.year}</p>

            <p className="text-white/55 text-[15px] leading-relaxed mt-6">{vehicle.description}</p>

            <div className="flex items-baseline gap-3 mt-8 pt-8 border-t hairline">
              <span className="text-numeral text-5xl text-white">
                ${vehicle.dailyRate.toLocaleString()}
              </span>
              <span className="text-[11px] tracking-[0.14em] uppercase text-white/35">Per day</span>
            </div>

            <dl className="grid grid-cols-3 gap-5 mt-8">
              {specs.map(s => (
                <div key={s.label} className="flex flex-col gap-1.5">
                  <s.icon size={15} className="text-amber/70" aria-hidden="true" />
                  <dd className="text-numeral text-xl text-white leading-none">{s.value}</dd>
                  <dt className="text-[9px] tracking-[0.12em] uppercase text-white/30 mt-1">{s.label}</dt>
                </div>
              ))}
            </dl>

            <div className="glass p-4 mt-8 flex items-center gap-3">
              <span className="text-[11px] tracking-[0.14em] uppercase text-white/40">Status</span>
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-white">
                {AVAILABILITY_LABELS[vehicle.availability]}
              </span>
              <span className="ml-auto text-[11px] text-white/25">
                Live availability arrives in Phase 2
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              {bookable ? (
                <Link
                  href={`/booking?vehicle=${vehicle.slug}`}
                  className="flex-1 text-center bg-amber text-black px-8 py-4 text-[11px] font-bold tracking-[0.16em] uppercase hover:bg-amber-bright transition-colors"
                >
                  Reserve This Vehicle
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="flex-1 text-center bg-white/5 text-white/30 px-8 py-4 text-[11px] font-bold tracking-[0.16em] uppercase cursor-not-allowed"
                >
                  {AVAILABILITY_LABELS[vehicle.availability]}
                </span>
              )}
              <button
                type="button"
                data-concierge-open
                className="flex-1 border hairline text-white px-8 py-4 text-[11px] font-bold tracking-[0.16em] uppercase hover:border-amber/50 hover:text-amber transition-colors"
              >
                Chat With Concierge
              </button>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section
        eyebrow="Also Available"
        title="You might also consider"
        className="bg-ink-050 border-t hairline"
      >
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {related.map(v => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </StaggerGrid>
      </Section>
    </div>
  )
}
