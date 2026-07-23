import { Navbar } from '@/components/Navbar'
import { StickyBookButton } from '@/components/StickyBookButton'
import { Footer } from '@/components/Footer'
import { CinematicStage } from '@/components/sections/CinematicStage'
import { BrandStrip } from '@/components/sections/BrandStrip'
import { About } from '@/components/sections/About'
import { Work } from '@/components/sections/Work'
import { Services } from '@/components/sections/Services'
import { Booking } from '@/components/sections/Booking'
import { Reviews } from '@/components/sections/Reviews'
import { Suite } from '@/components/sections/Suite'
import { Location } from '@/components/sections/Location'
import { FinalCta } from '@/components/sections/FinalCta'

export default function Home() {
  return (
    <main>
      <Navbar />
      <CinematicStage />
      <BrandStrip />
      <About />
      <Work />
      <Services />
      <Booking />
      <Reviews />
      <Suite />
      <Location />
      <FinalCta />
      <Footer />
      <StickyBookButton />
    </main>
  )
}
