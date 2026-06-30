import Link from 'next/link'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase/server'
import type { Vehicle } from '@/types'
import DashboardHero from '@/components/DashboardHero'
import GoldAurora from '@/components/GoldAurora'

async function getVehicles(): Promise<Vehicle[]> {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase.from('vehicles').select('*').eq('active', true)
    return data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const vehicles = await getVehicles()

  return (
    <>
      <DashboardHero />

      {/* VALUE PROPS */}
      <section className="relative bg-[#0d0d0d] border-y border-white/5 px-10 md:px-20 py-24">
        <GoldAurora />
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-20 items-start">
          <div className="md:sticky md:top-28">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-4">Why Book Direct</p>
            <h2 className="font-playfair font-black text-5xl leading-none text-white tracking-tight">Skip the<br />Platform.</h2>
          </div>
          <div className="flex flex-col">
            {[
              { num: '01', title: 'You text the owner, period', desc: "No support tickets. No chatbots. You reach me directly — I'm the one who owns the car, handles the booking, and hands you the keys. I respond fast because I actually want your business." },
              { num: '02', title: 'Both cars stay spotless', desc: 'I detail every vehicle before pickup. Not because I have to — because I drive these cars too. When you get in, it will smell clean and look new.' },
              { num: '03', title: 'The price is the price', desc: "Deposit online, balance at pickup. No 15% Turo service fee, no insurance upsell you didn't ask for, no \"convenience\" charges. $150 or $175 a day — that's it." },
            ].map((v, i) => (
              <div key={v.num} className={`flex gap-8 items-start py-9 border-white/6 ${i === 0 ? 'border-t border-b' : 'border-b'}`}>
                <span className="font-playfair font-bold text-5xl text-[#D4A853] opacity-35 leading-none min-w-[60px]">{v.num}</span>
                <div>
                  <h3 className="font-playfair font-bold text-[22px] text-white mb-2.5">{v.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLEET */}
      <section className="relative bg-black px-10 md:px-20 py-28">
        <GoldAurora />
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Our Collection</p>
          <h2 className="font-playfair font-black text-5xl md:text-6xl leading-none text-white tracking-tight mb-16">The Fleet</h2>

          <div className="flex flex-col gap-1">
            {vehicles.map((vehicle, i) => (
              <div key={vehicle.id} className={`grid grid-cols-1 md:grid-cols-2 bg-[#0f0f0f] border border-white/6 overflow-hidden min-h-[400px] ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
                {/* Photo */}
                <div className={`relative overflow-hidden min-h-[260px] md:min-h-0 ${i % 2 === 1 ? '[direction:ltr]' : ''}`}>
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#D4A853] z-10" />
                  {vehicle.photos?.[0] ? (
                    <Image
                      src={vehicle.photos[0]}
                      alt={vehicle.name}
                      fill
                      className="object-cover saturate-80 brightness-90 hover:scale-[1.03] transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
                  )}
                </div>

                {/* Details */}
                <div className={`flex flex-col justify-center p-10 md:p-14 ${i % 2 === 1 ? '[direction:ltr]' : ''}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-px bg-[#D4A853]" />
                    <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#D4A853]">{vehicle.make}</span>
                  </div>
                  <h3 className="font-playfair font-bold text-4xl text-white leading-tight mb-4">{vehicle.name}</h3>
                  <p className="text-sm text-white/45 leading-relaxed mb-9">{vehicle.description}</p>

                  <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/6 mb-9">
                    {[
                      { val: `$${vehicle.daily_rate}`, label: 'Per day' },
                      { val: `$${vehicle.deposit_amount}`, label: 'Deposit' },
                      { val: `${vehicle.mileage_limit}mi`, label: 'Daily limit' },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="font-bold text-2xl text-white leading-none mb-1">{s.val}</div>
                        <div className="text-[9px] font-bold tracking-[0.12em] uppercase text-white/30">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-5">
                    <Link href={`/booking?vehicle=${vehicle.slug}`}
                      className="bg-[#D4A853] text-black px-8 py-3.5 text-[11px] font-bold tracking-[0.14em] uppercase hover:bg-[#e8c278] transition-colors">
                      Book This Car
                    </Link>
                    <Link href={`/fleet/${vehicle.slug}`}
                      className="text-[11px] font-medium tracking-[0.12em] uppercase text-white/40 hover:text-white transition-colors border border-white/15 hover:border-white/40 px-6 py-3.5">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative bg-[#060606] border-t border-white/5 px-10 md:px-20 py-28">
        <GoldAurora />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-[#D4A853]">★</span>
              ))}
            </div>
            <span className="text-white/25 text-xs tracking-widest">5.0 · 8 verified reviews</span>
          </div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Turo Verified</p>
          <h2 className="font-playfair font-black text-5xl leading-none text-white tracking-tight mb-16">What Renters Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {[
              { text: "A beautiful clean car and a unique driving experience. It was like a comfortable tour guide around Florida for the duration of my stay. The only thing better was the owner who was knowledgeable and friendly with a quick response for my every want and need. I would highly recommend both this vehicle and its owner.", name: 'Brian', date: 'February 2026' },
              { text: "An amazing host super nice car well kept. He really works with you and tries to make sure your trip is the best! Definitely renting with him again and every time I come to Fort Lauderdale.", name: 'Tyrell', date: 'January 2026' },
            ].map(r => (
              <div key={r.name} className="relative bg-[#0f0f0f] border border-white/7 p-11 overflow-hidden hover:border-[#D4A853]/20 transition-colors">
                <div className="absolute top-0 left-0 right-0 bottom-0 font-playfair text-[140px] text-[#D4A853] opacity-[0.06] leading-none pointer-events-none select-none pl-6 -mt-4">"</div>
                <div className="flex gap-0.5 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-[#D4A853] text-sm">★</span>
                  ))}
                </div>
                <p className="font-playfair italic text-[17px] text-white/75 leading-relaxed mb-9">"{r.text}"</p>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-white">{r.name}</p>
                  <div className="text-right">
                    <p className="text-[10px] text-white/25">{r.date}</p>
                    <p className="text-[9px] font-bold tracking-widest uppercase text-[#D4A853]/50 mt-0.5">Turo · Verified</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/reviews" className="text-[11px] text-white/30 hover:text-[#D4A853] tracking-[0.2em] uppercase transition-colors">
              See all 8 reviews →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-black border-t border-[#D4A853]/10 px-10 md:px-20 py-28">
        <GoldAurora />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-16">
          <div className="max-w-xl">
            <div className="w-12 h-[3px] bg-[#D4A853] mb-7" />
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-4">Ready?</p>
            <h2 className="font-playfair font-black text-5xl md:text-[54px] leading-none text-white tracking-tight mb-4">
              Pick your dates.<br />I'll take it<br />from there.
            </h2>
            <p className="text-[15px] text-white/40 leading-relaxed">Book online, pay the deposit, and I'll reach out within the hour to confirm pickup. Seven days a week.</p>
          </div>
          <div className="shrink-0 flex flex-col items-center gap-4">
            <Link href="/booking"
              className="block bg-[#D4A853] text-black px-14 py-5 text-[13px] font-bold tracking-[0.16em] uppercase hover:bg-[#e8c278] transition-colors text-center">
              Check Availability
            </Link>
            <a href="https://wa.me/17543077359" target="_blank" rel="noopener"
              className="text-[11px] text-white/25 hover:text-[#D4A853] tracking-[0.14em] uppercase transition-colors">
              or text (754) 307-7359
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
