import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/VehicleCard'
import type { Vehicle } from '@/types'

async function getVehicles(): Promise<Vehicle[]> {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase.from('vehicles').select('*').eq('active', true)
    return data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const vehicles = await getVehicles()

  return (
    <>
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-24 md:py-36 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-4">Private Car Rentals</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Drive Something<br />Worth Remembering.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto mb-10">
            Tesla Model 3 and Mercedes-Benz C300 available for daily rental.
            No agency fees — direct, personal service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking"
              className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Book Now
            </Link>
            <Link href="/fleet"
              className="border border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              View Fleet
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {[
          { icon: '🚗', title: 'Premium Vehicles', desc: 'Meticulously maintained Tesla and Mercedes-Benz — always clean and fully charged.' },
          { icon: '💬', title: 'Personal Service', desc: 'Deal directly with the owner, not a call center. Fast responses, flexible options.' },
          { icon: '💳', title: 'Easy Online Booking', desc: 'Secure deposit via Stripe. Remaining balance due at pickup.' },
        ].map(v => (
          <div key={v.title} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-50">
            <span className="text-3xl">{v.icon}</span>
            <h3 className="font-semibold text-lg">{v.title}</h3>
            <p className="text-sm text-gray-500">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Fleet</h2>
        {vehicles.length === 0 ? (
          <p className="text-center text-gray-400">Fleet details coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        )}
      </section>

      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">What Renters Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Alex M.', text: 'Easiest rental experience ever. The Tesla was immaculate.', rating: 5 },
              { name: 'Brittany K.', text: 'Booked the Mercedes for my anniversary. Way better than Turo.', rating: 5 },
              { name: 'Jordan T.', text: 'Drove the Tesla for a week. Loved every minute. Highly recommend.', rating: 5 },
            ].map(r => (
              <div key={r.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{r.text}"</p>
                <p className="text-sm font-semibold text-gray-500">{r.name}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="/reviews" className="text-sm text-gray-500 hover:text-black underline underline-offset-2">Read all reviews →</a>
          </div>
        </div>
      </section>

      <section className="bg-black text-white py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to roll?</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">Check availability and lock in your dates in minutes.</p>
        <Link href="/booking"
          className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
          Check Availability
        </Link>
      </section>
    </>
  )
}
