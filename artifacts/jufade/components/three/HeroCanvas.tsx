'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { stageState } from '@/lib/scrollState'

// The whole three.js bundle stays out of the critical path — it only loads
// after hydration, and only on devices that can handle it.
const Scene = dynamic(() => import('./Scene'), { ssr: false })

/** Static fallback for reduced-motion, no-WebGL, and low-power devices. */
export function HeroFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="smoke-layer left-[-10%] top-[20%] h-[50vh] w-[60vw] bg-slate-500/40" />
      <div className="smoke-layer right-[-15%] top-[45%] h-[45vh] w-[55vw] bg-electric/20 [animation-delay:-8s]" />
      {/* Chair silhouette — replace with a real photo at public/images/hero-fallback.jpg if preferred */}
      <svg
        viewBox="0 0 400 480"
        className="absolute left-1/2 top-1/2 h-[62vh] -translate-x-1/2 -translate-y-[46%] opacity-90"
      >
        <defs>
          <linearGradient id="chromeFall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e8ecf2" />
            <stop offset="0.5" stopColor="#767e8c" />
            <stop offset="1" stopColor="#c9cfd9" />
          </linearGradient>
          <radialGradient id="glowFall" cx="0.5" cy="0.55" r="0.55">
            <stop offset="0" stopColor="#4d8dff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#4d8dff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="400" height="480" fill="url(#glowFall)" />
        <g>
          <rect x="130" y="70" width="140" height="150" rx="26" fill="#101216" />
          <rect x="118" y="200" width="164" height="52" rx="20" fill="#0c0d10" />
          <rect x="96" y="196" width="26" height="70" rx="10" fill="#15171c" />
          <rect x="278" y="196" width="26" height="70" rx="10" fill="#15171c" />
          <rect x="160" y="40" width="80" height="34" rx="14" fill="#101216" />
          <rect x="188" y="252" width="24" height="86" rx="8" fill="url(#chromeFall)" />
          <ellipse cx="200" cy="360" rx="92" ry="18" fill="url(#chromeFall)" />
          <rect x="150" y="284" width="100" height="8" rx="4" fill="url(#chromeFall)" transform="rotate(18 200 288)" />
          <ellipse cx="200" cy="400" rx="120" ry="10" fill="#4d8dff" opacity="0.12" />
        </g>
      </svg>
    </div>
  )
}

/**
 * Mounts the 3D scene lazily after first paint, with pointer tracking and a
 * graceful fallback when WebGL / motion isn't available.
 */
export function HeroCanvas() {
  const [mode, setMode] = useState<'pending' | 'high' | 'low' | 'fallback'>('pending')

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (reduced || !gl) {
      setMode('fallback')
      return
    }
    const weak = (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth < 480
    const start = () => setMode(weak ? 'low' : 'high')
    // Defer the three.js chunk until the browser is idle
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(start, 300)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (mode === 'fallback' || mode === 'pending') return
    const onMove = (e: PointerEvent) => {
      stageState.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      stageState.pointerY = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mode])

  if (mode === 'fallback') return <HeroFallback />
  if (mode === 'pending') return <div className="absolute inset-0" aria-hidden />
  return (
    <div className="absolute inset-0" aria-hidden>
      <Scene quality={mode} />
    </div>
  )
}
