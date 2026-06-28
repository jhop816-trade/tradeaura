import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const { vehicleId } = await params
  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('start_date, end_date')
      .eq('vehicle_id', vehicleId)
      .in('status', ['pending', 'confirmed'])
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
