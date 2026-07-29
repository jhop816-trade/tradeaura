'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { easeInOut, phase, stageState } from '@/lib/scrollState'
import { themeColors } from '@/lib/themeColors'
import { BarberChair, type ChairAnim } from './BarberChair'
import { FloatingTools, type ToolsAnim } from './FloatingTools'
import { AssemblyParticles, type ParticlesAnim } from './AssemblyParticles'
import { SuiteEnvironment } from './SuiteEnvironment'

/**
 * The cinematic rig: assembles the chair from particles on load, rotates it
 * with scroll, breaks it apart into floating tools, and follows the mouse.
 */
function Rig({ quality }: { quality: 'high' | 'low' }) {
  const rig = useRef<THREE.Group>(null)
  const chairGroup = useRef<THREE.Group>(null)
  const intro = useRef(0)

  const chairAnim = useRef<ChairAnim>({ assemble: 0 })
  const toolsAnim = useRef<ToolsAnim>({ appear: 0 })
  const particlesAnim = useRef<ParticlesAnim>({ converge: 0, burst: 0 })

  useFrame((state, delta) => {
    const p = stageState.progress

    // Intro assembly: ramps 0 → 1 over ~2.4s after mount
    intro.current = Math.min(1, intro.current + delta / 2.4)

    // Scroll phases: chair (0–0.3) → tools (0.3–0.62) → hand off to DOM
    const toolsIn = easeInOut(phase(p, 0.28, 0.5))
    const toolsOut = easeInOut(phase(p, 0.56, 0.72))

    chairAnim.current.assemble = intro.current * (1 - toolsIn)
    toolsAnim.current.appear = toolsIn * (1 - toolsOut)
    particlesAnim.current.converge = intro.current
    particlesAnim.current.burst = Math.sin(Math.min(toolsIn, 1 - toolsOut) * Math.PI) * 0.6

    // Chair slowly spins, then accelerates + sinks away as it dissolves
    const chair = chairGroup.current
    if (chair) {
      const t = state.clock.elapsedTime
      chair.rotation.y = t * 0.12 + p * Math.PI * 2
      chair.position.y = Math.sin(t * 0.7) * 0.06 - toolsIn * 0.4
      chair.scale.setScalar(1 - toolsIn * 0.3)
    }

    // Mouse parallax + subtle idle camera drift
    const g = rig.current
    if (g) {
      const targetX = stageState.pointerX * 0.12
      const targetY = stageState.pointerY * 0.08
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetX, 0.05)
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -targetY, 0.05)
    }
    const cam = state.camera
    const t = state.clock.elapsedTime
    cam.position.x = Math.sin(t * 0.16) * 0.18
    cam.position.y = 0.35 + Math.sin(t * 0.11) * 0.1 - p * 0.3
    cam.lookAt(0, 0, 0)
  })

  return (
    <group ref={rig}>
      <SuiteEnvironment quality={quality} />
      <group ref={chairGroup}>
        <BarberChair anim={chairAnim.current} />
      </group>
      <FloatingTools anim={toolsAnim.current} />
      <AssemblyParticles anim={particlesAnim.current} />
      <ContactShadows position={[0, -1.14, 0]} opacity={0.65} scale={7} blur={2.6} far={2.2} resolution={quality === 'high' ? 512 : 256} color="#000000" />
    </group>
  )
}

/**
 * Full R3F scene. Loaded lazily via next/dynamic — never part of the initial
 * JS bundle, and skipped entirely on reduced-motion / weak devices.
 */
export default function Scene({ quality }: { quality: 'high' | 'low' }) {
  return (
    <Canvas
      dpr={quality === 'high' ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [0, 0.35, quality === 'low' ? 6.6 : 5.6], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.18} />
      <spotLight position={[3, 6, 5]} angle={0.5} penumbra={0.8} intensity={60} color="#ffffff" />
      <pointLight position={[-4, 2, -3]} intensity={22} color={themeColors.keyLight} />
      <pointLight position={[0, 1.5, -3.5]} intensity={12} color={themeColors.backLight} />
      <pointLight position={[4, 0, 4]} intensity={5} color={themeColors.rimNeutral} />
      <pointLight position={[-3, -1, 4]} intensity={5} color="#8b93a1" />

      {/* Local light-strip environment map → clean chrome reflections, no network fetch */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.5} position={[0, 4, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 3, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-5, 1, -1]} rotation={[0, Math.PI / 2, 0]} scale={[6, 1.5, 1]} color="#dfe6f0" />
        <Lightformer intensity={2.2} position={[5, 0, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 1, 1]} color={themeColors.envRim} />
        <Lightformer intensity={0.9} position={[0, -3, 3]} rotation={[-Math.PI / 2, 0, 0]} scale={[7, 3, 1]} color={themeColors.envFill} />
      </Environment>

      <Rig quality={quality} />
    </Canvas>
  )
}
