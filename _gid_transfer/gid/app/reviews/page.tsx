import { Sidebar } from '@/components/Sidebar'
import { mockReviewsData } from '@/lib/mock/reviewsData'

export default function ReviewsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-4 text-lg font-semibold">Reviews</h1>
        <p className="mb-4 text-xs text-white/40">Mock data — placeholder until Google Business Profile API access is approved.</p>

        <div className="space-y-3">
          {mockReviewsData.map((r) => (
            <div key={r.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{r.reviewer}</span>
                <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
              </div>
              <p className="mt-1 text-sm text-white/70">{r.text}</p>
              <div className="mt-3 rounded-md border border-white/10 bg-black/30 p-2 text-sm">
                <span className="text-xs uppercase text-white/40">GID's reply</span>
                <p className="mt-1">{r.gidReply}</p>
              </div>
              <div className="mt-2 text-xs text-white/40">{new Date(r.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
