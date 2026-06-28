import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/VehicleCard'
import type { Vehicle } from '@/types'

export const metadata: Metadata = {
  title: 'Fleet',
  description: 'Browse our Tesla Model 3 and Mercedes-Benz C300 available for private daily rental.',
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

export default async function FleetPage() {
  const vehicles = await getVehicles()
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">Our Fleet</h1>
      <p className="text-gray-500 mb-12 max-w-xl">
        Two meticulously maintained vehicles ready for your next trip.
        Both include insurance, roadside assistance, and a full tank (or charge).
      </p>
      {vehicles.length === 0 ? (
        <p className="text-gray-400">Fleet details coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      )}
    </div>
  )
}
