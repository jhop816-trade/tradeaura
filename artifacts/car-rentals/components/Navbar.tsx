'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/fleet', label: 'Fleet' },
  { href: '/booking', label: 'Book Now' },
  { href: '/about', label: 'About' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight">[Client Name]</Link>
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={l.label === 'Book Now'
                ? 'bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors'
                : 'text-sm text-gray-600 hover:text-black transition-colors'
              }>
              {l.label}
            </Link>
          ))}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-sm text-gray-700 hover:text-black">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
