import { createServiceClient } from '@/lib/supabase/server'
import type { Booking } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-600',
}

export default async function AdminPage() {
  const supabase = await createServiceClient()
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, vehicles(name, make, model, year)')
    .order('created_at', { ascending: false })

  const list = (bookings ?? []) as Booking[]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Bookings</h2>
        <p className="text-sm text-gray-500">{list.length} total</p>
      </div>

      {list.length === 0 ? (
        <p className="text-gray-400 py-12 text-center">No bookings yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Vehicle', 'Client', 'Dates', 'Deposit', 'Status', 'Booked'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <p className="font-medium">{b.vehicles?.name ?? '—'}</p>
                    <p className="text-gray-400 text-xs">{b.vehicles?.year}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium">{b.client_name}</p>
                    <p className="text-gray-400 text-xs">{b.client_email}</p>
                    <p className="text-gray-400 text-xs">{b.client_phone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p>{b.start_date}</p>
                    <p className="text-gray-400">→ {b.end_date}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={b.deposit_paid ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {b.deposit_paid ? '✓ Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] ?? ''}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-xs">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
