import Link from 'next/link'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase/server'
import type { Vehicle } from '@/types'
import DashboardHero from '@/components/DashboardHero'

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
      <section className="bg-[#0d0d0d] border-y border-white/5 px-10 md:px-20 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-20 items-start">
          <div className="md:sticky md:top-28">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-4">Why Book Direct</p>
            <h2 className="font-playfair font-black text-5xl leading-none text-white tracking-tight">A Different<br />Standard</h2>
          </div>
          <div className="flex flex-col">
            {[
              { num: '01', title: 'You talk to me, not a call center', desc: 'Book directly with the owner. I answer fast, I\'m flexible, and I actually care that your experience is good.' },
              { num: '02', title: 'The car is always ready', desc: 'Both vehicles are personally maintained and detailed before every rental. No surprises when you show up.' },
              { num: '03', title: 'Straightforward pricing', desc: 'Deposit online, balance at pickup. No hidden fees, no agency markup. What you see is what you pay.' },
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
      <section className="bg-black px-10 md:px-20 py-28">
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
      <section className="bg-[#060606] border-t border-white/5 px-10 md:px-20 py-28">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-3">Reviews</p>
          <h2 className="font-playfair font-black text-5xl leading-none text-white tracking-tight mb-16">What Renters Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { text: 'Pulled up in the Tesla and honestly turned heads all weekend. Car was spotless, owner responded within like 20 minutes. Way better than Turo.', name: 'Alex M.' },
              { text: 'Rented the Mercedes for my anniversary trip. Whole process was smooth, no weird fees, and the car was immaculate. Already booked again.', name: 'Brittany K.' },
            ].map(r => (
              <div key={r.name} className="relative bg-[#0f0f0f] border border-white/7 p-11 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bottom-0 font-playfair text-[120px] text-[#D4A853] opacity-[0.08] leading-none pointer-events-none select-none pl-6 -mt-3">"</div>
                <div className="w-8 h-0.5 bg-[#D4A853] mb-7" />
                <p className="font-playfair italic text-lg text-white/80 leading-relaxed mb-9">"{r.text}"</p>
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#D4A853]">{r.name}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/reviews" className="text-xs text-white/30 hover:text-white/60 tracking-widest uppercase border-b border-white/20 pb-0.5 hover:border-white/40 transition-colors">
              Read all reviews
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black border-t border-[#D4A853]/10 px-10 md:px-20 py-28">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-16">
          <div className="max-w-xl">
            <div className="w-12 h-[3px] bg-[#D4A853] mb-7" />
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853] mb-4">Ready to go?</p>
            <h2 className="font-playfair font-black text-5xl md:text-[54px] leading-none text-white tracking-tight mb-4">
              Pick your dates.<br />We'll handle the rest.
            </h2>
            <p className="text-[15px] text-white/40 leading-relaxed">Check availability and pay the deposit in minutes. I'll reach out to confirm pickup details personally.</p>
          </div>
          <div className="shrink-0">
            <Link href="/booking"
              className="block bg-[#D4A853] text-black px-14 py-5 text-[13px] font-bold tracking-[0.16em] uppercase hover:bg-[#e8c278] transition-colors mb-3 text-center">
              Check Availability
            </Link>
            <p className="text-[11px] text-white/20 text-center tracking-wide">Available 7 days a week</p>
          </div>
        </div>
      </section>
    </>
  )
}
