'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      })
      if (res.ok) {
        setStatus('success')
        setName(''); setEmail(''); setPhone(''); setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-500 mb-12">Have questions before booking? Reach out — we respond fast.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone (optional)</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="Ask us anything…" />
          </div>

          {status === 'success' && <p className="text-green-600 text-sm">Message sent! We'll get back to you soon.</p>}
          {status === 'error' && <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>}

          <button type="submit" disabled={status === 'loading'}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
            {status === 'loading' ? 'Sending…' : 'Send Message'}
          </button>
        </form>

        <div className="space-y-6 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Response Time</p>
            <p>We typically respond within a few hours. For urgent inquiries, DM us on Instagram.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Instagram</p>
            <a href="https://instagram.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
              @[handle]
            </a>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Service Area</p>
            <p>[City, State] and surrounding areas. Pickup and dropoff by arrangement.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
