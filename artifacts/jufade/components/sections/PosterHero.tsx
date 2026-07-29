'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { site } from '@/config/site'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Sticker, BookSticker } from '@/components/ui/Sticker'
import { Marquee } from '@/components/ui/Marquee'

const words = [
  { text: 'Your Next', className: 'text-frost' },
  { text: 'Cut Starts', className: 'text-frost' },
  { text: 'Here.', className: 'outline-text' },
]

const services = ['Fades', 'Tapers', 'Beard Work', 'Designs', 'Kids’ Cuts', 'Lineups', 'Enhancements']

/**
 * Street-poster hero (Variant B): stacked condensed headline on the left,
 * the JuFadedd reaper in its own spotlight column on the right, and a gold
 * service ticker across the bottom. The reaper leans toward the cursor.
 */
export function PosterHero() {
  const reduced = useReducedMotion()
  const wrap = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 120, damping: 18 })
  const ry = useSpring(useTransform(mx, [-1, 1], [-10, 10]), { stiffness: 120, damping: 18 })
  const tx = useSpring(useTransform(mx, [-1, 1], [-14, 14]), { stiffness: 120, damping: 18 })

  const onMove = (e: React.PointerEvent) => {
    if (reduced || !wrap.current) return
    const r = wrap.current.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1)
    my.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28">
      {/* Atmosphere */}
      <div className="smoke-layer left-[-10%] top-[30%] h-[45vh] w-[50vw] bg-slate-500/25" aria-hidden />
      <div className="smoke-layer right-[6%] top-[8%] h-[40vh] w-[40vw] bg-gold/12 [animation-delay:-9s]" aria-hidden />

      <div
        ref={wrap}
        onPointerMove={onMove}
        className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 pb-10 md:grid-cols-[1.05fr_0.95fr]"
      >
        {/* Copy */}
        <div className="order-2 md:order-1">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="poster-tag"
          >
            {site.name} · Private Barber Suite
          </motion.span>

          <h1 className="display mt-6 text-[clamp(3.2rem,11vw,7.5rem)]">
            {words.map((w, i) => (
              <span key={w.text} className="block overflow-hidden">
                <motion.span
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-block ${w.className}`}
                >
                  {w.text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-6 max-w-md text-lg text-smoke"
          >
            {site.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <BookSticker placement="hero" size="lg" />
            <Sticker href="#work" tone="ghost">
              View My Work
            </Sticker>
          </motion.div>
        </div>

        {/* Reaper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-1 flex justify-center md:order-2"
          style={{ perspective: 900 }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[80px]"
          />
          <motion.div style={{ rotateX: rx, rotateY: ry, x: tx }} className="relative">
            <BrandLogo
              priority
              className="h-[22rem] w-auto drop-shadow-[0_0_60px_rgb(var(--accent-rgb)/0.25)] sm:h-[26rem]"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Service ticker */}
      <div className="relative mt-4">
        <Marquee items={services} />
      </div>
    </section>
  )
}
