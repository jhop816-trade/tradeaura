/** Infinite gold service ticker. Duplicated content makes the loop seamless. */
export function Marquee({ items, className = '' }: { items: string[]; className?: string }) {
  const strip = [...items, ...items]
  return (
    <div className={`flex overflow-hidden border-y-2 border-gold bg-black/60 py-3 ${className}`}>
      <div className="flex shrink-0 animate-marquee whitespace-nowrap will-change-transform">
        {strip.map((item, i) => (
          <span key={i} className="display flex items-center px-6 text-2xl text-gold sm:text-3xl">
            {item}
            <span className="px-6 text-frost/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
