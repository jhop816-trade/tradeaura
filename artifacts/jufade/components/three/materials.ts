import * as THREE from 'three'
import { themeColors } from '@/lib/themeColors'

export const chrome = () =>
  new THREE.MeshStandardMaterial({
    color: '#e8ecf2',
    metalness: 1,
    roughness: 0.12,
    envMapIntensity: 1.4,
  })

export const brushedSteel = () =>
  new THREE.MeshStandardMaterial({
    color: '#9aa2af',
    metalness: 0.9,
    roughness: 0.35,
    envMapIntensity: 1,
  })

export const leather = () =>
  new THREE.MeshStandardMaterial({
    color: '#0c0d10',
    metalness: 0.1,
    roughness: 0.55,
    envMapIntensity: 0.6,
  })

export const matteBlack = () =>
  new THREE.MeshStandardMaterial({
    color: '#101216',
    metalness: 0.4,
    roughness: 0.6,
  })

export const blueLed = () =>
  new THREE.MeshStandardMaterial({
    color: themeColors.ledBase,
    emissive: themeColors.led,
    emissiveIntensity: 2.6,
    toneMapped: false,
  })

/** Soft round smoke sprite texture generated on the fly (no asset needed). */
export function smokeTexture(): THREE.Texture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(150,160,180,0.55)')
  g.addColorStop(0.45, 'rgba(120,130,150,0.18)')
  g.addColorStop(1, 'rgba(100,110,130,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}
