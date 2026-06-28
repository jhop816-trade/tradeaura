import Image from 'next/image'
import Link from 'next/link'
import type { Vehicle } from '@/types'

interface Props {
  vehicle: Vehicle
  compact?: boolean
}

export default function VehicleCard({ vehicle, compact = false }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="relative aspect-video">
        <Image
          src={vehicle.photos[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'}
          alt={vehicle.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-lg">{vehicle.name}</h3>
            <p className="text-sm text-gray-500">{vehicle.year} · {vehicle.mileage_limit} mi/day</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-xl">${vehicle.daily_rate}</p>
            <p className="text-xs text-gray-400">per day</p>
          </div>
        </div>
        {!compact && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{vehicle.description}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Link href={`/booking?vehicle=${vehicle.slug}`}
            className="flex-1 bg-black text-white text-sm font-medium py-2 rounded-lg text-center hover:bg-gray-800 transition-colors">
            Book Now
          </Link>
          <Link href={`/fleet/${vehicle.slug}`}
            className="flex-1 border border-gray-200 text-sm font-medium py-2 rounded-lg text-center hover:bg-gray-50 transition-colors">
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
