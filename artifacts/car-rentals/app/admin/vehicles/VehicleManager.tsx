'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Blackout, Vehicle } from '@/types'

interface Props {
  vehicles: Vehicle[]
  blackouts: Blackout[]
  blackoutsUnavailable: boolean
}

interface FormState {
  name: string
  make: string
  model: string
  year: string
  daily_rate: string
  deposit_amount: string
  mileage_limit: string
  slug: string
  description: string
  photos: string
  active: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  make: '',
  model: '',
  year: String(new Date().getFullYear()),
  daily_rate: '',
  deposit_amount: '',
  mileage_limit: '200',
  slug: '',
  description: '',
  photos: '',
  active: true,
}

function toForm(vehicle: Vehicle): FormState {
  return {
    name: vehicle.name,
    make: vehicle.make,
    model: vehicle.model,
    year: String(vehicle.year),
    daily_rate: String(vehicle.daily_rate),
    deposit_amount: String(vehicle.deposit_amount),
    mileage_limit: String(vehicle.mileage_limit),
    slug: vehicle.slug,
    description: vehicle.description,
    photos: (vehicle.photos ?? []).join('\n'),
    active: vehicle.active,
  }
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const inputClass =
  'w-full bg-[#0a0a0a] border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A853] transition-colors placeholder:text-white/20 [color-scheme:dark]'
const labelClass =
  'block text-[10px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2'
const goldButton =
  'bg-[#D4A853] text-black px-6 py-2.5 text-[11px] font-bold tracking-[0.14em] uppercase hover:bg-[#e8c278] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
const ghostButton =
  'border border-white/20 text-white/70 px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] uppercase hover:border-white/40 hover:text-white transition-colors disabled:opacity-50'

export default function VehicleManager({ vehicles, blackouts, blackoutsUnavailable }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [blackoutVehicle, setBlackoutVehicle] = useState('')
  const [blackoutStart, setBlackoutStart] = useState('')
  const [blackoutEnd, setBlackoutEnd] = useState('')
  const [blackoutReason, setBlackoutReason] = useState('')
  const [blackoutError, setBlackoutError] = useState('')
  const [blackoutSaving, setBlackoutSaving] = useState(false)

  function startCreate() {
    setEditing('new')
    setForm(EMPTY_FORM)
    setError('')
  }

  function startEdit(vehicle: Vehicle) {
    setEditing(vehicle.id)
    setForm(toForm(vehicle))
    setError('')
  }

  function cancel() {
    setEditing(null)
    setError('')
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      make: form.make,
      model: form.model,
      year: Number(form.year),
      daily_rate: Number(form.daily_rate),
      deposit_amount: Number(form.deposit_amount),
      mileage_limit: Number(form.mileage_limit),
      slug: form.slug,
      description: form.description,
      photos: form.photos.split('\n').map(p => p.trim()).filter(Boolean),
      active: form.active,
    }

    try {
      const res = await fetch(
        editing === 'new' ? '/api/admin/vehicles' : `/api/admin/vehicles/${editing}`,
        {
          method: editing === 'new' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Could not save the vehicle.')
        return
      }
      setEditing(null)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function retire(vehicle: Vehicle) {
    if (!confirm(`Retire ${vehicle.name}? It stops showing on the site, but past bookings are kept.`)) return
    const res = await fetch(`/api/admin/vehicles/${vehicle.id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  async function addBlackout(e: React.FormEvent) {
    e.preventDefault()
    setBlackoutSaving(true)
    setBlackoutError('')
    try {
      const res = await fetch('/api/admin/blackouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: blackoutVehicle,
          start_date: blackoutStart,
          end_date: blackoutEnd,
          reason: blackoutReason,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setBlackoutError(data.error ?? 'Could not block those dates.')
        return
      }
      setBlackoutStart('')
      setBlackoutEnd('')
      setBlackoutReason('')
      router.refresh()
    } catch {
      setBlackoutError('Network error. Please try again.')
    } finally {
      setBlackoutSaving(false)
    }
  }

  async function removeBlackout(id: string) {
    const res = await fetch(`/api/admin/blackouts/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  const vehicleName = (id: string) => vehicles.find(v => v.id === id)?.name ?? 'Unknown vehicle'

  return (
    <div className="space-y-14">
      {/* ── VEHICLES ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-playfair text-2xl font-bold text-white">Vehicles</h2>
          {editing === null && (
            <button type="button" onClick={startCreate} className={goldButton}>
              Add Vehicle
            </button>
          )}
        </div>

        {editing !== null && (
          <form onSubmit={save} className="bg-[#0f0f0f] border border-white/6 p-6 md:p-8 mb-8 space-y-5">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853]">
              {editing === 'new' ? 'New Vehicle' : 'Edit Vehicle'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label htmlFor="v-name" className={labelClass}>Display Name</label>
                <input id="v-name" className={inputClass} value={form.name}
                  onChange={e => update('name', e.target.value)} placeholder="CLA 35 AMG" required />
              </div>
              <div>
                <label htmlFor="v-make" className={labelClass}>Make</label>
                <input id="v-make" className={inputClass} value={form.make}
                  onChange={e => update('make', e.target.value)} placeholder="Mercedes-Benz" required />
              </div>
              <div>
                <label htmlFor="v-model" className={labelClass}>Model</label>
                <input id="v-model" className={inputClass} value={form.model}
                  onChange={e => update('model', e.target.value)} placeholder="CLA 35 AMG" required />
              </div>
              <div>
                <label htmlFor="v-year" className={labelClass}>Year</label>
                <input id="v-year" type="number" className={inputClass} value={form.year}
                  onChange={e => update('year', e.target.value)} required />
              </div>
              <div>
                <label htmlFor="v-rate" className={labelClass}>Daily Rate ($)</label>
                <input id="v-rate" type="number" min="0" step="1" className={inputClass} value={form.daily_rate}
                  onChange={e => update('daily_rate', e.target.value)} placeholder="300" required />
              </div>
              <div>
                <label htmlFor="v-deposit" className={labelClass}>Deposit ($)</label>
                <input id="v-deposit" type="number" min="0" step="1" className={inputClass} value={form.deposit_amount}
                  onChange={e => update('deposit_amount', e.target.value)} placeholder="600" required />
              </div>
              <div>
                <label htmlFor="v-mileage" className={labelClass}>Mileage Limit (mi/day)</label>
                <input id="v-mileage" type="number" min="0" step="1" className={inputClass} value={form.mileage_limit}
                  onChange={e => update('mileage_limit', e.target.value)} required />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="v-slug" className={labelClass}>URL Slug</label>
                <input id="v-slug" className={inputClass} value={form.slug}
                  onChange={e => update('slug', e.target.value)} placeholder="mercedes-cla-35-amg" />
                <p className="text-xs text-white/25 mt-2">
                  Leave blank to generate from the display name. Changing it breaks existing links to /fleet/&lt;slug&gt;.
                </p>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="v-desc" className={labelClass}>Description</label>
                <textarea id="v-desc" rows={4} className={inputClass} value={form.description}
                  onChange={e => update('description', e.target.value)} />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="v-photos" className={labelClass}>Photos — one URL or path per line</label>
                <textarea id="v-photos" rows={5} className={`${inputClass} font-mono text-xs`} value={form.photos}
                  onChange={e => update('photos', e.target.value)}
                  placeholder={'/images/mercedes/mercedes-1.jpg\nhttps://…/photo.jpg'} />
                <p className="text-xs text-white/25 mt-2">
                  The first photo is used as the card and hero image.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-white/60 cursor-pointer">
              <input type="checkbox" checked={form.active}
                onChange={e => update('active', e.target.checked)}
                className="w-4 h-4 accent-[#D4A853]" />
              Live on the site
            </label>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className={goldButton}>
                {saving ? 'Saving…' : editing === 'new' ? 'Create Vehicle' : 'Save Changes'}
              </button>
              <button type="button" onClick={cancel} disabled={saving} className={ghostButton}>Cancel</button>
            </div>
          </form>
        )}

        {vehicles.length === 0 ? (
          <p className="text-white/30 py-12 text-center">No vehicles yet.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="bg-[#0f0f0f] border border-white/6 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#D4A853] mb-1">
                      {v.year} {v.make}
                    </p>
                    <h3 className="font-playfair font-bold text-xl text-white">{v.name}</h3>
                    <p className="text-xs text-white/25 mt-1">/fleet/{v.slug}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold tracking-[0.12em] uppercase whitespace-nowrap ${
                    v.active ? 'bg-[#D4A853]/12 text-[#D4A853]' : 'bg-white/5 text-white/35'
                  }`}>
                    {v.active ? 'Live' : 'Retired'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/6 mb-5">
                  {[
                    { val: `$${v.daily_rate}`, label: 'Per day' },
                    { val: `$${v.deposit_amount}`, label: 'Deposit' },
                    { val: `${v.mileage_limit}mi`, label: 'Daily limit' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="font-bold text-lg text-white leading-none mb-1">{s.val}</div>
                      <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-white/30">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => startEdit(v)} className={ghostButton}>Edit</button>
                  {v.active && (
                    <button type="button" onClick={() => retire(v)}
                      className="text-[11px] font-medium tracking-[0.12em] uppercase text-white/30 hover:text-red-400 transition-colors">
                      Retire
                    </button>
                  )}
                  <span className="ml-auto text-xs text-white/25">
                    {(v.photos ?? []).length} photo{(v.photos ?? []).length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── BLOCKED DATES ────────────────────────────────────── */}
      <section>
        <h2 className="font-playfair text-2xl font-bold text-white mb-2">Blocked Dates</h2>
        <p className="text-sm text-white/40 mb-6 max-w-2xl">
          Dates blocked here are treated exactly like a booking — the car stops showing as available on the
          fleet search, the vehicle page, and the booking calendar.
        </p>

        {blackoutsUnavailable ? (
          <div className="bg-[#D4A853]/10 border border-[#D4A853]/20 px-5 py-4 text-sm text-[#D4A853]">
            The <code className="font-mono">vehicle_blackouts</code> table isn&apos;t there yet. Run the Phase 2
            section of <code className="font-mono">supabase_setup.sql</code> in the Supabase SQL editor, then
            reload this page.
          </div>
        ) : (
          <>
            <form onSubmit={addBlackout} className="bg-[#0f0f0f] border border-white/6 p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:items-end">
                <div>
                  <label htmlFor="b-vehicle" className={labelClass}>Vehicle</label>
                  <select id="b-vehicle" className={inputClass} value={blackoutVehicle}
                    onChange={e => setBlackoutVehicle(e.target.value)} required>
                    <option value="">Select…</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="b-start" className={labelClass}>From</label>
                  <input id="b-start" type="date" className={inputClass} value={blackoutStart}
                    onChange={e => setBlackoutStart(e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="b-end" className={labelClass}>To</label>
                  <input id="b-end" type="date" className={inputClass} value={blackoutEnd}
                    min={blackoutStart || undefined}
                    onChange={e => setBlackoutEnd(e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="b-reason" className={labelClass}>Reason (optional)</label>
                  <input id="b-reason" className={inputClass} value={blackoutReason}
                    onChange={e => setBlackoutReason(e.target.value)} placeholder="Maintenance" />
                </div>
                <button type="submit" disabled={blackoutSaving} className={goldButton}>
                  {blackoutSaving ? 'Blocking…' : 'Block Dates'}
                </button>
              </div>
              {blackoutError && <p className="text-red-400 text-sm mt-4">{blackoutError}</p>}
            </form>

            {blackouts.length === 0 ? (
              <p className="text-white/30 py-8 text-center">No blocked dates.</p>
            ) : (
              <div className="bg-[#0f0f0f] border border-white/6 divide-y divide-white/6">
                {blackouts.map(b => (
                  <div key={b.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <div className="min-w-[180px]">
                      <p className="font-medium text-white text-sm">{vehicleName(b.vehicle_id)}</p>
                      {b.reason && <p className="text-xs text-white/30 mt-0.5">{b.reason}</p>}
                    </div>
                    <p className="text-sm text-white/60">
                      {formatDate(b.start_date)} → {formatDate(b.end_date)}
                    </p>
                    <button type="button" onClick={() => removeBlackout(b.id)}
                      className="ml-auto text-[11px] font-medium tracking-[0.12em] uppercase text-white/30 hover:text-red-400 transition-colors">
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
