import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Booking Confirmed' }

export default function SuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold mb-4">You're booked!</h1>
      <p className="text-gray-600 mb-8">
        Your deposit has been received and your booking is confirmed.
        Check your email for a confirmation. We'll reach out shortly to
        finalize pickup logistics.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/" className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
          Back to Home
        </Link>
        <Link href="/contact" className="border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
          Contact Us
        </Link>
      </div>
    </div>
  )
}
