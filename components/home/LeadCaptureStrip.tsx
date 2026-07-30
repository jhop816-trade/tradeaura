'use client'
import { useState } from 'react'
import { Send } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { brand, contactLinks } from '@/lib/brand'

/**
 * The closing scene — a full-bleed backdrop with the reservation form
 * floating on top of it as a glass panel, rather than another instance of
 * the standard `Section` heading-plus-content shape everything else uses.
 *
 * There is no backend to send this to yet, and the brief is explicit that
 * nothing should pretend a core function works before it's wired up. So this
 * collects the fields a real quote request needs — proving the UI is
 * production-shaped — but submitting never claims success. It surfaces
 * whatever real contact channel exists instead, or says plainly that none is
 * published yet. Swapping in a real submit handler in Phase 4 does not
 * change this component's shape, only the submit function's body.
 */
export default function LeadCaptureStrip() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  const hasChannel = contactLinks.tel || contactLinks.email

  return (
    <section id="contact-form" className="relative px-6 sm:px-10 lg:px-20 py-24 sm:py-32 overflow-hidden bg-ink-000 border-y hairline">
      {/* Ambient backdrop — a still light source rather than another canvas;
          this scene is meant to feel calm and conclusive, not busy. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgb(245 197 66 / 0.08) 0%, transparent 60%)',
        }}
      />
      <div aria-hidden="true" className="grain" />

      <div className="relative max-w-4xl mx-auto text-center">
        <Reveal>
          <p className="eyebrow mb-5">Request A Quote</p>
          <h2 className="font-display text-display-xl text-white mb-6">
            Start the <span className="text-amber">conversation.</span>
          </h2>
          <p className="text-white/45 text-[15px] max-w-lg mx-auto mb-14">
            No account, no deposit, no commitment — just tell us what you have in mind.
          </p>
        </Reveal>

        <Reveal index={1}>
          <div className="glass p-8 sm:p-12 text-left shadow-[var(--shadow-cinematic)]">
            {submitted ? (
              <div role="status">
                <p className="text-white text-lg leading-relaxed">
                  This form isn&apos;t connected to anything yet — nothing was sent.
                </p>
                {hasChannel ? (
                  <p className="text-white/50 text-[14px] leading-relaxed mt-3">
                    In the meantime,{' '}
                    {contactLinks.tel && (
                      <a href={contactLinks.tel} className="text-amber hover:underline">
                        call {brand.contact.phoneDisplay}
                      </a>
                    )}
                    {contactLinks.tel && contactLinks.email && ' or '}
                    {contactLinks.email && (
                      <a href={contactLinks.email} className="text-amber hover:underline">
                        email us
                      </a>
                    )}
                    , or use the concierge button in the corner.
                  </p>
                ) : (
                  <p className="text-white/50 text-[14px] leading-relaxed mt-3">
                    Contact details are being finalised and will appear here before
                    launch. Use the concierge button in the corner in the meantime.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead-name" className="block text-[10px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2">
                    Name
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    required
                    className="w-full bg-ink-100 border hairline text-white px-4 py-3 text-sm focus:outline-none focus:border-amber/50 transition-colors placeholder:text-white/20"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="lead-contact" className="block text-[10px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2">
                    Email or phone
                  </label>
                  <input
                    id="lead-contact"
                    type="text"
                    required
                    className="w-full bg-ink-100 border hairline text-white px-4 py-3 text-sm focus:outline-none focus:border-amber/50 transition-colors placeholder:text-white/20"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="lead-details" className="block text-[10px] font-bold tracking-[0.14em] uppercase text-white/40 mb-2">
                    What are you planning?
                  </label>
                  <textarea
                    id="lead-details"
                    rows={3}
                    className="w-full bg-ink-100 border hairline text-white px-4 py-3 text-sm focus:outline-none focus:border-amber/50 transition-colors placeholder:text-white/20 resize-none"
                    placeholder="Vehicle, dates, occasion — whatever you know so far"
                  />
                </div>
                <button
                  type="submit"
                  className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-amber text-black px-8 py-3.5 text-[11px] font-bold tracking-[0.16em] uppercase hover:bg-amber-bright transition-colors"
                >
                  <Send size={14} aria-hidden="true" />
                  Request A Quote
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
