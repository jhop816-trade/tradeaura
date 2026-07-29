import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-auth'
import { parseDateRange } from '@/lib/availability'

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { vehicle_id, start_date, end_date, reason } = body as Record<string, unknown>
  if (typeof vehicle_id !== 'string' || vehicle_id === '') {
    return NextResponse.json({ error: 'Pick a vehicle.' }, { status: 400 })
  }

  const range = parseDateRange(
    typeof start_date === 'string' ? start_date : undefined,
    typeof end_date === 'string' ? end_date : undefined
  )
  if (!range) {
    return NextResponse.json(
      { error: 'Enter a valid start and end date, with the end on or after the start.' },
      { status: 400 }
    )
  }

  const supabase = await createServiceClient()

  // Blocking dates that are already sold would leave the customer holding a
  // booking the car can't honour, so surface the clash instead of hiding it.
  const { data: clashes } = await supabase
    .from('bookings')
    .select('start_date, end_date, client_name')
    .eq('vehicle_id', vehicle_id)
    .eq('status', 'confirmed')
    .lte('start_date', range.end)
    .gte('end_date', range.start)

  if (clashes && clashes.length > 0) {
    const first = clashes[0] as { start_date: string; end_date: string; client_name: string }
    return NextResponse.json(
      {
        error: `That overlaps a confirmed booking (${first.client_name}, ${first.start_date} → ${first.end_date}). Cancel it first if the car really is unavailable.`,
      },
      { status: 409 }
    )
  }

  const { data, error } = await supabase
    .from('vehicle_blackouts')
    .insert({
      vehicle_id,
      start_date: range.start,
      end_date: range.end,
      reason: typeof reason === 'string' ? reason.trim().slice(0, 200) : '',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ blackout: data }, { status: 201 })
}
