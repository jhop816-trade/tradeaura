import { Car, CalendarRange, IdCard, PenLine, KeyRound } from 'lucide-react'
import Section from '@/components/ui/Section'
import Reveal from '@/components/ui/Reveal'

const STEPS = [
  { icon: Car, title: 'Choose Your Vehicle', body: 'Browse the collection and pick the car that fits the occasion.' },
  { icon: CalendarRange, title: 'Select Your Dates', body: 'Live availability, transparent pricing, no hidden platform fees.' },
  { icon: IdCard, title: 'Upload Your Documents', body: "Driver's licence and insurance, submitted through encrypted storage." },
  { icon: PenLine, title: 'Sign and Pay', body: 'Review the agreement, sign electronically and pay securely online.' },
  { icon: KeyRound, title: 'Receive Your Vehicle', body: 'Collect in person or have it delivered by concierge to you.' },
]

export default function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      eyebrow="How It Works"
      title="Five steps, start to keys"
      intro="The whole reservation runs online. A human steps in only when something genuinely needs one."
    >
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} index={i} className="h-full">
            <li className="relative h-full glass p-6 flex flex-col gap-4 hover:border-amber/30 transition-colors">
              <span
                aria-hidden="true"
                className="font-display text-5xl text-amber/15 leading-none"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <step.icon size={20} className="text-amber" aria-hidden="true" />
              <div>
                <h3 className="font-display text-lg text-white mb-2">{step.title}</h3>
                <p className="text-[13px] text-white/45 leading-relaxed">{step.body}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
