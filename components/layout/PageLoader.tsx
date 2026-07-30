'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { brand } from '@/lib/brand'

/** Matches the CSS animation duration in globals.css (.anim-loader-out). */
const HOLD_MS = 1150

/**
 * One-time branded entrance overlay.
 *
 * Renders visible in the server HTML and on first client paint — identical
 * markup both times, so there is no hydration mismatch — then a client effect
 * unmounts it after the hold. The CSS animation is purely cosmetic; the
 * timeout is what actually removes it from the DOM and accessibility tree,
 * rather than leaving an invisible layer behind.
 *
 * Under reduced motion the global stylesheet collapses every animation to
 * ~0ms, so this disappears almost immediately instead of holding for a
 * second — visitors who asked for less motion don't get a forced pause.
 */
export default function PageLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.body.style.overflow = 'hidden'

    const timer = setTimeout(() => {
      setVisible(false)
      document.body.style.overflow = ''
    }, reduced ? 60 : HOLD_MS)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className="anim-loader-out fixed inset-0 z-[100] flex items-center justify-center bg-ink-000"
    >
      <div className="anim-loader-mark">
        <Image src={brand.logo.medium} alt="" width={64} height={64} className="rounded-full" priority />
      </div>
    </div>
  )
}
