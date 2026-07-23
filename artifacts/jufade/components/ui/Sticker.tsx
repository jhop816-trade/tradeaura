'use client'

import { site } from '@/config/site'
import { trackBookClick } from '@/lib/analytics'

type Props = {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  size?: 'md' | 'lg'
  tone?: 'gold' | 'ghost'
  className?: string
}

/**
 * Street-poster sticker button — gold, slightly rotated, hard drop shadow.
 * Straightens and lifts on hover.
 */
export function Sticker({ children, onClick, href, size = 'md', tone = 'gold', className = '' }: Props) {
  const pad = size === 'lg' ? 'px-9 py-5 text-xl' : 'px-7 py-3.5 text-base'
  const toneCls =
    tone === 'gold'
      ? 'bg-gold text-ink shadow-[4px_4px_0_#000] hover:bg-frost'
      : 'border-2 border-gold text-gold bg-transparent hover:bg-gold hover:text-ink'
  const Tag: React.ElementType = href ? 'a' : 'button'
  return (
    <Tag
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      className={`display inline-block -rotate-2 uppercase tracking-[0.03em] transition-all duration-200 hover:rotate-0 hover:-translate-y-0.5 ${pad} ${toneCls} ${className}`}
    >
      {children}
    </Tag>
  )
}

/** Booking sticker that fires the Google Ads conversion. */
export function BookSticker({
  placement,
  children = 'Book Your Appointment',
  size = 'md',
  className,
}: {
  placement: string
  children?: React.ReactNode
  size?: 'md' | 'lg'
  className?: string
}) {
  return (
    <Sticker href={site.booking.url} size={size} className={className} onClick={() => trackBookClick(placement)}>
      {children}
    </Sticker>
  )
}
