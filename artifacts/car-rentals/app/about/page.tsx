import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'Why rent private? Meet the owner and learn why a direct rental beats Turo and agencies every time.',
}

export default function AboutPage() {
  return (
    <div className="bg-black min-h-screen pt-[76px]">
      <div className="max-w-4xl mx-auto px-8 md:px-20 py-24">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Our Story</p>
        <h1 className="font-playfair font-black text-5xl md:text-6xl leading-none text-white tracking-tight mb-10">About Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-16">
          <div className="space-y-1">
            <div className="w-full aspect-square bg-[#0f0f0f] border border-white/6 flex items-center justify-center">
              <span className="font-playfair text-[#D4A853]/20 text-8xl font-black">?</span>
            </div>
            <p className="text-[11px] text-white/20 tracking-widest uppercase text-center pt-3">[Owner photo coming soon]</p>
          </div>

          <div className="space-y-6 text-[15px] text-white/60 leading-relaxed">
            <p className="text-xl text-white font-medium leading-relaxed">
              Private car rental — the way it should be.
            </p>
            <p>
              We're a small, owner-operated rental service offering two meticulously maintained vehicles: a Tesla Model 3 and a Mercedes-Benz C300. No middlemen, no agencies, no Turo fees eating into your budget.
            </p>
            <p>
              When you book with us, you deal directly with the owner. That means fast responses, flexible arrangements, and a vehicle that's always spotless and ready to go.
            </p>

            <div className="pt-4">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-6">Why Private vs. Turo or Agencies</p>
              <ul className="space-y-4">
                {[
                  'No platform fees — you pay what you see, nothing more.',
                  'Vehicles are personally maintained, not fleet-cycled.',
                  'Direct communication — no call centers or ticket queues.',
                  'Flexible pickup and dropoff options.',
                  'Consistent pricing, no surge or peak-season markups.',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-[#D4A853] mt-1 shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <Link href="/booking" className="inline-block bg-[#D4A853] text-black px-10 py-4 text-[11px] font-bold tracking-[0.16em] uppercase hover:bg-[#e8c278] transition-colors">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
