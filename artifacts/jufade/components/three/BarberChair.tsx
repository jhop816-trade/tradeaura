'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { clamp01, easeInOut } from '@/lib/scrollState'
import { blueLed, chrome, leather, matteBlack } from './materials'

/** Per-frame animation values driven by the Scene rig. */
export type ChairAnim = { assemble: number }

type PartProps = {
  anim: ChairAnim
  seed: number
  position: [number, number, number]
  rotation?: [number, number, number]
  children: React.ReactNode
}

function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * A chair piece that flies in from a random scattered position/rotation as
 * `anim.assemble` goes 0 → 1 (and breaks apart again when it returns to 0).
 */
function Part({ anim, seed, position, rotation = [0, 0, 0], children }: PartProps) {
  const ref = useRef<THREE.Group>(null)

  const scatter = useMemo(() => {
    const dir = new THREE.Vector3(
      rand(seed) - 0.5,
      rand(seed + 1) - 0.2,
      rand(seed + 2) - 0.5,
    ).normalize()
    return {
      offset: dir.multiplyScalar(2.4 + rand(seed + 3) * 2.6),
      spin: new THREE.Vector3(rand(seed + 4) - 0.5, rand(seed + 5) - 0.5, rand(seed + 6) - 0.5).multiplyScalar(6),
      delay: rand(seed + 7) * 0.35,
    }
  }, [seed])

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const a = easeInOut(clamp01(anim.assemble * (1 + scatter.delay) - scatter.delay))
    const inv = 1 - a
    g.position.set(
      position[0] + scatter.offset.x * inv,
      position[1] + scatter.offset.y * inv,
      position[2] + scatter.offset.z * inv,
    )
    g.rotation.set(
      rotation[0] + scatter.spin.x * inv,
      rotation[1] + scatter.spin.y * inv,
      rotation[2] + scatter.spin.z * inv,
    )
    const s = 0.35 + 0.65 * a
    g.scale.setScalar(s)
    g.visible = a > 0.01
  })

  return <group ref={ref}>{children}</group>
}

/**
 * Procedural barber chair built from primitives — chrome base and hydraulics,
 * leather seat/backrest, blue LED underglow. No external model files needed.
 */
export function BarberChair({ anim }: { anim: ChairAnim }) {
  const mats = useMemo(
    () => ({ chrome: chrome(), leather: leather(), matte: matteBlack(), led: blueLed() }),
    [],
  )

  return (
    <group>
      {/* Chrome base disc + foot pedal */}
      <Part anim={anim} seed={1} position={[0, -1.05, 0]}>
        <mesh material={mats.chrome}>
          <cylinderGeometry args={[0.85, 0.95, 0.1, 48]} />
        </mesh>
        <mesh position={[0.45, 0.1, 0.35]} material={mats.matte}>
          <boxGeometry args={[0.35, 0.08, 0.16]} />
        </mesh>
      </Part>

      {/* Hydraulic column */}
      <Part anim={anim} seed={2} position={[0, -0.68, 0]}>
        <mesh material={mats.chrome}>
          <cylinderGeometry args={[0.13, 0.17, 0.72, 32]} />
        </mesh>
        <mesh position={[0, 0.34, 0]} material={mats.matte}>
          <cylinderGeometry args={[0.22, 0.22, 0.1, 32]} />
        </mesh>
      </Part>

      {/* Seat with LED underglow */}
      <Part anim={anim} seed={3} position={[0, -0.18, 0.05]}>
        <RoundedBox args={[1.3, 0.24, 1.15]} radius={0.08} smoothness={4} material={mats.leather} />
        <mesh position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.led}>
          <torusGeometry args={[0.52, 0.02, 12, 48]} />
        </mesh>
      </Part>

      {/* Backrest */}
      <Part anim={anim} seed={4} position={[0, 0.52, -0.5]} rotation={[-0.16, 0, 0]}>
        <RoundedBox args={[1.24, 1.2, 0.22]} radius={0.08} smoothness={4} material={mats.leather} />
        <mesh position={[0, 0, -0.12]} material={mats.matte}>
          <boxGeometry args={[1.1, 1.05, 0.04]} />
        </mesh>
      </Part>

      {/* Headrest */}
      <Part anim={anim} seed={5} position={[0, 1.32, -0.66]} rotation={[-0.16, 0, 0]}>
        <RoundedBox args={[0.56, 0.3, 0.18]} radius={0.07} smoothness={4} material={mats.leather} />
        <mesh position={[0, -0.24, 0.02]} material={mats.chrome}>
          <cylinderGeometry args={[0.03, 0.03, 0.24, 16]} />
        </mesh>
      </Part>

      {/* Armrests */}
      {([-1, 1] as const).map((side) => (
        <Part key={side} anim={anim} seed={6 + side} position={[side * 0.76, 0.1, 0.05]}>
          <RoundedBox args={[0.16, 0.1, 0.85]} radius={0.04} smoothness={4} material={mats.leather} />
          <mesh position={[0, -0.16, 0.1]} material={mats.chrome}>
            <cylinderGeometry args={[0.03, 0.03, 0.26, 16]} />
          </mesh>
          <mesh position={[0, -0.16, -0.25]} material={mats.chrome}>
            <cylinderGeometry args={[0.03, 0.03, 0.26, 16]} />
          </mesh>
        </Part>
      ))}

      {/* Chrome footrest */}
      <Part anim={anim} seed={9} position={[0, -0.62, 0.62]} rotation={[0.5, 0, 0]}>
        <mesh material={mats.chrome} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.7, 20]} />
        </mesh>
        <mesh position={[0, -0.08, 0.06]} material={mats.matte}>
          <boxGeometry args={[0.5, 0.03, 0.22]} />
        </mesh>
      </Part>
    </group>
  )
}
