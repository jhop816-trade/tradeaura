import { Sidebar } from '@/components/Sidebar'
import { ActivityLogTable } from '@/components/ActivityLogTable'
import { getActivityLog } from '@/lib/activityLog'

export default async function ActivityPage() {
  const entries = await getActivityLog()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-1 text-lg font-semibold">Activity Log</h1>
        <p className="mb-4 text-xs text-white/40">Real data — every meaningful GID action lands here.</p>
        <ActivityLogTable entries={entries} />
      </main>
    </div>
  )
}
