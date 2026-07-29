import { IS_DEMO_DATA } from '@/lib/demo-data'

/**
 * Site-wide notice that the fleet, pricing and reviews on screen are
 * placeholder content. Renders nothing once `IS_DEMO_DATA` is false.
 *
 * This is deliberately unmissable: the brief requires that nothing pretends to
 * be a working booking platform before the integrations are actually wired up.
 */
export default function DemoDataBanner() {
  if (!IS_DEMO_DATA) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] bg-amber text-black">
      <p className="max-w-6xl mx-auto px-4 py-2 text-[11px] sm:text-xs font-semibold tracking-wide text-center">
        Preview build — demo fleet and placeholder reviews. Booking, payments and
        the AI concierge are not connected yet.
      </p>
    </div>
  )
}
