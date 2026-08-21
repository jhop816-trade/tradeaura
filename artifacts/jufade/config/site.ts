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
  name: 'JuFaded',
  tagline: 'Premium cuts. Private suite. Clean experience.',

  // Booksy booking link. Every "Book" button opens this in a new tab, where the
  // client picks service/date/time and pays (if prepayment is enabled in Booksy).
  // NOTE: confirm this opens your booking page in a browser — if it 404s, grab the
  // full link from Booksy Biz → your profile → Share, and replace it here.
  // Booksy Instant Experience widget — opens directly in-browser, no
  // "download the app" interstitial (unlike the jufadedd.booksy.com/a/ short
  // link, which is Booksy's app-install link and was prompting an app download).
  booking: {
    url: 'https://booksy.com/en-us/instant-experiences/widget/1133760',
    // Booksy doesn't offer a clean inline embed, so this stays false (button/link
    // hand-off). If you get a Booksy "Book Now" widget snippet later, tell me and
    // I'll wire the overlay instead.
    embed: false,
    embedUrl: '',
    // ⚠️ CONFIRM THESE. These are deliberately non-specific because I don't know
    // your actual rules. If you charge a late-cancel fee, take deposits, or have
    // a hard grace period, tell me the real numbers and I'll state them exactly.
    // Whatever you set in Booksy is what actually gets enforced at booking.
    cancellationPolicy:
      'Life happens — just cancel or reschedule through Booksy as early as you can so the slot can go to someone else. Any deposit or cancellation terms are shown when you book.',
    latePolicy:
      'Running late? Call or text and I’ll tell you if the slot still works. Show up too late and we may have to rebook, since the next client is already on the clock.',
  },

  contact: {
    instagram: 'https://instagram.com/Ju_Fadedd',
    instagramHandle: '@Ju_Fadedd',
    phone: '(954) 261-7884',
    // Leave '' to hide the email icon entirely. Only put a real inbox here —
    // a made-up address silently loses clients when their mail bounces.
    email: '',
  },

  location: {
    suiteName: 'JuFaded Private Suite',
    addressLine1: '146 E McNab Road',
    addressLine2: 'Pompano Beach, FL 33060',
    mapQuery: '146 E McNab Road Pompano Beach FL 33060',
    parking: 'Free parking on-site.', // REPLACE if you want to add detail
    hours: [
      { day: 'Monday', hours: '10:00 AM – 8:00 PM' },
      { day: 'Tuesday', hours: '10:00 AM – 8:00 PM' },
      { day: 'Wednesday', hours: '10:00 AM – 8:00 PM' },
      { day: 'Thursday', hours: '10:00 AM – 8:00 PM' },
      { day: 'Friday', hours: '10:00 AM – 8:00 PM' },
      { day: 'Saturday', hours: '10:00 AM – 9:00 PM' },
      { day: 'Sunday', hours: 'Closed' },
    ],
  },

  // Google Ads + Analytics.
  // googleAdsId — the Google tag from Ads → Tools → Data manager → Google tag.
  // conversionLabel — created separately under Goals → Conversions. Until it's
  // filled in, the tag still loads and collects traffic, and every Book click
  // fires a `book_click` event, but no Ads *conversion* is counted.
  analytics: {
    googleAdsId: 'AW-18095937011',
    conversionLabel: '2ahtCLm-tdccEPOr6LRD',
    ga4Id: '', // OPTIONAL e.g. 'G-XXXXXXXXXX'
  },

  // REPLACE: your bio, years, and specialties
  about: {
    intro:
      "I'm Ju — the barber behind JuFaded. Every cut happens one-on-one in my private suite: no crowd, no waiting room, no rushing. Just you, the chair, and a cut that's sharp when you leave and still sharp two weeks later.",
    // Years behind the chair. Shown alongside the verified Booksy rating.
    years: 4.5 as number | null,
    specialties: ['Skin Fades', 'Tapers', 'Beard Sculpting', 'Freestyle Designs', 'Kids’ Cuts'],
    photo: '/images/barber.jpg',
  },

  // Real prices as given by Ju. `duration` is optional and left off on purpose —
  // it isn't shown unless a real length is filled in, so nothing is invented.
  services: [
    { name: 'Haircut', price: 40, description: 'Any style — fades, brush cuts, tapers. Cut, lined, and finished.', featured: true },
    { name: 'VIP', price: 100, description: 'The full experience — cut plus a steam facial.', featured: true },
    { name: 'Tape Up & Shave', price: 25, description: 'Edge-up and shave between full cuts.', featured: false },
    { name: 'Kid Cut', price: 25, description: 'Same cut, kids’ pricing.', featured: false },
    { name: 'Teen Cut', price: 30, description: 'Same cut, teen pricing.', featured: false },
    { name: 'House Call', price: 150, description: 'I come to you.', featured: false },
  ] as ServiceItem[],

  // After-hours up-charge — shown as a second panel below the main menu.
  // House Call stays the same price regardless of time.
  afterHours: {
    note: 'After 8:00 PM',
    services: [
      { name: 'Haircut', price: 80 },
      { name: 'VIP', price: 100 },
      { name: 'Tape Up & Shave', price: 50 },
      { name: 'Kid Cut', price: 50 },
      { name: 'Teen Cut', price: 50 },
      { name: 'House Call', price: 150 },
    ],
  },

  // Cards shown in the cinematic "The Book Is Open" beat.
  // These state your REAL schedule — not invented open slots. (Faking specific
  // times like "Today 4:30 — last one!" reads as pressure-selling and burns
  // trust the moment someone opens Booksy and sees different availability.)
  scheduleCards: [
    { day: 'Mon – Fri', time: '10a – 8p', tag: 'Open' },
    { day: 'Saturday', time: '10a – 9p', tag: 'Late nights' },
    { day: 'Sunday', time: 'Closed', tag: '' },
    { day: 'Book online', time: '24 / 7', tag: 'Booksy' },
    { day: 'Private suite', time: '1 at a time', tag: 'By appointment' },
  ],

  // REPLACE: portfolio items. Drop real photos into public/images/work/
  // and set `src` to e.g. '/images/work/fade-01.jpg'. While src is '', a
  // styled placeholder tile renders instead so the layout never breaks.
  portfolio: [
    { title: 'Twists + Taper', category: 'tapers', src: '/images/work/cut-01.jpg', tall: true },
    { title: 'Curly Taper', category: 'tapers', src: '/images/work/cut-02.jpg', tall: true },
    { title: 'Sponge Twist Fade', category: 'fades', src: '/images/work/cut-03.jpg', tall: false },
    { title: 'Loc Taper', category: 'tapers', src: '/images/work/cut-04.jpg', tall: true },
    { title: 'Twist-Out Fade', category: 'tapers', src: '/images/work/cut-05.jpg', tall: true },
    { title: 'Low Fade', category: 'fades', src: '/images/work/cut-06.jpg', tall: false },
    { title: 'Waves + Lineup', category: 'fades', src: '/images/work/cut-07.jpg', tall: true },
    { title: 'Beard Detail', category: 'beard', src: '/images/work/cut-08.jpg', tall: true },
    { title: 'Curly Top Fade', category: 'tapers', src: '/images/work/cut-09.jpg', tall: false },
    { title: 'Bald Fade', category: 'fades', src: '/images/work/cut-10.jpg', tall: true },
    { title: 'Loc Lineup', category: 'designs', src: '/images/work/cut-11.jpg', tall: true },
    { title: 'Beard Blend', category: 'beard', src: '/images/work/cut-12.jpg', tall: false },
    { title: 'Sponge Drop Fade', category: 'fades', src: '/images/work/cut-13.jpg', tall: true },
    { title: 'High Top + Lineup', category: 'tapers', src: '/images/work/cut-14.jpg', tall: true },
    { title: 'Twist Burst Fade', category: 'tapers', src: '/images/work/cut-15.jpg', tall: false },
    { title: 'Clean Low Fade', category: 'fades', src: '/images/work/cut-16.jpg', tall: true },
    { title: 'Waves Fade', category: 'fades', src: '/images/work/cut-17.jpg', tall: true },
    { title: 'Full Beard Sculpt', category: 'beard', src: '/images/work/cut-18.jpg', tall: false },
    { title: 'Freeform Locs', category: 'tapers', src: '/images/work/cut-19.jpg', tall: true },
    { title: 'Braid Design', category: 'designs', src: '/images/work/cut-20.jpg', tall: true },
    { title: 'Twist Taper', category: 'tapers', src: '/images/work/cut-21.jpg', tall: false },
    { title: 'Kids’ First Cut', category: 'kids', src: '/images/work/cut-22.jpg', tall: true },
    { title: 'Fade + Beard', category: 'fades', src: '/images/work/cut-23.jpg', tall: true },
    { title: 'Textured Mullet', category: 'tapers', src: '/images/work/cut-24.jpg', tall: false },
    { title: 'Low Fade Lineup', category: 'fades', src: '/images/work/cut-25.jpg', tall: true },
    { title: 'Curly High Top', category: 'fades', src: '/images/work/cut-26.jpg', tall: true },
    { title: 'Mullet Taper', category: 'tapers', src: '/images/work/cut-27.jpg', tall: false },
    { title: 'Fade + Lineup', category: 'fades', src: '/images/work/cut-28.jpg', tall: true },
    { title: 'Braids + Design', category: 'designs', src: '/images/work/cut-29.jpg', tall: true },
    { title: 'Fade + Lineup', category: 'fades', src: '/images/work/cut-30.jpg', tall: true },
  ] as PortfolioItem[],

  // Before/after pair. To swap in another, drop both shots in public/images/work/
  // and point these at them — shoot the pair from the same angle so it wipes cleanly.
  beforeAfter: {
    before: '/images/work/before-01.jpg',
    after: '/images/work/after-01.jpg',
    label: 'Cut + beard sculpt transformation',
  },

  // Real 5-star reviews pulled from Booksy (JuFaded: 5.0 · 57 reviews).
  // Add/replace anytime; set photo to '/images/reviews/name.jpg' or leave '' for
  // a clean initials avatar.
  reviewStats: { rating: '5.0', count: 57, source: 'Booksy' },
  reviews: [
    { name: 'Devon W.', text: '10 outta 10!! Knows how to cut, he’s clean, good music, good vibes. Went off a recommendation — and I recommend him to y’all! 🔥🔥', photo: '' },
    { name: 'Renaldo F.', text: 'Blending skills are top-tier. Made the impossible, POSSIBLE! People’s person.', photo: '' },
    { name: 'Maxwell S.', text: 'Quality haircuts anytime you can book with him. Fades, blowouts, simple lineups always come out top notch.', photo: '' },
    { name: 'C. H.', text: 'The shop is welcoming and the service is always top-notch. My son leaves feeling confident after every visit. Highly recommend — and the prices are good. 👍🏽', photo: '' },
    { name: 'Kobe F.', text: 'I go to him on the regular. Pays attention to detail. HIGHLY RECOMMENDED.', photo: '' },
    { name: 'Ruby A.', text: 'Best barber in Broward — check him out, you won’t be disappointed. 💯💯', photo: '' },
    { name: 'Kevin T.', text: 'After I get my cut, I run errands just so I can show off my haircut.', photo: '' },
    { name: 'Anne R.', text: '10/10 the best!!!! Great cut, excellent service — best barber my son has gone to.', photo: '' },
    { name: 'Moi T.', text: 'Best barber — any style you need, he can achieve.', photo: '' },
  ] as ReviewItem[],

  // Suite experience highlights — photos go in public/images/suite/
  suite: {
    photos: ['/images/suite/suite-01.jpg', '/images/suite/suite-02.jpg'], // add more anytime
    highlights: [
      { title: 'Private, one-on-one', text: 'The suite is yours for the whole appointment. No walk-ins, no audience.' },
      { title: 'Clean, every time', text: 'Fresh capes, sanitized tools, and a spotless chair for every single client.' },
      { title: 'The right atmosphere', text: 'Curated playlists, dialed lighting, and a comfortable chair you won’t want to leave.' },
      { title: 'On your schedule', text: 'Appointment-only means your time is respected — in the chair at your booked time.' },
    ],
  },

  // SEO — REPLACE the city/region with yours so local search finds you.
  seo: {
    title: 'JuFaded | Premium Private Suite Barber',
    description:
      'JuFaded is a premium private-suite barber experience. Skin fades, tapers, beard sculpting, and designs — one-on-one appointments, no waiting room. Book your next cut today.',
    city: 'Pompano Beach', // REPLACE if different
    region: 'FL', // REPLACE with your state (Broward County noted from reviews)
    // The live domain. Canonical URL, sitemap, share card, and JSON-LD all build
    // from this — if the site ends up on a different host (e.g. a .vercel.app
    // subdomain), point this at whatever URL clients actually visit.
    url: 'https://jufaded.com',
  },
}

export type ServiceItem = {
  name: string
  price: number
  /** Optional — only rendered when set, so no appointment length is invented. */
  duration?: string
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
