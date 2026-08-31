'use client'

import { useState } from 'react'

interface Message {
  role: 'user' | 'gid'
  text: string
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'gid', text: "GID online. Ask me about ads, reviews, or the business profile — I'm working off mock data until Google API access clears." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: 'gid', text: data.reply as string }])
    } catch {
      setMessages((m) => [...m, { role: 'gid', text: 'Something went wrong reaching GID. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-white/10 bg-white/5">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <span
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.role === 'user' ? 'bg-white text-black' : 'bg-black/30 text-white'
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && <p className="text-xs text-white/40">GID is thinking…</p>}
      </div>
      <div className="flex gap-2 border-t border-white/10 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask GID something…"
          className="flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/30"
        />
        <button onClick={send} disabled={loading} className="rounded-md bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  )
}
