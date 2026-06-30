import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'Owner-operated private car rental in Fort Lauderdale, FL. Direct booking — no Turo fees, no agencies, no nonsense.',
}

export default function AboutPage() {
  return (
    <div className="bg-black min-h-screen pt-[76px]">
      <div className="max-w-5xl mx-auto px-8 md:px-20 py-24">

        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">The Story</p>
        <h1 className="font-playfair font-black text-5xl md:text-6xl leading-none text-white tracking-tight mb-16">Built Different.</h1>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-16 items-start mb-20">
          <div className="space-y-6 text-[15px] text-white/60 leading-relaxed">
            <p className="text-[22px] text-white font-medium leading-snug">
              I got tired of watching people overpay to rent through apps that take a cut from both sides.
            </p>
            <p>
              38 Exotics started in Fort Lauderdale with a simple idea: let people rent directly from the owner. No platform markup, no bait-and-switch pricing, no call center when something comes up. Just text me.
            </p>
            <p>
              I keep two vehicles in the fleet — a 2026 Tesla Model Y and a 2020 Mercedes-Benz CLA 35 AMG. Both are personally owned, personally maintained, and detailed before every single rental. I care about what I drive, and you'll feel that the moment you pick up the keys.
            </p>
            <p>
              Based in South Florida, I serve Broward, Miami-Dade, and Palm Beach counties. Pickup and dropoff are by arrangement — I work around your schedule, not mine.
            </p>
          </div>

          <div className="space-y-1">
            <div className="border border-[#D4A853]/15 p-8 bg-[#0a0a0a]">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-6">By the numbers</p>
              <div className="space-y-6">
                {[
                  { val: '8', label: 'Five-star reviews' },
                  { val: '2', label: 'Vehicles in fleet' },
                  { val: 'Fort Lauderdale', label: 'Home base' },
                  { val: '@38exotics_', label: 'Instagram' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-baseline border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <span className="font-playfair font-bold text-2xl text-white">{s.val}</span>
                    <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/30">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/6 pt-16">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-8">Why Book Direct</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-white/5">
            {[
              { title: 'No platform fees', desc: "What you see is what you pay. Turo adds 15–35% on top. We don't." },
              { title: 'Owner picks up the phone', desc: 'Text or call me directly. No ticket queues, no bots, no wait.' },
              { title: 'Always ready', desc: 'Every rental gets a full detail. The car is clean because I drive it too.' },
              { title: 'Flexible pickup', desc: 'I work around your schedule. Need a late drop? Just ask.' },
              { title: 'Steady pricing', desc: 'No surge pricing, no peak-season markups. Same rate, every time.' },
              { title: 'You deal with one person', desc: "From booking to keys — it's me. That's how it should work." },
            ].map(item => (
              <div key={item.title} className="bg-[#0a0a0a] p-8">
                <div className="w-5 h-0.5 bg-[#D4A853] mb-5" />
                <h3 className="font-playfair font-bold text-lg text-white mb-3">{item.title}</h3>
                <p className="text-[13px] text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row gap-4">
          <Link href="/booking" className="inline-block bg-[#D4A853] text-black px-10 py-4 text-[11px] font-bold tracking-[0.16em] uppercase hover:bg-[#e8c278] transition-colors text-center">
            Book Now
          </Link>
          <a href="https://wa.me/17543077359" target="_blank" rel="noopener" className="inline-block border border-white/20 text-white px-10 py-4 text-[11px] font-bold tracking-[0.16em] uppercase hover:border-[#D4A853] hover:text-[#D4A853] transition-colors text-center">
            Text the Owner
          </a>
        </div>
      </div>
    </div>
  )
}
