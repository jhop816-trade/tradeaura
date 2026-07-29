/**
 * Domain types. These mirror the database schema that lands in Phase 2, so the
 * Phase 1 UI is already written against the real shape rather than throwaway
 * props.
 */

export type VehicleCategory =
  | 'Supercar'
  | 'Luxury Sedan'
  | 'Luxury SUV'
  | 'Convertible'
  | 'Sports Car'

export type Transmission = 'Automatic' | 'Dual-Clutch' | 'Manual'

/**
 * Availability is a derived value in Phase 2 — computed from bookings and
 * owner blackouts. In Phase 1 it is part of the demo record so the UI can
 * render every state.
 */
export type AvailabilityStatus =
  | 'available'
  | 'reserved'
  | 'rented'
  | 'maintenance'
  | 'unavailable'
  | 'pending_approval'

export interface VehicleSpecs {
  horsepower: number
  zeroToSixty: number
  seats: number
  transmission: Transmission
  milesPerDay: number
}

export interface Vehicle {
  id: string
  slug: string
  name: string
  make: string
  model: string
  year: number
  category: VehicleCategory
  dailyRate: number
  depositAmount: number
  specs: VehicleSpecs
  availability: AvailabilityStatus
  /** Empty until the client's photography is supplied. */
  photos: string[]
  description: string
  instantBooking: boolean
}

export interface Review {
  id: string
  author: string
  rating: number
  vehicleName: string
  body: string
  date: string
  verified: boolean
}

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  rented: 'Out on rental',
  maintenance: 'In maintenance',
  unavailable: 'Unavailable',
  pending_approval: 'Pending approval',
}
