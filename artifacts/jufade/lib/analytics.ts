import { site } from '@/config/site'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * Fires a Google Ads conversion + GA4 event when someone clicks any
 * "Book" button. Safe to call when tracking isn't configured yet.
 */
export function trackBookClick(placement: string) {
  if (typeof window === 'undefined' || !window.gtag) return
  const { googleAdsId, conversionLabel } = site.analytics
  if (googleAdsId && conversionLabel) {
    window.gtag('event', 'conversion', {
      send_to: `${googleAdsId}/${conversionLabel}`,
    })
  }
  window.gtag('event', 'book_click', {
    event_category: 'booking',
    event_label: placement,
  })
}

/** Opens the booking platform in a new tab and records the click. */
export function openBooking(placement: string) {
  trackBookClick(placement)
  window.open(site.booking.url, '_blank', 'noopener,noreferrer')
}
