import type { Metadata } from 'next'
import { business } from '@/lib/business'
import BookingForm from '@/components/BookingForm'

export const metadata: Metadata = {
  title: `Contact — ${business.name}`,
  description: `Book an appointment with ${business.name} or get in touch with our team.`,
}

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-white to-blue-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
            Get In Touch
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Request an appointment, ask a question, or just say hello. We&apos;ll respond within one business day.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reach Us Directly</h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: 'var(--accent-light)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Phone</p>
                  <a href={`tel:${business.phone}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {business.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: 'var(--accent-light)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email</p>
                  <a href={`mailto:${business.email}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {business.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: 'var(--accent-light)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Address</p>
                  <p className="text-sm text-gray-500">{business.address}</p>
                </div>
              </div>
            </div>

            {/* Hours table */}
            <div className="mt-10">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Office Hours</h3>
              <dl className="space-y-2">
                {Object.entries(business.hours).map(([day, time]) => (
                  <div key={day} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <dt className="text-gray-600">{day}</dt>
                    <dd className={`font-medium ${time === 'Closed' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {time}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Booking form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request an Appointment</h2>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <BookingForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
