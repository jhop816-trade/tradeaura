'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ArrowRight, MessageSquareText } from 'lucide-react'
import BrandMark from '@/components/brand/BrandMark'
import FogCanvas from './FogCanvas'
import ParticlesCanvas from './ParticlesCanvas'
import HeroParallax from './HeroParallax'
import { prefersReducedMotion } from '@/lib/motion'

const TRUST = ['Secure Payments', 'Verified Fleet', 'Concierge Delivery']

/**
 * The opening scene, staged in two acts.
 *
 * Act one is a one-time entrance on load: darkness, fog and drifting
 * particles, the headlights flaring on rather than fading in, then the
 * copy assembling — built entirely in CSS (see `.anim-*` in globals.css) so
 * it renders identically on the server and the first client paint. Nothing
 * here depends on JavaScript to be legible.
 *
 * Act two is a scroll-scrubbed exit: as the visitor scrolls past, the whole
 * environment (fog, light, grain) pulls back and dissolves while the copy
 * fades on a separate, faster track — two depth layers exiting at different
 * rates, which is what actually reads as camera movement without a 3D scene.
 * This part requires JavaScript (GSAP ScrollTrigger, pinned to the section)
 * and is why this component is a client component; it is entirely additive
 * — skipped outright under reduced motion, in which case the section simply
 * scrolls past like any other.
 *
 * Still no fake car: the "reveal" is abstract light and fog, not a drawn
 * silhouette. A flat CSS shape read as an unidentified dark blob the one
 * time this project tried it (see git history) — engine sound would need
 * licensed audio that doesn't exist yet, so this is the honest stand-in for
 * the ignition beat the brief asked for.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !sectionRef.current || !stageRef.current || !contentRef.current) return

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=100%',
            scrub: 0.6,
            pin: true,
          },
        })
        .to(stageRef.current, { scale: 1.18, opacity: 0.25, filter: 'blur(10px)', ease: 'none' }, 0)
        .to(contentRef.current, { yPercent: -18, opacity: 0, ease: 'none' }, 0)
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden bg-ink-000 pt-24 pb-28"
    >
      {/* Environment — everything that isn't type. Scales and dissolves as
          one layer during the scroll exit. */}
      <div ref={stageRef} className="absolute inset-0">
        <FogCanvas />
        <ParticlesCanvas className="opacity-70" />

        {/* Light rays — soft diagonal beams drifting behind the copy. */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden opacity-60">
          <div
            className="anim-ray absolute -top-1/4 left-[8%] w-[3px] h-[160%] bg-gradient-to-b from-transparent via-amber/25 to-transparent blur-[2px]"
            style={{ '--ray-angle': '11deg' } as React.CSSProperties}
          />
          <div
            className="anim-ray absolute -top-1/4 left-1/2 w-[4px] h-[160%] bg-gradient-to-b from-transparent via-white/10 to-transparent blur-[3px]"
            style={{ '--ray-angle': '-7deg', animationDelay: '-4s' } as React.CSSProperties}
          />
          <div
            className="anim-ray absolute -top-1/4 right-[12%] w-[3px] h-[160%] bg-gradient-to-b from-transparent via-amber/20 to-transparent blur-[2px]"
            style={{ '--ray-angle': '9deg', animationDelay: '-7s' } as React.CSSProperties}
          />
        </div>

        {/* Headlights — ignition flare rather than a flat fade-in. */}
        <HeroParallax
          strength={10}
          className="anim-flare absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[min(1100px,120vw)] h-[420px] pointer-events-none"
        >
          <div aria-hidden="true" className="relative w-full h-full">
            <div className="absolute left-[24%] top-1/2 -translate-y-1/2 w-40 h-16 rounded-full bg-white/80 blur-[42px]" />
            <div className="absolute right-[24%] top-1/2 -translate-y-1/2 w-40 h-16 rounded-full bg-white/80 blur-[42px]" />
            <div className="absolute left-[18%] top-1/2 -translate-y-1/2 w-72 h-40 rounded-full bg-amber/25 blur-[70px]" />
            <div className="absolute right-[18%] top-1/2 -translate-y-1/2 w-72 h-40 rounded-full bg-amber/25 blur-[70px]" />
          </div>
        </HeroParallax>

        {/* Floor light pool — the media slot a real vehicle cutout or scene
            will eventually occupy. Lower parallax strength than the
            headlights so it reads as further back — real depth, not a flat
            stack. */}
        <HeroParallax
          strength={6}
          className="anim-settle absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 w-[min(1000px,96vw)] h-[300px] pointer-events-none"
        >
          <div aria-hidden="true" className="relative w-full h-full" style={{ animationDelay: '600ms' }}>
            <div className="absolute inset-x-[6%] bottom-8 h-24 rounded-[50%] bg-amber/10 blur-[60px]" />
            <div className="absolute inset-x-[22%] bottom-[52px] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>
        </HeroParallax>

        {/* Vignette keeps the centre bright and the edges cinematic. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 55%, transparent 0%, rgba(0,0,0,0.55) 62%, #050505 100%)',
          }}
        />
        <div aria-hidden="true" className="grain" />
      </div>

      {/* Copy — a separate depth layer, exits faster than the environment. */}
      <div ref={contentRef} className="relative z-10 px-6 sm:px-10 lg:px-20 w-full">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="anim-rise" style={{ animationDelay: '200ms' }}>
            <BrandMark size="lg" showWordmark={false} className="mb-8" />
          </div>

          <p className="anim-rise eyebrow mb-5" style={{ animationDelay: '380ms' }}>
            Private Rental Experience
          </p>

          <h1 className="font-display text-display-hero text-white max-w-5xl">
            <span className="anim-rise block" style={{ animationDelay: '480ms' }}>
              Your Dream Car.
            </span>
            <span className="anim-rise block text-amber" style={{ animationDelay: '680ms' }}>
              Your Moment.
            </span>
          </h1>

          <p
            className="anim-rise mt-8 text-white/55 text-base sm:text-lg leading-relaxed max-w-xl"
            style={{ animationDelay: '900ms' }}
          >
            Reserve premium exotic and luxury vehicles through a seamless private
            rental experience.
          </p>

          <div
            className="anim-rise mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
            style={{ animationDelay: '1080ms' }}
          >
            <Link
              href="/fleet"
              className="group inline-flex items-center justify-center gap-2 bg-amber text-black px-9 py-4 text-xs font-bold tracking-[0.16em] uppercase hover:bg-amber-bright transition-colors"
            >
              View Available Cars
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              data-concierge-open
              className="inline-flex items-center justify-center gap-2 glass text-white px-9 py-4 text-xs font-bold tracking-[0.16em] uppercase hover:border-amber/50 transition-colors"
            >
              <MessageSquareText size={15} />
              Book With AI Concierge
            </button>
          </div>

          <ul
            className="anim-rise mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] tracking-[0.18em] uppercase text-white/35"
            style={{ animationDelay: '1260ms' }}
          >
            {TRUST.map((item, i) => (
              <li key={item} className="flex items-center gap-3">
                {i > 0 && (
                  <span aria-hidden="true" className="text-amber/40">
                    •
                  </span>
                )}
                {item}
              </li>
            ))}
          </ul>

          {/* Scroll cue — visual affordance only; the section scrolls past
              normally with or without it, and it fades out with the rest of
              the copy layer during the exit. */}
          <div
            aria-hidden="true"
            className="anim-rise mt-16 flex flex-col items-center gap-2 text-white/25"
            style={{ animationDelay: '1450ms' }}
          >
            <span className="text-[9px] tracking-[0.3em] uppercase">Scroll</span>
            <span className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
