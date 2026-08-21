'use client'

import { trackBookClick } from '@/lib/analytics'
import { site } from '@/config/site'
import { MagneticButton } from './MagneticButton'

type Props = {
  placement: string
  children?: React.ReactNode
  variant?: 'primary' | 'ghost'
  className?: string
}

/** Booking CTA — opens the booking platform and fires the Google Ads conversion. */
export function BookButton({ placement, children = 'Book Your Appointment', variant = 'primary', className }: Props) {
  return (
    <MagneticButton
      href={site.booking.url}
      variant={variant}
      className={className}
      ariaLabel="Book an appointment with JuFaded"
      onClick={() => trackBookClick(placement)}
    >
      {children}
    </MagneticButton>
  )
}
