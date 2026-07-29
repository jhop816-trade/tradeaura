import Image from 'next/image'
import { Armchair, Music, ShieldCheck, Sparkles } from 'lucide-react'
import { site } from '@/config/site'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'

const icons = [ShieldCheck, Sparkles, Music, Armchair]

export function Suite() {
  return (
    <section id="suite" className="relative mx-auto max-w-6xl px-5 py-28">
      <SectionHeading
        kicker="The Suite"
        title="A private suite, not a shop"
        intro="No waiting room. No crowd. The whole space is set up for one client at a time."
      />

      {/* Suite photo grid — add more at config/site.ts → suite.photos */}
      <div className="grid gap-4 sm:grid-cols-2">
        {site.suite.photos.map((src, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="photo-placeholder group relative aspect-[4/5] overflow-hidden rounded-xl border-2 border-line transition-colors hover:border-gold">
              {src ? (
                <Image
                  src={src}
                  alt={`JuFade private suite — photo ${i + 1}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-4">
                  <p className="text-center text-[10px] uppercase tracking-[0.2em] text-smoke/50">
                    Suite photo {i + 1}
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {/* Highlights */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {site.suite.highlights.map((h, i) => {
          const Icon = icons[i % icons.length]
          return (
            <Reveal key={h.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-line bg-panel/50 p-6">
                <Icon size={20} className="text-gold" />
                <p className="mt-4 font-semibold text-frost">{h.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-smoke">{h.text}</p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
