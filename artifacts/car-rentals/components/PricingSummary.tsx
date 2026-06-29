import { differenceInCalendarDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import type { Vehicle } from '@/types'

interface Props {
  vehicle: Vehicle
  dateRange: DateRange | undefined
}

export default function PricingSummary({ vehicle, dateRange }: Props) {
  const days = dateRange?.from && dateRange?.to
    ? Math.max(1, differenceInCalendarDays(dateRange.to, dateRange.from))
    : 0

  const rentalTotal = days * vehicle.daily_rate
  const balance = rentalTotal - vehicle.deposit_amount

  if (days === 0) return null

  return (
    <div className="bg-[#0f0f0f] border border-white/10 p-6 space-y-3 text-sm">
      <h3 className="font-playfair font-bold text-base text-white">Pricing Summary</h3>
      <div className="flex justify-between text-white/50">
        <span>${vehicle.daily_rate}/day × {days} {days === 1 ? 'day' : 'days'}</span>
        <span className="text-white font-medium">${rentalTotal}</span>
      </div>
      <div className="flex justify-between font-medium">
        <span className="text-white/50">Deposit due today</span>
        <span className="text-[#D4A853]">${vehicle.deposit_amount}</span>
      </div>
      <div className="border-t border-white/10 pt-3 flex justify-between text-white/30">
        <span>Balance due at pickup</span>
        <span>${Math.max(0, balance)}</span>
      </div>
    </div>
  )
}
