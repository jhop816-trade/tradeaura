import Link from 'next/link'
import Section from '@/components/ui/Section'
import Reveal from '@/components/ui/Reveal'
import VehicleCard from '@/components/ui/VehicleCard'
import type { Vehicle } from '@/lib/types'

export default function FleetPreview({ vehicles }: { vehicles: readonly Vehicle[] }) {
  return (
    <Section
      id="fleet"
      eyebrow="The Collection"
      title="A fleet worth the occasion"
      intro="Each vehicle is inspected, detailed and delivered ready. Availability updates in real time once the booking system is connected."
      className="sheen bg-ink-050 border-y hairline"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {vehicles.map((vehicle, i) => (
          <Reveal key={vehicle.id} index={i % 3}>
            <VehicleCard vehicle={vehicle} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14 flex justify-center">
        <Link
          href="/fleet"
          className="inline-flex items-center gap-2 border hairline text-white px-10 py-4 text-[11px] font-bold tracking-[0.16em] uppercase hover:border-amber/50 hover:text-amber transition-colors"
        >
          Browse the full fleet
        </Link>
      </Reveal>
    </Section>
  )
}
