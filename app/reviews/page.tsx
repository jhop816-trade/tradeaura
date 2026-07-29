import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Reviews',
  description: 'Real reviews from verified Turo renters. 5 stars across the board — see what people say about renting with 38 Exotics.',
}

const reviews = [
  {
    name: 'Brian',
    date: 'February 12, 2026',
    text: "A beautiful clean car and a unique driving experience. It was like a comfortable tour guide around Florida for the duration of my stay. The only thing better was the owner who was knowledgeable and friendly with a quick response for my every want and need. I would highly recommend both this vehicle and its owner.",
  },
  {
    name: 'Tyrell',
    date: 'January 28, 2026',
    text: "An amazing host super nice car well kept. He really works with you and tries to make sure your trip is the best! Definitely renting with him again and every time I come to Fort Lauderdale.",
  },
  {
    name: 'Brad',
    date: 'February 21, 2026',
    text: "Great car and great communication.",
  },
  {
    name: 'Paul',
    date: 'March 6, 2026',
    text: "Great experience would recommend.",
  },
  {
    name: 'Jontate',
    date: 'January 15, 2026',
    text: "Great host, Great vehicle trip was Great.",
  },
  {
    name: 'THEODIS',
    date: 'January 19, 2026',
    text: "Awesome host and amazing car!",
  },
  {
    name: 'shaquavious',
    date: 'February 23, 2026',
    text: null,
  },
  {
    name: 'Jacob',
    date: 'January 21, 2026',
    text: null,
  },
]

export default function ReviewsPage() {
  const withText = reviews.filter(r => r.text)
  const starsOnly = reviews.filter(r => !r.text)

  return (
    <div className="bg-black min-h-screen pt-[76px]">
      <div className="max-w-5xl mx-auto px-8 md:px-20 py-24">

        <div className="flex items-center gap-3 mb-5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-[#D4A853] text-lg">★</span>
            ))}
          </div>
          <span className="text-white/30 text-sm">5.0 · {reviews.length} reviews</span>
        </div>

        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Verified Renters</p>
        <h1 className="font-playfair font-black text-5xl md:text-6xl leading-none text-white tracking-tight mb-4">What People Say</h1>
        <p className="text-white/40 text-[15px] mb-20">Every review below is real — pulled directly from verified Turo renters.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-1">
          {withText.map((r, i) => (
            <div key={i} className="relative bg-[#0f0f0f] border border-white/7 p-10 overflow-hidden group hover:border-[#D4A853]/20 transition-colors">
              <div className="absolute top-0 left-0 bottom-0 font-playfair text-[140px] text-[#D4A853] opacity-[0.05] leading-none pointer-events-none select-none pl-4 -mt-4 group-hover:opacity-[0.09] transition-opacity">"</div>
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="text-[#D4A853] text-sm">★</span>
                ))}
              </div>
              <p className="font-playfair italic text-[17px] text-white/75 leading-relaxed mb-9 relative">"{r.text}"</p>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-white">{r.name}</p>
                <div className="text-right">
                  <p className="text-[10px] text-white/25">{r.date}</p>
                  <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-[#D4A853]/50 mt-0.5">Turo · Verified</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {starsOnly.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-16">
            {starsOnly.map((r, i) => (
              <div key={i} className="bg-[#0f0f0f] border border-white/7 p-7 flex flex-col items-center text-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className="text-[#D4A853] text-sm">★</span>
                  ))}
                </div>
                <p className="text-[12px] font-bold text-white/80 tracking-wide">{r.name}</p>
                <p className="text-[10px] text-white/25">{r.date}</p>
                <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-[#D4A853]/50">Turo · Verified</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#0a0a0a] border border-[#D4A853]/15 p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Ready to join them?</p>
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-white leading-tight">Book directly — skip the platform.</h2>
            <p className="text-white/35 text-sm mt-3 leading-relaxed max-w-md">No Turo fees. No middlemen. Just you, the car, and the owner picking up the phone.</p>
          </div>
          <Link href="/booking" className="shrink-0 bg-[#D4A853] text-black px-10 py-4 text-[11px] font-bold tracking-[0.16em] uppercase hover:bg-[#e8c278] transition-colors whitespace-nowrap">
            Check Availability
          </Link>
        </div>
      </div>
    </div>
  )
}
