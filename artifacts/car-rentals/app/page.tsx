import Link from 'next/link'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase/server'
import type { Vehicle } from '@/types'

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
  const [primary] = vehicles

  return (
    <>
      {/* HERO — Editorial Split */}
      <section className="flex min-h-screen mt-[76px]">
        {/* Left */}
        <div className="flex-1 relative bg-black flex flex-col justify-center px-10 md:px-20 py-20">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 20% 60%, rgba(212,168,83,0.05) 0%, transparent 60%)' }} />
          {/* Gold vertical line */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, transparent 5%, #D4A853 30%, #D4A853 70%, transparent 95%)', opacity: 0.4 }} />

          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-[#D4A853]" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853]">Private Car Rentals</span>
            </div>

            <h1 className="font-playfair font-black text-[clamp(52px,7vw,82px)] leading-[0.92] tracking-tight text-white mb-9">
              Drive<br />Something<br /><em className="italic text-[#D4A853]">Worth It.</em>
            </h1>

            <p className="text-[15px] font-light text-white/50 leading-relaxed max-w-sm mb-12">
              Tesla Model 3 and Mercedes-Benz C300. Book directly with the owner — no agency, no fees, no nonsense.
            </p>

            <div className="flex flex-col gap-4">
              <Link href="/booking"
                className="self-start bg-[#D4A853] text-black px-10 py-[18px] text-[12px] font-bold tracking-[0.16em] uppercase hover:bg-[#e8c278] transition-colors">
                Book Now
              </Link>
              <Link href="/fleet"
                className="self-start flex items-center gap-3 text-[12px] font-medium tracking-[0.12em] uppercase text-white/45 hover:text-white transition-colors group">
                View Fleet <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="mt-14 pt-10 border-t border-white/7 flex gap-10">
              {[
                { val: '2', label: 'Vehicles' },
                { val: '$250', label: 'From / day' },
                { val: '24h', label: 'Response' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-playfair font-bold text-4xl text-white leading-none mb-1.5">{s.val}</div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/30">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — car photo */}
        <div className="hidden md:block flex-1 relative overflow-hidden">
          {primary?.photos?.[0] ? (
            <Image
              src={primary.photos[0]}
              alt={primary.name}
              fill
              className="object-cover saturate-75 brightness-90"
              priority
              sizes="50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] to-[#080808]" />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.2) 0%, transparent 30%)' }} />
          {primary && (
            <div className="absolute bottom-8 right-8 bg-black/70 backdrop-blur border border-[#D4A853]/30 px-5 py-4">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#D4A853] mb-1">{primary.name}</p>
              <p className="font-playfair font-bold text-2xl text-white">${primary.daily_rate}<span className="font-sans text-xs text-white/40 font-normal">/day</span></p>
            </div>
          )}
        </div>
      </section>

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
