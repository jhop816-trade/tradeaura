'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { site } from '@/config/site'
import { trackBookClick } from '@/lib/analytics'

/** Mobile-only booking bar pinned to the bottom once the visitor starts scrolling. */
export function StickyBookButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed inset-x-0 bottom-0 z-50 p-3 md:hidden"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <a
            href={site.booking.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackBookClick('sticky-mobile')}
            className="glow-gold flex w-full items-center justify-center rounded-full bg-frost py-4 text-sm font-bold uppercase tracking-[0.18em] text-ink active:scale-[0.98]"
          >
            Book Now — {site.name}
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
