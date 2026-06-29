import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { sendBookingConfirmation, sendOwnerAlert } from '@/lib/resend'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const bookingId = session.metadata?.booking_id
    if (!bookingId) return NextResponse.json({ received: true })

    try {
      const supabase = await createServiceClient()

      const { data: booking } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          deposit_paid: true,
          stripe_payment_id: session.payment_intent as string,
        })
        .eq('id', bookingId)
        .select('*, vehicles(name)')
        .single()

      if (booking) {
        const vehicleName = (booking.vehicles as { name: string } | null)?.name ?? 'Vehicle'
        await Promise.allSettled([
          sendBookingConfirmation({
            client_name: booking.client_name,
            client_email: booking.client_email,
            vehicle_name: vehicleName,
            start_date: booking.start_date,
            end_date: booking.end_date,
            deposit_amount: booking.deposit_amount ?? 0,
          }),
          sendOwnerAlert({
            client_name: booking.client_name,
            client_email: booking.client_email,
            client_phone: booking.client_phone,
            vehicle_name: vehicleName,
            start_date: booking.start_date,
            end_date: booking.end_date,
            deposit_amount: booking.deposit_amount ?? 0,
          }),
        ])
      }
    } catch (err) {
      console.error('Webhook processing error:', err)
    }
  }

  return NextResponse.json({ received: true })
}
