import Link from 'next/link'
import { ArrowRight, MessageSquareText } from 'lucide-react'
import BrandMark from '@/components/brand/BrandMark'
import FogCanvas from './FogCanvas'
import ParticlesCanvas from './ParticlesCanvas'
import HeroParallax from './HeroParallax'

const TRUST = ['Secure Payments', 'Verified Fleet', 'Concierge Delivery']

/**
 * Opening sequence: near-black, fog drifts in, headlights bloom, dust drifts
 * through the beams, then the copy settles.
 *
 * Entrances are CSS animations rather than JS, so this stays a server
 * component (no hydration cost, no reduced-motion mismatch). The lighting
 * layers pass through HeroParallax, a client component that renders with an
 * identity transform on first paint and only starts nudging on pointer move,
 * so it can't cause a mismatch either. FogCanvas and ParticlesCanvas are the
 * only pieces that ship real per-frame JavaScript. The silhouette is a CSS
 * stand-in occupying the same box the client's photography will fill, so
 * swapping it in won't reflow.
 */
export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden bg-ink-000 pt-24 pb-28">
      <FogCanvas />
      <ParticlesCanvas className="opacity-70" />

      {/* Headlights — two hot spots blooming out of the dark. */}
      <HeroParallax
        strength={10}
        className="anim-bloom absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[min(1100px,120vw)] h-[420px] pointer-events-none"
      >
        <div aria-hidden="true" className="relative w-full h-full">
          <div className="absolute left-[24%] top-1/2 -translate-y-1/2 w-40 h-16 rounded-full bg-white/80 blur-[42px]" />
          <div className="absolute right-[24%] top-1/2 -translate-y-1/2 w-40 h-16 rounded-full bg-white/80 blur-[42px]" />
          <div className="absolute left-[18%] top-1/2 -translate-y-1/2 w-72 h-40 rounded-full bg-amber/25 blur-[70px]" />
          <div className="absolute right-[18%] top-1/2 -translate-y-1/2 w-72 h-40 rounded-full bg-amber/25 blur-[70px]" />
        </div>
      </HeroParallax>

      {/*
        Hero media slot.

        Deliberately left as lighting only — a lit, empty stage reads as
        intentional, whereas a CSS-drawn car silhouette reads as an unidentified
        dark shape and cheapens the whole section. Drop the client's cutout
        photography (or a Three.js scene) into this container when it arrives;
        it is already positioned and sized for it. Parallax strength is lower
        here than the headlights so the floor reads as further back.
      */}
      <HeroParallax
        strength={6}
        className="anim-settle absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 w-[min(1000px,96vw)] h-[300px] pointer-events-none"
      >
        <div aria-hidden="true" className="relative w-full h-full" style={{ animationDelay: '600ms' }}>
          {/* Floor light pool the vehicle will eventually sit in. */}
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

      <div className="relative z-10 px-6 sm:px-10 lg:px-20 w-full">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="anim-rise" style={{ animationDelay: '200ms' }}>
            <BrandMark size="lg" showWordmark={false} className="mb-8" />
          </div>

          <h1
            className="anim-rise font-display text-[13vw] sm:text-7xl lg:text-8xl text-white max-w-4xl"
            style={{ animationDelay: '450ms' }}
          >
            Your Dream Car.
            <br />
            <span className="text-amber">Your Moment.</span>
          </h1>

          <p
            className="anim-rise mt-7 text-white/55 text-base sm:text-lg leading-relaxed max-w-xl"
            style={{ animationDelay: '650ms' }}
          >
            Reserve premium exotic and luxury vehicles through a seamless private
            rental experience.
          </p>

          <div
            className="anim-rise mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
            style={{ animationDelay: '850ms' }}
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
            style={{ animationDelay: '1050ms' }}
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
        </div>
      </div>
    </section>
  )
}
