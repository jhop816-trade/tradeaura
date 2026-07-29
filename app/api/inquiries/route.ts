import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, vehicle_id, preferred_dates, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const { error } = await supabase.from('inquiries').insert({
      name, phone: phone ?? '', email,
      vehicle_id: vehicle_id ?? null,
      preferred_dates: preferred_dates ?? '',
      message,
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to submit inquiry.' }, { status: 500 })
  }
}
