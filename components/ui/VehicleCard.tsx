'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { Gauge, Timer, Users, Cog, Route } from 'lucide-react'
import { AVAILABILITY_LABELS, type Vehicle } from '@/lib/types'
import { prefersReducedMotion } from '@/lib/motion'

const MAX_TILT = 9
const MAX_DRIFT = 10

/** Availability dot + label styling per state. */
const STATUS_STYLE: Record<Vehicle['availability'], string> = {
  available: 'bg-emerald-400',
  reserved: 'bg-amber',
  rented: 'bg-orange-400',
  maintenance: 'bg-sky-400',
  unavailable: 'bg-white/25',
  pending_approval: 'bg-violet-400',
}

interface PointerState {
  tiltX: number
  tiltY: number
  driftX: number
  driftY: number
  /** Percentages — position the light-reactive sheen at the cursor. */
  glowX: number
  glowY: number
}

const REST: PointerState = { tiltX: 0, tiltY: 0, driftX: 0, driftY: 0, glowX: 50, glowY: 40 }

/**
 * The vehicle "collectible plate" — a 3D-tilting card with a cursor-driven
 * light sheen and a magnetic pull toward the pointer, replacing the old flat
 * card that just swapped a border color on `:hover`. Same data and routes
 * as before; only the presentation changed.
 */
export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const ref = useRef<HTMLElement | null>(null)
  const [pointer, setPointer] = useState<PointerState>(REST)

  const bookable = vehicle.availability === 'available'

  /**
   * One pointer sample drives three effects at once: tilt, a small magnetic
   * translate toward the cursor, and the position of the glass sheen —
   * skipped for touch (no hover to respond to) and reduced motion.
   */
  function handleMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'mouse' || prefersReducedMotion() || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setPointer({
      tiltX: -py * MAX_TILT,
      tiltY: px * MAX_TILT,
      driftX: px * MAX_DRIFT,
      driftY: py * MAX_DRIFT,
      glowX: (px + 0.5) * 100,
      glowY: (py + 0.5) * 100,
    })
  }

  const reset = () => setPointer(REST)

  const specs = [
    { icon: Gauge, value: `${vehicle.specs.horsepower} hp`, label: 'Power' },
    { icon: Timer, value: `${vehicle.specs.zeroToSixty}s`, label: '0–60' },
    { icon: Users, value: `${vehicle.specs.seats}`, label: 'Seats' },
    { icon: Cog, value: vehicle.specs.transmission, label: 'Gearbox' },
    { icon: Route, value: `${vehicle.specs.milesPerDay} mi`, label: 'Per day' },
  ]

  return (
    <article
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{
        transform: `perspective(1200px) rotateX(${pointer.tiltX}deg) rotateY(${pointer.tiltY}deg) translate3d(${pointer.driftX}px, ${pointer.driftY}px, 0)`,
        transition: 'transform 500ms cubic-bezier(0.22,1,0.36,1)',
      }}
      className="group relative glass overflow-hidden flex flex-col hover:border-amber/35 hover:shadow-[var(--shadow-lift)]"
    >
      {/* Photo — placeholder until the client's photography is supplied. */}
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-200" style={{ transform: 'translateZ(24px)' }}>
        {vehicle.photos[0] ? (
          <Image
            src={vehicle.photos[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="plate absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="font-display text-3xl text-white/10">{vehicle.make}</span>
            <span className="text-[9px] tracking-[0.2em] uppercase text-white/20">
              Photography to be supplied
            </span>
          </div>
        )}

        {/* Light-reactive sheen — follows the cursor, the "glass" surface
            the brief asked for on hover. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${pointer.glowX}% ${pointer.glowY}%, rgb(255 255 255 / 0.16), transparent 45%)`,
          }}
        />

        {/* Specimen-plate corner marks. */}
        {(['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'] as const).map(pos => (
          <span
            key={pos}
            aria-hidden="true"
            className={`absolute ${pos} w-3 h-3 border-amber/30 group-hover:border-amber/70 transition-colors duration-500`}
          />
        ))}

        <div className="absolute top-3 left-3 flex items-center gap-2 glass px-2.5 py-1.5">
          <span
            aria-hidden="true"
            className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[vehicle.availability]}`}
          />
          <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/80">
            {AVAILABILITY_LABELS[vehicle.availability]}
          </span>
        </div>

        {vehicle.instantBooking && (
          <span className="absolute top-3 right-3 bg-amber text-black px-2.5 py-1.5 text-[9px] font-bold tracking-[0.14em] uppercase">
            Instant
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6" style={{ transform: 'translateZ(10px)' }}>
        <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-amber mb-2">
          {vehicle.category}
        </p>
        <h3 className="font-display text-2xl text-white">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-white/35 text-[13px] mt-1">{vehicle.year}</p>

        {/* flex-1 so the price and buttons line up across cards of unequal copy. */}
        <p className="flex-1 text-white/45 text-[13px] leading-relaxed mt-4">{vehicle.description}</p>

        {/* Specs reveal on hover at desktop widths, staggered per item;
            always visible on touch, where there's no hover to trigger it. */}
        <dl className="grid grid-cols-3 gap-y-4 gap-x-2 mt-6 pt-5 border-t hairline lg:max-h-0 lg:opacity-0 lg:overflow-hidden lg:mt-0 lg:pt-0 lg:border-t-0 lg:group-hover:max-h-56 lg:group-hover:opacity-100 lg:group-hover:mt-6 lg:group-hover:pt-5 lg:group-hover:border-t transition-all duration-500">
          {specs.map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col gap-1 transition-transform duration-500 lg:translate-y-2 lg:group-hover:translate-y-0"
              style={{ transitionDelay: `${i * 45}ms` }}
            >
              <s.icon size={13} className="text-amber/70" aria-hidden="true" />
              <dd className="text-[13px] text-white font-medium leading-none">{s.value}</dd>
              <dt className="text-[9px] tracking-[0.12em] uppercase text-white/30">{s.label}</dt>
            </div>
          ))}
        </dl>

        <div className="flex items-end justify-between gap-4 mt-6 pt-5 border-t hairline">
          <div>
            <p className="font-display text-3xl text-white leading-none">
              ${vehicle.dailyRate.toLocaleString()}
            </p>
            <p className="text-[10px] tracking-[0.12em] uppercase text-white/30 mt-1.5">
              Per day · ${vehicle.depositAmount.toLocaleString()} deposit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-5">
          <Link
            href={`/fleet/${vehicle.slug}`}
            className="flex-1 text-center border hairline text-white px-4 py-3 text-[10px] font-bold tracking-[0.14em] uppercase hover:border-amber/50 hover:text-amber transition-colors"
          >
            View Vehicle
          </Link>
          {bookable ? (
            <Link
              href={`/booking?vehicle=${vehicle.slug}`}
              className="flex-1 text-center bg-amber text-black px-4 py-3 text-[10px] font-bold tracking-[0.14em] uppercase hover:bg-amber-bright transition-all duration-300 lg:translate-x-1 lg:group-hover:translate-x-0"
            >
              Reserve Now
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="flex-1 text-center bg-white/5 text-white/30 px-4 py-3 text-[10px] font-bold tracking-[0.14em] uppercase cursor-not-allowed"
            >
              {AVAILABILITY_LABELS[vehicle.availability]}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
