import { Check } from 'lucide-react'
import Section from '@/components/ui/Section'
import StaggerGrid from '@/components/ui/StaggerGrid'
import { demoMembershipTiers } from '@/lib/demo-data'

/**
 * Illustrative — the tier names and benefits below are a concept, not a live
 * program. No enrollment exists yet; the CTA opens the concierge rather than
 * a signup form that would collect information for a plan that doesn't
 * exist.
 */
export default function VipMembership() {
  return (
    <Section
      eyebrow="Membership — Preview"
      title="An account, not just a rental"
      intro="A concept for regular renters, shown here for feedback. Full terms and a real way to join are published before this launches."
      className="bg-ink-050 border-y hairline"
    >
      <StaggerGrid className="grid grid-cols-1 lg:grid-cols-3 gap-5" y={30}>
        {demoMembershipTiers.map(tier => (
          <div
            key={tier.id}
            className={`relative flex flex-col p-8 sm:p-9 transition-colors ${
              tier.featured
                ? 'glass border-amber/40 lg:-translate-y-3 lg:scale-[1.03] shadow-[var(--shadow-lift)]'
                : 'glass hover:border-amber/25'
            }`}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-8 bg-amber text-black px-3 py-1 text-[9px] font-bold tracking-[0.14em] uppercase">
                Most requested
              </span>
            )}
            <p className="eyebrow mb-2">{tier.tagline}</p>
            <h3 className="font-display text-display-md text-white mb-6">{tier.name}</h3>
            <ul className="flex flex-col gap-3 flex-1">
              {tier.benefits.map(benefit => (
                <li key={benefit} className="flex items-start gap-2.5 text-[13px] text-white/55 leading-relaxed">
                  <Check size={14} className="text-amber shrink-0 mt-0.5" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
            <button
              type="button"
              data-concierge-open
              className={`mt-8 w-full text-center px-6 py-3.5 text-[10px] font-bold tracking-[0.14em] uppercase transition-colors ${
                tier.featured
                  ? 'bg-amber text-black hover:bg-amber-bright'
                  : 'border hairline text-white hover:border-amber/50 hover:text-amber'
              }`}
            >
              Ask About {tier.name}
            </button>
          </div>
        ))}
      </StaggerGrid>
    </Section>
  )
}
