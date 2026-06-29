'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) { router.push('/admin') } else { setError('Incorrect password') }
  }

  return (
    <div className="bg-black min-h-screen flex items-center justify-center px-8">
      <div className="w-full max-w-sm">
        <p className="font-playfair font-bold text-3xl text-white mb-2">[Client Name]</p>
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-10">Admin Access</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-white/10 text-white px-4 py-4 text-sm focus:outline-none focus:border-[#D4A853] transition-colors placeholder:text-white/20"
            placeholder="Password"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-[#D4A853] text-black py-4 text-[12px] font-bold tracking-[0.16em] uppercase hover:bg-[#e8c278] transition-colors">
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
