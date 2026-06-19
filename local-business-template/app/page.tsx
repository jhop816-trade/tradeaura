import Link from 'next/link'
import { business } from '@/lib/business'

const testimonials = [
  { quote: "Best dental experience I've ever had. The team made me feel completely at ease.", name: "Sarah M." },
  { quote: "Dr. Santos is incredible — finally a dentist my kids actually look forward to seeing.", name: "Carlos R." },
  { quote: "My Invisalign results are better than I ever imagined. Worth every penny.", name: "Priya K." },
]

export default function Home() {
  const featuredServices = business.services.slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="min-h-[72vh] flex items-center bg-gradient-to-br from-white via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
            San Diego&apos;s Trusted Dental Care
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Beautiful smiles<br className="hidden sm:block" /> start here.
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            {business.tagline}. Serving San Diego families with compassionate, high-quality dental care since 2008.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold text-sm shadow-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Book an Appointment
            </Link>
            <Link
              href="/services"
              className="inline-block px-8 py-3.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              View Our Services
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-400">
            <span>✓ Most insurance accepted</span>
            <span>✓ Same-day emergency care</span>
            <span>✓ Patients of all ages</span>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What We Offer</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              From routine cleanings to complete smile transformations — we have you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <div key={service.name} className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-light)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{service.description}</p>
                <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>{service.price}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-block text-sm font-semibold border-b-2 pb-0.5 transition-colors"
              style={{ color: 'var(--accent)', borderColor: 'var(--accent-light)' }}
            >
              See all services →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Our Patients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-sm font-semibold text-gray-900">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready for a healthier smile?</h2>
          <p className="text-gray-500 mb-8">
            Call us at{' '}
            <a href={`tel:${business.phone}`} className="font-semibold text-gray-900 hover:underline">
              {business.phone}
            </a>{' '}
            or request an appointment online — we&apos;ll be in touch within one business day.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-semibold text-sm shadow-md transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Contact Us Today
          </Link>
        </div>
      </section>
    </>
  )
}
