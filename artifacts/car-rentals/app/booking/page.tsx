import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import BookingForm from '@/components/BookingForm'
import type { Vehicle } from '@/types'

export const metadata: Metadata = {
  title: 'Book a Vehicle',
  description: 'Check availability and book the Tesla Model Y or Mercedes CLA 35 AMG online.',
}

async function getVehicles(): Promise<Vehicle[]> {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase.from('vehicles').select('*').eq('active', true)
    return data ?? []
  } catch { return [] }
}

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ vehicle?: string }> }) {
  const { vehicle } = await searchParams
  const vehicles = await getVehicles()

  return (
    <div className="bg-black min-h-screen pt-[76px]">
      <div className="max-w-2xl mx-auto px-8 py-24">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Reserve</p>
        <h1 className="font-playfair font-black text-5xl text-white leading-tight mb-4">Book a Vehicle</h1>
        <p className="text-white/40 text-[15px] leading-relaxed mb-6">
          Select your vehicle, pick your dates, and pay the deposit online. I'll reach out personally to confirm pickup details.
        </p>

        <div className="bg-[#D4A853]/10 border border-[#D4A853]/20 px-5 py-4 mb-10 text-sm text-[#D4A853]">
          <strong>Cancellation policy:</strong> Deposits are fully refundable if cancelled 48+ hours before pickup. Cancellations within 48 hours are non-refundable.
        </div>

        {vehicles.length === 0 ? (
          <p className="text-white/40">No vehicles available at this time. Please check back soon.</p>
        ) : (
          <BookingForm vehicles={vehicles} defaultVehicleSlug={vehicle} />
        )}
      </div>
    </div>
  )
}
