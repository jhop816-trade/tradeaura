'use client'
import { useState, useEffect } from 'react'
import type { DateRange } from 'react-day-picker'
import type { Vehicle } from '@/types'
import BookingCalendar from './BookingCalendar'
import PricingSummary from './PricingSummary'

interface Props {
  vehicles: Vehicle[]
  defaultVehicleSlug?: string
}

export default function BookingForm({ vehicles, defaultVehicleSlug }: Props) {
  const defaultVehicle = vehicles.find(v => v.slug === defaultVehicleSlug) ?? vehicles[0]
  const [vehicleId, setVehicleId] = useState(defaultVehicle?.id ?? '')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [bookedRanges, setBookedRanges] = useState<{ start_date: string; end_date: string }[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedVehicle = vehicles.find(v => v.id === vehicleId)

  async function loadAvailability(id: string) {
    const res = await fetch(`/api/availability/${id}`)
    if (res.ok) setBookedRanges(await res.json())
  }

  useEffect(() => {
    if (vehicleId) loadAvailability(vehicleId)
  }, [vehicleId])

  async function handleVehicleChange(id: string) {
    setVehicleId(id)
    setDateRange(undefined)
    const res = await fetch(`/api/availability/${id}`)
    const data = await res.json()
    setBookedRanges(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dateRange?.from || !dateRange?.to || !name || !email || !phone) {
      setError('Please fill in all fields and select dates.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: vehicleId,
          start_date: dateRange.from.toISOString().split('T')[0],
          end_date: dateRange.to.toISOString().split('T')[0],
          client_name: name,
          client_email: email,
          client_phone: phone,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-[#0f0f0f] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#D4A853] transition-colors placeholder:text-white/20"

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/40 mb-3">Select Vehicle</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vehicles.map(v => (
            <button
              key={v.id}
              type="button"
              onClick={() => handleVehicleChange(v.id)}
              className={`p-4 border text-left transition-colors ${
                vehicleId === v.id
                  ? 'border-[#D4A853] bg-[#D4A853]/10 text-white'
                  : 'border-white/15 hover:border-white/30 text-white'
              }`}
            >
              <p className="font-semibold text-sm">{v.name}</p>
              <p className={`text-sm mt-0.5 ${vehicleId === v.id ? 'text-white/60' : 'text-white/40'}`}>
                ${v.daily_rate}/day · ${v.deposit_amount} deposit
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/40 mb-3">Select Dates</label>
        <div className="border border-white/10 p-4 inline-block">
          <BookingCalendar
            selected={dateRange}
            onSelect={setDateRange}
            bookedRanges={bookedRanges}
          />
        </div>
      </div>

      {selectedVehicle && <PricingSummary vehicle={selectedVehicle} dateRange={dateRange} />}

      <div className="space-y-4">
        <h3 className="font-playfair font-bold text-xl text-white">Your Information</h3>
        <div>
          <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2">Full Name</label>
          <input
            type="text" required value={name} onChange={e => setName(e.target.value)}
            className={inputClass}
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2">Email</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className={inputClass}
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2">Phone</label>
          <input
            type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !dateRange?.from || !dateRange?.to}
        className="w-full bg-[#D4A853] text-black py-4 text-[12px] font-bold tracking-[0.16em] uppercase hover:bg-[#e8c278] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing…' : 'Continue to Payment →'}
      </button>
      <p className="text-xs text-white/30 text-center">
        You'll pay the deposit securely via Stripe. Balance is due at pickup.
      </p>
    </form>
  )
}
