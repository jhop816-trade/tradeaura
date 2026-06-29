'use client'
import { DayPicker, type DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { eachDayOfInterval, parseISO } from 'date-fns'

interface Props {
  selected: DateRange | undefined
  onSelect: (range: DateRange | undefined) => void
  bookedRanges: { start_date: string; end_date: string }[]
}

export default function BookingCalendar({ selected, onSelect, bookedRanges }: Props) {
  const disabledDays = [
    { before: new Date() },
    ...bookedRanges.flatMap(r =>
      eachDayOfInterval({ start: parseISO(r.start_date), end: parseISO(r.end_date) })
    ),
  ]

  return (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={onSelect}
      disabled={disabledDays}
      numberOfMonths={1}
      className="!font-sans"
    />
  )
}
