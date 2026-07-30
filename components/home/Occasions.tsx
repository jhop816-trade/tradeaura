import { Heart, Camera, Building2, Plane, PartyPopper, CalendarDays } from 'lucide-react'
import Section from '@/components/ui/Section'
import StaggerGrid from '@/components/ui/StaggerGrid'

const OCCASIONS = [
  { icon: Heart, title: 'Weddings', body: 'Arrival, send-off, or both — timed to the minute.' },
  { icon: Camera, title: 'Photo & Video', body: 'Music videos, shoots and campaigns, any vehicle in the fleet.' },
  { icon: Building2, title: 'Corporate', body: 'Client arrivals, executive transport, brand activations.' },
  { icon: Plane, title: 'Airport', body: 'Land and drive — or have it waiting curbside.' },
  { icon: PartyPopper, title: 'Milestones', body: 'Birthdays, graduations, anniversaries worth remembering.' },
  { icon: CalendarDays, title: 'Weekend Escapes', body: 'A different kind of Saturday. No occasion required.' },
]

/**
 * Every card opens the concierge — the same entry point as the hero's
 * secondary CTA — rather than a dead-end contact form, since that's the one
 * "start a conversation" surface that exists in Phase 1.
 */
export default function Occasions() {
  return (
    <Section
      eyebrow="Made For The Moment"
      title="Whatever the occasion calls for"
      intro="Tell the concierge what you're planning and it narrows the fleet to fit."
    >
      <StaggerGrid className="grid grid-cols-2 lg:grid-cols-3 gap-4" y={28}>
        {OCCASIONS.map(occasion => (
          <button
            key={occasion.title}
            type="button"
            data-concierge-open
            className="group relative w-full h-full text-left glass overflow-hidden p-6 sm:p-7 flex flex-col gap-6 hover:border-amber/30 transition-colors"
          >
            <occasion.icon
              size={64}
              strokeWidth={0.9}
              className="absolute -top-3 -right-3 text-amber/0 group-hover:text-amber/[0.08] transition-colors duration-500"
              aria-hidden="true"
            />
            <occasion.icon size={20} className="relative text-amber" aria-hidden="true" />
            <div className="relative">
              <h3 className="font-display text-lg sm:text-xl text-white mb-1.5 transition-transform duration-500 group-hover:-translate-y-0.5">
                {occasion.title}
              </h3>
              <p className="text-[13px] text-white/45 leading-relaxed">{occasion.body}</p>
            </div>
          </button>
        ))}
      </StaggerGrid>
    </Section>
  )
}
