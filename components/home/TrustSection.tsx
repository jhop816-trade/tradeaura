import { ShieldCheck, CreditCard, FileText, Sparkles, Clock, MapPin } from 'lucide-react'
import Section from '@/components/ui/Section'
import Reveal from '@/components/ui/Reveal'

const ITEMS = [
  { icon: CreditCard, title: 'Secure payments', body: 'Card details are handled by the payment processor and never stored on this site.' },
  { icon: ShieldCheck, title: 'Insurance & age', body: 'Full coverage and a minimum age apply. Exact requirements are confirmed at booking.' },
  { icon: FileText, title: 'Clear agreement', body: 'You review and sign the rental agreement before any vehicle is released.' },
  { icon: Sparkles, title: 'Detailed every time', body: 'Every vehicle is cleaned and inspected between rentals, without exception.' },
  { icon: Clock, title: 'Mileage & returns', body: 'Daily mileage is listed on each vehicle. Late returns and overages are billed transparently.' },
  { icon: MapPin, title: 'Delivery options', body: 'Collect in person, or arrange delivery to a hotel, residence or airport.' },
]

export default function TrustSection() {
  return (
    <Section
      eyebrow="Trust & Safety"
      title="No surprises at the counter"
      intro="Policies are published in full before launch and reviewed by the company's legal counsel."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ITEMS.map((item, i) => (
          <Reveal key={item.title} index={i % 3} className="h-full">
            <div className="h-full glass p-6 hover:border-amber/25 transition-colors">
              <item.icon size={19} className="text-amber mb-4" aria-hidden="true" />
              <h3 className="font-display text-lg text-white mb-2">{item.title}</h3>
              <p className="text-[13px] text-white/45 leading-relaxed">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
