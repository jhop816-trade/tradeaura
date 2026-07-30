import Section from '@/components/ui/Section'
import StaggerGrid from '@/components/ui/StaggerGrid'
import { demoStories } from '@/lib/demo-data'

/**
 * Narrative vignettes, distinct from the star-rated Reviews section — these
 * are fictional placeholder copy (see the warning in demo-data.ts), not real
 * customer accounts, and must not be published as-is.
 */
export default function CustomerStories() {
  return (
    <Section
      eyebrow="Stories"
      title="A few of the moments"
      intro="Sample vignettes, not real accounts — replaced before launch."
      className="bg-ink-050 border-y hairline"
    >
      <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-5" y={30}>
        {demoStories.map(story => (
          <article key={story.id} className="glass p-7 sm:p-8 flex flex-col h-full hover:border-amber/25 transition-colors">
            <span className="eyebrow mb-4">{story.occasion}</span>
            <h3 className="font-display text-xl text-white mb-3">{story.title}</h3>
            <p className="text-[14px] text-white/55 leading-relaxed flex-1">{story.body}</p>
            <p className="text-[11px] text-white/30 mt-6 pt-5 border-t hairline">{story.vehicleName}</p>
          </article>
        ))}
      </StaggerGrid>
    </Section>
  )
}
