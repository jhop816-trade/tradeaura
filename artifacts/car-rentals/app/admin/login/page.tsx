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
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Password"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit"
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
