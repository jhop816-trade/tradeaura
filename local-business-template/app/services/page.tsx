import type { Metadata } from 'next'
import Link from 'next/link'
import { business } from '@/lib/business'

export const metadata: Metadata = {
  title: `Services — ${business.name}`,
  description: `Explore the dental services offered by ${business.name} in San Diego.`,
}

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-white to-blue-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
            What We Offer
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Comprehensive dental care for every stage of life — from routine cleanings to complete smile transformations.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {business.services.map((service) => (
              <div
                key={service.name}
                className="rounded-2xl border border-gray-100 p-7 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="w-11 h-11 rounded-xl mb-5 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-light)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h2>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{service.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                    {service.price}
                  </span>
                  <Link
                    href="/contact"
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Book now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance note */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-500">
            We accept most major PPO dental insurance plans.{' '}
            <a href={`tel:${business.phone}`} className="font-medium text-gray-900 hover:underline">
              Call us at {business.phone}
            </a>{' '}
            to verify your coverage before your visit.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Not sure which service you need?</h2>
          <p className="text-gray-500 mb-8">
            Chat with our assistant below or contact us — we&apos;ll help you figure out the best next step.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold text-sm shadow-md transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Request an Appointment
          </Link>
        </div>
      </section>
    </>
  )
}
