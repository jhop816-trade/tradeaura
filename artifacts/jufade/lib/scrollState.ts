/**
 * Mutable scroll/pointer state shared between the DOM (Framer Motion / GSAP
 * scroll triggers) and the R3F render loop — read every frame without
 * triggering React re-renders.
 */
export const stageState = {
  /** 0 → 1 progress through the pinned cinematic stage. */
  progress: 0,
  /** Normalized pointer position, -1 → 1 on both axes. */
  pointerX: 0,
  pointerY: 0,
}

export const easeInOut = (t: number) => t * t * (3 - 2 * t)

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Remaps progress within [a, b] to 0 → 1. */
export const phase = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
