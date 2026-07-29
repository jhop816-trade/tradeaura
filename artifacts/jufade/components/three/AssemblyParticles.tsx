'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { clamp01, easeInOut } from '@/lib/scrollState'
import { themeColors } from '@/lib/themeColors'

export type ParticlesAnim = { converge: number; burst: number }

const COUNT = 1100

/**
 * Glowing blue particles that swirl in from a wide sphere and converge onto
 * the chair volume during the intro assembly, then linger as faint dust.
 * `burst` re-energizes them during the chair → tools transition.
 */
export function AssemblyParticles({ anim }: { anim: ParticlesAnim }) {
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.PointsMaterial>(null)

  const { positions, start, end } = useMemo(() => {
    const start = new Float32Array(COUNT * 3)
    const end = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      // Scattered far out on a rough sphere shell
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 4 + Math.random() * 4
      start[i * 3] = Math.sin(phi) * Math.cos(theta) * r
      start[i * 3 + 1] = Math.cos(phi) * r * 0.7
      start[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r

      // Converge into a loose chair-shaped column
      end[i * 3] = (Math.random() - 0.5) * 1.6
      end[i * 3 + 1] = -1.1 + Math.random() * 2.6
      end[i * 3 + 2] = (Math.random() - 0.5) * 1.4
    }
    return { positions: start.slice(), start, end }
  }, [])

  useFrame(({ clock }) => {
    const geo = points.current?.geometry
    const mat = material.current
    if (!geo || !mat) return
    const t = clock.elapsedTime
    const a = easeInOut(clamp01(anim.converge))
    const pos = geo.attributes.position.array as Float32Array

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3
      const wobble = Math.sin(t * 0.8 + i * 0.37) * 0.06
      pos[ix] = start[ix] + (end[ix] - start[ix]) * a + wobble
      pos[ix + 1] = start[ix + 1] + (end[ix + 1] - start[ix + 1]) * a + Math.cos(t * 0.6 + i) * 0.05
      pos[ix + 2] = start[ix + 2] + (end[ix + 2] - start[ix + 2]) * a + wobble
    }
    geo.attributes.position.needsUpdate = true

    // Bright while assembling, faint idle shimmer after, re-lit during bursts
    const assembling = a > 0.02 && a < 0.98 ? 0.85 : 0.22
    mat.opacity = Math.max(assembling * clamp01(anim.converge * 4), anim.burst * 0.9)
    mat.size = 0.035 + anim.burst * 0.03
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        color={themeColors.particles}
        size={0.035}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
