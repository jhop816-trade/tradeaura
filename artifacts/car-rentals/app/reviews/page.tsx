import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reviews',
  description: 'See what our customers say about renting our Tesla and Mercedes-Benz.',
}

const reviews = [
  {
    name: 'Alex M.',
    rating: 5,
    text: "Easiest car rental experience I've ever had. The Tesla was immaculate and the owner was super responsive. Will definitely book again.",
    source: 'Google',
    date: 'June 2025',
  },
  {
    name: 'Brittany K.',
    rating: 5,
    text: "Booked the Mercedes for my anniversary weekend. It was perfect — clean, full tank, and the whole process was seamless. Way better than Turo.",
    source: 'Instagram',
    date: 'May 2025',
  },
  {
    name: 'Jordan T.',
    rating: 5,
    text: "Drove the Tesla for a week. Loved every minute. Charging was covered, the car was pristine. Highly recommend skipping the agencies.",
    source: 'Google',
    date: 'April 2025',
  },
]

export default function ReviewsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">What Customers Say</h1>
      <p className="text-gray-500 mb-12">Real reviews from real renters.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((r, i) => (
          <div key={i} className="border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: r.rating }).map((_, j) => (
                <span key={j} className="text-yellow-400">★</span>
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">"{r.text}"</p>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span className="font-medium text-gray-600">{r.name}</span>
              <span>{r.source} · {r.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
