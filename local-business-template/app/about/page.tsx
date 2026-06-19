import type { Metadata } from 'next'
import Link from 'next/link'
import { business } from '@/lib/business'

export const metadata: Metadata = {
  title: `About — ${business.name}`,
  description: `Learn about ${business.name} and our team of dental professionals.`,
}

const values = [
  {
    title: 'Gentle Care',
    description: 'We know dental visits can be stressful. Our team goes the extra mile to make every visit comfortable.',
  },
  {
    title: 'Modern Technology',
    description: 'From digital X-rays to same-visit crowns, we use the latest tools to deliver better results faster.',
  },
  {
    title: '15+ Years of Experience',
    description: 'Thousands of San Diego families have trusted us with their smiles since 2008.',
  },
  {
    title: 'Transparent Pricing',
    description: 'No surprises. We discuss costs and insurance coverage before any treatment begins.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-white to-blue-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
            Our Story
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About {business.name}</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            A family-owned practice dedicated to exceptional dental care and lasting patient relationships.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-lg text-gray-600 leading-relaxed">{business.about}</p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Patients Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="mt-0.5 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-light)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Meet Our Team</h2>
            <p className="text-gray-500 mt-3">The people behind your smile.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {business.team.map((member) => {
              const initials = member.name
                .split(' ')
                .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                .map((n) => n[0])
                .join('')
              return (
                <div key={member.name} className="text-center">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
                  >
                    {initials}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--accent)' }}>{member.role}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Come meet us in person</h2>
          <p className="text-gray-500 mb-8">
            We&apos;d love to be your dental home. Book an appointment and see the difference for yourself.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold text-sm shadow-md transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Book an Appointment
          </Link>
        </div>
      </section>
    </>
  )
}
