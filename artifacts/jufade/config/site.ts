/**
 * ============================================================================
 * JUFADE — SITE CONFIG
 * ============================================================================
 * This is the ONLY file you need to edit to make the site yours.
 * Every price, link, address, review, and time slot on the site reads from
 * here. Search for "REPLACE" to find everything that needs your real info.
 * ============================================================================
 */

export const site = {
  name: 'JuFade',
  tagline: 'Premium cuts. Private suite. Clean experience.',

  // Booksy booking link. Every "Book" button opens this in a new tab, where the
  // client picks service/date/time and pays (if prepayment is enabled in Booksy).
  // NOTE: confirm this opens your booking page in a browser — if it 404s, grab the
  // full link from Booksy Biz → your profile → Share, and replace it here.
  booking: {
    url: 'https://jufadedd.booksy.com/a/',
    // Booksy doesn't offer a clean inline embed, so this stays false (button/link
    // hand-off). If you get a Booksy "Book Now" widget snippet later, tell me and
    // I'll wire the overlay instead.
    embed: false,
    embedUrl: '',
    cancellationPolicy:
      'Cancel or reschedule at least 24 hours before your appointment. Late cancellations are charged 50% of the service.',
    latePolicy:
      'A 10-minute grace period is included. After 15 minutes the appointment is marked as a no-show and the chair goes to the next client.',
  },

  // REPLACE: your real contact + social links
  contact: {
    instagram: 'https://instagram.com/Ju_Fadedd',
    instagramHandle: '@Ju_Fadedd',
    phone: '(555) 555-5555', // REPLACE
    email: 'book@jufade.com', // REPLACE
  },

  // REPLACE: your real suite address + hours + parking
  location: {
    suiteName: 'JuFade Private Suite',
    addressLine1: '123 Main Street, Suite 12', // REPLACE
    addressLine2: 'Your City, ST 00000', // REPLACE
    // REPLACE: paste your address into this query for the embedded map
    mapQuery: '123 Main Street Suite 12 Your City ST 00000',
    parking: 'Free parking directly in front of the building. Rear lot available on weekends.', // REPLACE
    hours: [
      { day: 'Monday', hours: '9:00 AM – 7:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM – 7:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM – 7:00 PM' },
      { day: 'Thursday', hours: '9:00 AM – 8:00 PM' },
      { day: 'Friday', hours: '8:00 AM – 8:00 PM' },
      { day: 'Saturday', hours: '8:00 AM – 6:00 PM' },
      { day: 'Sunday', hours: 'Closed' },
    ],
  },

  // REPLACE: your Google Ads + Analytics IDs to track ad performance.
  // 1. Google Ads tag ID looks like "AW-123456789"
  // 2. Conversion label comes from your "Book appointment" conversion action,
  //    it looks like "AbCdEfGhIjK-D12345678"
  // Leave empty ('') to disable tracking until you have them.
  analytics: {
    googleAdsId: '', // REPLACE e.g. 'AW-123456789'
    conversionLabel: '', // REPLACE e.g. 'AbCdEfGhIjK-D12345678'
    ga4Id: '', // OPTIONAL e.g. 'G-XXXXXXXXXX'
  },

  // REPLACE: your bio, years, and specialties
  about: {
    intro:
      "I'm Ju — the barber behind JuFade. Every cut happens one-on-one in my private suite: no crowd, no waiting room, no rushing. Just you, the chair, and a cut that's sharp when you leave and still sharp two weeks later.",
    years: 8, // REPLACE with your years of experience
    specialties: ['Skin Fades', 'Tapers', 'Beard Sculpting', 'Freestyle Designs', 'Kids’ Cuts'],
    // REPLACE: drop your professional photo at public/images/barber.jpg and
    // set this to '/images/barber.jpg'. While '' a styled placeholder shows.
    photo: '',
  },

  // REPLACE: prices with your real prices (all placeholders)
  services: [
    { name: 'Haircut', price: 45, duration: '45 min', description: 'Full cut, fade or taper, styled and finished.', featured: true },
    { name: 'Haircut + Beard', price: 60, duration: '60 min', description: 'The full reset. Cut plus a sculpted, lined beard.', featured: true },
    { name: 'Kids’ Haircut', price: 35, duration: '30 min', description: 'Ages 12 and under. Patient, clean, parent-approved.', featured: false },
    { name: 'Lineup', price: 25, duration: '20 min', description: 'Edge-up and touch-up between full cuts.', featured: false },
    { name: 'Beard Service', price: 30, duration: '30 min', description: 'Shape, line, hot lather razor finish.', featured: false },
    { name: 'Enhancements', price: 15, duration: '10 min', description: 'Hairline and beard enhancement for extra definition.', featured: false },
    { name: 'Facial Add-On', price: 25, duration: '20 min', description: 'Steam towel, black mask, and moisturizer finish.', featured: false },
  ] as ServiceItem[],

  // Placeholder next-available slots shown in the floating appointment cards.
  // These are just visuals to create urgency — real availability lives on your
  // booking platform. REPLACE with times that look like your real book.
  sampleSlots: [
    { day: 'Today', time: '4:30 PM', tag: 'Last one today' },
    { day: 'Tomorrow', time: '10:00 AM', tag: 'Morning slot' },
    { day: 'Tomorrow', time: '2:15 PM', tag: '' },
    { day: 'Friday', time: '11:45 AM', tag: 'Going fast' },
    { day: 'Saturday', time: '9:00 AM', tag: 'Weekend' },
  ],

  // REPLACE: portfolio items. Drop real photos into public/images/work/
  // and set `src` to e.g. '/images/work/fade-01.jpg'. While src is '', a
  // styled placeholder tile renders instead so the layout never breaks.
  portfolio: [
    { title: 'Mid Skin Fade', category: 'fades', src: '', tall: true },
    { title: 'Clean Taper', category: 'tapers', src: '', tall: false },
    { title: 'Beard Sculpt', category: 'beard', src: '', tall: false },
    { title: 'Freestyle Design', category: 'designs', src: '', tall: true },
    { title: 'High Fade + Part', category: 'fades', src: '', tall: false },
    { title: 'Kids’ Fade', category: 'kids', src: '', tall: false },
    { title: 'Drop Fade', category: 'fades', src: '', tall: true },
    { title: 'Taper + Waves', category: 'tapers', src: '', tall: false },
    { title: 'Full Beard Lineup', category: 'beard', src: '', tall: false },
    { title: 'Burst Fade Design', category: 'designs', src: '', tall: false },
    { title: 'First Cut', category: 'kids', src: '', tall: true },
    { title: 'Low Taper', category: 'tapers', src: '', tall: false },
  ] as PortfolioItem[],

  // REPLACE: before/after pairs. Drop photos in public/images/work/ and set paths.
  beforeAfter: {
    before: '', // e.g. '/images/work/before-01.jpg'
    after: '', // e.g. '/images/work/after-01.jpg'
    label: 'Skin fade transformation',
  },

  // REPLACE: your real 5-star reviews (copy them from Google/Booksy).
  // Set photo to '/images/reviews/name.jpg' if the client is cool with it, or
  // leave '' for a clean initials avatar.
  reviews: [
    { name: 'Marcus T.', text: 'Cleanest fade I’ve ever had. The private suite is a different experience — no waiting around, just straight to the chair.', photo: '' },
    { name: 'Devon R.', text: 'Been going to Ju for a year. Never had to fix a single lineup after. Books up fast for a reason.', photo: '' },
    { name: 'Chris M.', text: 'Took my son for his first real cut. Patient, professional, and the fade was crazy. We’re both clients now.', photo: '' },
    { name: 'Andre W.', text: 'The beard work is on another level. Hot towel, razor finish, walked out feeling brand new.', photo: '' },
    { name: 'Jalen P.', text: 'Suite is spotless, music is right, and the cut speaks for itself. Worth every dollar.', photo: '' },
    { name: 'Tony S.', text: 'Booked the haircut + beard before a wedding. Got more compliments on the cut than the suit.', photo: '' },
  ] as ReviewItem[],

  // Suite experience highlights — photos go in public/images/suite/
  suite: {
    photos: ['', '', '', ''], // REPLACE e.g. '/images/suite/chair.jpg'
    highlights: [
      { title: 'Private, one-on-one', text: 'The suite is yours for the whole appointment. No walk-ins, no audience.' },
      { title: 'Clean, every time', text: 'Fresh capes, sanitized tools, and a spotless chair for every single client.' },
      { title: 'The right atmosphere', text: 'Curated playlists, dialed lighting, and a comfortable chair you won’t want to leave.' },
      { title: 'On your schedule', text: 'Appointment-only means your time is respected — in the chair at your booked time.' },
    ],
  },

  // SEO — REPLACE the city/region with yours so local search finds you.
  seo: {
    title: 'JuFade | Premium Private Suite Barber',
    description:
      'JuFade is a premium private-suite barber experience. Skin fades, tapers, beard sculpting, and designs — one-on-one appointments, no waiting room. Book your next cut today.',
    city: 'Your City', // REPLACE
    region: 'ST', // REPLACE
    url: 'https://jufade.com', // REPLACE with your real domain
  },
}

export type ServiceItem = {
  name: string
  price: number
  duration: string
  description: string
  featured: boolean
}

export type PortfolioItem = {
  title: string
  category: 'fades' | 'tapers' | 'beard' | 'designs' | 'kids'
  src: string
  tall: boolean
}

export type ReviewItem = { name: string; text: string; photo: string }

export type SiteConfig = typeof site
