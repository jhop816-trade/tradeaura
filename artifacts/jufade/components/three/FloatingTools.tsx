'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { clamp01, easeInOut } from '@/lib/scrollState'
import { blueLed, brushedSteel, chrome, matteBlack } from './materials'

export type ToolsAnim = { appear: number }

type Mats = {
  chrome: THREE.MeshStandardMaterial
  steel: THREE.MeshStandardMaterial
  matte: THREE.MeshStandardMaterial
  led: THREE.MeshStandardMaterial
}

function Clippers({ mats }: { mats: Mats }) {
  return (
    <group>
      <RoundedBox args={[0.28, 0.7, 0.2]} radius={0.06} smoothness={4} material={mats.matte} />
      <mesh position={[0, 0.4, 0]} material={mats.steel}>
        <boxGeometry args={[0.3, 0.12, 0.16]} />
      </mesh>
      <mesh position={[0, 0.47, 0.02]} material={mats.chrome}>
        <boxGeometry args={[0.32, 0.03, 0.14]} />
      </mesh>
      <mesh position={[0, -0.05, 0.105]} material={mats.led}>
        <boxGeometry args={[0.05, 0.18, 0.01]} />
      </mesh>
    </group>
  )
}

function Trimmer({ mats }: { mats: Mats }) {
  return (
    <group>
      <RoundedBox args={[0.16, 0.62, 0.14]} radius={0.05} smoothness={4} material={mats.matte} />
      <mesh position={[0, 0.36, 0]} material={mats.chrome}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
      </mesh>
    </group>
  )
}

function StraightRazor({ mats }: { mats: Mats }) {
  return (
    <group>
      <RoundedBox args={[0.1, 0.55, 0.05]} radius={0.02} smoothness={4} material={mats.matte} />
      <group position={[0, 0.26, 0]} rotation={[0, 0, -0.85]}>
        <mesh position={[0, 0.24, 0]} material={mats.chrome}>
          <boxGeometry args={[0.09, 0.5, 0.015]} />
        </mesh>
      </group>
    </group>
  )
}

function Comb({ mats }: { mats: Mats }) {
  const teeth = useMemo(() => Array.from({ length: 9 }, (_, i) => i), [])
  return (
    <group>
      <mesh position={[0, 0.12, 0]} material={mats.matte}>
        <boxGeometry args={[0.62, 0.1, 0.03]} />
      </mesh>
      {teeth.map((i) => (
        <mesh key={i} position={[-0.26 + i * 0.065, -0.02, 0]} material={mats.matte}>
          <boxGeometry args={[0.025, 0.2, 0.025]} />
        </mesh>
      ))}
    </group>
  )
}

function EnhancementSpray({ mats }: { mats: Mats }) {
  return (
    <group>
      <mesh material={mats.steel}>
        <cylinderGeometry args={[0.13, 0.13, 0.55, 24]} />
      </mesh>
      <mesh position={[0, 0.33, 0]} material={mats.matte}>
        <cylinderGeometry args={[0.09, 0.11, 0.12, 24]} />
      </mesh>
      <mesh position={[0, 0.42, 0.03]} material={mats.matte}>
        <boxGeometry args={[0.05, 0.06, 0.09]} />
      </mesh>
      <mesh position={[0, -0.1, 0.132]} material={mats.led}>
        <boxGeometry args={[0.14, 0.18, 0.005]} />
      </mesh>
    </group>
  )
}

/**
 * The five floating tools the chair transforms into on scroll — clippers,
 * trimmer, straight razor, comb, and enhancement spray, orbiting slowly.
 */
export function FloatingTools({ anim }: { anim: ToolsAnim }) {
  const root = useRef<THREE.Group>(null)
  const items = useRef<(THREE.Group | null)[]>([])

  const mats = useMemo<Mats>(
    () => ({ chrome: chrome(), steel: brushedSteel(), matte: matteBlack(), led: blueLed() }),
    [],
  )

  const slots = useMemo(
    () =>
      [Clippers, Trimmer, StraightRazor, Comb, EnhancementSpray].map((Tool, i, arr) => {
        const angle = (i / arr.length) * Math.PI * 2
        return {
          Tool,
          angle,
          radius: 1.55,
          y: (i % 2 === 0 ? 0.25 : -0.25) + (i === 2 ? 0.45 : 0),
          delay: i * 0.12,
        }
      }),
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const g = root.current
    if (!g) return
    const a = easeInOut(clamp01(anim.appear))
    g.visible = a > 0.01
    if (!g.visible) return
    g.rotation.y = t * 0.18

    items.current.forEach((item, i) => {
      if (!item) return
      const slot = slots[i]
      const local = easeInOut(clamp01((anim.appear - slot.delay) / (1 - slot.delay)))
      const r = slot.radius * (0.3 + 0.7 * local)
      item.position.set(
        Math.cos(slot.angle) * r,
        slot.y + Math.sin(t * 0.9 + i * 1.7) * 0.12,
        Math.sin(slot.angle) * r,
      )
      item.rotation.set(Math.sin(t * 0.4 + i) * 0.25, t * 0.3 + i, Math.cos(t * 0.35 + i) * 0.2)
      item.scale.setScalar(local * 1.05)
    })
  })

  return (
    <group ref={root}>
      {slots.map(({ Tool }, i) => (
        <group
          key={i}
          ref={(el) => {
            items.current[i] = el
          }}
        >
          <Tool mats={mats} />
        </group>
      ))}
    </group>
  )
}
