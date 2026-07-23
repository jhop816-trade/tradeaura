'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

type Props = {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'ghost'
  className?: string
  ariaLabel?: string
}

/**
 * Button that magnetically leans toward the cursor on hover.
 * Falls back to a plain button under reduced motion / touch.
 */
export function MagneticButton({ children, onClick, href, variant = 'primary', className = '', ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18 })
  const sy = useSpring(y, { stiffness: 220, damping: 18 })

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === 'touch' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  const styles =
    variant === 'primary'
      ? 'bg-frost text-ink hover:bg-gold hover:text-frost glow-gold'
      : 'border border-line bg-panel/40 text-frost backdrop-blur hover:border-gold/60 hover:text-gold'

  const inner = (
    <motion.span
      style={{ x: sx, y: sy }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${styles}`}
    >
      {children}
    </motion.span>
  )

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={`inline-block ${className}`}>
      {href ? (
        <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" aria-label={ariaLabel} onClick={onClick} className="inline-block">
          {inner}
        </a>
      ) : (
        <button type="button" onClick={onClick} aria-label={ariaLabel} className="inline-block cursor-pointer">
          {inner}
        </button>
      )}
    </div>
  )
}
