import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import type { Vehicle } from '@/types'

export const metadata: Metadata = {
  title: 'Fleet',
  description: 'Browse our 2026 Tesla Model Y and 2020 Mercedes-Benz CLA 35 AMG — both available for private daily rental in South Florida.',
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
    <div className="bg-black min-h-screen pt-[76px]">
      <div className="max-w-6xl mx-auto px-8 md:px-20 py-24">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Our Collection</p>
        <h1 className="font-playfair font-black text-5xl md:text-6xl leading-none text-white tracking-tight mb-6">The Fleet</h1>
        <p className="text-white/40 text-[15px] max-w-lg leading-relaxed mb-20">
          Two personally owned and maintained vehicles — detailed before every rental, ready when you are. Book direct and skip the platform fees.
        </p>

        <div className="flex flex-col gap-1">
          {vehicles.map((vehicle, i) => (
            <div key={vehicle.id} className={`grid grid-cols-1 md:grid-cols-2 bg-[#0f0f0f] border border-white/6 overflow-hidden min-h-[400px] ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
              <div className={`relative overflow-hidden min-h-[260px] md:min-h-0 ${i % 2 === 1 ? '[direction:ltr]' : ''}`}>
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#D4A853] z-10" />
                {vehicle.photos?.[0] ? (
                  <Image src={vehicle.photos[0]} alt={vehicle.name} fill className="object-cover saturate-80 brightness-90 hover:scale-[1.03] transition-transform duration-700" sizes="(max-width: 768px) 100vw, 50vw" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
                )}
              </div>
              <div className={`flex flex-col justify-center p-10 md:p-14 ${i % 2 === 1 ? '[direction:ltr]' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-px bg-[#D4A853]" />
                  <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#D4A853]">{vehicle.make}</span>
                </div>
                <h2 className="font-playfair font-bold text-4xl text-white leading-tight mb-4">{vehicle.name}</h2>
                <p className="text-sm text-white/45 leading-relaxed mb-9">{vehicle.description}</p>
                <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/6 mb-9">
                  {[
                    { val: `$${vehicle.daily_rate}`, label: 'Per day' },
                    { val: `$${vehicle.deposit_amount}`, label: 'Deposit' },
                    { val: `${vehicle.mileage_limit}mi`, label: 'Daily limit' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="font-bold text-2xl text-white leading-none mb-1">{s.val}</div>
                      <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-white/30">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <Link href={`/booking?vehicle=${vehicle.slug}`} className="bg-[#D4A853] text-black px-8 py-3.5 text-[11px] font-bold tracking-[0.14em] uppercase hover:bg-[#e8c278] transition-colors">Book Now</Link>
                  <Link href={`/fleet/${vehicle.slug}`} className="border border-white/20 text-white px-6 py-3.5 text-[11px] font-medium tracking-[0.12em] uppercase hover:border-[#D4A853] hover:text-[#D4A853] transition-colors">Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
