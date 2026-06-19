'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { business } from '@/lib/business'

interface FormState {
  name: string
  phone: string
  email: string
  requested_date: string
  message: string
}

const empty: FormState = { name: '', phone: '', email: '', requested_date: '', message: '' }

export default function BookingForm() {
  const [form, setForm] = useState<FormState>(empty)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return

    setStatus('loading')
    const { error } = await getSupabase().from('leads').insert({
      business_slug: business.slug,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim(),
      message: form.message.trim() || null,
      requested_date: form.requested_date.trim() || null,
      source: 'form',
    })

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setForm(empty)
      setStatus('success')
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[--accent] focus:ring-2 focus:ring-[--accent]/20'

  if (status === 'success') {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="font-semibold text-green-800">Request received!</p>
        <p className="text-sm text-green-700 mt-1">We&apos;ll be in touch within one business day to confirm your appointment.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm font-medium underline text-green-700 hover:text-green-900"
        >
          Submit another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Jane Smith"
            value={form.name}
            onChange={update('name')}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            placeholder="(619) 555-0100"
            value={form.phone}
            onChange={update('phone')}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          placeholder="jane@example.com"
          value={form.email}
          onChange={update('email')}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date / Time</label>
        <input
          type="text"
          placeholder="e.g. Next Tuesday morning, or any weekday after 3pm"
          value={form.requested_date}
          onChange={update('requested_date')}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          rows={3}
          placeholder="What can we help you with? (optional)"
          value={form.message}
          onChange={update('message')}
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          Something went wrong: {errorMsg}. Please call us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 px-6 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {status === 'loading' ? 'Sending…' : 'Request Appointment'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        We&apos;ll confirm within one business day. For urgent needs, call{' '}
        <a href={`tel:${business.phone}`} className="underline hover:text-gray-600">
          {business.phone}
        </a>
        .
      </p>
    </form>
  )
}
