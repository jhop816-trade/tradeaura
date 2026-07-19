import { Reveal, TextReveal } from './Reveal'

type Props = {
  kicker: string
  title: string
  intro?: string
  align?: 'left' | 'center'
}

/** Consistent section header: small blue kicker, big display title, intro line. */
export function SectionHeading({ kicker, title, intro, align = 'left' }: Props) {
  const alignCls = align === 'center' ? 'text-center items-center' : 'text-left items-start'
  return (
    <div className={`mb-14 flex flex-col gap-4 ${alignCls}`}>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-electric">{kicker}</p>
      </Reveal>
      <TextReveal text={title} className="display text-4xl text-frost sm:text-5xl lg:text-6xl" />
      {intro ? (
        <Reveal delay={0.15}>
          <p className="max-w-xl text-base leading-relaxed text-smoke">{intro}</p>
        </Reveal>
      ) : null}
    </div>
  )
}
