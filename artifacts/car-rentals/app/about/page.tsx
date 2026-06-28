import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'Why rent private? Meet the owner and learn why a direct rental beats Turo and agencies every time.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
        <p className="text-xl text-gray-900 font-medium">
          Private car rental — the way it should be.
        </p>
        <p>
          We're a small, owner-operated car rental service offering two
          meticulously maintained luxury vehicles: a Tesla Model 3 and a
          Mercedes-Benz C300. No middlemen, no agencies, no Turo fees eating
          into your budget.
        </p>
        <p>
          When you book with us, you deal directly with the owner. That means
          fast responses, flexible arrangements, and a vehicle that's always
          spotless and ready to go.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 pt-4">Why Private vs. Turo or Agencies?</h2>
        <ul className="space-y-3">
          {[
            'No platform fees — you pay what you see, nothing more.',
            'Vehicles are personally maintained, not fleet-cycled.',
            'Direct communication — no call centers or ticket queues.',
            'Flexible pickup and dropoff options.',
            'Consistent pricing, no surge or peak-season markups.',
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link href="/booking"
            className="inline-block bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  )
}
