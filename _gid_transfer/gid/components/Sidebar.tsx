import Link from 'next/link'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/ads', label: 'Ads' },
  { href: '/business', label: 'Business' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/activity', label: 'Activity' },
]

export function Sidebar() {
  return (
    <nav className="flex w-48 shrink-0 flex-col gap-1 border-r border-white/10 p-4">
      <div className="mb-4 px-2 text-sm font-semibold tracking-wide text-white/80">GID 2.0</div>
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md px-2 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
