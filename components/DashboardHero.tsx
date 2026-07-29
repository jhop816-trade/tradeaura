'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function DashboardHero() {
  const warpRef = useRef<HTMLCanvasElement>(null)
  const dashRef = useRef<HTMLCanvasElement>(null)
  const speedDigitsRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const warpCanvas = warpRef.current
    if (!warpCanvas) return
    const wCtxOrNull = warpCanvas.getContext('2d')
    if (!wCtxOrNull) return
    const wCtx = wCtxOrNull

    warpCanvas.width = warpCanvas.offsetWidth
    warpCanvas.height = warpCanvas.offsetHeight
    const W = warpCanvas.width, H = warpCanvas.height
    const VX = W * 0.62, VY = H * 0.5

    type Trail = { angle: number; dist: number; speed: number; maxLen: number; len: number; color: string; width: number; dead: boolean }
    function makeTrail(): Trail {
      const angle = Math.random() * Math.PI * 2
      const isGold = Math.random() < 0.35
      return {
        angle,
        dist: 20 + Math.random() * 60,
        speed: 2.5 + Math.random() * 5.5,
        maxLen: 80 + Math.random() * 220,
        len: 0,
        color: isGold
          ? `rgba(212,168,83,${(0.15 + Math.random() * 0.5).toFixed(2)})`
          : `rgba(255,255,255,${(0.08 + Math.random() * 0.35).toFixed(2)})`,
        width: 0.5 + Math.random() * 1.2,
        dead: false,
      }
    }

    const trails: Trail[] = Array.from({ length: 180 }, () => {
      const t = makeTrail()
      t.dist = 10 + Math.random() * 300
      t.len = Math.random() * t.maxLen
      return t
    })

    let warpRaf: number
    function drawWarp() {
      wCtx.clearRect(0, 0, W, H)
      wCtx.fillStyle = '#000'
      wCtx.fillRect(0, 0, W, H)
      const grd = wCtx.createRadialGradient(VX, VY, 0, VX, VY, 200)
      grd.addColorStop(0, 'rgba(212,168,83,0.06)')
      grd.addColorStop(1, 'transparent')
      wCtx.fillStyle = grd
      wCtx.fillRect(0, 0, W, H)

      for (const t of trails) {
        const x1 = VX + Math.cos(t.angle) * t.dist
        const y1 = VY + Math.sin(t.angle) * t.dist
        const tail = Math.max(0, t.dist - t.len)
        const x0 = VX + Math.cos(t.angle) * tail
        const y0 = VY + Math.sin(t.angle) * tail
        const grad = wCtx.createLinearGradient(x0, y0, x1, y1)
        grad.addColorStop(0, 'transparent')
        grad.addColorStop(1, t.color)
        wCtx.beginPath()
        wCtx.moveTo(x0, y0)
        wCtx.lineTo(x1, y1)
        wCtx.strokeStyle = grad
        wCtx.lineWidth = t.width
        wCtx.stroke()
        t.dist += t.speed
        t.len = Math.min(t.len + t.speed * 1.4, t.maxLen)
        const edge = Math.max(VX, W - VX, VY, H - VY) * 1.6
        if (t.dist > edge) Object.assign(t, makeTrail())
      }
      warpRaf = requestAnimationFrame(drawWarp)
    }
    drawWarp()
    return () => cancelAnimationFrame(warpRaf)
  }, [])

  useEffect(() => {
    const dashCanvas = dashRef.current
    if (!dashCanvas) return
    const ctxOrNull = dashCanvas.getContext('2d')
    if (!ctxOrNull) return
    const ctx = ctxOrNull

    dashCanvas.width = dashCanvas.offsetWidth
    dashCanvas.height = dashCanvas.offsetHeight
    const CW = dashCanvas.width, CH = dashCanvas.height

    const mainGauge = { cx: CW / 2, cy: CH / 2 - 20, r: Math.min(CW, CH) * 0.28, minVal: 0, maxVal: 160, startAngle: Math.PI * 0.72, endAngle: Math.PI * 2.28 }
    const rpmGauge = { cx: CW / 2 - CW * 0.4, cy: CH / 2 + CH * 0.09, r: Math.min(CW, CH) * 0.135, minVal: 0, maxVal: 8, startAngle: Math.PI * 0.78, endAngle: Math.PI * 2.22 }
    const tempGauge = { cx: CW / 2 + CW * 0.4, cy: CH / 2 + CH * 0.09, r: Math.min(CW, CH) * 0.135, minVal: 100, maxVal: 300, startAngle: Math.PI * 0.78, endAngle: Math.PI * 2.22 }

    function valToAngle(g: typeof mainGauge, val: number) {
      const frac = Math.min(1, Math.max(0, (val - g.minVal) / (g.maxVal - g.minVal)))
      return g.startAngle + frac * (g.endAngle - g.startAngle)
    }

    function drawGaugeFace(g: typeof mainGauge, isMain: boolean, label: string) {
      const { cx, cy, r } = g
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, r + (isMain ? 14 : 8), 0, Math.PI * 2)
      const bezelGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
      bezelGrad.addColorStop(0, '#3a2e18')
      bezelGrad.addColorStop(0.4, '#6b5124')
      bezelGrad.addColorStop(0.6, '#D4A853')
      bezelGrad.addColorStop(1, '#2a2010')
      ctx.fillStyle = bezelGrad
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx, cy, r + (isMain ? 6 : 4), 0, Math.PI * 2)
      ctx.fillStyle = '#111008'
      ctx.fill()
      const faceGrad = ctx.createRadialGradient(cx, cy - r * 0.1, 0, cx, cy, r)
      faceGrad.addColorStop(0, '#0d1018')
      faceGrad.addColorStop(0.6, '#080c12')
      faceGrad.addColorStop(1, '#040608')
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = faceGrad
      ctx.fill()

      const totalTicks = isMain ? 32 : 16
      const majorEvery = 4
      const innerR = r - (isMain ? 22 : 14)
      const outerR = r - (isMain ? 4 : 3)
      for (let i = 0; i <= totalTicks; i++) {
        const frac = i / totalTicks
        const angle = g.startAngle + frac * (g.endAngle - g.startAngle)
        const isMajor = i % majorEvery === 0
        const isMid = !isMajor && i % (majorEvery / 2) === 0
        const tickInner = isMajor ? innerR - (isMain ? 10 : 6) : isMid ? innerR - (isMain ? 5 : 3) : innerR
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(angle) * tickInner, cy + Math.sin(angle) * tickInner)
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR)
        ctx.strokeStyle = isMajor ? '#D4A853' : 'rgba(212,168,83,0.35)'
        ctx.lineWidth = isMajor ? (isMain ? 2.5 : 1.8) : (isMain ? 1.0 : 0.8)
        ctx.stroke()
        if (isMajor) {
          const val = g.minVal + frac * (g.maxVal - g.minVal)
          const numR = tickInner - (isMain ? 20 : 14)
          ctx.save()
          ctx.font = `${isMain ? '600 14px' : '600 10px'} sans-serif`
          ctx.fillStyle = 'rgba(212,168,83,0.8)'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(isMain ? String(Math.round(val / 10) * 10) : val.toFixed(0), cx + Math.cos(angle) * numR, cy + Math.sin(angle) * numR)
          ctx.restore()
        }
      }
      if (isMain) {
        ctx.beginPath()
        ctx.arc(cx, cy, r - 6, valToAngle(g, 120), g.endAngle)
        ctx.strokeStyle = 'rgba(220,40,40,0.5)'
        ctx.lineWidth = 8
        ctx.lineCap = 'butt'
        ctx.stroke()
      }
      ctx.font = `${isMain ? '700 11px' : '600 8px'} sans-serif`
      ctx.fillStyle = 'rgba(212,168,83,0.4)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, cx, cy + r * (isMain ? 0.55 : 0.6))
      ctx.restore()
    }

    function drawNeedle(g: typeof mainGauge, val: number, isMain: boolean) {
      const { cx, cy, r } = g
      const angle = valToAngle(g, val)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      const needleLen = r - (isMain ? 28 : 18)
      const tailLen = isMain ? 28 : 16
      const baseW = isMain ? 5 : 3
      ctx.shadowColor = 'rgba(212,168,83,0.7)'
      ctx.shadowBlur = isMain ? 12 : 8
      ctx.beginPath()
      ctx.moveTo(0, -tailLen)
      ctx.lineTo(-baseW / 2, 0)
      ctx.lineTo(-0.4, needleLen)
      ctx.lineTo(0.4, needleLen)
      ctx.lineTo(baseW / 2, 0)
      ctx.closePath()
      const ng = ctx.createLinearGradient(0, -tailLen, 0, needleLen)
      ng.addColorStop(0, '#3a2a08')
      ng.addColorStop(0.3, '#D4A853')
      ng.addColorStop(1, 'rgba(212,168,83,0.6)')
      ctx.fillStyle = ng
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(0, 0, isMain ? 10 : 6, 0, Math.PI * 2)
      const capG = ctx.createRadialGradient(0, -2, 0, 0, 0, isMain ? 10 : 6)
      capG.addColorStop(0, '#e8c070')
      capG.addColorStop(1, '#6b4a18')
      ctx.fillStyle = capG
      ctx.fill()
      ctx.restore()
    }

    function drawActiveArc(g: typeof mainGauge, val: number, isMain: boolean) {
      const angle = valToAngle(g, val)
      ctx.save()
      ctx.beginPath()
      ctx.arc(g.cx, g.cy, g.r - (isMain ? 12 : 8), g.startAngle, angle)
      ctx.strokeStyle = 'rgba(212,168,83,0.3)'
      ctx.lineWidth = isMain ? 4 : 2.5
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.restore()
    }

    const TARGET_HIGH = 85, TARGET_IDLE = 35
    const RPM_HIGH = 4.2, RPM_IDLE = 1.8
    const TEMP_VAL = 195
    const SWEEP_MS = 2000, SETTLE_MS = 800
    let phase = 0, phaseStart: number | null = null, idleT = 0
    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    let dashRaf: number
    function animate(ts: number) {
      if (!phaseStart) phaseStart = ts
      const elapsed = ts - phaseStart
      let speed: number, rpm: number, temp: number

      if (phase === 0) {
        const t = Math.min(elapsed / SWEEP_MS, 1)
        const e = easeInOut(t)
        speed = e * TARGET_HIGH; rpm = e * RPM_HIGH; temp = e * TEMP_VAL
        if (t >= 1) { phase = 1; phaseStart = ts }
      } else if (phase === 1) {
        const t = Math.min(elapsed / SETTLE_MS, 1)
        const e = easeOut(t)
        speed = TARGET_HIGH + (TARGET_IDLE - TARGET_HIGH) * e
        rpm = RPM_HIGH + (RPM_IDLE - RPM_HIGH) * e
        temp = TEMP_VAL
        if (t >= 1) { phase = 2; phaseStart = ts }
      } else {
        idleT = elapsed * 0.001
        const tremor = Math.sin(idleT * 7.3) * 0.8 + Math.sin(idleT * 13.1) * 0.4 + Math.sin(idleT * 3.7) * 1.2
        speed = TARGET_IDLE + tremor; rpm = RPM_IDLE + tremor * 0.05; temp = TEMP_VAL + Math.sin(idleT * 0.3) * 2
      }

      ctx.clearRect(0, 0, CW, CH)

      // bg glow
      const halo = ctx.createRadialGradient(mainGauge.cx, mainGauge.cy, 0, mainGauge.cx, mainGauge.cy, mainGauge.r * 1.4)
      halo.addColorStop(0, 'rgba(212,168,83,0.05)')
      halo.addColorStop(1, 'transparent')
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, CW, CH)
      const bluePool = ctx.createRadialGradient(mainGauge.cx, CH, 0, mainGauge.cx, CH, 360)
      bluePool.addColorStop(0, 'rgba(40,70,210,0.18)')
      bluePool.addColorStop(1, 'transparent')
      ctx.fillStyle = bluePool
      ctx.fillRect(0, 0, CW, CH)

      drawGaugeFace(mainGauge, true, 'MPH')
      drawGaugeFace(rpmGauge, false, 'RPM ×1000')
      drawGaugeFace(tempGauge, false, '°F')
      drawActiveArc(mainGauge, speed, true)
      drawActiveArc(rpmGauge, rpm, false)
      drawActiveArc(tempGauge, temp, false)
      drawNeedle(mainGauge, speed, true)
      drawNeedle(rpmGauge, rpm, false)
      drawNeedle(tempGauge, temp, false)

      if (speedDigitsRef.current) {
        speedDigitsRef.current.textContent = String(Math.round(speed)).padStart(3, '0')
      }

      dashRaf = requestAnimationFrame(animate)
    }
    dashRaf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(dashRaf)
  }, [])

  return (
    <section className="flex min-h-screen mt-[76px]">
      {/* Left — warp speed + text */}
      <div className="flex-1 relative bg-black flex flex-col justify-center px-10 md:px-20 py-20 overflow-hidden">
        <canvas ref={warpRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 60% 50%, transparent 30%, rgba(0,0,0,0.7) 100%), linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 60%)' }} />

        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-[#D4A853]" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4A853]">Private Car Rentals</span>
          </div>
          <h1 className="font-playfair font-black text-[clamp(52px,7vw,82px)] leading-[0.92] tracking-tight text-white mb-9">
            Drive<br />Something<br /><em className="italic text-[#D4A853]">Worth It.</em>
          </h1>
          <p className="text-[15px] font-light text-white/50 leading-relaxed max-w-sm mb-12">
            Tesla Model Y and Mercedes CLA 35 AMG. Book directly with the owner — no agency, no fees, no nonsense.
          </p>
          <div className="flex flex-col gap-4">
            <Link href="/booking"
              className="self-start bg-[#D4A853] text-black px-10 py-[18px] text-[12px] font-bold tracking-[0.16em] uppercase hover:bg-[#e8c278] transition-colors">
              Book Now
            </Link>
            <Link href="/fleet"
              className="self-start flex items-center gap-3 text-[12px] font-medium tracking-[0.12em] uppercase text-white/45 hover:text-white transition-colors group">
              View Fleet <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="mt-14 pt-10 border-t border-white/7 flex gap-10">
            {[{ val: '2', label: 'Vehicles' }, { val: '$150', label: 'From / day' }, { val: '24h', label: 'Response' }].map(s => (
              <div key={s.label}>
                <div className="font-playfair font-bold text-4xl text-white leading-none mb-1.5">{s.val}</div>
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/30">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gold divider */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px"
          style={{ background: 'linear-gradient(to bottom, transparent 5%, #D4A853 30%, #D4A853 70%, transparent 95%)', opacity: 0.4 }} />
      </div>

      {/* Right — dashboard */}
      <div className="hidden md:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at 50% 115%, rgba(30,50,160,0.45) 0%, rgba(15,25,80,0.2) 45%, transparent 65%), #020408' }}>

        {/* Cluster ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[560px] h-[280px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(40,70,220,0.28) 0%, transparent 72%)' }} />

        <canvas ref={dashRef} className="absolute inset-0 w-full h-full" />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%), linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 75%, rgba(0,0,0,0.6) 100%), linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.6) 100%)' }} />

        {/* Digital speed readout */}
        <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-10 text-center">
          <span ref={speedDigitsRef}
            className="text-[42px] font-bold tabular-nums"
            style={{ color: '#e8a020', textShadow: '0 0 10px rgba(232,160,32,0.8), 0 0 30px rgba(232,160,32,0.4)', letterSpacing: '0.08em', fontFamily: 'sans-serif' }}>
            000
          </span>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase mt-1" style={{ color: 'rgba(232,160,32,0.5)' }}>mph</div>
        </div>

        {/* Gear indicator */}
        <div className="absolute top-[42%] right-[8%] -translate-y-1/2 z-10 text-center">
          <div className="font-playfair font-bold text-[28px] text-[#D4A853]" style={{ textShadow: '0 0 20px rgba(212,168,83,0.5)' }}>D</div>
          <div className="text-[8px] font-bold tracking-[0.2em] uppercase mt-1" style={{ color: 'rgba(212,168,83,0.4)' }}>Gear</div>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-10 flex items-center gap-5">
          {[
            { label: 'Battery', value: '78%', color: '#34d399' },
            { label: 'Temp', value: '72°F', color: '#60a5fa' },
            { label: 'Range', value: 'Full', color: '#34d399' },
          ].map(ind => (
            <div key={ind.label} className="flex flex-col items-center gap-1">
              <div className="text-[10px] font-semibold" style={{ color: ind.color }}>{ind.value}</div>
              <div className="text-[8px] font-bold tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{ind.label}</div>
            </div>
          ))}
        </div>

        {/* Steering wheel silhouette */}
        <svg className="absolute bottom-[-160px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] z-[3] pointer-events-none" viewBox="0 0 340 340" fill="none">
          <circle cx="170" cy="170" r="155" stroke="rgba(30,22,8,0.95)" strokeWidth="22" fill="none" />
          <line x1="170" y1="15" x2="170" y2="115" stroke="rgba(25,18,6,0.9)" strokeWidth="14" strokeLinecap="round" />
          <line x1="26" y1="242" x2="109" y2="193" stroke="rgba(25,18,6,0.9)" strokeWidth="14" strokeLinecap="round" />
          <line x1="314" y1="242" x2="231" y2="193" stroke="rgba(25,18,6,0.9)" strokeWidth="14" strokeLinecap="round" />
          <circle cx="170" cy="170" r="30" fill="rgba(20,15,5,0.95)" stroke="rgba(212,168,83,0.2)" strokeWidth="1" />
          <circle cx="170" cy="170" r="155" stroke="rgba(212,168,83,0.12)" strokeWidth="2" fill="none" />
        </svg>
      </div>
    </section>
  )
}
