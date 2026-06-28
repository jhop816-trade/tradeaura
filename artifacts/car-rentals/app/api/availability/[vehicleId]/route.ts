import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const { vehicleId } = await params
  try {
    const supabase = await createServiceClient()
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('bookings')
      .select('start_date, end_date')
      .eq('vehicle_id', vehicleId)
      .or(
        `status.eq.confirmed,and(status.eq.pending,created_at.gte.${thirtyMinutesAgo})`
      )
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
