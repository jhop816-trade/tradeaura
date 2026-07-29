import type { SupabaseClient } from '@supabase/supabase-js'
import type { DateRangeRow } from '@/types'

type DB = SupabaseClient<any, any, any>

/**
 * A pending booking holds the vehicle for this long while the customer finishes
 * checkout. After that the hold lapses and the dates open back up.
 */
export const PENDING_HOLD_MINUTES = 30

function pendingHoldCutoff(): string {
  return new Date(Date.now() - PENDING_HOLD_MINUTES * 60 * 1000).toISOString()
}

/**
 * Matches confirmed bookings plus pending ones still inside their hold window.
 */
function activeBookingFilter(): string {
  return `status.eq.confirmed,and(status.eq.pending,created_at.gte.${pendingHoldCutoff()})`
}

/** Dates are stored as `date` (YYYY-MM-DD), so string compare is date compare. */
export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && bStart <= aEnd
}

/**
 * Every range a vehicle is unavailable for: live bookings and owner blackouts.
 */
export async function getBlockedRanges(supabase: DB, vehicleId: string): Promise<DateRangeRow[]> {
  const [bookings, blackouts] = await Promise.all([
    supabase
      .from('bookings')
      .select('start_date, end_date')
      .eq('vehicle_id', vehicleId)
      .or(activeBookingFilter()),
    supabase
      .from('vehicle_blackouts')
      .select('start_date, end_date')
      .eq('vehicle_id', vehicleId),
  ])

  if (bookings.error) throw bookings.error
  if (blackouts.error) throw blackouts.error

  return [...(bookings.data ?? []), ...(blackouts.data ?? [])] as DateRangeRow[]
}

/**
 * Vehicle ids that are blocked for any part of [start, end], in one round trip
 * per table rather than one per vehicle.
 */
export async function getUnavailableVehicleIds(
  supabase: DB,
  start: string,
  end: string
): Promise<Set<string>> {
  const [bookings, blackouts] = await Promise.all([
    supabase
      .from('bookings')
      .select('vehicle_id')
      .lte('start_date', end)
      .gte('end_date', start)
      .or(activeBookingFilter()),
    supabase
      .from('vehicle_blackouts')
      .select('vehicle_id')
      .lte('start_date', end)
      .gte('end_date', start),
  ])

  if (bookings.error) throw bookings.error
  if (blackouts.error) throw blackouts.error

  const blocked = new Set<string>()
  for (const row of bookings.data ?? []) blocked.add(row.vehicle_id as string)
  for (const row of blackouts.data ?? []) blocked.add(row.vehicle_id as string)
  return blocked
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Returns the pair only if both are well-formed and correctly ordered. */
export function parseDateRange(
  start: string | undefined,
  end: string | undefined
): { start: string; end: string } | null {
  if (!start || !end) return null
  if (!ISO_DATE.test(start) || !ISO_DATE.test(end)) return null
  if (Number.isNaN(Date.parse(start)) || Number.isNaN(Date.parse(end))) return null
  if (end < start) return null
  return { start, end }
}
