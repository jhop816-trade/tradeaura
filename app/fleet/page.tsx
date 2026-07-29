import type { Metadata } from 'next'
import Section from '@/components/ui/Section'
import Reveal from '@/components/ui/Reveal'
import VehicleCard from '@/components/ui/VehicleCard'
import { demoFleet } from '@/lib/demo-data'

export const metadata: Metadata = {
  title: 'The Fleet',
  description:
    'Browse the exotic and luxury collection available for private rental. Search, filters and live availability arrive with the booking system.',
}

export default function FleetPage() {
  return (
    <div className="pt-[74px]">
      <Section
        eyebrow="The Collection"
        title="Every vehicle in the fleet"
        intro="Date search, filters and live availability are part of the next build phase. The cards below show the demo inventory."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {demoFleet.map((vehicle, i) => (
            <Reveal key={vehicle.id} index={i % 3}>
              <VehicleCard vehicle={vehicle} />
            </Reveal>
          ))}
        </div>
      </Section>
    </div>
  )
}
