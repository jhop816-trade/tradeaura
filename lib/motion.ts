/**
 * Single check for the OS-level "less motion" preference. Every JS-driven
 * animation in this project — canvases, parallax, GSAP scroll scenes — gates
 * on this rather than each rolling its own `window.matchMedia` call, so
 * there's one place to get the query right.
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
