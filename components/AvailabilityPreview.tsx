'use client'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { eachDayOfInterval, parseISO } from 'date-fns'
import type { DateRangeRow } from '@/types'

interface Props {
  blockedRanges: DateRangeRow[]
}

/**
 * Read-only month view of when a vehicle is already committed. The booking
 * calendar enforces the same ranges — this is just so people can eyeball it
 * before starting a reservation.
 */
export default function AvailabilityPreview({ blockedRanges }: Props) {
  const disabled = [
    { before: new Date() },
    ...blockedRanges.flatMap(r =>
      eachDayOfInterval({ start: parseISO(r.start_date), end: parseISO(r.end_date) })
    ),
  ]

  return (
    <div>
      <div className="border border-white/10 p-4 inline-block bg-[#0f0f0f]">
        <DayPicker
          disabled={disabled}
          numberOfMonths={2}
          className="!font-sans"
        />
      </div>
      <div className="flex items-center gap-6 mt-5 text-xs text-white/40">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#D4A853]" /> Open
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-white/15" /> Booked or unavailable
        </span>
      </div>
    </div>
  )
}
