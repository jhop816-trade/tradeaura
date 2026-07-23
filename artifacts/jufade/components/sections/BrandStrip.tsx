'use client'

import { motion } from 'framer-motion'
import { site } from '@/config/site'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Reveal } from '@/components/ui/Reveal'
import { BookButton } from '@/components/ui/BookButton'

/**
 * Dedicated brand moment: the JuFadedd reaper logo presented as the centerpiece
 * on a warm smoke-and-gold stage, paired with the brand statement.
 */
export function BrandStrip() {
  return (
    <section className="relative overflow-hidden border-y border-line/60 bg-charcoal py-24">
      {/* Warm atmosphere */}
      <div className="smoke-layer left-[-8%] top-[10%] h-[45vh] w-[50vw] bg-slate-500/25" aria-hidden />
      <div className="smoke-layer right-[-6%] bottom-[5%] h-[40vh] w-[45vw] bg-gold/10 [animation-delay:-10s]" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
        {/* Logo on a warm smoke halo */}
        <div className="relative flex justify-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[90px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrandLogo className="relative h-72 w-auto drop-shadow-[0_0_50px_rgba(232,178,58,0.2)] sm:h-80" />
          </motion.div>
        </div>

        {/* Brand statement */}
        <div className="text-center md:text-left">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">The Brand</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display mt-4 text-4xl text-frost sm:text-5xl">
              Cold precision.
              <br />
              <span className="text-chrome-gradient">Clean lines.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-smoke md:mx-0">
              {site.name} is a one-chair operation built on a simple promise — you walk out sharper
              than you walked in, every single time. The reaper takes the old cut. You keep the fade.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 flex justify-center md:justify-start">
              <BookButton placement="brand-strip">Book the Chair</BookButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
