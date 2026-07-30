'use client'
import { useEffect, useState } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/lib/motion'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Wires Lenis's raf loop to GSAP's ticker and forwards its scroll events to
 * `ScrollTrigger.update`, so every pinned/scrubbed scene recalculates
 * against Lenis's smoothed position rather than raw native scroll.
 *
 * Must render as a descendant of `<ReactLenis root>` — `useLenis()` reads
 * the instance from Lenis's own external store, which only gains a value
 * once `ReactLenis` constructs it in its own effect. Reading the instance
 * off a ref in a sibling effect (the first version of this file did that)
 * races that construction: the ref effect can fire before the instance
 * exists, silently no-ops, and never retries — Lenis then intercepts and
 * `preventDefault()`s every wheel event but never advances, and scrolling
 * stops completely. `useLenis()` is a proper subscription, so it re-renders
 * once the instance is actually ready instead of racing it.
 */
function LenisGsapSync() {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return
    const activeLenis = lenis

    function onTick(time: number) {
      activeLenis.raf(time * 1000)
    }

    const unsubscribe = activeLenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      unsubscribe()
      gsap.ticker.remove(onTick)
    }
  }, [lenis])

  return null
}

interface Props {
  children: React.ReactNode
}

/**
 * Inertial scroll (Lenis) for the whole app.
 *
 * Renders `{children}` with no wrapper element on the server and on first
 * client paint — identical markup both times, so there is no hydration
 * mismatch — and only starts smoothing after a mount effect confirms the
 * visitor hasn't asked for reduced motion. `root` mode means ReactLenis
 * never adds a wrapper div either way, so flipping it on post-mount doesn't
 * move a single DOM node, matching the same pattern already used by
 * HeroParallax and Reveal elsewhere in this project.
 *
 * Under reduced motion, Lenis never initializes: scroll stays native, and
 * every ScrollTrigger-driven scene is responsible for its own
 * `prefers-reduced-motion` check (same discipline as the canvas components)
 * so nothing depends on this provider to become readable.
 */
export default function SmoothScrollProvider({ children }: Props) {
  const [smooth, setSmooth] = useState(false)

  useEffect(() => {
    setSmooth(!prefersReducedMotion())
  }, [])

  if (!smooth) return <>{children}</>

  return (
    <ReactLenis root options={{ autoRaf: false, duration: 1.15 }}>
      <LenisGsapSync />
      {children}
    </ReactLenis>
  )
}
