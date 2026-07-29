'use client'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { MessageSquareText } from 'lucide-react'
import ConciergePanel from './ConciergePanel'

/**
 * Floating concierge entry point.
 *
 * Any element on the page carrying `data-concierge-open` also opens the panel,
 * so section CTAs (the hero, landing pages) do not each need their own state
 * or a context provider threaded through the tree.
 */
export default function ConciergeLauncher() {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('[data-concierge-open]')) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <>
      <AnimatePresence>{open && <ConciergePanel onClose={close} />}</AnimatePresence>

      {/* CSS entrance rather than a JS reduced-motion branch, which would
          differ between the server and client render and break hydration. */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label="Open AI rental concierge"
        style={{ animationDelay: '1400ms' }}
        className="anim-bloom group fixed bottom-12 right-4 sm:right-6 z-[65] inline-flex items-center gap-3 glass pl-5 pr-6 py-3.5 hover:border-amber/50 transition-colors shadow-[var(--shadow-lift)]"
      >
        <span className="relative flex items-center justify-center">
          <MessageSquareText size={17} className="text-amber" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute -inset-2 rounded-full bg-amber/20 blur-md animate-pulse motion-reduce:hidden"
          />
        </span>
        <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-white whitespace-nowrap">
          Concierge
        </span>
      </button>
    </>
  )
}
