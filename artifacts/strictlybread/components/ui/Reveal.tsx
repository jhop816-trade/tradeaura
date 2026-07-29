'use client'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Stagger index — each step delays the reveal by 90ms. */
  index?: number
  className?: string
}

/** useLayoutEffect warns during SSR; fall back to useEffect on the server. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Scroll-triggered entrance.
 *
 * The server renders the content plainly visible, and the first client render
 * matches it exactly — no hydration mismatch, and the copy is readable with
 * JavaScript disabled. The hidden state is applied in a layout effect, before
 * the browser paints, so there is no flash of visible content first.
 *
 * Visitors who prefer reduced motion never leave the visible state.
 */
export default function Reveal({ children, index = 0, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [phase, setPhase] = useState<'idle' | 'hidden' | 'shown'>('idle')

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setPhase('hidden')
  }, [])

  useEffect(() => {
    if (phase !== 'hidden') return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setPhase('shown')
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -60px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [phase])

  const delay = index * 90
  const style =
    phase === 'idle'
      ? undefined
      : {
          opacity: phase === 'shown' ? 1 : 0,
          transform: phase === 'shown' ? 'none' : 'translateY(28px)',
          transition: `opacity 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        }

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
