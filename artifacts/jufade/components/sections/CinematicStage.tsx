'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, CalendarClock } from 'lucide-react'
import { site } from '@/config/site'
import { stageState } from '@/lib/scrollState'
import { trackBookClick } from '@/lib/analytics'
import { HeroCanvas } from '@/components/three/HeroCanvas'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { BookButton } from '@/components/ui/BookButton'

gsap.registerPlugin(ScrollTrigger)

/** Piecewise-linear map: progress → value over [stop, value] pairs. */
function ramp(p: number, stops: [number, number][]): number {
  if (p <= stops[0][0]) return stops[0][1]
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i][0]) {
      const [a, va] = stops[i - 1]
      const [b, vb] = stops[i]
      return va + ((p - a) / (b - a)) * (vb - va)
    }
  }
  return stops[stops.length - 1][1]
}

const entrance = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: 1 + i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

/**
 * The pinned cinematic experience: a sticky full-screen 3D stage the visitor
 * scrolls "through" — chair → floating tools → appointment cards → framed
 * work — before the regular sections begin. One GSAP ScrollTrigger drives the
 * 3D scene (via stageState) and every overlay in lockstep.
 */
export function CinematicStage() {
  const container = useRef<HTMLDivElement>(null)
  const canvasWrap = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLDivElement>(null)
  const tools = useRef<HTMLDivElement>(null)
  const cards = useRef<HTMLDivElement>(null)
  const frames = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !container.current) return

    const apply = (el: HTMLElement | null, opacity: number, y = 0) => {
      if (!el) return
      el.style.opacity = String(opacity)
      el.style.transform = y ? `translateY(${y}px)` : ''
      el.style.pointerEvents = opacity < 0.05 ? 'none' : ''
      el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible'
    }

    const update = (p: number) => {
      stageState.progress = p
      apply(canvasWrap.current, ramp(p, [[0.58, 1], [0.72, 0]]))
      apply(hero.current, ramp(p, [[0, 1], [0.16, 0]]), ramp(p, [[0, 0], [0.16, -80]]))
      apply(tools.current, ramp(p, [[0.3, 0], [0.38, 1], [0.5, 1], [0.58, 0]]))
      apply(
        cards.current,
        ramp(p, [[0.6, 0], [0.68, 1], [0.8, 1], [0.86, 0]]),
        ramp(p, [[0.6, 120], [0.68, 0]]),
      )
      apply(frames.current, ramp(p, [[0.84, 0], [0.92, 1]]), ramp(p, [[0.84, 140], [0.96, 0]]))
    }

    const trigger = ScrollTrigger.create({
      trigger: container.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => update(self.progress),
    })
    update(trigger.progress)

    return () => trigger.kill()
  }, [reduced])

  // Reduced motion: a single calm hero screen, no 500vh scroll theater.
  if (reduced) {
    return (
      <section id="top" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
        <HeroCanvas />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        <HeroCopy static />
      </section>
    )
  }

  return (
    <div ref={container} id="top" className="relative h-[520vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* 3D stage */}
        <div ref={canvasWrap} className="absolute inset-0">
          <HeroCanvas />
        </div>

        {/* Atmosphere */}
        <div className="smoke-layer left-[-12%] top-[55%] h-[45vh] w-[55vw] bg-slate-500/30" aria-hidden />
        <div className="smoke-layer right-[-10%] top-[10%] h-[40vh] w-[45vw] bg-electric/15 [animation-delay:-12s]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" aria-hidden />

        {/* Phase 1 — hero copy */}
        <div ref={hero} className="absolute inset-0 will-change-[opacity,transform]">
          <HeroCopy />
        </div>

        {/* Phase 2 — the craft (floating tools) */}
        <div
          ref={tools}
          style={{ opacity: 0, visibility: 'hidden' }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-24 text-center will-change-[opacity]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-electric">The Craft</p>
          <h2 className="display mt-3 text-3xl text-frost sm:text-5xl">
            Precision in <span className="text-chrome-gradient">every tool</span>
          </h2>
          <p className="mt-3 max-w-md px-6 text-sm text-smoke">
            Clippers, trimmers, straight razor, combs, enhancement spray — dialed in before you sit down.
          </p>
        </div>

        {/* Phase 3 — floating appointment cards */}
        <div
          ref={cards}
          style={{ opacity: 0, visibility: 'hidden' }}
          className="absolute inset-0 flex flex-col items-center justify-center px-5 will-change-[opacity,transform]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-electric">This Week</p>
          <h2 className="display mt-3 text-center text-3xl text-frost sm:text-5xl">The book is open</h2>
          <div className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {site.sampleSlots.map((slot, i) => (
              <motion.a
                key={`${slot.day}-${slot.time}`}
                href={site.booking.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackBookClick('stage-slot-card')}
                animate={{ y: [0, i % 2 === 0 ? -10 : 10, 0] }}
                transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: 'easeInOut' }}
                className="group rounded-2xl border border-line bg-panel/70 p-4 backdrop-blur transition-colors hover:border-electric/70"
              >
                <CalendarClock size={16} className="text-electric" />
                <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-smoke">{slot.day}</p>
                <p className="mt-1 text-lg font-semibold text-frost group-hover:text-electric">{slot.time}</p>
                {slot.tag ? <p className="mt-1 text-[10px] text-electric/80">{slot.tag}</p> : null}
              </motion.a>
            ))}
          </div>
          <p className="mt-6 text-xs text-smoke/80">Live availability is on the booking page — these go fast.</p>
        </div>

        {/* Phase 4 — framed work teaser */}
        <div
          ref={frames}
          style={{ opacity: 0, visibility: 'hidden' }}
          className="absolute inset-0 flex flex-col items-center justify-center px-5 will-change-[opacity,transform]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-electric">The Proof</p>
          <h2 className="display mt-3 text-center text-3xl text-frost sm:text-5xl">Fresh off the chair</h2>
          <div className="mt-10 flex items-center justify-center gap-4 sm:gap-8">
            {[-6, 0, 5].map((tilt, i) => (
              <div
                key={tilt}
                className={`photo-placeholder relative h-48 w-32 rounded-lg border border-line/80 p-1.5 shadow-2xl shadow-black/60 sm:h-72 sm:w-52 ${i === 1 ? 'z-10 scale-110' : 'opacity-80'}`}
                style={{ transform: `rotate(${tilt}deg)` }}
              >
                <div className="photo-placeholder flex h-full w-full items-end rounded-md border border-line/50 p-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-smoke">
                    {['Skin Fade', 'Before / After', 'Beard Sculpt'][i]}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <a
            href="#work"
            className="mt-10 text-xs font-semibold uppercase tracking-[0.25em] text-electric underline-offset-8 hover:underline"
          >
            See the full portfolio ↓
          </a>
        </div>
      </div>
    </div>
  )
}

function HeroCopy({ static: isStatic = false }: { static?: boolean }) {
  return (
    <div className="relative z-10 flex h-full min-h-[100svh] flex-col items-center justify-center px-5 text-center">
      <motion.p
        variants={entrance}
        custom={0}
        initial={isStatic ? undefined : 'hidden'}
        animate={isStatic ? undefined : 'show'}
        className="text-xs font-semibold uppercase tracking-[0.4em] text-electric"
      >
        {site.name} — Private Barber Suite
      </motion.p>
      <motion.h1
        variants={entrance}
        custom={1}
        initial={isStatic ? undefined : 'hidden'}
        animate={isStatic ? undefined : 'show'}
        className="display mt-6 max-w-4xl text-5xl text-frost sm:text-7xl lg:text-8xl"
      >
        Your next cut <span className="text-chrome-gradient">starts here.</span>
      </motion.h1>
      <motion.p
        variants={entrance}
        custom={2}
        initial={isStatic ? undefined : 'hidden'}
        animate={isStatic ? undefined : 'show'}
        className="mt-6 text-base text-smoke sm:text-lg"
      >
        {site.tagline}
      </motion.p>
      <motion.div
        variants={entrance}
        custom={3}
        initial={isStatic ? undefined : 'hidden'}
        animate={isStatic ? undefined : 'show'}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <BookButton placement="hero" />
        <MagneticButton href="#work" variant="ghost">
          View My Work
        </MagneticButton>
      </motion.div>
      <motion.div
        initial={isStatic ? undefined : { opacity: 0 }}
        animate={isStatic ? undefined : { opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 text-smoke/70"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown size={16} className="animate-bounce" />
      </motion.div>
    </div>
  )
}
