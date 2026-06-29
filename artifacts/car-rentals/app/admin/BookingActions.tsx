'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  bookingId: string
  currentStatus: string
}

const TRANSITIONS: Record<string, { label: string; next: string; color: string }[]> = {
  pending: [
    { label: 'Confirm', next: 'confirmed', color: 'bg-[#D4A853] hover:bg-[#e8c278] text-black' },
    { label: 'Cancel', next: 'cancelled', color: 'bg-red-900/40 hover:bg-red-900/60 text-red-400' },
  ],
  confirmed: [
    { label: 'Complete', next: 'completed', color: 'bg-white/10 hover:bg-white/20 text-white' },
    { label: 'Cancel', next: 'cancelled', color: 'bg-red-900/40 hover:bg-red-900/60 text-red-400' },
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
          className={`text-xs px-3 py-1.5 font-bold tracking-wider uppercase transition-colors disabled:opacity-50 ${a.color}`}
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}
