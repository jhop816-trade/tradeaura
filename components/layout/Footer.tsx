import Link from 'next/link'
import BrandMark from '@/components/brand/BrandMark'
import { brand, contactLinks, isPlaceholder } from '@/lib/brand'

const COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { href: '/#fleet', label: 'The Fleet' },
      { href: '/#how-it-works', label: 'How It Works' },
      { href: '/#reviews', label: 'Reviews' },
      { href: '/booking', label: 'Reserve' },
    ],
  },
  {
    heading: 'Occasions',
    links: [
      { href: '/#fleet', label: 'Weddings' },
      { href: '/#fleet', label: 'Photo & Video' },
      { href: '/#fleet', label: 'Airport Arrival' },
      { href: '/#fleet', label: 'Weekend Escapes' },
    ],
  },
]

/**
 * Contact rows render as plain text while the detail is still a placeholder,
 * so the footer never ships a link that dials or emails nothing.
 */
function ContactRow({ label, value, href }: { label: string; value: string; href: string | null }) {
  const pending = isPlaceholder(value)
  return (
    <li className="flex flex-col gap-0.5">
      <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-white/25">{label}</span>
      {pending || !href ? (
        <span className="text-[13px] text-white/30 italic">To be confirmed</span>
      ) : (
        <a href={href} className="text-[13px] text-white/55 hover:text-amber transition-colors">
          {value}
        </a>
      )}
    </li>
  )
}

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-ink-050 border-t hairline px-6 sm:px-10 lg:px-20 pt-20 pb-28 overflow-hidden">
      {/* Oversized ghost wordmark — a common editorial footer flourish,
          pure type, no asset. Clipped by the footer's own overflow-hidden. */}
      <p
        aria-hidden="true"
        className="font-display absolute -bottom-[6vw] left-1/2 -translate-x-1/2 text-[24vw] leading-none text-white/[0.025] whitespace-nowrap select-none pointer-events-none"
      >
        {brand.shortName}
      </p>

      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b hairline">
          <div className="col-span-2 lg:col-span-1">
            <BrandMark size="md" splitWordmark className="mb-4" />
            <p className="text-[13px] text-white/35 leading-relaxed max-w-xs">{brand.tagline}</p>
          </div>

          {COLUMNS.map(column => (
            <div key={column.heading}>
              <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-amber mb-5">
                {column.heading}
              </p>
              <ul className="flex flex-col gap-3">
                {column.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/40 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-amber mb-5">
              Contact
            </p>
            <ul className="flex flex-col gap-4">
              <ContactRow label="Phone" value={brand.contact.phoneDisplay} href={contactLinks.tel} />
              <ContactRow label="Email" value={brand.contact.email} href={contactLinks.email} />
              <ContactRow
                label="Instagram"
                value={brand.contact.instagramHandle}
                href={contactLinks.instagram}
              />
              <ContactRow
                label="Service area"
                value={brand.location.region}
                href={null}
              />
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-[11px] text-white/20">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p className="text-[11px] text-white/20">
            Rental terms pending legal review before launch.
          </p>
        </div>
      </div>
    </footer>
  )
}
