import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { vehicle_id, start_date, end_date, client_name, client_email, client_phone } = body

    if (!vehicle_id || !start_date || !end_date || !client_name || !client_email || !client_phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const { data: vehicle, error: vErr } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicle_id)
      .eq('active', true)
      .single()

    if (vErr || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Check for conflicting confirmed bookings
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('vehicle_id', vehicle_id)
      .eq('status', 'confirmed')
      .or(`start_date.lte.${end_date},end_date.gte.${start_date}`)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: 'Those dates are no longer available. Please choose different dates.' }, { status: 409 })
    }

    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .insert({
        vehicle_id,
        client_name,
        client_email,
        client_phone,
        start_date,
        end_date,
        status: 'pending',
        source: 'website',
      })
      .select()
      .single()

    if (bErr || !booking) {
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3002'

    const days = Math.max(1, Math.round((new Date(end_date).getTime() - new Date(start_date).getTime()) / 86400000))
    const rentalTotal = days * vehicle.daily_rate

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${vehicle.name} Rental`,
              description: `Rental: ${start_date} → ${end_date} (${days} ${days === 1 ? 'day' : 'days'})`,
            },
            unit_amount: Math.round(rentalTotal * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: client_email,
      metadata: {
        booking_id: booking.id,
        vehicle_id,
        client_name,
        client_phone,
      },
      success_url: `${siteUrl}/booking/success`,
      cancel_url: `${siteUrl}/booking`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
