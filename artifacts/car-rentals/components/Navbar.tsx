'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/fleet', label: 'Fleet' },
  { href: '/about', label: 'About' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 h-[76px] bg-black/90 backdrop-blur-xl border-b border-[#D4A853]/10">
      <Link href="/" className="font-playfair font-bold text-xl tracking-widest text-white uppercase">
        [Client Name]
      </Link>

      <ul className="hidden md:flex items-center gap-10 list-none">
        {links.map(l => (
          <li key={l.href}>
            <Link href={l.href} className="text-[11px] font-medium tracking-[0.14em] uppercase text-white/50 hover:text-[#D4A853] transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden md:flex items-center gap-5">
        <Link href="/booking" className="bg-[#D4A853] text-black px-7 py-2.5 text-[11px] font-bold tracking-[0.14em] uppercase hover:bg-[#e8c278] transition-colors">
          Book Now
        </Link>
      </div>

      <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-[76px] left-0 right-0 bg-black border-b border-white/10 px-8 py-6 flex flex-col gap-5">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-white/60 hover:text-white uppercase tracking-widest">
              {l.label}
            </Link>
          ))}
          <Link href="/booking" onClick={() => setOpen(false)} className="bg-[#D4A853] text-black px-6 py-3 text-xs font-bold tracking-[0.14em] uppercase text-center">
            Book Now
          </Link>
        </div>
      )}
    </nav>
  )
}
