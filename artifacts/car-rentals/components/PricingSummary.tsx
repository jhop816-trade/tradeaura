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
    <div className="bg-gray-50 rounded-2xl p-6 space-y-3 text-sm">
      <h3 className="font-semibold text-base">Pricing Summary</h3>
      <div className="flex justify-between">
        <span className="text-gray-500">${vehicle.daily_rate}/day × {days} {days === 1 ? 'day' : 'days'}</span>
        <span className="font-medium">${rentalTotal}</span>
      </div>
      <div className="flex justify-between text-green-700 font-medium">
        <span>Deposit due today</span>
        <span>${vehicle.deposit_amount}</span>
      </div>
      <div className="border-t pt-3 flex justify-between text-gray-500">
        <span>Balance due at pickup</span>
        <span>${Math.max(0, balance)}</span>
      </div>
    </div>
  )
}
