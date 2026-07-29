/**
 * Single source of truth for brand identity and contact details.
 *
 * Every user-facing surface reads from here — metadata, structured data,
 * navigation, footer, concierge. Changing a number or handle is one edit.
 *
 * PLACEHOLDERS: the contact fields below are NOT the client's real details.
 * They are deliberately obvious placeholders so nothing fake ships to
 * production looking legitimate. Replace each one before launch — see
 * `isPlaceholder` for the check the UI uses to flag them.
 */

const PLACEHOLDER = 'TODO' as const

export const brand = {
  name: 'StrictlyBread Rentals',
  shortName: 'StrictlyBread',

  /** Rendered as lead + accent dot + trail in the footer lockup. */
  wordmark: { lead: 'Strictly', trail: 'Bread' },

  tagline: 'Exotic and luxury rentals, arranged privately.',

  description:
    'Reserve premium exotic and luxury vehicles through a seamless private rental experience. Concierge delivery, verified fleet, secure online booking.',

  logo: {
    small: '/brand/logo-96.png',
    medium: '/brand/logo-192.png',
    large: '/brand/logo-512.png',
    alt: 'StrictlyBread Rentals',
  },

  /** REPLACE — placeholder contact details, not the client's real numbers. */
  contact: {
    phoneDisplay: PLACEHOLDER,
    phoneE164: PLACEHOLDER,
    email: PLACEHOLDER,
    instagramHandle: PLACEHOLDER,
  },

  location: {
    /** REPLACE once the client confirms their market. */
    homeBase: PLACEHOLDER,
    region: PLACEHOLDER,
  },

  colors: {
    /** Amber sampled from the supplied logo artwork. */
    accent: '#E5A812',
    accentBright: '#F5C542',
    cream: '#EEE7D7',
    ink: '#0D0903',
  },
} as const

/** True when a brand field is still the shipped placeholder. */
export function isPlaceholder(value: string): boolean {
  return value === PLACEHOLDER
}

/**
 * Contact links resolve to `null` while the underlying detail is a
 * placeholder, so components render a "coming soon" state instead of an
 * anchor that dials nothing.
 */
export const contactLinks = {
  tel: isPlaceholder(brand.contact.phoneE164) ? null : `tel:${brand.contact.phoneE164}`,
  sms: isPlaceholder(brand.contact.phoneE164) ? null : `sms:${brand.contact.phoneE164}`,
  whatsapp: isPlaceholder(brand.contact.phoneE164)
    ? null
    : `https://wa.me/${brand.contact.phoneE164.replace('+', '')}`,
  email: isPlaceholder(brand.contact.email) ? null : `mailto:${brand.contact.email}`,
  instagram: isPlaceholder(brand.contact.instagramHandle)
    ? null
    : `https://instagram.com/${brand.contact.instagramHandle}`,
} as const

/** Profiles Google may treat as the same entity (schema.org sameAs). */
export const socialProfiles: readonly string[] = [contactLinks.instagram].filter(
  (url): url is string => url !== null
)
