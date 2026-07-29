import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getBlockedRanges } from '@/lib/availability'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const { vehicleId } = await params
  try {
    const supabase = await createServiceClient()
    return NextResponse.json(await getBlockedRanges(supabase, vehicleId))
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
