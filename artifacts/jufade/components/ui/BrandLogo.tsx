/**
 * The JuFadedd reaper logo, with its smoky grey background radially masked so
 * the edges dissolve into the site's black instead of showing a hard rectangle.
 * REPLACE the artwork at public/images/logo.jpg (keep it roughly centered).
 */
export function BrandLogo({
  className = '',
  priority = false,
}: {
  className?: string
  priority?: boolean
}) {
  const mask =
    'radial-gradient(ellipse 60% 64% at 50% 46%, #000 40%, rgba(0,0,0,0.35) 66%, transparent 86%)'
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo.jpg"
      alt="JuFadedd — hooded barber reaper logo"
      loading={priority ? 'eager' : 'lazy'}
      className={`pointer-events-none select-none object-contain ${className}`}
      style={{
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        filter: 'brightness(0.9) contrast(1.06)',
      }}
    />
  )
}
