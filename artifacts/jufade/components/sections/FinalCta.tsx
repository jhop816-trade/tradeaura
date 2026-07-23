import { site } from '@/config/site'
import { TextReveal, Reveal } from '@/components/ui/Reveal'
import { BookSticker } from '@/components/ui/Sticker'
import { BrandLogo } from '@/components/ui/BrandLogo'

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t-2 border-gold py-36">
      {/* Atmosphere */}
      <div className="smoke-layer left-[10%] top-[20%] h-[40vh] w-[50vw] bg-gold/12" aria-hidden />
      <div className="smoke-layer right-[5%] bottom-[10%] h-[35vh] w-[45vw] bg-slate-500/25 [animation-delay:-14s]" aria-hidden />
      {/* Reaper watermark */}
      <BrandLogo className="pointer-events-none absolute left-1/2 top-1/2 h-[80vh] max-h-[560px] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.08]" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
        <Reveal>
          <span className="poster-tag">The Chair Is Waiting</span>
        </Reveal>
        <TextReveal
          text="The chair is waiting."
          className="display mt-6 text-6xl text-frost sm:text-8xl lg:text-[8.5rem]"
        />
        <Reveal delay={0.3}>
          <p className="mt-6 max-w-md text-lg text-smoke">
            Lock in your appointment before the best times are gone.
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <div className="mt-10">
            <BookSticker placement="final-cta" size="lg">
              Book With {site.name}
            </BookSticker>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
