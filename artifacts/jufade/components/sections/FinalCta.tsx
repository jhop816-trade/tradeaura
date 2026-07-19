import { site } from '@/config/site'
import { TextReveal, Reveal } from '@/components/ui/Reveal'
import { BookButton } from '@/components/ui/BookButton'

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-36">
      {/* Atmosphere */}
      <div className="smoke-layer left-[10%] top-[20%] h-[40vh] w-[50vw] bg-electric/15" aria-hidden />
      <div className="smoke-layer right-[5%] bottom-[10%] h-[35vh] w-[45vw] bg-slate-500/25 [animation-delay:-14s]" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/10 blur-[120px]"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
        <TextReveal
          text="The chair is waiting."
          className="display text-5xl text-frost sm:text-7xl lg:text-8xl"
        />
        <Reveal delay={0.3}>
          <p className="mt-6 max-w-md text-lg text-smoke">
            Lock in your appointment before the best times are gone.
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <div className="mt-10">
            <BookButton placement="final-cta">Book With {site.name}</BookButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
