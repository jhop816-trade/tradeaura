import { Sidebar } from '@/components/Sidebar'
import { StatCard } from '@/components/StatCard'
import { mockBusinessData } from '@/lib/mock/businessData'

export default function BusinessPage() {
  const d = mockBusinessData

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-4 text-lg font-semibold">Google Business Profile</h1>
        <p className="mb-4 text-xs text-white/40">Mock data — placeholder until Google Business Profile API access is approved.</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Profile" value={d.name} />
          <StatCard label="Status" value={d.status} />
          <StatCard label="Rating" value={`${d.rating.toFixed(1)}★`} />
          <StatCard label="Reviews" value={d.reviewCount} />
        </div>

        <h2 className="mb-2 mt-6 text-sm font-semibold text-white/80">Recent updates</h2>
        <div className="space-y-1">
          {d.recentUpdates.map((u) => (
            <div key={u.date} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <span className="text-white/40">{u.date}</span> — {u.text}
            </div>
          ))}
        </div>

        {d.pendingActions.length === 0 && (
          <p className="mt-6 text-sm text-white/50">No pending actions.</p>
        )}
      </main>
    </div>
  )
}
