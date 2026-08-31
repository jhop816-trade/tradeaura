'use client'

import { useRouter } from 'next/navigation'
import type { ActivityLogEntry } from '@/lib/types'

export function ActivityLogTable({ entries }: { entries: ActivityLogEntry[] }) {
  const router = useRouter()

  async function handleApprove(id: string) {
    await fetch(`/api/activity/${id}/approve`, { method: 'POST' })
    router.refresh()
  }

  if (entries.length === 0) {
    return <p className="text-sm text-white/50">No activity yet.</p>
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>{new Date(entry.created_at).toLocaleString()}</span>
            <span className="uppercase">{entry.category}</span>
          </div>
          <div className="mt-1 text-sm">{entry.action}</div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`text-xs ${
                entry.status === 'success'
                  ? 'text-green-400'
                  : entry.status === 'pending_approval'
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {entry.status.replace('_', ' ')}
            </span>
            {entry.approval_required && !entry.approved_at && (
              <button
                onClick={() => handleApprove(entry.id)}
                className="rounded bg-white px-2 py-0.5 text-xs font-medium text-black"
              >
                Approve
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
