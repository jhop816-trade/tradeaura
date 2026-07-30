import type { ReactNode } from 'react'
import Reveal from './Reveal'

interface Props {
  id?: string
  eyebrow?: string
  title?: string
  intro?: string
  children: ReactNode
  className?: string
}

/**
 * Standard section shell — consistent rhythm, heading hierarchy and max width
 * across the page, so individual sections only describe their own content.
 */
export default function Section({ id, eyebrow, title, intro, children, className = '' }: Props) {
  return (
    <section id={id} className={`relative px-6 sm:px-10 lg:px-20 py-20 sm:py-28 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {(eyebrow || title || intro) && (
          <Reveal className="mb-12 sm:mb-16">
            {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            {title && (
              <h2 className="font-display text-display-xl text-white max-w-3xl">{title}</h2>
            )}
            {intro && (
              <p className="mt-5 text-white/45 text-[15px] leading-relaxed max-w-xl">{intro}</p>
            )}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  )
}
