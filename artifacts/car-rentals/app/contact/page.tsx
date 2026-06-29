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
      } else { setStatus('error') }
    } catch { setStatus('error') }
  }

  const inputClass = "w-full bg-[#0f0f0f] border border-white/10 text-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#D4A853] transition-colors placeholder:text-white/20"

  return (
    <div className="bg-black min-h-screen pt-[76px]">
      <div className="max-w-5xl mx-auto px-8 md:px-20 py-24">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Get in Touch</p>
        <h1 className="font-playfair font-black text-5xl md:text-6xl leading-none text-white tracking-tight mb-4">Contact Us</h1>
        <p className="text-white/40 text-[15px] mb-20">Have questions before booking? Reach out — we respond fast.</p>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-16">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2">Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2">Phone (optional)</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2">Message</label>
              <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={5} className={`${inputClass} resize-none`} placeholder="Ask us anything…" />
            </div>

            {status === 'success' && <p className="text-[#D4A853] text-sm">Message sent! We'll get back to you soon.</p>}
            {status === 'error' && <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>}

            <button type="submit" disabled={status === 'loading'} className="w-full bg-[#D4A853] text-black py-4 text-[12px] font-bold tracking-[0.16em] uppercase hover:bg-[#e8c278] transition-colors disabled:opacity-50">
              {status === 'loading' ? 'Sending…' : 'Send Message'}
            </button>
          </form>

          <div className="space-y-10 text-[14px] text-white/50 pt-1">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Response Time</p>
              <p>We typically respond within a few hours. For urgent inquiries, text or DM us on Instagram.</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Text / WhatsApp</p>
              <a href="https://wa.me/19546543485" target="_blank" rel="noopener" className="text-white hover:text-[#D4A853] transition-colors">(954) 654-3485</a>
              <p className="text-white/25 text-xs mt-1">Fastest way to reach us</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Instagram</p>
              <a href="https://instagram.com/38exotics_" target="_blank" rel="noopener" className="text-white hover:text-[#D4A853] transition-colors">@38exotics_</a>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Service Area</p>
              <p>South Florida — Broward, Miami-Dade, and Palm Beach. Pickup and dropoff by arrangement.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
