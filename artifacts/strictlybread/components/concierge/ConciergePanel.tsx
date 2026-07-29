'use client'
import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { X, Sparkles, Lock } from 'lucide-react'
import { brand, contactLinks, isPlaceholder } from '@/lib/brand'

/**
 * Illustrative exchange showing the flow the concierge will run in Phase 4.
 * Clearly labelled in the UI as a preview — it is not a live conversation and
 * no availability has been checked.
 */
const PREVIEW = [
  { from: 'guest', text: 'I need a Lamborghini this Saturday.' },
  {
    from: 'concierge',
    text: 'I can help with that. What time would you like the rental to begin, and when would you return it?',
  },
  { from: 'guest', text: 'Saturday 10am until Monday morning.' },
  {
    from: 'concierge',
    text: 'Once the booking database is connected I’ll check live availability for those dates and show you matching vehicles with pricing, deposits and a booking link.',
  },
] as const

const CAPABILITIES = [
  'Check live availability before recommending anything',
  'Explain pricing, deposits, mileage and delivery fees',
  'Collect your details and start the reservation',
  'Hand off to a human whenever you ask',
]

interface Props {
  onClose: () => void
}

export default function ConciergePanel({ onClose }: Props) {
  const reduced = useReducedMotion()
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="AI rental concierge"
      initial={reduced ? false : { opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-28 right-4 sm:right-6 z-[70] w-[min(400px,calc(100vw-2rem))] max-h-[min(620px,calc(100vh-10rem))] glass shadow-[var(--shadow-cinematic)] flex flex-col overflow-hidden outline-none"
    >
      <header className="flex items-center justify-between gap-3 px-5 py-4 border-b hairline bg-ink-100/60">
        <span className="flex items-center gap-2.5">
          <Sparkles size={16} className="text-amber" aria-hidden="true" />
          <span className="font-display text-base text-white">Concierge</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close concierge"
          className="text-white/40 hover:text-white transition-colors p-1"
        >
          <X size={17} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-amber/70 text-center">
          Preview of the concierge flow — not a live conversation
        </p>

        {PREVIEW.map((message, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-4 py-3 text-[13px] leading-relaxed ${
              message.from === 'guest'
                ? 'self-end bg-amber text-black'
                : 'self-start bg-ink-200 text-white/75 border hairline'
            }`}
          >
            {message.text}
          </div>
        ))}

        <div className="mt-2 border hairline bg-ink-100/50 p-4">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/50 mb-3">
            What it will do
          </p>
          <ul className="flex flex-col gap-2">
            {CAPABILITIES.map(item => (
              <li key={item} className="flex gap-2 text-[12px] text-white/45 leading-relaxed">
                <span aria-hidden="true" className="text-amber shrink-0">
                  →
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="px-5 py-4 border-t hairline bg-ink-100/60">
        <div className="flex items-center gap-2 text-white/30 border hairline px-3.5 py-3 mb-3">
          <Lock size={13} aria-hidden="true" className="shrink-0" />
          <span className="text-[12px]">Concierge not connected yet</span>
        </div>
        <p className="text-[11px] text-white/35 leading-relaxed">
          {contactLinks.email || contactLinks.tel ? (
            <>
              In the meantime,{' '}
              {contactLinks.tel && !isPlaceholder(brand.contact.phoneDisplay) && (
                <a href={contactLinks.tel} className="text-amber hover:underline">
                  call {brand.contact.phoneDisplay}
                </a>
              )}
              {contactLinks.tel && contactLinks.email && ' or '}
              {contactLinks.email && (
                <a href={contactLinks.email} className="text-amber hover:underline">
                  send an email
                </a>
              )}
              .
            </>
          ) : (
            'Contact details are being finalised and will appear here before launch.'
          )}
        </p>
      </footer>
    </motion.div>
  )
}
