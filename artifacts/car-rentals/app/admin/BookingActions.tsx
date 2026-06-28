'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  bookingId: string
  currentStatus: string
}

const TRANSITIONS: Record<string, { label: string; next: string; color: string }[]> = {
  pending: [
    { label: 'Confirm', next: 'confirmed', color: 'bg-green-600 hover:bg-green-700 text-white' },
    { label: 'Cancel', next: 'cancelled', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
  ],
  confirmed: [
    { label: 'Complete', next: 'completed', color: 'bg-gray-800 hover:bg-gray-900 text-white' },
    { label: 'Cancel', next: 'cancelled', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
  ],
  completed: [],
  cancelled: [],
}

export default function BookingActions({ bookingId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const actions = TRANSITIONS[currentStatus] ?? []
  if (actions.length === 0) return null

  async function updateStatus(next: string) {
    setLoading(true)
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map(a => (
        <button
          key={a.next}
          disabled={loading}
          onClick={() => updateStatus(a.next)}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${a.color}`}
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}
