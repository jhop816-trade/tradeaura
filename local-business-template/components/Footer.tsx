import Link from 'next/link'
import { business } from '@/lib/business'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <p className="text-xl font-bold text-white mb-2">{business.name}</p>
          <p className="text-sm leading-relaxed">{business.tagline}</p>
          <p className="text-sm mt-4">{business.address}</p>
          <a href={`tel:${business.phone}`} className="text-sm hover:text-white transition-colors mt-1 block">
            {business.phone}
          </a>
          <a href={`mailto:${business.email}`} className="text-sm hover:text-white transition-colors mt-1 block">
            {business.email}
          </a>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</p>
          <nav className="flex flex-col gap-2">
            {[
              { label: 'Home', href: '/' },
              { label: 'Services', href: '/services' },
              { label: 'About Us', href: '/about' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="text-sm hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Hours */}
        <div>
          <p className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Hours</p>
          <dl className="flex flex-col gap-1">
            {Object.entries(business.hours).map(([day, time]) => (
              <div key={day} className="flex justify-between text-sm gap-4">
                <dt>{day}</dt>
                <dd className={time === 'Closed' ? 'text-gray-500' : 'text-gray-300'}>{time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs text-gray-600">
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
