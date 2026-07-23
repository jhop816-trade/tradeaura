import { Reveal, TextReveal } from './Reveal'

type Props = {
  kicker: string
  title: string
  intro?: string
  align?: 'left' | 'center'
}

/** Poster-style section header: tilted gold sticker tag + condensed title. */
export function SectionHeading({ kicker, title, intro, align = 'left' }: Props) {
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left'
  return (
    <div className={`mb-12 flex flex-col gap-5 ${alignCls}`}>
      <Reveal>
        <span className="poster-tag">{kicker}</span>
      </Reveal>
      <TextReveal text={title} className="display text-5xl text-frost sm:text-6xl lg:text-7xl" />
      {intro ? (
        <Reveal delay={0.15}>
          <p className="max-w-xl text-base leading-relaxed text-smoke">{intro}</p>
        </Reveal>
      ) : null}
    </div>
  )
}
