/**
 * ⚠️  DEMO DATA — NOT REAL INVENTORY, NOT REAL CUSTOMERS.
 *
 * Every record here is fictional placeholder content used to build and review
 * the Phase 1 interface. None of it describes vehicles the client owns, and
 * none of the reviews came from a real customer.
 *
 * This module is replaced wholesale in Phase 2 by Supabase-backed queries.
 * Nothing outside `lib/` should import it directly — components take data as
 * props so the swap is a one-line change at the page level.
 *
 * The UI surfaces `IS_DEMO_DATA` as a visible banner. Do not set it to false
 * until real inventory is actually being served.
 */

import type { CustomerStory, MembershipTier, Review, Vehicle } from './types'

export const IS_DEMO_DATA = true

export const demoFleet: readonly Vehicle[] = [
  {
    id: 'demo-1',
    slug: 'lamborghini-urus',
    name: 'Urus',
    make: 'Lamborghini',
    model: 'Urus',
    year: 2024,
    category: 'Luxury SUV',
    dailyRate: 1295,
    depositAmount: 2500,
    specs: { horsepower: 641, zeroToSixty: 3.5, seats: 5, transmission: 'Automatic', milesPerDay: 150 },
    availability: 'available',
    photos: [],
    description:
      'Sample record. The super-SUV that made the category — supercar pace with room for five and their luggage.',
    instantBooking: true,
  },
  {
    id: 'demo-2',
    slug: 'rolls-royce-ghost',
    name: 'Ghost',
    make: 'Rolls-Royce',
    model: 'Ghost',
    year: 2023,
    category: 'Luxury Sedan',
    dailyRate: 1650,
    depositAmount: 3500,
    specs: { horsepower: 563, zeroToSixty: 4.6, seats: 5, transmission: 'Automatic', milesPerDay: 100 },
    availability: 'reserved',
    photos: [],
    description:
      'Sample record. Effortless, near-silent, and the most requested vehicle for weddings and arrivals.',
    instantBooking: false,
  },
  {
    id: 'demo-3',
    slug: 'ferrari-488-spider',
    name: '488 Spider',
    make: 'Ferrari',
    model: '488 Spider',
    year: 2022,
    category: 'Convertible',
    dailyRate: 1495,
    depositAmount: 3000,
    specs: { horsepower: 661, zeroToSixty: 3.0, seats: 2, transmission: 'Dual-Clutch', milesPerDay: 100 },
    availability: 'available',
    photos: [],
    description:
      'Sample record. Roof down, V8 behind your shoulders. The one people book to remember the weekend.',
    instantBooking: true,
  },
  {
    id: 'demo-4',
    slug: 'mclaren-720s',
    name: '720S',
    make: 'McLaren',
    model: '720S',
    year: 2023,
    category: 'Supercar',
    dailyRate: 1795,
    depositAmount: 4000,
    specs: { horsepower: 710, zeroToSixty: 2.8, seats: 2, transmission: 'Dual-Clutch', milesPerDay: 100 },
    availability: 'maintenance',
    photos: [],
    description:
      'Sample record. Dihedral doors, carbon tub, and the kind of acceleration that rearranges your priorities.',
    instantBooking: false,
  },
  {
    id: 'demo-5',
    slug: 'mercedes-g63-amg',
    name: 'G 63 AMG',
    make: 'Mercedes-Benz',
    model: 'G 63 AMG',
    year: 2024,
    category: 'Luxury SUV',
    dailyRate: 895,
    depositAmount: 2000,
    specs: { horsepower: 577, zeroToSixty: 4.5, seats: 5, transmission: 'Automatic', milesPerDay: 150 },
    availability: 'available',
    photos: [],
    description:
      'Sample record. Squared-off, unmistakable, and equally at home at a resort entrance or a job site.',
    instantBooking: true,
  },
  {
    id: 'demo-6',
    slug: 'porsche-911-turbo-s',
    name: '911 Turbo S',
    make: 'Porsche',
    model: '911 Turbo S',
    year: 2023,
    category: 'Sports Car',
    dailyRate: 1095,
    depositAmount: 2500,
    specs: { horsepower: 640, zeroToSixty: 2.6, seats: 4, transmission: 'Dual-Clutch', milesPerDay: 150 },
    availability: 'pending_approval',
    photos: [],
    description:
      'Sample record. The supercar you can actually drive every day, and the quickest way to any airport.',
    instantBooking: false,
  },
]

/**
 * ⚠️  Sample text written as layout filler. These are not real testimonials
 * and must not be published. Phase 5 replaces this with moderated reviews
 * tied to completed rentals.
 */
export const demoReviews: readonly Review[] = [
  {
    id: 'demo-r1',
    author: 'Sample Review',
    rating: 5,
    vehicleName: 'Lamborghini Urus',
    body: 'Placeholder testimonial copy used to size and style the review card. Replace with a verified customer review before launch.',
    date: '2026-06-14',
    verified: true,
  },
  {
    id: 'demo-r2',
    author: 'Sample Review',
    rating: 5,
    vehicleName: 'Rolls-Royce Ghost',
    body: 'Placeholder testimonial copy demonstrating a longer entry, so the grid can be checked against uneven content lengths before real reviews arrive.',
    date: '2026-05-30',
    verified: true,
  },
  {
    id: 'demo-r3',
    author: 'Sample Review',
    rating: 5,
    vehicleName: 'Ferrari 488 Spider',
    body: 'Placeholder testimonial copy. Short entry, used to confirm the card still balances beside longer ones.',
    date: '2026-05-02',
    verified: false,
  },
]

/**
 * ⚠️  Illustrative tier structure — names and qualitative benefits only.
 * No pricing, points thresholds or enrollment mechanism exists yet; none is
 * invented here. Full terms are published, and an actual way to join is
 * built, before this goes live.
 */
export const demoMembershipTiers: readonly MembershipTier[] = [
  {
    id: 'signature',
    name: 'Signature',
    tagline: 'For the regular renter',
    benefits: ['Priority booking during peak periods', 'Waived delivery fee within the service area', 'Direct line to the concierge'],
    featured: false,
  },
  {
    id: 'reserve',
    name: 'Reserve',
    tagline: 'For the standing plan',
    benefits: ['Everything in Signature', 'First access to new arrivals', 'Flexible cancellation window', 'Complimentary vehicle swap, once per rental'],
    featured: true,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tagline: 'For the account, not the rental',
    benefits: ['Everything in Reserve', 'Dedicated account concierge', 'Airport meet-and-greet handoff', 'Rates held for the season'],
    featured: false,
  },
]

/**
 * ⚠️  Fictional narrative vignettes, not real customer accounts. Same rule
 * as demoReviews — replace with real, moderated stories before launch.
 */
export const demoStories: readonly CustomerStory[] = [
  {
    id: 'story-1',
    occasion: 'Wedding',
    vehicleName: 'Rolls-Royce Ghost',
    title: 'The arrival',
    body: 'Sample story. Booked for a Saturday morning ceremony — the Ghost was staged curbside twenty minutes early, engine off, doors held. Nobody was watching the time anymore.',
  },
  {
    id: 'story-2',
    occasion: 'Airport',
    vehicleName: 'Porsche 911 Turbo S',
    title: 'The delayed flight',
    body: "Sample story. Landed three hours late into a red-eye connection. The concierge had already pushed the pickup window — car was waiting, no rebooking fee, no conversation needed.",
  },
  {
    id: 'story-3',
    occasion: 'Weekend Escape',
    vehicleName: 'Ferrari 488 Spider',
    title: 'The long way back',
    body: 'Sample story. Two days became three. A short call moved the return date and adjusted the total on the spot — no desk, no line, no surprise at drop-off.',
  },
]
