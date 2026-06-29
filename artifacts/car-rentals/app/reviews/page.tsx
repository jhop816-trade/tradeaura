import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Reviews',
  description: 'See what our customers say about renting our Tesla and Mercedes-Benz.',
}

const reviews = [
  { name: 'Alex M.', rating: 5, text: 'Pulled up in the Tesla and honestly turned heads all weekend. Car was spotless, owner responded within like 20 minutes. Way better than Turo.', source: 'Google', date: 'June 2025' },
  { name: 'Brittany K.', rating: 5, text: 'Booked the Mercedes for my anniversary trip. Whole process was smooth, no weird fees, and the car was immaculate. Already booked again.', source: 'Instagram', date: 'May 2025' },
  { name: 'Jordan T.', rating: 5, text: 'Drove the Tesla for a week for a work trip. Charging was covered, car was always clean. Way easier than renting from an agency.', source: 'Google', date: 'April 2025' },
  { name: 'Marcus D.', rating: 5, text: "The Mercedes felt brand new. Owner was easy to reach and super flexible with pickup time. Will definitely book again next time I'm in town.", source: 'Google', date: 'March 2025' },
]

export default function ReviewsPage() {
  return (
    <div className="bg-black min-h-screen pt-[76px]">
      <div className="max-w-5xl mx-auto px-8 md:px-20 py-24">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Testimonials</p>
        <h1 className="font-playfair font-black text-5xl md:text-6xl leading-none text-white tracking-tight mb-4">What Renters Say</h1>
        <p className="text-white/40 text-[15px] mb-20">Real reviews from real renters.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {reviews.map((r, i) => (
            <div key={i} className="relative bg-[#0f0f0f] border border-white/7 p-10 overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 font-playfair text-[120px] text-[#D4A853] opacity-[0.07] leading-none pointer-events-none select-none pl-5 -mt-2">"</div>
              <div className="w-7 h-0.5 bg-[#D4A853] mb-6" />
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <span key={j} className="text-[#D4A853] text-sm">★</span>
                ))}
              </div>
              <p className="font-playfair italic text-lg text-white/75 leading-relaxed mb-8">"{r.text}"</p>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#D4A853]">{r.name}</p>
                <p className="text-[11px] text-white/25 tracking-wide">{r.source} · {r.date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-[#0f0f0f] border border-white/6 p-12 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-4">Ready to Experience It?</p>
          <h2 className="font-playfair font-bold text-4xl text-white mb-6">Book your rental today.</h2>
          <Link href="/booking" className="inline-block bg-[#D4A853] text-black px-12 py-4 text-[11px] font-bold tracking-[0.16em] uppercase hover:bg-[#e8c278] transition-colors">
            Check Availability
          </Link>
        </div>
      </div>
    </div>
  )
}
