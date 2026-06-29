import Image from 'next/image'
import Link from 'next/link'
import type { Vehicle } from '@/types'

interface Props {
  vehicle: Vehicle
  compact?: boolean
}

export default function VehicleCard({ vehicle, compact = false }: Props) {
  return (
    <div className="bg-[#0f0f0f] border border-white/6 overflow-hidden group">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={vehicle.photos[0] || '/images/placeholder.jpg'}
          alt={vehicle.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="font-playfair font-bold text-xl text-white">{vehicle.name}</h3>
            <p className="text-sm text-white/30 mt-0.5">{vehicle.year} · {vehicle.mileage_limit} mi/day</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-2xl text-white">${vehicle.daily_rate}</p>
            <p className="text-xs text-white/30">per day</p>
          </div>
        </div>
        {!compact && (
          <p className="text-sm text-white/50 leading-relaxed line-clamp-2 mb-5">{vehicle.description}</p>
        )}
        <div className="flex gap-3">
          <Link href={`/booking?vehicle=${vehicle.slug}`}
            className="flex-1 bg-[#D4A853] text-black text-[11px] font-bold tracking-[0.14em] uppercase py-3 text-center hover:bg-[#e8c278] transition-colors">
            Book Now
          </Link>
          <Link href={`/fleet/${vehicle.slug}`}
            className="flex-1 border border-white/12 text-white text-[11px] font-bold tracking-[0.14em] uppercase py-3 text-center hover:border-white/30 hover:bg-white/4 transition-colors">
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
