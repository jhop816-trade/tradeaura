'use client'
import { useEffect, useRef } from 'react'

interface Blob {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  a: number
}

/**
 * Drifting volumetric fog behind the hero.
 *
 * Performance notes — this runs on every visitor's first paint, so:
 *  - the backing store is rendered at 0.35x and upscaled by CSS, which cuts
 *    fill cost by ~8x. Fog is blurry, so the resolution loss is invisible.
 *  - the loop stops when the tab is hidden or the hero scrolls out of view.
 *  - it does not start at all under `prefers-reduced-motion`; a static
 *    gradient is painted once instead.
 */
export default function FogCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SCALE = 0.35
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let blobs: Blob[] = []
    let frame = 0
    let visible = true

    function resize() {
      const el = canvas as HTMLCanvasElement
      const parent = el.parentElement
      if (!parent) return
      const { width, height } = parent.getBoundingClientRect()
      el.width = Math.max(1, Math.floor(width * SCALE))
      el.height = Math.max(1, Math.floor(height * SCALE))
      seed(el.width, el.height)
      if (reduced) paint()
    }

    function seed(w: number, h: number) {
      const count = w < 400 ? 7 : 12
      blobs = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: h * (0.45 + Math.random() * 0.6),
        r: (0.18 + Math.random() * 0.3) * w,
        vx: (Math.random() - 0.5) * 0.09,
        vy: (Math.random() - 0.5) * 0.03,
        a: 0.025 + Math.random() * 0.045,
      }))
    }

    function paint() {
      const c = ctx as CanvasRenderingContext2D
      const el = canvas as HTMLCanvasElement
      c.clearRect(0, 0, el.width, el.height)
      c.globalCompositeOperation = 'lighter'
      for (const b of blobs) {
        const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        g.addColorStop(0, `rgba(190,196,210,${b.a})`)
        g.addColorStop(0.55, `rgba(150,158,178,${b.a * 0.35})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        c.fillStyle = g
        c.beginPath()
        c.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        c.fill()
      }
      c.globalCompositeOperation = 'source-over'
    }

    function step() {
      const el = canvas as HTMLCanvasElement
      for (const b of blobs) {
        b.x += b.vx
        b.y += b.vy
        // Wrap around the edges so the drift never leaves a bald patch.
        if (b.x - b.r > el.width) b.x = -b.r
        if (b.x + b.r < 0) b.x = el.width + b.r
        if (b.y - b.r > el.height) b.y = -b.r
        if (b.y + b.r < 0) b.y = el.height + b.r
      }
      paint()
      frame = requestAnimationFrame(step)
    }

    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const io = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? true
      sync()
    })
    io.observe(canvas)

    function sync() {
      const running = frame !== 0
      const shouldRun = visible && !document.hidden && !reduced
      if (shouldRun && !running) frame = requestAnimationFrame(step)
      if (!shouldRun && running) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }

    document.addEventListener('visibilitychange', sync)
    sync()

    return () => {
      if (frame) cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full blur-[38px] opacity-70 pointer-events-none ${className}`}
    />
  )
}
