import { Heart, Camera, Building2, Plane, PartyPopper, CalendarDays } from 'lucide-react'
import Section from '@/components/ui/Section'
import Reveal from '@/components/ui/Reveal'

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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {OCCASIONS.map((occasion, i) => (
          <Reveal key={occasion.title} index={i % 3}>
            <button
              type="button"
              data-concierge-open
              className="group w-full h-full text-left glass p-6 flex flex-col gap-4 hover:border-amber/30 transition-colors"
            >
              <occasion.icon size={19} className="text-amber" aria-hidden="true" />
              <div>
                <h3 className="font-display text-lg text-white mb-1.5">{occasion.title}</h3>
                <p className="text-[13px] text-white/45 leading-relaxed">{occasion.body}</p>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
