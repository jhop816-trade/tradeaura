import React from "react";

const C = {
  bg:"#0f1117", surf:"#161b27", surf2:"#1c2333", bord:"#232d40",
  blue:"#4f8ef7", green:"#34d399", red:"#f87171", gold:"#fbbf24", purp:"#a78bfa",
  txt:"#e2e8f0", muted:"#64748b", dim:"#94a3b8"
};

const Wrap = ({ title, children }) => (
  <div style={{ background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
    {title && <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 12 }}>{title}</div>}
    {children}
  </div>
);

// ── BULLISH CANDLE ────────────────────────────────────────────────────────────
export function BullishCandleVisual() {
  return (
    <Wrap title="BULLISH (GREEN) CANDLE — BUYERS WON">
      <svg viewBox="0 0 320 180" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="180" fill={C.bg} rx="8"/>
        <text x="80" y="20" fill={C.green} fontSize="11" textAnchor="middle" fontWeight="bold">BULLISH CANDLE</text>
        <line x1="80" y1="30" x2="80" y2="55" stroke={C.green} strokeWidth="2.5"/>
        <rect x="60" y="55" width="40" height="70" fill={C.green} rx="3"/>
        <line x1="80" y1="125" x2="80" y2="150" stroke={C.green} strokeWidth="2.5"/>
        <line x1="100" y1="30" x2="150" y2="30" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="155" y="33" fill={C.muted} fontSize="9">High — upper wick tip</text>
        <line x1="100" y1="55" x2="150" y2="55" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="155" y="58" fill={C.green} fontSize="9">Close — top of body</text>
        <line x1="100" y1="125" x2="150" y2="125" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="155" y="128" fill={C.green} fontSize="9">Open — bottom of body</text>
        <line x1="100" y1="150" x2="150" y2="150" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="155" y="153" fill={C.muted} fontSize="9">Low — lower wick tip</text>
        <rect x="10" y="160" width="300" height="16" fill={C.green+"18"} rx="4"/>
        <text x="160" y="172" fill={C.green} fontSize="8" textAnchor="middle">Green = closed HIGHER than it opened — buyers in control</text>
      </svg>
    </Wrap>
  );
}

// ── BEARISH CANDLE ────────────────────────────────────────────────────────────
export function BearishCandleVisual() {
  return (
    <Wrap title="BEARISH (RED) CANDLE — SELLERS WON">
      <svg viewBox="0 0 320 180" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="180" fill={C.bg} rx="8"/>
        <text x="80" y="20" fill={C.red} fontSize="11" textAnchor="middle" fontWeight="bold">BEARISH CANDLE</text>
        <line x1="80" y1="30" x2="80" y2="55" stroke={C.red} strokeWidth="2.5"/>
        <rect x="60" y="55" width="40" height="70" fill={C.red} rx="3"/>
        <line x1="80" y1="125" x2="80" y2="150" stroke={C.red} strokeWidth="2.5"/>
        <line x1="100" y1="30" x2="150" y2="30" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="155" y="33" fill={C.muted} fontSize="9">High — upper wick tip</text>
        <line x1="100" y1="55" x2="150" y2="55" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="155" y="58" fill={C.red} fontSize="9">Open — top of body</text>
        <line x1="100" y1="125" x2="150" y2="125" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="155" y="128" fill={C.red} fontSize="9">Close — bottom of body</text>
        <line x1="100" y1="150" x2="150" y2="150" stroke={C.muted} strokeWidth="0.5" strokeDasharray="3"/>
        <text x="155" y="153" fill={C.muted} fontSize="9">Low — lower wick tip</text>
        <rect x="10" y="160" width="300" height="16" fill={C.red+"18"} rx="4"/>
        <text x="160" y="172" fill={C.red} fontSize="8" textAnchor="middle">Red = closed LOWER than it opened — sellers in control</text>
      </svg>
    </Wrap>
  );
}

// ── SUPPORT & RESISTANCE ──────────────────────────────────────────────────────
export function SupportResistanceVisual() {
  return (
    <Wrap title="SUPPORT & RESISTANCE">
      <svg viewBox="0 0 320 190" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="190" fill={C.bg} rx="8"/>
        <line x1="15" y1="45" x2="300" y2="45" stroke={C.red} strokeWidth="2" strokeDasharray="7,3"/>
        <text x="305" y="49" fill={C.red} fontSize="10" fontWeight="bold">R</text>
        <text x="20" y="38" fill={C.red} fontSize="9">RESISTANCE — sellers push price back down</text>
        <line x1="15" y1="150" x2="300" y2="150" stroke={C.green} strokeWidth="2" strokeDasharray="7,3"/>
        <text x="305" y="154" fill={C.green} fontSize="10" fontWeight="bold">S</text>
        <text x="20" y="175" fill={C.green} fontSize="9">SUPPORT — buyers push price back up</text>
        <polyline points="15,150 40,115 65,45 82,68 105,45 128,75 152,45 172,88 200,150 225,108 255,150 278,118 300,150"
          fill="none" stroke={C.blue} strokeWidth="2.5"/>
        <text x="65" y="42" fill={C.red} fontSize="13">↓</text>
        <text x="105" y="42" fill={C.red} fontSize="13">↓</text>
        <text x="148" y="42" fill={C.red} fontSize="13">↓</text>
        <text x="197" y="165" fill={C.green} fontSize="13">↑</text>
        <text x="252" y="165" fill={C.green} fontSize="13">↑</text>
      </svg>
    </Wrap>
  );
}

// ── UPTREND ───────────────────────────────────────────────────────────────────
export function UptrendVisual() {
  return (
    <Wrap title="UPTREND — HIGHER HIGHS & HIGHER LOWS">
      <svg viewBox="0 0 320 190" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="190" fill={C.bg} rx="8"/>
        {[40,80,120,160].map(y => <line key={y} x1="15" y1={y} x2="305" y2={y} stroke={C.bord} strokeWidth="0.5"/>)}
        <polyline points="20,160 55,130 90,145 130,105 165,120 205,80 240,95 280,55"
          fill="none" stroke={C.green} strokeWidth="3"/>
        <polygon points="20,160 55,130 90,145 130,105 165,120 205,80 240,95 280,55 280,175 20,175"
          fill={C.green+"12"}/>
        <circle cx="55" cy="130" r="5" fill={C.green} opacity="0.7"/>
        <circle cx="130" cy="105" r="5" fill={C.green} opacity="0.7"/>
        <circle cx="205" cy="80" r="5" fill={C.green} opacity="0.7"/>
        <circle cx="280" cy="55" r="5" fill={C.green}/>
        <text x="55" y="120" fill={C.green} fontSize="8" textAnchor="middle">HH</text>
        <text x="130" y="95" fill={C.green} fontSize="8" textAnchor="middle">HH</text>
        <text x="205" y="70" fill={C.green} fontSize="8" textAnchor="middle">HH</text>
        <text x="280" y="45" fill={C.green} fontSize="8" textAnchor="middle">HH</text>
        <circle cx="90" cy="145" r="4" fill={C.blue} opacity="0.7"/>
        <circle cx="165" cy="120" r="4" fill={C.blue} opacity="0.7"/>
        <circle cx="240" cy="95" r="4" fill={C.blue} opacity="0.7"/>
        <text x="90" y="158" fill={C.blue} fontSize="8" textAnchor="middle">HL</text>
        <text x="165" y="133" fill={C.blue} fontSize="8" textAnchor="middle">HL</text>
        <text x="240" y="108" fill={C.blue} fontSize="8" textAnchor="middle">HL</text>
        <rect x="10" y="174" width="300" height="14" fill={C.green+"15"} rx="3"/>
        <text x="160" y="184" fill={C.green} fontSize="8" textAnchor="middle">Buy pullbacks to Higher Lows — trade WITH the trend</text>
      </svg>
    </Wrap>
  );
}

// ── MOVING AVERAGES ───────────────────────────────────────────────────────────
export function MovingAverageVisual() {
  return (
    <Wrap title="MOVING AVERAGES — 9 EMA / 50 SMA / 200 SMA">
      <svg viewBox="0 0 320 215" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="215" fill={C.bg} rx="8"/>
        {[50,95,140].map(y => <line key={y} x1="15" y1={y} x2="305" y2={y} stroke={C.bord} strokeWidth="0.5"/>)}
        <polyline points="15,135 35,120 55,128 75,108 95,118 115,96 135,108 155,84 175,96 195,75 215,88 235,65 255,78 275,56 300,62"
          fill="none" stroke={C.dim} strokeWidth="1" strokeDasharray="2,2" opacity="0.5"/>
        <polyline points="15,132 35,118 55,124 75,106 95,115 115,95 135,105 155,83 175,94 195,73 215,86 235,63 255,76 275,54 300,60"
          fill="none" stroke={C.blue} strokeWidth="2"/>
        <polyline points="15,145 60,132 105,118 150,104 195,90 240,78 285,64 300,60"
          fill="none" stroke={C.gold} strokeWidth="2.5"/>
        <polyline points="15,160 70,148 130,133 190,116 250,98 300,85"
          fill="none" stroke={C.purp} strokeWidth="3"/>
        <line x1="15" y1="172" x2="35" y2="172" stroke={C.blue} strokeWidth="2"/>
        <text x="40" y="175" fill={C.blue} fontSize="9">9 EMA — fast, short term momentum</text>
        <line x1="15" y1="186" x2="35" y2="186" stroke={C.gold} strokeWidth="2.5"/>
        <text x="40" y="189" fill={C.gold} fontSize="9">50 SMA — medium term trend</text>
        <line x1="15" y1="200" x2="35" y2="200" stroke={C.purp} strokeWidth="3"/>
        <text x="40" y="203" fill={C.purp} fontSize="9">200 SMA — long term, THE big one</text>
      </svg>
    </Wrap>
  );
}

// ── HAMMER ────────────────────────────────────────────────────────────────────
export function HammerVisual() {
  return (
    <Wrap title="HAMMER — BULLISH REVERSAL">
      <svg viewBox="0 0 320 160" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="160" fill={C.bg} rx="8"/>
        <text x="80" y="20" fill={C.green} fontSize="11" textAnchor="middle" fontWeight="bold">🔨 HAMMER</text>
        <line x1="80" y1="28" x2="80" y2="42" stroke={C.green} strokeWidth="2"/>
        <rect x="65" y="42" width="30" height="16" fill={C.green} rx="2"/>
        <line x1="80" y1="58" x2="80" y2="110" stroke={C.green} strokeWidth="2.5"/>
        <text x="80" y="128" fill={C.green} fontSize="9" textAnchor="middle">Small body</text>
        <text x="80" y="140" fill={C.green} fontSize="9" textAnchor="middle">Long lower wick</text>
        <text x="80" y="152" fill={C.muted} fontSize="8" textAnchor="middle">2× or more body</text>
        <line x1="112" y1="80" x2="140" y2="80" stroke={C.muted} strokeWidth="0.5" strokeDasharray="2"/>
        <text x="145" y="84" fill={C.muted} fontSize="8">Buyers fought</text>
        <text x="145" y="95" fill={C.muted} fontSize="8">back hard from</text>
        <text x="145" y="106" fill={C.muted} fontSize="8">the lows</text>
        <rect x="10" y="144" width="300" height="14" fill={C.green+"18"} rx="3"/>
        <text x="160" y="154" fill={C.green} fontSize="8" textAnchor="middle">Look for this at SUPPORT levels — strong buy signal</text>
      </svg>
    </Wrap>
  );
}

// ── SHOOTING STAR ─────────────────────────────────────────────────────────────
export function ShootingStarVisual() {
  return (
    <Wrap title="SHOOTING STAR — BEARISH REVERSAL">
      <svg viewBox="0 0 320 160" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="160" fill={C.bg} rx="8"/>
        <text x="80" y="20" fill={C.red} fontSize="11" textAnchor="middle" fontWeight="bold">⭐ SHOOTING STAR</text>
        <line x1="80" y1="28" x2="80" y2="80" stroke={C.red} strokeWidth="2.5"/>
        <rect x="65" y="80" width="30" height="16" fill={C.red} rx="2"/>
        <line x1="80" y1="96" x2="80" y2="110" stroke={C.red} strokeWidth="2"/>
        <text x="80" y="128" fill={C.red} fontSize="9" textAnchor="middle">Long upper wick</text>
        <text x="80" y="140" fill={C.red} fontSize="9" textAnchor="middle">Small body</text>
        <text x="80" y="152" fill={C.muted} fontSize="8" textAnchor="middle">2× or more body</text>
        <line x1="112" y1="52" x2="140" y2="52" stroke={C.muted} strokeWidth="0.5" strokeDasharray="2"/>
        <text x="145" y="44" fill={C.muted} fontSize="8">Sellers pushed</text>
        <text x="145" y="55" fill={C.muted} fontSize="8">price back down</text>
        <text x="145" y="66" fill={C.muted} fontSize="8">from the highs</text>
        <rect x="10" y="144" width="300" height="14" fill={C.red+"18"} rx="3"/>
        <text x="160" y="154" fill={C.red} fontSize="8" textAnchor="middle">Look for this at RESISTANCE levels — strong sell signal</text>
      </svg>
    </Wrap>
  );
}

// ── DOJI ──────────────────────────────────────────────────────────────────────
export function DojiVisual() {
  return (
    <Wrap title="DOJI — INDECISION">
      <svg viewBox="0 0 320 160" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="160" fill={C.bg} rx="8"/>
        <text x="80" y="20" fill={C.gold} fontSize="11" textAnchor="middle" fontWeight="bold">✚ DOJI</text>
        <line x1="80" y1="28" x2="80" y2="72" stroke={C.gold} strokeWidth="2"/>
        <line x1="58" y1="72" x2="102" y2="72" stroke={C.gold} strokeWidth="3"/>
        <line x1="80" y1="72" x2="80" y2="116" stroke={C.gold} strokeWidth="2"/>
        <text x="80" y="132" fill={C.gold} fontSize="9" textAnchor="middle">Open = Close</text>
        <text x="80" y="144" fill={C.muted} fontSize="9" textAnchor="middle">Buyers & sellers</text>
        <text x="80" y="154" fill={C.muted} fontSize="8" textAnchor="middle">perfectly balanced</text>
        <text x="155" y="55" fill={C.txt} fontSize="9">Neither side won.</text>
        <text x="155" y="68" fill={C.txt} fontSize="9">Watch the NEXT</text>
        <text x="155" y="81" fill={C.txt} fontSize="9">candle to decide</text>
        <text x="155" y="94" fill={C.txt} fontSize="9">direction.</text>
        <rect x="10" y="144" width="300" height="14" fill={C.gold+"18"} rx="3"/>
        <text x="160" y="154" fill={C.gold} fontSize="8" textAnchor="middle">Doji at key S/R = high probability reversal setup</text>
      </svg>
    </Wrap>
  );
}

// ── ENGULFING ─────────────────────────────────────────────────────────────────
export function EngulfingVisual() {
  return (
    <Wrap title="ENGULFING PATTERN">
      <svg viewBox="0 0 320 170" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="170" fill={C.bg} rx="8"/>
        <text x="80" y="18" fill={C.green} fontSize="10" textAnchor="middle" fontWeight="bold">BULLISH ENGULFING</text>
        <rect x="62" y="55" width="22" height="45" fill={C.red} rx="2"/>
        <line x1="73" y1="42" x2="73" y2="55" stroke={C.red} strokeWidth="1.5"/>
        <line x1="73" y1="100" x2="73" y2="112" stroke={C.red} strokeWidth="1.5"/>
        <rect x="88" y="35" width="30" height="80" fill={C.green} rx="2"/>
        <line x1="103" y1="25" x2="103" y2="35" stroke={C.green} strokeWidth="1.5"/>
        <line x1="103" y1="115" x2="103" y2="125" stroke={C.green} strokeWidth="1.5"/>
        <text x="80" y="145" fill={C.green} fontSize="8" textAnchor="middle">Big green swallows red</text>
        <text x="80" y="156" fill={C.green} fontSize="8" textAnchor="middle">= buyers took control</text>
        <text x="200" y="18" fill={C.red} fontSize="10" textAnchor="middle" fontWeight="bold">BEARISH ENGULFING</text>
        <rect x="182" y="55" width="22" height="45" fill={C.green} rx="2"/>
        <line x1="193" y1="42" x2="193" y2="55" stroke={C.green} strokeWidth="1.5"/>
        <line x1="193" y1="100" x2="193" y2="112" stroke={C.green} strokeWidth="1.5"/>
        <rect x="208" y="35" width="30" height="80" fill={C.red} rx="2"/>
        <line x1="223" y1="25" x2="223" y2="35" stroke={C.red} strokeWidth="1.5"/>
        <line x1="223" y1="115" x2="223" y2="125" stroke={C.red} strokeWidth="1.5"/>
        <text x="200" y="145" fill={C.red} fontSize="8" textAnchor="middle">Big red swallows green</text>
        <text x="200" y="156" fill={C.red} fontSize="8" textAnchor="middle">= sellers took control</text>
        <rect x="10" y="160" width="300" height="8" fill={C.bord} rx="3"/>
      </svg>
    </Wrap>
  );
}

// ── THREE SOLDIERS / CROWS ────────────────────────────────────────────────────
export function ThreeSoldiersVisual() {
  return (
    <Wrap title="THREE WHITE SOLDIERS & THREE BLACK CROWS">
      <svg viewBox="0 0 320 180" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="180" fill={C.bg} rx="8"/>
        <text x="75" y="18" fill={C.green} fontSize="10" textAnchor="middle" fontWeight="bold">THREE WHITE SOLDIERS</text>
        <rect x="22" y="110" width="22" height="50" fill={C.green} rx="2"/>
        <line x1="33" y1="105" x2="33" y2="110" stroke={C.green} strokeWidth="1.5"/>
        <line x1="33" y1="160" x2="33" y2="165" stroke={C.green} strokeWidth="1.5"/>
        <rect x="52" y="85" width="22" height="55" fill={C.green} rx="2"/>
        <line x1="63" y1="79" x2="63" y2="85" stroke={C.green} strokeWidth="1.5"/>
        <line x1="63" y1="140" x2="63" y2="145" stroke={C.green} strokeWidth="1.5"/>
        <rect x="82" y="58" width="22" height="57" fill={C.green} rx="2"/>
        <line x1="93" y1="52" x2="93" y2="58" stroke={C.green} strokeWidth="1.5"/>
        <line x1="93" y1="115" x2="93" y2="120" stroke={C.green} strokeWidth="1.5"/>
        <text x="75" y="172" fill={C.green} fontSize="8" textAnchor="middle">Strong bullish momentum</text>
        <text x="235" y="18" fill={C.red} fontSize="10" textAnchor="middle" fontWeight="bold">THREE BLACK CROWS</text>
        <rect x="182" y="30" width="22" height="50" fill={C.red} rx="2"/>
        <line x1="193" y1="25" x2="193" y2="30" stroke={C.red} strokeWidth="1.5"/>
        <line x1="193" y1="80" x2="193" y2="85" stroke={C.red} strokeWidth="1.5"/>
        <rect x="212" y="55" width="22" height="55" fill={C.red} rx="2"/>
        <line x1="223" y1="50" x2="223" y2="55" stroke={C.red} strokeWidth="1.5"/>
        <line x1="223" y1="110" x2="223" y2="115" stroke={C.red} strokeWidth="1.5"/>
        <rect x="242" y="82" width="22" height="57" fill={C.red} rx="2"/>
        <line x1="253" y1="77" x2="253" y2="82" stroke={C.red} strokeWidth="1.5"/>
        <line x1="253" y1="139" x2="253" y2="144" stroke={C.red} strokeWidth="1.5"/>
        <text x="235" y="172" fill={C.red} fontSize="8" textAnchor="middle">Strong bearish momentum</text>
        <line x1="155" y1="15" x2="155" y2="170" stroke={C.bord} strokeWidth="1"/>
      </svg>
    </Wrap>
  );
}

// ── BREAK OF STRUCTURE ────────────────────────────────────────────────────────
export function BOSVisual() {
  return (
    <Wrap title="BREAK OF STRUCTURE (BOS)">
      <svg viewBox="0 0 320 195" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="195" fill={C.bg} rx="8"/>
        <text x="60" y="16" fill={C.red} fontSize="9" textAnchor="middle">DOWNTREND</text>
        <polyline points="15,30 35,45 55,34 75,52 95,42 115,62"
          fill="none" stroke={C.red} strokeWidth="2.5"/>
        <circle cx="35" cy="45" r="4" fill={C.red}/>
        <circle cx="75" cy="52" r="4" fill={C.red}/>
        <text x="35" y="41" fill={C.red} fontSize="7" textAnchor="middle">LH</text>
        <text x="75" y="48" fill={C.red} fontSize="7" textAnchor="middle">LH</text>
        <circle cx="55" cy="34" r="3" fill={C.red} opacity="0.5"/>
        <circle cx="95" cy="42" r="3" fill={C.red} opacity="0.5"/>
        <text x="55" y="30" fill={C.red} fontSize="7" textAnchor="middle" opacity="0.7">LL</text>
        <text x="95" y="38" fill={C.red} fontSize="7" textAnchor="middle" opacity="0.7">LL</text>
        <polyline points="115,62 135,78 155,56 175,70"
          fill="none" stroke={C.dim} strokeWidth="1.5" strokeDasharray="4,2"/>
        <line x1="155" y1="56" x2="155" y2="28" stroke={C.gold} strokeWidth="1.5" strokeDasharray="3,2"/>
        <text x="163" y="43" fill={C.gold} fontSize="9" fontWeight="bold">BOS</text>
        <text x="163" y="54" fill={C.gold} fontSize="7">Breaks prev</text>
        <text x="163" y="63" fill={C.gold} fontSize="7">swing high ↑</text>
        <text x="255" y="16" fill={C.green} fontSize="9" textAnchor="middle">UPTREND BEGINS</text>
        <polyline points="175,70 195,55 215,65 235,45 255,55 275,35 300,40"
          fill="none" stroke={C.green} strokeWidth="2.5"/>
        <circle cx="235" cy="45" r="4" fill={C.green} opacity="0.6"/>
        <circle cx="275" cy="35" r="4" fill={C.green}/>
        <text x="235" y="41" fill={C.green} fontSize="7" textAnchor="middle">HH</text>
        <text x="275" y="31" fill={C.green} fontSize="7" textAnchor="middle">HH</text>
        <circle cx="215" cy="65" r="3" fill={C.blue} opacity="0.6"/>
        <circle cx="255" cy="55" r="3" fill={C.blue} opacity="0.6"/>
        <text x="215" y="76" fill={C.blue} fontSize="7" textAnchor="middle">HL</text>
        <text x="255" y="66" fill={C.blue} fontSize="7" textAnchor="middle">HL</text>
        <rect x="10" y="88" width="300" height="100" fill={C.surf2} rx="8"/>
        <text x="160" y="108" fill={C.txt} fontSize="10" textAnchor="middle" fontWeight="bold">How to trade BOS:</text>
        <text x="25" y="126" fill={C.green} fontSize="9">1. BOS confirms the new uptrend direction</text>
        <text x="25" y="144" fill={C.gold} fontSize="9">2. Wait for price to pull back</text>
        <text x="25" y="162" fill={C.blue} fontSize="9">3. Enter long at the pullback (order block or S/R)</text>
        <text x="25" y="180" fill={C.purp} fontSize="9">4. Target the next swing high</text>
      </svg>
    </Wrap>
  );
}

// ── ORDER BLOCK ───────────────────────────────────────────────────────────────
export function OrderBlockVisual() {
  return (
    <Wrap title="ORDER BLOCK — WHERE INSTITUTIONS BUY/SELL">
      <svg viewBox="0 0 320 190" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="190" fill={C.bg} rx="8"/>
        <text x="160" y="16" fill={C.txt} fontSize="10" textAnchor="middle" fontWeight="bold">BULLISH ORDER BLOCK</text>
        {[
          {x:20, open:92, close:80, h:62, l:100},
          {x:40, open:88, close:76, h:58, l:96},
          {x:60, open:84, close:72, h:54, l:92},
        ].map((c,i) => (
          <g key={i}>
            <line x1={c.x+6} y1={c.h} x2={c.x+6} y2={c.open} stroke={C.red} strokeWidth="1.5"/>
            <rect x={c.x} y={c.close} width="12" height={c.open-c.close} fill={C.red} rx="1"/>
            <line x1={c.x+6} y1={c.open} x2={c.x+6} y2={c.l} stroke={C.red} strokeWidth="1.5"/>
          </g>
        ))}
        <rect x="80" y="62" width="18" height="22" fill={C.red} rx="1"/>
        <line x1="89" y1="52" x2="89" y2="62" stroke={C.red} strokeWidth="2"/>
        <line x1="89" y1="84" x2="89" y2="95" stroke={C.red} strokeWidth="2"/>
        <rect x="78" y="50" width="22" height="47" fill="none" stroke={C.gold} strokeWidth="2" strokeDasharray="4,2" rx="3"/>
        <text x="89" y="108" fill={C.gold} fontSize="7" textAnchor="middle" fontWeight="bold">ORDER BLOCK</text>
        <text x="89" y="118" fill={C.gold} fontSize="7" textAnchor="middle">last red candle</text>
        <polyline points="98,76 115,62 132,48 150,34 168,22"
          fill="none" stroke={C.green} strokeWidth="3"/>
        <text x="172" y="24" fill={C.green} fontSize="9" fontWeight="bold">↑ BIG MOVE</text>
        <polyline points="168,22 188,32 208,44 228,58 244,70"
          fill="none" stroke={C.dim} strokeWidth="1.5" strokeDasharray="4,2"/>
        <text x="255" y="72" fill={C.gold} fontSize="8">Returns</text>
        <text x="255" y="82" fill={C.gold} fontSize="8">to OB</text>
        <line x1="244" y1="72" x2="244" y2="128" stroke={C.green} strokeWidth="1.5" strokeDasharray="3"/>
        <text x="244" y="142" fill={C.green} fontSize="9" textAnchor="middle" fontWeight="bold">BUY ZONE</text>
        <polyline points="244,70 260,55 276,40 295,28"
          fill="none" stroke={C.green} strokeWidth="2.5"/>
        <rect x="10" y="155" width="300" height="30" fill={C.surf2} rx="6"/>
        <text x="160" y="168" fill={C.txt} fontSize="8" textAnchor="middle">Institutions couldn't fill all orders in one move</text>
        <text x="160" y="181" fill={C.muted} fontSize="7" textAnchor="middle">Price returns to the OB to fill remaining orders — that's your entry</text>
      </svg>
    </Wrap>
  );
}

// ── POSITION SIZING ───────────────────────────────────────────────────────────
export function PositionSizingVisual() {
  return (
    <Wrap title="POSITION SIZING — THE 1-2% RULE">
      <svg viewBox="0 0 320 185" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="185" fill={C.bg} rx="8"/>
        <text x="160" y="20" fill={C.txt} fontSize="11" textAnchor="middle" fontWeight="bold">Max Risk Per Trade</text>
        {[
          { account: "$10,000", risk1: "$100", risk2: "$200", y: 35 },
          { account: "$25,000", risk1: "$250", risk2: "$500", y: 72 },
          { account: "$50,000", risk1: "$500", risk2: "$1,000", y: 109 },
        ].map((row, i) => (
          <g key={i}>
            <rect x="10" y={row.y} width="300" height="30" fill={i%2===0?C.surf2:C.bg} rx="4"/>
            <text x="80" y={row.y+20} fill={C.txt} fontSize="12" textAnchor="middle" fontWeight="bold">{row.account}</text>
            <text x="210" y={row.y+14} fill={C.green} fontSize="10" textAnchor="middle">1% = {row.risk1}</text>
            <text x="210" y={row.y+26} fill={C.gold} fontSize="10" textAnchor="middle">2% = {row.risk2}</text>
            <line x1="150" y1={row.y+4} x2="150" y2={row.y+26} stroke={C.bord} strokeWidth="0.5"/>
          </g>
        ))}
        <text x="80" y="33" fill={C.muted} fontSize="8" textAnchor="middle">Account</text>
        <text x="210" y="33" fill={C.muted} fontSize="8" textAnchor="middle">Max Risk</text>
        <rect x="10" y="148" width="300" height="32" fill={C.green+"15"} rx="6" stroke={C.green+"40"} strokeWidth="1"/>
        <text x="160" y="163" fill={C.green} fontSize="9" textAnchor="middle" fontWeight="bold">Even 10 losses in a row = only 10-20% drawdown</text>
        <text x="160" y="176" fill={C.dim} fontSize="8" textAnchor="middle">You stay in the game long enough to recover</text>
      </svg>
    </Wrap>
  );
}

// ── RISK / REWARD ─────────────────────────────────────────────────────────────
export function RiskRewardVisual() {
  return (
    <Wrap title="RISK / REWARD RATIO — MINIMUM 1:2">
      <svg viewBox="0 0 320 185" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="185" fill={C.bg} rx="8"/>
        <line x1="55" y1="105" x2="305" y2="105" stroke={C.blue} strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="8" y="109" fill={C.blue} fontSize="8" fontWeight="bold">ENTRY</text>
        <line x1="55" y1="138" x2="305" y2="138" stroke={C.red} strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="8" y="142" fill={C.red} fontSize="8" fontWeight="bold">STOP</text>
        <line x1="55" y1="38" x2="305" y2="38" stroke={C.green} strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="5" y="34" fill={C.green} fontSize="7" fontWeight="bold">TARGET</text>
        <text x="5" y="44" fill={C.green} fontSize="7">(1:2 R)</text>
        <line x1="68" y1="105" x2="68" y2="138" stroke={C.red} strokeWidth="2.5"/>
        <line x1="63" y1="105" x2="73" y2="105" stroke={C.red} strokeWidth="2"/>
        <line x1="63" y1="138" x2="73" y2="138" stroke={C.red} strokeWidth="2"/>
        <text x="80" y="119" fill={C.red} fontSize="9" fontWeight="bold">RISK $100</text>
        <line x1="68" y1="38" x2="68" y2="105" stroke={C.green} strokeWidth="2.5"/>
        <line x1="63" y1="38" x2="73" y2="38" stroke={C.green} strokeWidth="2"/>
        <line x1="63" y1="105" x2="73" y2="105" stroke={C.green} strokeWidth="2"/>
        <text x="80" y="70" fill={C.green} fontSize="9" fontWeight="bold">REWARD $200</text>
        <polyline points="145,105 165,98 185,88 205,74 225,60 245,48 268,42"
          fill="none" stroke={C.green} strokeWidth="2.5"/>
        <rect x="148" y="148" width="160" height="33" fill={C.surf2} rx="6"/>
        <text x="228" y="162" fill={C.txt} fontSize="8" textAnchor="middle" fontWeight="bold">R/R Examples</text>
        <text x="180" y="175" fill={C.red} fontSize="7">1:1 breakeven</text>
        <text x="255" y="175" fill={C.green} fontSize="7">1:3 elite level</text>
        <text x="160" y="180" fill={C.gold} fontSize="7" textAnchor="middle">⚠️ Never take a trade below 1:2</text>
      </svg>
    </Wrap>
  );
}

// ── PSYCHOLOGY ────────────────────────────────────────────────────────────────
export function PsychologyVisual() {
  return (
    <Wrap title="THE EMOTIONAL TRADING CYCLE — AVOID THIS">
      <svg viewBox="0 0 320 200" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="200" fill={C.bg} rx="8"/>
        <polyline points="15,170 50,140 90,100 130,65 165,45 200,60 240,95 278,135 305,162"
          fill="none" stroke={C.dim} strokeWidth="2.5"/>
        <text x="20" y="165" fill={C.muted} fontSize="9">Caution</text>
        <text x="45" y="132" fill={C.gold} fontSize="9">Hope</text>
        <text x="82" y="92" fill={C.gold} fontSize="10">Optimism</text>
        <text x="118" y="57" fill={C.green} fontSize="10">Excitement</text>
        <text x="148" y="33" fill={C.green} fontSize="11" fontWeight="bold">THRILL</text>
        <text x="196" y="52" fill={C.gold} fontSize="10">Anxiety</text>
        <text x="232" y="87" fill={C.red} fontSize="10">Denial</text>
        <text x="268" y="128" fill={C.red} fontSize="10">Fear</text>
        <text x="290" y="158" fill={C.red} fontSize="11" fontWeight="bold">PANIC</text>
        <rect x="10" y="178" width="300" height="18" fill={C.purp+"20"} rx="5"/>
        <text x="160" y="191" fill={C.purp} fontSize="9" textAnchor="middle">Professionals feel none of this — they just execute their plan</text>
      </svg>
    </Wrap>
  );
}

// ── NEWS IMPACT ───────────────────────────────────────────────────────────────
export function NewsImpactVisual() {
  return (
    <Wrap title="HOW HIGH IMPACT NEWS MOVES MARKETS">
      <svg viewBox="0 0 320 200" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="200" fill={C.bg} rx="8"/>
        <text x="55" y="15" fill={C.muted} fontSize="10" textAnchor="middle">Before News</text>
        <rect x="10" y="20" width="98" height="140" fill={C.surf2} rx="4" opacity="0.4"/>
        <polyline points="15,95 28,93 41,97 54,92 67,96 80,94 100,93" fill="none" stroke={C.dim} strokeWidth="2"/>
        <text x="55" y="170" fill={C.muted} fontSize="9" textAnchor="middle">Low volatility</text>
        <line x1="110" y1="10" x2="110" y2="185" stroke={C.gold} strokeWidth="2.5"/>
        <text x="110" y="8" fill={C.gold} fontSize="11" textAnchor="middle">NEWS</text>
        <text x="215" y="15" fill={C.txt} fontSize="10" textAnchor="middle">After News</text>
        <polyline points="112,93 128,76 145,58 162,40 180,26 198,18" fill="none" stroke={C.green} strokeWidth="2.5"/>
        <text x="204" y="20" fill={C.green} fontSize="10" fontWeight="bold">Good News UP</text>
        <polyline points="112,93 128,108 145,122 162,138 180,150 198,160" fill="none" stroke={C.red} strokeWidth="2.5"/>
        <text x="204" y="165" fill={C.red} fontSize="10" fontWeight="bold">Bad News DOWN</text>
        <rect x="10" y="178" width="300" height="18" fill={C.gold+"20"} rx="5"/>
        <text x="160" y="191" fill={C.gold} fontSize="9" textAnchor="middle">Stay out 30 min BEFORE and AFTER high impact news</text>
      </svg>
    </Wrap>
  );
}

// ── LEVERAGE ──────────────────────────────────────────────────────────────────
export function LeverageVisual() {
  return (
    <Wrap title="HOW LEVERAGE WORKS IN FUTURES">
      <svg viewBox="0 0 320 190" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="190" fill={C.bg} rx="8"/>
        <text x="160" y="22" fill={C.txt} fontSize="12" textAnchor="middle">You deposit $12,500 margin</text>
        <text x="160" y="38" fill={C.muted} fontSize="11" textAnchor="middle">but you control this much value:</text>
        <rect x="20" y="46" width="280" height="34" fill={C.blue+"20"} rx="6" stroke={C.blue+"50"} strokeWidth="1.5"/>
        <text x="160" y="68" fill={C.blue} fontSize="14" textAnchor="middle" fontWeight="bold">$250,000+ in ES futures</text>
        <text x="160" y="95" fill={C.muted} fontSize="14" textAnchor="middle">20:1 LEVERAGE</text>
        <rect x="10" y="108" width="145" height="55" fill={C.green+"15"} rx="8" stroke={C.green+"40"} strokeWidth="1"/>
        <text x="82" y="128" fill={C.green} fontSize="10" textAnchor="middle" fontWeight="bold">1% Move UP</text>
        <text x="82" y="148" fill={C.green} fontSize="14" textAnchor="middle" fontWeight="bold">+$2,500</text>
        <rect x="165" y="108" width="145" height="55" fill={C.red+"15"} rx="8" stroke={C.red+"40"} strokeWidth="1"/>
        <text x="237" y="128" fill={C.red} fontSize="10" textAnchor="middle" fontWeight="bold">1% Move DOWN</text>
        <text x="237" y="148" fill={C.red} fontSize="14" textAnchor="middle" fontWeight="bold">-$2,500</text>
        <rect x="10" y="170" width="300" height="17" fill={C.gold+"20"} rx="5"/>
        <text x="160" y="182" fill={C.gold} fontSize="9" textAnchor="middle">Leverage amplifies BOTH gains and losses equally</text>
      </svg>
    </Wrap>
  );
}

// ── TICK VALUES ───────────────────────────────────────────────────────────────
export function TickValueVisual() {
  return (
    <Wrap title="ES vs NQ — TICK VALUES">
      <svg viewBox="0 0 320 190" style={{ width:"100%", height:"auto" }}>
        <rect width="320" height="190" fill={C.bg} rx="8"/>
        <rect x="10" y="10" width="145" height="155" fill={C.green+"10"} rx="10" stroke={C.green+"40"} strokeWidth="1.5"/>
        <text x="82" y="32" fill={C.green} fontSize="14" textAnchor="middle" fontWeight="bold">ES1!</text>
        <text x="82" y="46" fill={C.muted} fontSize="9" textAnchor="middle">S&P 500 Futures</text>
        <line x1="22" y1="54" x2="143" y2="54" stroke={C.bord} strokeWidth="1"/>
        <text x="82" y="72" fill={C.txt} fontSize="10" textAnchor="middle">1 tick = $12.50</text>
        <text x="82" y="90" fill={C.txt} fontSize="10" textAnchor="middle">1 point = $50.00</text>
        <text x="82" y="108" fill={C.txt} fontSize="10" textAnchor="middle">10 points = $500</text>
        <text x="82" y="126" fill={C.txt} fontSize="10" textAnchor="middle">Margin about $12,000</text>
        <rect x="22" y="138" width="110" height="18" fill={C.green+"25"} rx="4"/>
        <text x="77" y="151" fill={C.green} fontSize="10" textAnchor="middle" fontWeight="bold">More Stable</text>
        <rect x="165" y="10" width="145" height="155" fill={C.blue+"10"} rx="10" stroke={C.blue+"40"} strokeWidth="1.5"/>
        <text x="237" y="32" fill={C.blue} fontSize="14" textAnchor="middle" fontWeight="bold">NQ1!</text>
        <text x="237" y="46" fill={C.muted} fontSize="9" textAnchor="middle">NASDAQ Futures</text>
        <line x1="177" y1="54" x2="298" y2="54" stroke={C.bord} strokeWidth="1"/>
        <text x="237" y="72" fill={C.txt} fontSize="10" textAnchor="middle">1 tick = $5.00</text>
        <text x="237" y="90" fill={C.txt} fontSize="10" textAnchor="middle">1 point = $20.00</text>
        <text x="237" y="108" fill={C.txt} fontSize="10" textAnchor="middle">10 points = $200</text>
        <text x="237" y="126" fill={C.txt} fontSize="10" textAnchor="middle">Margin about $15,000</text>
        <rect x="177" y="138" width="110" height="18" fill={C.red+"20"} rx="4"/>
        <text x="232" y="151" fill={C.red} fontSize="10" textAnchor="middle" fontWeight="bold">Moves Faster</text>
        <rect x="10" y="170" width="300" height="17" fill={C.gold+"15"} rx="4"/>
        <text x="160" y="182" fill={C.gold} fontSize="9" textAnchor="middle">Start with MES or MNQ — 1/10th the size, same learning</text>
      </svg>
    </Wrap>
  );
}

// ── LESSON VISUAL MAP ─────────────────────────────────────────────────────────
export const LESSON_VISUALS = {
  "s1l1": <><BullishCandleVisual/><BearishCandleVisual/></>,
  "s2l2": <TickValueVisual/>,
  "s2l3": <LeverageVisual/>,
  "s4l1": <SupportResistanceVisual/>,
  "s4l2": <UptrendVisual/>,
  "s4l3": <MovingAverageVisual/>,
  "s5l1": <><BullishCandleVisual/><BearishCandleVisual/></>,
  "s5l2": <><HammerVisual/><ShootingStarVisual/><DojiVisual/><EngulfingVisual/></>,
  "s5l3": <ThreeSoldiersVisual/>,
  "s6l2": <BOSVisual/>,
  "s6l3": <OrderBlockVisual/>,
  "s7l1": <NewsImpactVisual/>,
  "s7l2": <NewsImpactVisual/>,
  "s8l2": <PositionSizingVisual/>,
  "s8l3": <RiskRewardVisual/>,
  "s8l4": <RiskRewardVisual/>,
  "s9l1": <PsychologyVisual/>,
  "s11l2": <BOSVisual/>,
  "s11l3": <SupportResistanceVisual/>,
  "s12l2": <><HammerVisual/><ShootingStarVisual/></>,
  "s13l2": <RiskRewardVisual/>,
  "s15l1": <BOSVisual/>,
  "s15l3": <SupportResistanceVisual/>,
  "s15l4": <OrderBlockVisual/>,
};
