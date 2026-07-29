'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  initialStart?: string
  initialEnd?: string
}

function today(): string {
  return new Date().toISOString().split('T')[0]!
}

export default function FleetSearch({ initialStart, initialEnd }: Props) {
  const router = useRouter()
  const [start, setStart] = useState(initialStart ?? '')
  const [end, setEnd] = useState(initialEnd ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!start || !end) {
      setError('Pick both a pickup and a return date.')
      return
    }
    if (end < start) {
      setError('The return date has to be on or after the pickup date.')
      return
    }
    setError('')
    router.push(`/fleet?start=${start}&end=${end}`)
  }

  function handleClear() {
    setStart('')
    setEnd('')
    setError('')
    router.push('/fleet')
  }

  const inputClass =
    'w-full bg-[#0f0f0f] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#D4A853] transition-colors [color-scheme:dark]'
  const labelClass =
    'block text-[10px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2'

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0f0f0f] border border-white/6 p-6 md:p-8 mb-16"
    >
      <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-5">
        Check Availability
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 sm:items-end">
        <div>
          <label htmlFor="fleet-start" className={labelClass}>Pickup</label>
          <input
            id="fleet-start"
            type="date"
            value={start}
            min={today()}
            onChange={e => setStart(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="fleet-end" className={labelClass}>Return</label>
          <input
            id="fleet-end"
            type="date"
            value={end}
            min={start || today()}
            onChange={e => setEnd(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 sm:flex-none bg-[#D4A853] text-black px-8 py-3 text-[11px] font-bold tracking-[0.14em] uppercase hover:bg-[#e8c278] transition-colors"
          >
            Search
          </button>
          {(initialStart || initialEnd) && (
            <button
              type="button"
              onClick={handleClear}
              className="border border-white/20 text-white/60 px-5 py-3 text-[11px] font-medium tracking-[0.12em] uppercase hover:border-white/40 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
    </form>
  )
}
