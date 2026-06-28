import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import type { Vehicle } from '@/types'
import PhotoCarousel from '@/components/PhotoCarousel'

async function getVehicle(slug: string): Promise<Vehicle | null> {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase.from('vehicles').select('*').eq('slug', slug).eq('active', true).single()
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const vehicle = await getVehicle(slug)
  if (!vehicle) return {}
  return {
    title: vehicle.name,
    description: vehicle.description,
  }
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const vehicle = await getVehicle(slug)
  if (!vehicle) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <PhotoCarousel photos={vehicle.photos} alt={vehicle.name} />

        <div>
          <h1 className="text-3xl font-bold">{vehicle.name}</h1>
          <p className="text-gray-500 mt-1">{vehicle.year} {vehicle.make} {vehicle.model}</p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Daily Rate', value: `$${vehicle.daily_rate}` },
              { label: 'Deposit', value: `$${vehicle.deposit_amount}` },
              { label: 'Mileage Limit', value: `${vehicle.mileage_limit} mi/day` },
              { label: 'Balance Due', value: 'At pickup' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</p>
                <p className="font-bold text-lg mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-600 mt-6 leading-relaxed">{vehicle.description}</p>

          <div className="mt-8 flex gap-3">
            <Link href={`/booking?vehicle=${vehicle.slug}`}
              className="flex-1 bg-black text-white text-center py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
              Book This Vehicle
            </Link>
            <Link href="/contact"
              className="border border-gray-200 px-5 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
              Ask a Question
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">What's Included</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
          {['Full insurance coverage', 'Roadside assistance', 'Full tank/charge at pickup', 'Clean, detailed vehicle', '24/7 owner support', 'Flexible pickup/dropoff'].map(item => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-green-500">✓</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Requirements</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
          {[
            'Valid driver\'s license (21+ years old)',
            'Full coverage auto insurance',
            'Major credit or debit card for deposit',
            'Clean driving record (no DUI/reckless driving)',
            'Must be primary driver listed on booking',
            'No smoking in vehicle',
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">→</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
