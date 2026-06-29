'use client'
import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  photos: string[]
  alt: string
}

const FALLBACK = '/images/placeholder.jpg'

export default function PhotoCarousel({ photos, alt }: Props) {
  const images = photos.length > 0 ? photos : [FALLBACK]
  const [index, setIndex] = useState(0)

  function prev() { setIndex(i => (i - 1 + images.length) % images.length) }
  function next() { setIndex(i => (i + 1) % images.length) }

  return (
    <div className="overflow-hidden">
      <div className="relative aspect-video">
        <Image
          src={images[index]}
          alt={`${alt} — photo ${index + 1}`}
          fill
          className="object-cover"
          priority={index === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 transition-colors ${i === index ? 'bg-[#D4A853]' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
