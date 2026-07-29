import { createServiceClient } from '@/lib/supabase/server'
import type { Blackout, Vehicle } from '@/types'
import VehicleManager from './VehicleManager'

export default async function AdminVehiclesPage() {
  const supabase = await createServiceClient()

  const [vehiclesRes, blackoutsRes] = await Promise.all([
    supabase.from('vehicles').select('*').order('name'),
    supabase.from('vehicle_blackouts').select('*').order('start_date'),
  ])

  const vehicles = (vehiclesRes.data ?? []) as Vehicle[]
  const blackouts = (blackoutsRes.data ?? []) as Blackout[]

  return (
    <div className="max-w-6xl mx-auto">
      <VehicleManager
        vehicles={vehicles}
        blackouts={blackouts}
        blackoutsUnavailable={Boolean(blackoutsRes.error)}
      />
    </div>
  )
}
