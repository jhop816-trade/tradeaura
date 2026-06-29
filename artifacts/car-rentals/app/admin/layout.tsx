import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (token !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <header className="bg-[#0a0a0a] border-b border-white/6 px-6 py-4 flex items-center justify-between">
        <h1 className="font-playfair font-bold text-white text-lg">Admin Dashboard</h1>
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="text-sm text-white/40 hover:text-white transition-colors">Log out</button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
