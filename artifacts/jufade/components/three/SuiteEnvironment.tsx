'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { blueLed, matteBlack, smokeTexture } from './materials'

/**
 * Minimal dark barber-suite backdrop: reflective floor, LED-framed mirror,
 * vertical light bars, a tool shelf, and drifting smoke sprites. Kept dim and
 * out of focus so the chair stays the hero.
 */
export function SuiteEnvironment({ quality }: { quality: 'high' | 'low' }) {
  const smoke = useRef<THREE.Group>(null)
  const mats = useMemo(() => ({ matte: matteBlack(), led: blueLed() }), [])
  const smokeMap = useMemo(() => smokeTexture(), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    smoke.current?.children.forEach((child, i) => {
      child.position.x = Math.sin(t * 0.05 + i * 2.1) * (1.6 + i * 0.5)
      child.position.y = -0.4 + Math.sin(t * 0.04 + i) * 0.3
      child.rotation.z = t * 0.02 * (i % 2 === 0 ? 1 : -1)
    })
  })

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.16, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#0a0c10"
          metalness={quality === 'high' ? 0.85 : 0.4}
          roughness={quality === 'high' ? 0.25 : 0.6}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, -4.2]}>
        <planeGeometry args={[24, 12]} />
        <meshStandardMaterial color="#07080b" roughness={0.95} />
      </mesh>

      {/* Mirror with LED frame */}
      <group position={[0, 0.7, -3.9]}>
        <mesh>
          <planeGeometry args={[2.1, 3]} />
          <meshStandardMaterial color="#10141c" metalness={0.9} roughness={0.15} envMapIntensity={1.2} />
        </mesh>
        {([-1.1, 1.1] as const).map((x) => (
          <mesh key={x} position={[x, 0, 0.02]} material={mats.led}>
            <boxGeometry args={[0.035, 3.05, 0.02]} />
          </mesh>
        ))}
        <mesh position={[0, 1.56, 0.02]} material={mats.led}>
          <boxGeometry args={[2.25, 0.035, 0.02]} />
        </mesh>
      </group>

      {/* Vertical LED bars flanking the suite */}
      {([-3.4, 3.4] as const).map((x) => (
        <mesh key={x} position={[x, 0.6, -3.6]} material={mats.led}>
          <boxGeometry args={[0.04, 3.4, 0.04]} />
        </mesh>
      ))}

      {/* Tool shelf */}
      <group position={[2.1, -0.2, -3.7]}>
        <mesh material={mats.matte}>
          <boxGeometry args={[1.4, 0.05, 0.35]} />
        </mesh>
        <mesh position={[-0.4, 0.12, 0]} material={mats.matte}>
          <boxGeometry args={[0.18, 0.2, 0.12]} />
        </mesh>
        <mesh position={[0.1, 0.14, 0]} material={mats.matte}>
          <cylinderGeometry args={[0.06, 0.06, 0.24, 16]} />
        </mesh>
        <mesh position={[0.5, 0.1, 0]} material={mats.matte}>
          <boxGeometry args={[0.3, 0.16, 0.1]} />
        </mesh>
      </group>

      {/* Drifting smoke sprites */}
      <group ref={smoke}>
        {[0, 1, 2].map((i) => (
          <sprite key={i} position={[0, -0.4, -2 + i * 0.6]} scale={[6 + i * 2, 3.5 + i, 1]}>
            <spriteMaterial map={smokeMap} transparent opacity={0.1} depthWrite={false} />
          </sprite>
        ))}
      </group>
    </group>
  )
}
