'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { site } from '@/config/site'

/**
 * Draggable before/after comparison. Uses placeholder tiles until real photos
 * are set at config/site.ts → beforeAfter.
 */
export function BeforeAfterSlider() {
  const [pos, setPos] = useState(50)
  const container = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateFromClientX = (clientX: number) => {
    const rect = container.current?.getBoundingClientRect()
    if (!rect) return
    setPos(Math.min(96, Math.max(4, ((clientX - rect.left) / rect.width) * 100)))
  }

  const { before, after, label } = site.beforeAfter

  return (
    <div
      ref={container}
      role="slider"
      aria-label={`Before and after comparison: ${label}`}
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setPos((p) => Math.max(4, p - 4))
        if (e.key === 'ArrowRight') setPos((p) => Math.min(96, p + 4))
      }}
      onPointerDown={(e) => {
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        updateFromClientX(e.clientX)
      }}
      onPointerMove={(e) => dragging.current && updateFromClientX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      className="relative aspect-[16/10] w-full cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-2xl border border-line"
    >
      {/* AFTER side (full) */}
      <div className="photo-placeholder absolute inset-0">
        {after ? (
          <Image src={after} alt={`After — ${label}`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
        ) : (
          <PlaceholderFace text="AFTER — drop photo at config/site.ts → beforeAfter.after" tone="after" />
        )}
        <span className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold backdrop-blur">
          After
        </span>
      </div>

      {/* BEFORE side (clipped) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <div className="photo-placeholder absolute inset-0 brightness-[0.65] saturate-50">
          {before ? (
            <Image src={before} alt={`Before — ${label}`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
          ) : (
            <PlaceholderFace text="BEFORE" tone="before" />
          )}
        </div>
        <span className="absolute bottom-4 left-4 rounded-full bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-smoke backdrop-blur">
          Before
        </span>
      </div>

      {/* Handle */}
      <div className="absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -translate-x-1/2 border-l-2 border-frost/80" />
        <div className="glow-gold absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-frost/50 bg-ink/80 text-frost backdrop-blur">
          <span className="text-xs">↔</span>
        </div>
      </div>
    </div>
  )
}

function PlaceholderFace({ text, tone }: { text: string; tone: 'before' | 'after' }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <p className={`max-w-xs text-center text-xs uppercase tracking-[0.2em] ${tone === 'after' ? 'text-gold/80' : 'text-smoke/70'}`}>
        {text}
      </p>
    </div>
  )
}
