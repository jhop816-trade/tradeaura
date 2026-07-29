import Hero from '@/components/home/Hero'
import FleetPreview from '@/components/home/FleetPreview'
import HowItWorks from '@/components/home/HowItWorks'
import Reviews from '@/components/home/Reviews'
import TrustSection from '@/components/home/TrustSection'
import { demoFleet, demoReviews } from '@/lib/demo-data'

/**
 * Phase 1 reads from the demo module. Phase 2 swaps these two lines for
 * Supabase queries — the sections take data as props and do not change.
 */
export default function HomePage() {
  const featured = demoFleet.slice(0, 6)

  return (
    <>
      <Hero />
      <FleetPreview vehicles={featured} />
      <HowItWorks />
      <Reviews reviews={demoReviews} />
      <TrustSection />
    </>
  )
}
