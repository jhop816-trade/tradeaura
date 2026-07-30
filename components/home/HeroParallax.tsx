'use client'
import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Max translation in pixels at the pointer's furthest extent. */
  strength?: number
  className?: string
}

/**
 * Subtle mouse-parallax on the hero lighting layers.
 *
 * The wrapped element renders with no transform on both server and first
 * client paint — identical markup, so there is no hydration mismatch — and
 * only starts moving once a real pointer event arrives. Coarse pointers
 * (touch) and reduced-motion visitors never get a listener attached at all.
 */
export default function HeroParallax({ children, strength = 14, className = '' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let frame = 0
    let targetX = 0
    let targetY = 0

    function apply() {
      if (el) el.style.transform = `translate3d(${targetX.toFixed(2)}px, ${targetY.toFixed(2)}px, 0)`
      frame = 0
    }

    function onMove(e: PointerEvent) {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      targetX = nx * strength
      targetY = ny * (strength * 0.6)
      if (!frame) frame = requestAnimationFrame(apply)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [strength])

  return (
    <div ref={ref} className={className} style={{ transition: 'transform 700ms cubic-bezier(0.22,1,0.36,1)' }}>
      {children}
    </div>
  )
}
