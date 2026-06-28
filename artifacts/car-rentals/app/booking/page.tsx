import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import BookingForm from '@/components/BookingForm'
import type { Vehicle } from '@/types'

export const metadata: Metadata = {
  title: 'Book a Vehicle',
  description: 'Check availability and book your Tesla or Mercedes-Benz rental online.',
}

async function getVehicles(): Promise<Vehicle[]> {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase.from('vehicles').select('*').eq('active', true)
    return data ?? []
  } catch {
    return []
  }
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>
}) {
  const { vehicle } = await searchParams
  const vehicles = await getVehicles()

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Book a Vehicle</h1>
      <p className="text-gray-500 mb-10">
        Select your vehicle, pick your dates, and pay the deposit online.
        We'll reach out to confirm pickup details.
      </p>
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-8 text-sm text-amber-800">
        <strong>Cancellation policy:</strong> Deposits are fully refundable if cancelled 48+ hours before pickup. Cancellations within 48 hours are non-refundable.
      </div>
      {vehicles.length === 0 ? (
        <p className="text-gray-400">No vehicles available at this time. Please check back soon.</p>
      ) : (
        <BookingForm vehicles={vehicles} defaultVehicleSlug={vehicle} />
      )}
    </div>
  )
}
