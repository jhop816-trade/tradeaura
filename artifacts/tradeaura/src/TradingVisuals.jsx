// ── PASTE THIS AS: src/TradingVisuals.jsx ────────────────────────────────────
// Import in EducationCenter.jsx and add visuals to each lesson

import React from "react";

const C = {
  bg:"#0f1117", surf:"#161b27", surf2:"#1c2333", bord:"#232d40",
  blue:"#4f8ef7", green:"#34d399", red:"#f87171", gold:"#fbbf24", purp:"#a78bfa",
  txt:"#e2e8f0", muted:"#64748b", dim:"#94a3b8"
};

const VisualWrapper = ({ title, children }) => (
  <div style={{ background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
    {title && <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 12 }}>{title}</div>}
    {children}
  </div>
);

// ── 1. STOCK MARKET OVERVIEW ─────────────────────────────────────────────────
export function StockMarketVisual() {
  return (
    <VisualWrapper title="HOW STOCK PRICES MOVE">
      <svg viewBox="0 0 320 160" style={{ width: "100%", height: "auto" }}>
        {/* Background */}
        <rect width="320" height="160" fill={C.bg} rx="8"/>
        {/* Grid lines */}
        {[40,80,120].map(y => <line key={y} x1="40" y1={y} x2="300" y2={y} stroke={C.bord} strokeWidth="0.5"/>)}
        {/* Price line - uptrend */}
        <polyline points="40,130 70,120 100,125 130,100 160,90 190,80 220,70 250,55 280,40 300,35"
          fill="none" stroke={C.green} strokeWidth="2.5"/>
        {/* Area fill */}
        <polygon points="40,130 70,120 100,125 130,100 160,90 190,80 220,70 250,55 280,40 300,35 300,150 40,150"
          fill={C.green + "15"}/>
        {/* Labels */}
        <text x="50" y="155" fill={C.muted} fontSize="8">More Buyers</text>
        <text x="220" y="30" fill={C.green} fontSize="9" fontWeight="bold">Price ↑</text>
        {/* Buy pressure arrows */}
        <text x="80" y="145" fill={C.green} fontSize="10">↑</text>
        <text x="150" y="145" fill={C.green} fontSize="10">↑</text>
        <text x="220" y="145" fill={C.green} fontSize="10">↑</text>
        {/* Y axis label */}
        <text x="5" y="85" fill={C.muted} fontSize="8" transform="rotate(-90, 15, 85)">PRICE</text>
        {/* Caption */}
        <text x="160" y="158" fill={C.muted} fontSize="7" textAnchor="middle">More buyers than sellers = price rises</text>
      </svg>
    </VisualWrapper>
  );
}

// ── 2. CANDLESTICK ANATOMY ───────────────────────────────────────────────────
export function CandleAnatomyVisual() {
  return (
    <VisualWrapper title="ANATOMY OF A CANDLESTICK">
      <svg viewBox="0 0 320 180" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="180" fill={C.bg} rx="8"/>

        {/* Bullish candle */}
        <text x="70" y="20" fill={C.green} fontSize="10" textAnchor="middle" fontWeight="bold">BULLISH</text>
        {/* Upper wick */}
        <line x1="70" y1="30" x2="70" y2="55" stroke={C.green} strokeWidth="2"/>
        {/* Body */}
        <rect x="55" y="55" width="30" height="60" fill={C.green} rx="2"/>
        {/* Lower wick */}
        <line x1="70" y1="115" x2="70" y2="140" stroke={C.green} strokeWidth="2"/>
        {/* Labels */}
        <line x1="90" y1="30" x2="130" y2="30" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="135" y="33" fill={C.muted} fontSize="8">High (Upper Wick)</text>
        <line x1="90" y1="55" x2="130" y2="55" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="135" y="58" fill={C.green} fontSize="8">Close (Top of Body)</text>
        <line x1="90" y1="85" x2="130" y2="85" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="135" y="88" fill={C.muted} fontSize="8">Body = Price Range</text>
        <line x1="90" y1="115" x2="130" y2="115" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="135" y="118" fill={C.green} fontSize="8">Open (Bottom of Body)</text>
        <line x1="90" y1="140" x2="130" y2="140" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="135" y="143" fill={C.muted} fontSize="8">Low (Lower Wick)</text>

        {/* Bearish candle */}
        <text x="240" y="20" fill={C.red} fontSize="10" textAnchor="middle" fontWeight="bold">BEARISH</text>
        <line x1="240" y1="30" x2="240" y2="55" stroke={C.red} strokeWidth="2"/>
        <rect x="225" y="55" width="30" height="60" fill={C.red} rx="2"/>
        <line x1="240" y1="115" x2="240" y2="140" stroke={C.red} strokeWidth="2"/>
        {/* Bearish labels */}
        <text x="200" y="33" fill={C.muted} fontSize="8" textAnchor="end">High</text>
        <text x="200" y="58" fill={C.red} fontSize="8" textAnchor="end">Open</text>
        <text x="200" y="118" fill={C.red} fontSize="8" textAnchor="end">Close</text>
        <text x="200" y="143" fill={C.muted} fontSize="8" textAnchor="end">Low</text>

        <text x="160" y="170" fill={C.muted} fontSize="7" textAnchor="middle">Green = closed higher than open | Red = closed lower than open</text>
      </svg>
    </VisualWrapper>
  );
}

// ── 3. SUPPORT AND RESISTANCE ────────────────────────────────────────────────
export function SupportResistanceVisual() {
  return (
    <VisualWrapper title="SUPPORT & RESISTANCE">
      <svg viewBox="0 0 320 180" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="180" fill={C.bg} rx="8"/>

        {/* Resistance line */}
        <line x1="20" y1="45" x2="300" y2="45" stroke={C.red} strokeWidth="1.5" strokeDasharray="6,3"/>
        <text x="305" y="49" fill={C.red} fontSize="9" fontWeight="bold">R</text>
        <text x="25" y="38" fill={C.red} fontSize="8">RESISTANCE — price gets rejected here</text>

        {/* Support line */}
        <line x1="20" y1="140" x2="300" y2="140" stroke={C.green} strokeWidth="1.5" strokeDasharray="6,3"/>
        <text x="305" y="144" fill={C.green} fontSize="9" fontWeight="bold">S</text>
        <text x="25" y="172" fill={C.green} fontSize="8">SUPPORT — buyers step in here</text>

        {/* Price action bouncing */}
        <polyline points="20,140 50,100 80,45 95,65 120,45 140,70 165,45 185,80 210,140 235,100 260,140 285,110 300,140"
          fill="none" stroke={C.blue} strokeWidth="2"/>

        {/* Bounce arrows at support */}
        <text x="205" y="158" fill={C.green} fontSize="14">↑</text>
        <text x="255" y="158" fill={C.green} fontSize="14">↑</text>

        {/* Rejection arrows at resistance */}
        <text x="75" y="42" fill={C.red} fontSize="14">↓</text>
        <text x="115" y="42" fill={C.red} fontSize="14">↓</text>
        <text x="160" y="42" fill={C.red} fontSize="14">↓</text>

        <text x="160" y="168" fill={C.muted} fontSize="7" textAnchor="middle">Price bounces off support, gets rejected at resistance</text>
      </svg>
    </VisualWrapper>
  );
}

// ── 4. BULL AND BEAR MARKET ──────────────────────────────────────────────────
export function BullBearVisual() {
  return (
    <VisualWrapper title="BULL VS BEAR MARKET">
      <svg viewBox="0 0 320 160" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="160" fill={C.bg} rx="8"/>

        {/* Divider */}
        <line x1="160" y1="10" x2="160" y2="150" stroke={C.bord} strokeWidth="1"/>

        {/* Bull market */}
        <text x="80" y="25" fill={C.green} fontSize="11" textAnchor="middle" fontWeight="bold">🐂 BULL</text>
        <polyline points="20,130 40,120 60,110 80,95 100,80 120,65 140,50"
          fill="none" stroke={C.green} strokeWidth="2.5"/>
        <polygon points="20,130 40,120 60,110 80,95 100,80 120,65 140,50 140,145 20,145"
          fill={C.green + "20"}/>
        <text x="80" y="145" fill={C.green} fontSize="9" textAnchor="middle">Prices Rising ↑</text>

        {/* Bear market */}
        <text x="240" y="25" fill={C.red} fontSize="11" textAnchor="middle" fontWeight="bold">🐻 BEAR</text>
        <polyline points="175,50 195,65 215,80 235,95 255,110 275,120 300,135"
          fill="none" stroke={C.red} strokeWidth="2.5"/>
        <polygon points="175,50 195,65 215,80 235,95 255,110 275,120 300,135 300,45 175,45"
          fill={C.red + "20"}/>
        <text x="240" y="145" fill={C.red} fontSize="9" textAnchor="middle">Prices Falling ↓</text>

        <text x="160" y="158" fill={C.muted} fontSize="7" textAnchor="middle">Bear = 20%+ decline from recent highs</text>
      </svg>
    </VisualWrapper>
  );
}

// ── 5. FUTURES TICK VALUE ────────────────────────────────────────────────────
export function TickValueVisual() {
  return (
    <VisualWrapper title="ES1! vs NQ1! TICK VALUES">
      <svg viewBox="0 0 320 160" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="160" fill={C.bg} rx="8"/>

        {/* ES column */}
        <rect x="20" y="20" width="130" height="120" fill={C.green + "10"} rx="8" stroke={C.green + "40"} strokeWidth="1"/>
        <text x="85" y="42" fill={C.green} fontSize="13" textAnchor="middle" fontWeight="bold">ES1!</text>
        <text x="85" y="58" fill={C.muted} fontSize="8" textAnchor="middle">S&P 500 Futures</text>
        <line x1="30" y1="65" x2="140" y2="65" stroke={C.bord} strokeWidth="0.5"/>
        <text x="85" y="82" fill={C.txt} fontSize="9" textAnchor="middle">1 tick = $12.50</text>
        <text x="85" y="98" fill={C.txt} fontSize="9" textAnchor="middle">1 point = $50</text>
        <text x="85" y="114" fill={C.txt} fontSize="9" textAnchor="middle">10 points = $500</text>
        <rect x="35" y="122" width="100" height="10" fill={C.green + "20"} rx="3"/>
        <text x="85" y="131" fill={C.green} fontSize="8" textAnchor="middle">Lower Risk</text>

        {/* NQ column */}
        <rect x="170" y="20" width="130" height="120" fill={C.blue + "10"} rx="8" stroke={C.blue + "40"} strokeWidth="1"/>
        <text x="235" y="42" fill={C.blue} fontSize="13" textAnchor="middle" fontWeight="bold">NQ1!</text>
        <text x="235" y="58" fill={C.muted} fontSize="8" textAnchor="middle">NASDAQ Futures</text>
        <line x1="180" y1="65" x2="290" y2="65" stroke={C.bord} strokeWidth="0.5"/>
        <text x="235" y="82" fill={C.txt} fontSize="9" textAnchor="middle">1 tick = $5.00</text>
        <text x="235" y="98" fill={C.txt} fontSize="9" textAnchor="middle">1 point = $20</text>
        <text x="235" y="114" fill={C.txt} fontSize="9" textAnchor="middle">10 points = $200</text>
        <rect x="185" y="122" width="100" height="10" fill={C.red + "20"} rx="3"/>
        <text x="235" y="131" fill={C.red} fontSize="8" textAnchor="middle">Moves Faster</text>
      </svg>
    </VisualWrapper>
  );
}

// ── 6. LEVERAGE EXPLAINED ────────────────────────────────────────────────────
export function LeverageVisual() {
  return (
    <VisualWrapper title="HOW LEVERAGE WORKS">
      <svg viewBox="0 0 320 170" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="170" fill={C.bg} rx="8"/>

        {/* You control */}
        <text x="160" y="22" fill={C.txt} fontSize="10" textAnchor="middle">You deposit $12,500 margin</text>
        <text x="160" y="38" fill={C.muted} fontSize="9" textAnchor="middle">But you control...</text>

        {/* Big bar */}
        <rect x="20" y="48" width="280" height="30" fill={C.blue + "20"} rx="4" stroke={C.blue + "50"} strokeWidth="1"/>
        <text x="160" y="68" fill={C.blue} fontSize="11" textAnchor="middle" fontWeight="bold">$250,000+ in market value</text>

        {/* Arrow */}
        <text x="160" y="95" fill={C.muted} fontSize="20" textAnchor="middle">⚡</text>

        {/* Win/Loss split */}
        <rect x="20" y="108" width="130" height="45" fill={C.green + "15"} rx="6" stroke={C.green + "40"} strokeWidth="1"/>
        <text x="85" y="128" fill={C.green} fontSize="9" textAnchor="middle" fontWeight="bold">1% market move UP</text>
        <text x="85" y="145" fill={C.green} fontSize="11" textAnchor="middle" fontWeight="bold">+$2,500 profit</text>

        <rect x="170" y="108" width="130" height="45" fill={C.red + "15"} rx="6" stroke={C.red + "40"} strokeWidth="1"/>
        <text x="235" y="128" fill={C.red} fontSize="9" textAnchor="middle" fontWeight="bold">1% market move DOWN</text>
        <text x="235" y="145" fill={C.red} fontSize="11" textAnchor="middle" fontWeight="bold">-$2,500 loss</text>

        <text x="160" y="165" fill={C.gold} fontSize="8" textAnchor="middle">⚠️ Leverage amplifies both gains AND losses</text>
      </svg>
    </VisualWrapper>
  );
}

// ── 7. OPTIONS CALLS VS PUTS ─────────────────────────────────────────────────
export function CallsPutsVisual() {
  return (
    <VisualWrapper title="CALLS vs PUTS">
      <svg viewBox="0 0 320 170" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="170" fill={C.bg} rx="8"/>

        {/* Call option */}
        <rect x="10" y="15" width="145" height="140" fill={C.green + "08"} rx="8" stroke={C.green + "30"} strokeWidth="1"/>
        <text x="82" y="35" fill={C.green} fontSize="12" textAnchor="middle" fontWeight="bold">📞 CALL</text>
        <text x="82" y="52" fill={C.muted} fontSize="8" textAnchor="middle">Right to BUY</text>
        <line x1="20" y1="60" x2="145" y2="60" stroke={C.bord} strokeWidth="0.5"/>
        <text x="82" y="78" fill={C.txt} fontSize="9" textAnchor="middle">You think price</text>
        <text x="82" y="93" fill={C.green} fontSize="14" textAnchor="middle" fontWeight="bold">will go UP ↑</text>
        <polyline points="25,140 55,130 85,115 115,95 140,75"
          fill="none" stroke={C.green} strokeWidth="2"/>
        <polygon points="25,140 55,130 85,115 115,95 140,75 140,145 25,145"
          fill={C.green + "15"}/>

        {/* Put option */}
        <rect x="165" y="15" width="145" height="140" fill={C.red + "08"} rx="8" stroke={C.red + "30"} strokeWidth="1"/>
        <text x="237" y="35" fill={C.red} fontSize="12" textAnchor="middle" fontWeight="bold">🔙 PUT</text>
        <text x="237" y="52" fill={C.muted} fontSize="8" textAnchor="middle">Right to SELL</text>
        <line x1="175" y1="60" x2="300" y2="60" stroke={C.bord} strokeWidth="0.5"/>
        <text x="237" y="78" fill={C.txt} fontSize="9" textAnchor="middle">You think price</text>
        <text x="237" y="93" fill={C.red} fontSize="14" textAnchor="middle" fontWeight="bold">will go DOWN ↓</text>
        <polyline points="175,75 200,95 225,115 255,130 300,145"
          fill="none" stroke={C.red} strokeWidth="2"/>
        <polygon points="175,75 200,95 225,115 255,130 300,145 300,70 175,70"
          fill={C.red + "15"}/>
      </svg>
    </VisualWrapper>
  );
}

// ── 8. MOVING AVERAGES ───────────────────────────────────────────────────────
export function MovingAverageVisual() {
  return (
    <VisualWrapper title="MOVING AVERAGES">
      <svg viewBox="0 0 320 170" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="170" fill={C.bg} rx="8"/>

        {/* Grid */}
        {[50,90,130].map(y => <line key={y} x1="20" y1={y} x2="300" y2={y} stroke={C.bord} strokeWidth="0.5"/>)}

        {/* Price action (choppy) */}
        <polyline points="20,120 35,105 50,115 65,95 80,110 95,90 110,105 125,80 140,95 155,75 170,90 185,70 200,85 215,65 230,80 245,60 260,75 275,55 300,65"
          fill="none" stroke={C.dim} strokeWidth="1" strokeDasharray="2,2" opacity="0.6"/>

        {/* 9 EMA - fast */}
        <polyline points="20,118 35,108 50,112 65,98 80,108 95,92 110,103 125,82 140,93 155,77 170,88 185,72 200,83 215,67 230,78 245,62 260,73 275,57 300,63"
          fill="none" stroke={C.blue} strokeWidth="1.5"/>

        {/* 50 SMA - medium */}
        <polyline points="20,125 60,115 100,105 140,95 180,85 220,75 260,67 300,62"
          fill="none" stroke={C.gold} strokeWidth="2"/>

        {/* 200 SMA - slow */}
        <polyline points="20,140 80,130 140,118 200,105 260,90 300,82"
          fill="none" stroke={C.purp} strokeWidth="2.5"/>

        {/* Legend */}
        <line x1="20" y1="155" x2="35" y2="155" stroke={C.blue} strokeWidth="1.5"/>
        <text x="40" y="158" fill={C.blue} fontSize="8">9 EMA</text>
        <line x1="80" y1="155" x2="95" y2="155" stroke={C.gold} strokeWidth="2"/>
        <text x="100" y="158" fill={C.gold} fontSize="8">50 SMA</text>
        <line x1="150" y1="155" x2="165" y2="155" stroke={C.purp} strokeWidth="2.5"/>
        <text x="170" y="158" fill={C.purp} fontSize="8">200 SMA</text>
        <line x1="220" y1="155" x2="235" y2="155" stroke={C.dim} strokeWidth="1" strokeDasharray="2,2"/>
        <text x="240" y="158" fill={C.dim} fontSize="8">Price</text>
      </svg>
    </VisualWrapper>
  );
}

// ── 9. BREAK OF STRUCTURE ────────────────────────────────────────────────────
export function BOSVisual() {
  return (
    <VisualWrapper title="BREAK OF STRUCTURE (BOS)">
      <svg viewBox="0 0 320 180" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="180" fill={C.bg} rx="8"/>

        {/* Bearish phase */}
        <text x="60" y="18" fill={C.red} fontSize="9" textAnchor="middle">DOWNTREND</text>
        <polyline points="20,30 40,45 60,35 80,55 100,45 120,65"
          fill="none" stroke={C.red} strokeWidth="2"/>

        {/* Lower highs markers */}
        <circle cx="40" cy="45" r="3" fill={C.red}/>
        <circle cx="80" cy="55" r="3" fill={C.red}/>
        <text x="40" y="42" fill={C.red} fontSize="7" textAnchor="middle">LH</text>
        <text x="80" y="52" fill={C.red} fontSize="7" textAnchor="middle">LH</text>

        {/* Lower lows */}
        <circle cx="60" cy="35" r="3" fill={C.red} opacity="0.5"/>
        <circle cx="100" cy="45" r="3" fill={C.red} opacity="0.5"/>
        <text x="60" y="32" fill={C.red} fontSize="7" textAnchor="middle" opacity="0.7">LL</text>
        <text x="100" y="42" fill={C.red} fontSize="7" textAnchor="middle" opacity="0.7">LL</text>

        {/* Transition */}
        <polyline points="120,65 140,80 160,60 180,75"
          fill="none" stroke={C.dim} strokeWidth="1.5" strokeDasharray="4,2"/>

        {/* BOS arrow */}
        <line x1="160" y1="60" x2="160" y2="30" stroke={C.gold} strokeWidth="1" strokeDasharray="3,2"/>
        <text x="165" y="48" fill={C.gold} fontSize="8" fontWeight="bold">BOS!</text>
        <text x="165" y="58" fill={C.gold} fontSize="7">Breaks</text>
        <text x="165" y="67" fill={C.gold} fontSize="7">prev high</text>

        {/* Bullish phase */}
        <text x="255" y="18" fill={C.green} fontSize="9" textAnchor="middle">UPTREND BEGINS</text>
        <polyline points="180,75 200,60 220,70 240,50 260,60 280,40 300,45"
          fill="none" stroke={C.green} strokeWidth="2"/>

        {/* Higher highs/lows */}
        <circle cx="200" cy="60" r="3" fill={C.green} opacity="0.5"/>
        <circle cx="240" cy="50" r="3" fill={C.green} opacity="0.5"/>
        <circle cx="280" cy="40" r="3" fill={C.green}/>
        <text x="240" y="47" fill={C.green} fontSize="7" textAnchor="middle">HH</text>
        <text x="280" y="37" fill={C.green} fontSize="7" textAnchor="middle">HH</text>

        <circle cx="220" cy="70" r="3" fill={C.green} opacity="0.5"/>
        <circle cx="260" cy="60" r="3" fill={C.green} opacity="0.5"/>
        <text x="220" y="80" fill={C.green} fontSize="7" textAnchor="middle">HL</text>
        <text x="260" y="70" fill={C.green} fontSize="7" textAnchor="middle">HL</text>

        {/* Pullback zone */}
        <rect x="20" y="100" width="280" height="70" fill={C.surf2} rx="6"/>
        <text x="160" y="118" fill={C.txt} fontSize="9" textAnchor="middle" fontWeight="bold">How to trade BOS:</text>
        <text x="35" y="132" fill={C.green} fontSize="8">1. BOS confirms new uptrend direction</text>
        <text x="35" y="146" fill={C.gold} fontSize="8">2. Wait for price to pull back</text>
        <text x="35" y="160" fill={C.blue} fontSize="8">3. Enter long at the pullback</text>

      </svg>
    </VisualWrapper>
  );
}

// ── 10. ORDER BLOCK ──────────────────────────────────────────────────────────
export function OrderBlockVisual() {
  return (
    <VisualWrapper title="ORDER BLOCK — WHERE INSTITUTIONS BUY/SELL">
      <svg viewBox="0 0 320 180" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="180" fill={C.bg} rx="8"/>

        {/* Bullish order block example */}
        <text x="160" y="18" fill={C.txt} fontSize="9" textAnchor="middle" fontWeight="bold">BULLISH ORDER BLOCK</text>

        {/* Candles before OB */}
        {[
          {x:25, h:60, open:90, close:80, color:C.red},
          {x:45, h:65, open:85, close:75, color:C.red},
          {x:65, h:55, open:80, close:70, color:C.red},
        ].map((c,i) => (
          <g key={i}>
            <line x1={c.x+5} y1={c.h} x2={c.x+5} y2={c.close} stroke={c.color} strokeWidth="1"/>
            <rect x={c.x} y={Math.min(c.open,c.close)} width="10" height={Math.abs(c.open-c.close)} fill={c.color} rx="1"/>
            <line x1={c.x+5} y1={c.open} x2={c.x+5} y2={c.open+10} stroke={c.color} strokeWidth="1"/>
          </g>
        ))}

        {/* The order block candle - last red before big move */}
        <rect x="85" y="65" width="18" height="20" fill={C.red} rx="1"/>
        <line x1="94" y1="55" x2="94" y2="65" stroke={C.red} strokeWidth="1.5"/>
        <line x1="94" y1="85" x2="94" y2="95" stroke={C.red} strokeWidth="1.5"/>
        {/* OB highlight */}
        <rect x="83" y="53" width="22" height="44" fill="none" stroke={C.gold} strokeWidth="1.5" strokeDasharray="3,2" rx="2"/>
        <text x="94" y="108" fill={C.gold} fontSize="7" textAnchor="middle" fontWeight="bold">ORDER BLOCK</text>
        <text x="94" y="118" fill={C.gold} fontSize="7" textAnchor="middle">(last red candle)</text>

        {/* Big bullish impulse move */}
        <polyline points="103,80 120,65 140,50 160,35 180,25"
          fill="none" stroke={C.green} strokeWidth="3"/>
        <text x="185" y="30" fill={C.green} fontSize="9" fontWeight="bold">↑ BIG MOVE</text>

        {/* Pullback to OB */}
        <polyline points="180,25 200,35 220,45 240,60 255,70"
          fill="none" stroke={C.dim} strokeWidth="1.5" strokeDasharray="4,2"/>
        <text x="270" y="72" fill={C.gold} fontSize="8">Returns</text>
        <text x="270" y="82" fill={C.gold} fontSize="8">to OB</text>

        {/* Entry arrow */}
        <line x1="255" y1="72" x2="255" y2="125" stroke={C.green} strokeWidth="1.5" strokeDasharray="3"/>
        <text x="255" y="140" fill={C.green} fontSize="9" textAnchor="middle" fontWeight="bold">BUY HERE</text>

        {/* Next move up */}
        <polyline points="255,70 270,55 285,40 300,28"
          fill="none" stroke={C.green} strokeWidth="2.5"/>

        {/* Key insight */}
        <rect x="10" y="148" width="300" height="26" fill={C.surf2} rx="6"/>
        <text x="160" y="162" fill={C.txt} fontSize="8" textAnchor="middle">Institutions left unfilled orders in the OB</text>
        <text x="160" y="172" fill={C.muted} fontSize="7" textAnchor="middle">Price returns to fill them — that's your entry signal</text>
      </svg>
    </VisualWrapper>
  );
}

// ── 11. RISK REWARD ──────────────────────────────────────────────────────────
export function RiskRewardVisual() {
  return (
    <VisualWrapper title="RISK / REWARD RATIO">
      <svg viewBox="0 0 320 180" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="180" fill={C.bg} rx="8"/>

        {/* Entry line */}
        <line x1="60" y1="100" x2="300" y2="100" stroke={C.blue} strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="15" y="104" fill={C.blue} fontSize="8" fontWeight="bold">ENTRY</text>

        {/* Stop loss */}
        <line x1="60" y1="130" x2="300" y2="130" stroke={C.red} strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="8" y="134" fill={C.red} fontSize="8" fontWeight="bold">STOP</text>

        {/* Target 1:2 */}
        <line x1="60" y1="40" x2="300" y2="40" stroke={C.green} strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="5" y="44" fill={C.green} fontSize="7" fontWeight="bold">TARGET</text>
        <text x="5" y="54" fill={C.green} fontSize="7">(1:2 R)</text>

        {/* Risk bracket */}
        <line x1="75" y1="100" x2="75" y2="130" stroke={C.red} strokeWidth="2"/>
        <line x1="70" y1="100" x2="80" y2="100" stroke={C.red} strokeWidth="2"/>
        <line x1="70" y1="130" x2="80" y2="130" stroke={C.red} strokeWidth="2"/>
        <text x="90" y="118" fill={C.red} fontSize="9" fontWeight="bold">RISK</text>
        <text x="90" y="130" fill={C.red} fontSize="8">$100</text>

        {/* Reward bracket */}
        <line x1="75" y1="40" x2="75" y2="100" stroke={C.green} strokeWidth="2"/>
        <line x1="70" y1="40" x2="80" y2="40" stroke={C.green} strokeWidth="2"/>
        <line x1="70" y1="100" x2="80" y2="100" stroke={C.green} strokeWidth="2"/>
        <text x="90" y="68" fill={C.green} fontSize="9" fontWeight="bold">REWARD</text>
        <text x="90" y="80" fill={C.green} fontSize="8">$200</text>

        {/* Trade line */}
        <polyline points="150,100 170,95 190,85 210,70 230,55 250,45 270,42"
          fill="none" stroke={C.green} strokeWidth="2.5"/>

        {/* R ratio examples */}
        <rect x="155" y="140" width="150" height="35" fill={C.surf2} rx="6"/>
        <text x="230" y="155" fill={C.txt} fontSize="8" textAnchor="middle" fontWeight="bold">R/R Examples</text>
        <text x="175" y="168" fill={C.red} fontSize="7">1:1 = Break even</text>
        <text x="255" y="168" fill={C.green} fontSize="7">1:3 = Elite level</text>

        {/* Minimum line */}
        <text x="160" y="175" fill={C.gold} fontSize="7" textAnchor="middle">⚠️ Minimum 1:2 R/R on every trade</text>
      </svg>
    </VisualWrapper>
  );
}

// ── 12. CANDLE PATTERNS ──────────────────────────────────────────────────────
export function CandlePatternsVisual() {
  return (
    <VisualWrapper title="KEY REVERSAL CANDLES">
      <svg viewBox="0 0 320 170" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="170" fill={C.bg} rx="8"/>

        {/* Hammer */}
        <text x="40" y="18" fill={C.green} fontSize="9" textAnchor="middle" fontWeight="bold">HAMMER</text>
        <line x1="40" y1="25" x2="40" y2="45" stroke={C.green} strokeWidth="1.5"/>
        <rect x="32" y="45" width="16" height="12" fill={C.green} rx="2"/>
        <line x1="40" y1="57" x2="40" y2="90" stroke={C.green} strokeWidth="1.5"/>
        <text x="40" y="105" fill={C.green} fontSize="7" textAnchor="middle">Bullish</text>
        <text x="40" y="114" fill={C.muted} fontSize="7" textAnchor="middle">Reversal</text>

        {/* Shooting Star */}
        <text x="110" y="18" fill={C.red} fontSize="9" textAnchor="middle" fontWeight="bold">SHOOTING STAR</text>
        <line x1="110" y1="25" x2="110" y2="55" stroke={C.red} strokeWidth="1.5"/>
        <rect x="102" y="55" width="16" height="12" fill={C.red} rx="2"/>
        <line x1="110" y1="67" x2="110" y2="80" stroke={C.red} strokeWidth="1.5"/>
        <text x="110" y="105" fill={C.red} fontSize="7" textAnchor="middle">Bearish</text>
        <text x="110" y="114" fill={C.muted} fontSize="7" textAnchor="middle">Reversal</text>

        {/* Doji */}
        <text x="185" y="18" fill={C.gold} fontSize="9" textAnchor="middle" fontWeight="bold">DOJI</text>
        <line x1="185" y1="25" x2="185" y2="55" stroke={C.gold} strokeWidth="1.5"/>
        <line x1="175" y1="55" x2="195" y2="55" stroke={C.gold} strokeWidth="2.5"/>
        <line x1="185" y1="55" x2="185" y2="85" stroke={C.gold} strokeWidth="1.5"/>
        <text x="185" y="105" fill={C.gold} fontSize="7" textAnchor="middle">Indecision</text>
        <text x="185" y="114" fill={C.muted} fontSize="7" textAnchor="middle">Watch next candle</text>

        {/* Engulfing */}
        <text x="270" y="18" fill={C.green} fontSize="9" textAnchor="middle" fontWeight="bold">ENGULFING</text>
        <rect x="258" y="45" width="10" height="20" fill={C.red} rx="1"/>
        <rect x="252" y="35" width="22" height="40" fill={C.green} rx="2"/>
        <text x="270" y="105" fill={C.green} fontSize="7" textAnchor="middle">Green engulfs</text>
        <text x="270" y="114" fill={C.muted} fontSize="7" textAnchor="middle">red = Bullish</text>

        {/* Dividers */}
        <line x1="75" y1="15" x2="75" y2="125" stroke={C.bord} strokeWidth="0.5"/>
        <line x1="150" y1="15" x2="150" y2="125" stroke={C.bord} strokeWidth="0.5"/>
        <line x1="230" y1="15" x2="230" y2="125" stroke={C.bord} strokeWidth="0.5"/>

        {/* Bottom tip */}
        <rect x="10" y="130" width="300" height="32" fill={C.surf2} rx="6"/>
        <text x="160" y="144" fill={C.txt} fontSize="8" textAnchor="middle" fontWeight="bold">💡 Key Rule</text>
        <text x="160" y="157" fill={C.muted} fontSize="7" textAnchor="middle">Patterns are MORE reliable at key support/resistance levels</text>
      </svg>
    </VisualWrapper>
  );
}

// ── 13. TRADING PSYCHOLOGY ───────────────────────────────────────────────────
export function PsychologyVisual() {
  return (
    <VisualWrapper title="THE EMOTIONAL TRADING CYCLE">
      <svg viewBox="0 0 320 180" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="180" fill={C.bg} rx="8"/>

        {/* Cycle circle */}
        <circle cx="160" cy="85" r="65" fill="none" stroke={C.bord} strokeWidth="1"/>

        {/* Emotions around the circle */}
        <text x="160" y="22" fill={C.green} fontSize="9" textAnchor="middle" fontWeight="bold">OPTIMISM 😊</text>
        <text x="245" y="50" fill={C.green} fontSize="8" textAnchor="middle">EXCITEMENT</text>
        <text x="255" y="90" fill={C.gold} fontSize="8" textAnchor="middle">THRILL 🤑</text>
        <text x="240" y="130" fill={C.gold} fontSize="8" textAnchor="middle">ANXIETY 😰</text>
        <text x="160" y="158" fill={C.red} fontSize="9" textAnchor="middle" fontWeight="bold">PANIC 😱 SELL</text>
        <text x="75" y="130" fill={C.red} fontSize="8" textAnchor="middle">DENIAL</text>
        <text x="60" y="90" fill={C.red} fontSize="8" textAnchor="middle">FEAR 😨</text>
        <text x="75" y="50" fill={C.muted} fontSize="8" textAnchor="middle">HOPE</text>

        {/* Center text */}
        <text x="160" y="80" fill={C.txt} fontSize="10" textAnchor="middle" fontWeight="bold">DON'T</text>
        <text x="160" y="95" fill={C.txt} fontSize="10" textAnchor="middle" fontWeight="bold">RIDE THIS</text>
        <text x="160" y="110" fill={C.txt} fontSize="10" textAnchor="middle" fontWeight="bold">CYCLE</text>

        {/* Arrow around circle */}
        <path d="M 160 20 A 65 65 0 1 1 159 20" fill="none" stroke={C.purp} strokeWidth="1.5" strokeDasharray="4,3"
          markerEnd="url(#arrow)"/>
      </svg>
    </VisualWrapper>
  );
}

// ── 14. POSITION SIZING ──────────────────────────────────────────────────────
export function PositionSizingVisual() {
  return (
    <VisualWrapper title="POSITION SIZING — THE 1-2% RULE">
      <svg viewBox="0 0 320 170" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="170" fill={C.bg} rx="8"/>

        {/* Account sizes */}
        <text x="160" y="18" fill={C.txt} fontSize="10" textAnchor="middle" fontWeight="bold">Max Risk Per Trade</text>

        {[
          { account: "$10,000", risk1: "$100", risk2: "$200", y: 40 },
          { account: "$25,000", risk1: "$250", risk2: "$500", y: 75 },
          { account: "$50,000", risk1: "$500", risk2: "$1,000", y: 110 },
        ].map((row, i) => (
          <g key={i}>
            <rect x="10" y={row.y} width="300" height="28" fill={i%2===0?C.surf2:C.bg} rx="4"/>
            <text x="75" y={row.y+18} fill={C.txt} fontSize="11" textAnchor="middle" fontWeight="bold">{row.account}</text>
            <text x="195" y={row.y+14} fill={C.green} fontSize="9" textAnchor="middle">1% = {row.risk1}</text>
            <text x="195" y={row.y+24} fill={C.gold} fontSize="9" textAnchor="middle">2% = {row.risk2}</text>
            <line x1="145" y1={row.y+4} x2="145" y2={row.y+24} stroke={C.bord} strokeWidth="0.5"/>
          </g>
        ))}

        {/* Headers */}
        <text x="75" y="38" fill={C.muted} fontSize="8" textAnchor="middle">Account Size</text>
        <text x="220" y="38" fill={C.muted} fontSize="8" textAnchor="middle">Max Risk</text>

        {/* Golden rule */}
        <rect x="10" y="145" width="300" height="22" fill={C.green + "15"} rx="6" stroke={C.green + "40"} strokeWidth="1"/>
        <text x="160" y="160" fill={C.green} fontSize="8" textAnchor="middle" fontWeight="bold">✓ Start with 1 contract. Master risk first. Size up later.</text>
      </svg>
    </VisualWrapper>
  );
}

// ── 15. NEWS IMPACT ──────────────────────────────────────────────────────────
export function NewsImpactVisual() {
  return (
    <VisualWrapper title="HOW NEWS MOVES MARKETS">
      <svg viewBox="0 0 320 170" style={{ width: "100%", height: "auto" }}>
        <rect width="320" height="170" fill={C.bg} rx="8"/>

        {/* Before news - choppy */}
        <text x="60" y="18" fill={C.muted} fontSize="8" textAnchor="middle">Before News</text>
        <polyline points="20,80 35,78 50,82 65,79 80,81 95,77 110,80"
          fill="none" stroke={C.dim} strokeWidth="1.5"/>
        <rect x="108" y="30" width="1" height="120" fill={C.gold} strokeWidth="2"/>
        <text x="115" y="25" fill={C.gold} fontSize="7">📰 NEWS</text>
        <text x="115" y="35" fill={C.gold} fontSize="7">RELEASE</text>

        {/* Bullish scenario */}
        <text x="210" y="18" fill={C.green} fontSize="8" textAnchor="middle">Good News = Rally</text>
        <polyline points="110,80 130,70 150,55 170,40 190,30 210,25 230,22"
          fill="none" stroke={C.green} strokeWidth="2.5"/>
        <polygon points="110,80 130,70 150,55 170,40 190,30 210,25 230,22 230,90 110,90"
          fill={C.green + "15"}/>

        {/* Bearish scenario */}
        <text x="210" y="110" fill={C.red} fontSize="8" textAnchor="middle">Bad News = Drop</text>
        <polyline points="110,80 130,95 150,110 170,125 190,135 210,140 230,145"
          fill="none" stroke={C.red} strokeWidth="2.5"/>

        {/* Warning box */}
        <rect x="10" y="148" width="300" height="18" fill={C.gold + "15"} rx="4" stroke={C.gold + "40"} strokeWidth="1"/>
        <text x="160" y="160" fill={C.gold} fontSize="7" textAnchor="middle">⚠️ Avoid trading 30 min before and after HIGH IMPACT news</text>
      </svg>
    </VisualWrapper>
  );
}

// ── VISUAL MAP — which visual goes with which lesson ─────────────────────────
export const LESSON_VISUALS = {
  "s1l1": <StockMarketVisual />,
  "s1l4": <BullBearVisual />,
  "s2l2": <TickValueVisual />,
  "s2l3": <LeverageVisual />,
  "s3l1": <CallsPutsVisual />,
  "s3l2": <CallsPutsVisual />,
  "s4l1": <SupportResistanceVisual />,
  "s4l3": <MovingAverageVisual />,
  "s5l1": <CandleAnatomyVisual />,
  "s5l2": <CandlePatternsVisual />,
  "s6l2": <BOSVisual />,
  "s6l3": <OrderBlockVisual />,
  "s7l1": <NewsImpactVisual />,
  "s8l2": <PositionSizingVisual />,
  "s8l3": <RiskRewardVisual />,
  "s8l4": <RiskRewardVisual />,
  "s9l1": <PsychologyVisual />,
};
