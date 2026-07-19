'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { site } from '@/config/site'
import { trackBookClick } from '@/lib/analytics'

const links = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#services', label: 'Services' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#location', label: 'Location' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? 'border-b border-line/60 bg-ink/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#top" className="display text-xl tracking-[0.08em] text-frost">
          JU<span className="text-electric">FADE</span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-medium uppercase tracking-[0.2em] text-smoke transition-colors hover:text-frost"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href={site.booking.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackBookClick('navbar')}
          className="rounded-full border border-frost/20 bg-frost px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-electric hover:text-frost"
        >
          Book Now
        </a>
      </nav>
    </motion.header>
  )
}
