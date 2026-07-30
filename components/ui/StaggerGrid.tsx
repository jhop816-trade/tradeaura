'use client'
import { useRef, type ElementType, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/lib/motion'

interface Props {
  children: ReactNode
  className?: string
  /** Distance (px) each item travels in from, and the per-item stagger (s). */
  y?: number
  stagger?: number
  /** Root element — 'ol' when the children are semantically an ordered list. */
  as?: ElementType
}

/**
 * Wraps a set of sibling elements — a grid of cards, typically — and
 * staggers them in as the group crosses into view, via GSAP's
 * `ScrollTrigger.batch`. Used anywhere several similar items should read as
 * arriving together, which a per-item `IntersectionObserver` (what `Reveal`
 * uses) can't coordinate on its own.
 *
 * Renders children plainly under reduced motion — nothing is ever hidden by
 * default; the animation only adds a starting state via `gsap.from()` once
 * JS has confirmed motion is welcome, so there's nothing to get stuck in.
 */
export default function StaggerGrid({ children, className = '', y = 36, stagger = 0.1, as: Tag = 'div' }: Props) {
  const ref = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current || ref.current.children.length === 0) return
      ScrollTrigger.batch(Array.from(ref.current.children), {
        start: 'top 88%',
        once: true,
        onEnter: batch =>
          gsap.from(batch, { opacity: 0, y, duration: 0.7, ease: 'power3.out', stagger }),
      })
    },
    { scope: ref }
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
