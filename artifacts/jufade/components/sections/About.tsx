import Image from 'next/image'
import { Scissors } from 'lucide-react'
import { site } from '@/config/site'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-5 py-28">
      <SectionHeading
        kicker="The Barber"
        title="Behind the chair"
        intro="One barber. One chair. One client at a time."
      />
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <Reveal>
          {/* REPLACE: drop your professional photo at public/images/barber.jpg */}
          <div className="photo-placeholder relative aspect-[4/5] overflow-hidden rounded-2xl border border-line">
            {site.about.photo ? (
              <Image
                src={site.about.photo}
                alt="Ju, the barber behind JuFade"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="max-w-[14rem] text-center text-xs uppercase tracking-[0.2em] text-smoke/60">
                  Your photo here — public/images/barber.jpg
                </p>
              </div>
            )}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/90 via-transparent p-6">
              <div>
                <p className="display text-3xl text-frost">Ju</p>
                <p className="text-xs uppercase tracking-[0.25em] text-smoke">
                  Founder · {site.name}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
        <div className="flex flex-col gap-8">
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-smoke">{site.about.intro}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex items-center gap-6 rounded-2xl border border-line bg-panel/50 p-6">
              {site.about.years ? (
                <>
                  <p className="display text-6xl text-chrome-gradient">{site.about.years}+</p>
                  <div>
                    <p className="font-semibold text-frost">Years behind the chair</p>
                    <p className="text-sm text-smoke">Cutting since day one — private suite by choice.</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="display text-6xl text-gold">{site.reviewStats.rating}</p>
                  <div>
                    <p className="font-semibold text-frost">
                      {site.reviewStats.count} five-star reviews
                    </p>
                    <p className="text-sm text-smoke">
                      Verified on {site.reviewStats.source} — not a single rating under five.
                    </p>
                  </div>
                </>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                Specialties
              </p>
              <div className="flex flex-wrap gap-2">
                {site.about.specialties.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/60 px-4 py-2 text-sm text-frost"
                  >
                    <Scissors size={13} className="text-gold" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <p className="border-l-2 border-gold pl-4 text-sm italic text-smoke">
              “The suite is private for a reason. When you're in the chair, the appointment is
              about you — not the next guy in line.”
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
