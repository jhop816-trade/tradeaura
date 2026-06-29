import { createServiceClient } from '@/lib/supabase/server'
import type { Booking } from '@/types'
import BookingActions from './BookingActions'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  completed: 'bg-white/10 text-white/40',
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
        <h2 className="font-playfair text-2xl font-bold text-white">Bookings</h2>
        <p className="text-sm text-white/30">{list.length} total</p>
      </div>

      {list.length === 0 ? (
        <p className="text-white/30 py-12 text-center">No bookings yet.</p>
      ) : (
        <div className="bg-[#0f0f0f] border border-white/6 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/6">
              <tr>
                {['Vehicle', 'Client', 'Dates', 'Deposit', 'Status', 'Booked', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-bold text-[10px] tracking-[0.2em] uppercase text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {list.map(b => (
                <tr key={b.id} className="hover:bg-white/2">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{b.vehicles?.name ?? '—'}</p>
                    <p className="text-white/30 text-xs">{b.vehicles?.year}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{b.client_name}</p>
                    <p className="text-white/30 text-xs">{b.client_email}</p>
                    <p className="text-white/30 text-xs">{b.client_phone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-white">{b.start_date}</p>
                    <p className="text-white/40">→ {b.end_date}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={b.deposit_paid ? 'text-[#D4A853] font-medium' : 'text-white/30'}>
                      {b.deposit_paid ? '✓ Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium ${STATUS_COLORS[b.status] ?? ''}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-white/30 text-xs">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <BookingActions bookingId={b.id} currentStatus={b.status} />
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
