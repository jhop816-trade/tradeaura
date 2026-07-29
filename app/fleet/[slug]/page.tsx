import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { getBlockedRanges } from '@/lib/availability'
import PhotoCarousel from '@/components/PhotoCarousel'
import AvailabilityPreview from '@/components/AvailabilityPreview'
import type { DateRangeRow, Vehicle } from '@/types'

async function getVehicle(slug: string): Promise<Vehicle | null> {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase.from('vehicles').select('*').eq('slug', slug).eq('active', true).single()
    return data
  } catch { return null }
}

async function getBlocked(vehicleId: string): Promise<DateRangeRow[] | null> {
  try {
    const supabase = await createServiceClient()
    return await getBlockedRanges(supabase, vehicleId)
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const vehicle = await getVehicle(slug)
  if (!vehicle) return {}
  return { title: vehicle.name, description: vehicle.description }
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const vehicle = await getVehicle(slug)
  if (!vehicle) notFound()

  const blockedRanges = await getBlocked(vehicle.id)

  return (
    <div className="bg-black min-h-screen pt-[76px]">
      <div className="max-w-6xl mx-auto px-8 md:px-20 py-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] text-white/30 mb-12 tracking-wider uppercase">
          <Link href="/fleet" className="hover:text-[#D4A853] transition-colors">Fleet</Link>
          <span>/</span>
          <span className="text-white/60">{vehicle.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <PhotoCarousel photos={vehicle.photos} alt={vehicle.name} />

          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-px bg-[#D4A853]" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853]">{vehicle.year} {vehicle.make}</span>
            </div>
            <h1 className="font-playfair font-black text-5xl text-white leading-tight mb-6">{vehicle.name}</h1>
            <p className="text-white/50 text-[15px] leading-relaxed mb-10">{vehicle.description}</p>

            <div className="grid grid-cols-2 gap-px bg-white/6 border border-white/6 mb-10">
              {[
                { label: 'Daily Rate', value: `$${vehicle.daily_rate}` },
                { label: 'Security Deposit', value: `$${vehicle.deposit_amount}` },
                { label: 'Mileage Limit', value: `${vehicle.mileage_limit} mi/day` },
                { label: 'Payment', value: 'Full online' },
              ].map(item => (
                <div key={item.label} className="bg-[#0f0f0f] p-5">
                  <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30 mb-2">{item.label}</p>
                  <p className="font-playfair font-bold text-2xl text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-12">
              <Link href={`/booking?vehicle=${vehicle.slug}`} className="flex-1 bg-[#D4A853] text-black text-center py-4 text-[11px] font-bold tracking-[0.14em] uppercase hover:bg-[#e8c278] transition-colors">
                Book This Vehicle
              </Link>
              <Link href="/contact" className="border border-white/20 px-6 py-4 text-[11px] font-medium tracking-[0.12em] uppercase text-white hover:border-[#D4A853] hover:text-[#D4A853] transition-colors">
                Ask a Question
              </Link>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="mt-20 pt-16 border-t border-white/6">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Availability</p>
          <h2 className="font-playfair font-bold text-3xl text-white mb-3">When You Can Take It</h2>
          <p className="text-white/40 text-sm max-w-lg leading-relaxed mb-8">
            Greyed-out days are already booked or blocked for maintenance. Pick your dates on the booking page
            and I&apos;ll confirm pickup details personally.
          </p>
          {blockedRanges === null ? (
            <p className="text-white/40 text-sm">
              Availability isn&apos;t loading right now — call or text and I&apos;ll check the calendar for you.
            </p>
          ) : (
            <AvailabilityPreview blockedRanges={blockedRanges} />
          )}
        </div>

        {/* What's Included */}
        <div className="mt-20 pt-16 border-t border-white/6">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Included</p>
          <h2 className="font-playfair font-bold text-3xl text-white mb-10">What's Included</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Full insurance coverage', 'Roadside assistance', 'Full tank/charge at pickup', 'Clean, detailed vehicle', '24/7 owner support', 'Flexible pickup/dropoff'].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                <span className="text-[#D4A853] text-base">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        <div className="mt-16">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Before You Book</p>
          <h2 className="font-playfair font-bold text-3xl text-white mb-10">Requirements</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["Valid driver's license (21+ years old)", 'Full coverage auto insurance', 'Major credit or debit card for deposit', 'Clean driving record (no DUI/reckless driving)', 'Must be primary driver listed on booking', 'No smoking in vehicle'].map(item => (
              <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                <span className="text-[#D4A853] mt-0.5">→</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
