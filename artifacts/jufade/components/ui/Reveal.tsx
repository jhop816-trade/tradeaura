'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type RevealProps = {
  children: React.ReactNode
  /** Extra delay in seconds once the element scrolls into view. */
  delay?: number
  y?: number
  className?: string
}

/** Fades + slides content up when it scrolls into view (GSAP ScrollTrigger). */
export function Reveal({ children, delay = 0, y = 40, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [delay, y])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/** Splits a headline into words and reveals them with a cinematic stagger. */
export function TextReveal({ text, className = '', as: Tag = 'h2' }: { text: string; className?: string; as?: 'h1' | 'h2' | 'h3' | 'p' }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const words = el.querySelectorAll<HTMLElement>('[data-word]')
    const tween = gsap.fromTo(
      words,
      { yPercent: 110, opacity: 0, rotateX: -40 },
      {
        yPercent: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [text])

  return (
    <Tag ref={ref as React.Ref<never>} className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="mr-[0.28em] inline-block overflow-hidden pb-[0.08em] align-top" aria-hidden>
          <span data-word className="inline-block will-change-transform">
            {word}
          </span>
        </span>
      ))}
    </Tag>
  )
}
