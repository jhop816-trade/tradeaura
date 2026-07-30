'use client'
import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  r: number
  vy: number
  drift: number
  phase: number
  baseAlpha: number
}

/**
 * Fine drifting light specks — dust caught in the headlight beams.
 *
 * Same cost discipline as FogCanvas: renders at 0.5x and lets CSS upscale,
 * pauses off-screen or when the tab is hidden, and paints a single static
 * frame under reduced motion instead of animating.
 */
export default function ParticlesCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SCALE = 0.5
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let particles: Particle[] = []
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
      paint(0)
    }

    function seed(w: number, h: number) {
      const count = w < 400 ? 20 : 42
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.3,
        vy: -(0.06 + Math.random() * 0.14),
        drift: (Math.random() - 0.5) * 0.05,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: 0.15 + Math.random() * 0.35,
      }))
    }

    function paint(t: number) {
      const c = ctx as CanvasRenderingContext2D
      const el = canvas as HTMLCanvasElement
      c.clearRect(0, 0, el.width, el.height)
      for (const p of particles) {
        const twinkle = reduced ? 1 : 0.55 + 0.45 * Math.sin(t / 900 + p.phase)
        c.beginPath()
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        c.fillStyle = `rgba(245,197,66,${p.baseAlpha * twinkle})`
        c.fill()
      }
    }

    function step(t: number) {
      const el = canvas as HTMLCanvasElement
      for (const p of particles) {
        p.y += p.vy
        p.x += p.drift
        if (p.y < -4) {
          p.y = el.height + 4
          p.x = Math.random() * el.width
        }
        if (p.x < -4) p.x = el.width + 4
        if (p.x > el.width + 4) p.x = -4
      }
      paint(t)
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
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  )
}
