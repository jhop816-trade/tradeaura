'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import BrandMark from '@/components/brand/BrandMark'
import { brand } from '@/lib/brand'

const LINKS = [
  { href: '/#fleet', label: 'Fleet' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/#contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock the page behind the open mobile sheet.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Escape closes the sheet — expected for any overlay.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        scrolled || open ? 'bg-ink-000/85 backdrop-blur-xl border-b hairline' : 'bg-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="flex items-center justify-between gap-6 px-6 sm:px-10 lg:px-20 h-[74px] max-w-[1600px] mx-auto"
      >
        <Link href="/" aria-label={brand.name} onClick={() => setOpen(false)}>
          <BrandMark size="md" wordmarkClassName="hidden sm:inline" />
        </Link>

        <ul className="hidden lg:flex items-center gap-9">
          {LINKS.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/50 hover:text-amber transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/booking"
            className="hidden sm:inline-flex bg-amber text-black px-7 py-3 text-[10px] font-bold tracking-[0.16em] uppercase hover:bg-amber-bright transition-colors"
          >
            Reserve
          </Link>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="lg:hidden text-white p-1"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={reduced ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="lg:hidden border-t hairline bg-ink-000/95 backdrop-blur-xl px-6 sm:px-10 py-8"
          >
            <ul className="flex flex-col gap-6">
              {LINKS.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-display text-2xl text-white/80 hover:text-amber transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/booking"
              onClick={() => setOpen(false)}
              className="mt-8 block text-center bg-amber text-black px-7 py-4 text-[11px] font-bold tracking-[0.16em] uppercase"
            >
              Reserve
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
