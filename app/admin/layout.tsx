import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'

const tabs = [
  { href: '/admin', label: 'Bookings' },
  { href: '/admin/vehicles', label: 'Vehicles' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <header className="bg-[#0a0a0a] border-b border-white/6 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <h1 className="font-playfair font-bold text-white text-lg">Admin Dashboard</h1>
          <nav className="flex items-center gap-6">
            {tabs.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/40 hover:text-[#D4A853] transition-colors"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="text-sm text-white/40 hover:text-white transition-colors">Log out</button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
