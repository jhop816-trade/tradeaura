import Image from 'next/image'
import { brand } from '@/lib/brand'

type Size = 'sm' | 'md' | 'lg'

interface Props {
  size?: Size
  showWordmark?: boolean
  /** Footer treatment: "Strictly" + accent dot + "Bread". */
  splitWordmark?: boolean
  className?: string
  wordmarkClassName?: string
}

/** Rendered size paired with the asset that covers it at 2x. */
const SIZES: Record<Size, { px: number; src: string; text: string }> = {
  sm: { px: 30, src: brand.logo.small, text: 'text-sm' },
  md: { px: 42, src: brand.logo.medium, text: 'text-lg' },
  lg: { px: 76, src: brand.logo.large, text: 'text-2xl' },
}

/**
 * The company lockup — logo disc, optionally with the wordmark beside it.
 * Defined once so the navbar, footer and any future admin screens stay in sync.
 */
export default function BrandMark({
  size = 'md',
  showWordmark = true,
  splitWordmark = false,
  className = '',
  wordmarkClassName = '',
}: Props) {
  const { px, src, text } = SIZES[size]

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src={src}
        alt={showWordmark ? '' : brand.logo.alt}
        aria-hidden={showWordmark || undefined}
        width={px}
        height={px}
        className="rounded-full shrink-0"
        priority={size !== 'sm'}
      />
      {showWordmark && (
        <span
          className={`font-display ${text} tracking-wide text-white whitespace-nowrap ${wordmarkClassName}`}
        >
          {splitWordmark ? (
            <>
              {brand.wordmark.lead}
              <span className="text-amber">.</span>
              {brand.wordmark.trail}
            </>
          ) : (
            brand.shortName
          )}
        </span>
      )}
    </span>
  )
}
