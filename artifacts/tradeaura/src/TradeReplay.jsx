import React, { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg:"#0f1117", surf:"#161b27", surf2:"#1c2333", bord:"#232d40",
  blue:"#4f8ef7", green:"#34d399", red:"#f87171", gold:"#fbbf24", purp:"#a78bfa",
  txt:"#e2e8f0", muted:"#64748b", dim:"#94a3b8"
};

const MARKETS = [
  { id:"ES=F", name:"ES1! — S&P 500", category:"Futures", color:C.blue },
  { id:"NQ=F", name:"NQ1! — NASDAQ", category:"Futures", color:C.purp },
  { id:"GC=F", name:"Gold Futures", category:"Futures", color:C.gold },
  { id:"CL=F", name:"Crude Oil", category:"Futures", color:"#fb923c" },
  { id:"EURUSD=X", name:"EUR/USD", category:"Forex", color:C.green },
  { id:"GBPUSD=X", name:"GBP/USD", category:"Forex", color:C.green },
  { id:"XAUUSD=X", name:"XAU/USD — Gold", category:"Forex", color:C.gold },
  { id:"AAPL", name:"Apple Inc.", category:"Stocks", color:C.blue },
  { id:"TSLA", name:"Tesla", category:"Stocks", color:C.red },
  { id:"SPY", name:"SPY — S&P ETF", category:"Stocks", color:C.blue },
  { id:"QQQ", name:"QQQ — NASDAQ ETF", category:"Stocks", color:C.purp },
  { id:"BTC-USD", name:"Bitcoin", category:"Crypto", color:C.gold },
  { id:"ETH-USD", name:"Ethereum", category:"Crypto", color:C.purp },
];

const SCENARIOS = [
  { id:"trend", name:"Trending Day", desc:"Strong directional move — practice riding trends", icon:"📈" },
  { id:"range", name:"Ranging Day", desc:"Price bouncing between levels — practice S/R trading", icon:"↔️" },
  { id:"volatile", name:"High Volatility", desc:"Big moves and reversals — advanced challenge", icon:"⚡" },
  { id:"random", name:"Random Day", desc:"Unknown scenario — test your adaptability", icon:"🎲" },
];

const SPEEDS = [
  { id:1, label:"Slow", ms:1500 },
  { id:2, label:"Normal", ms:800 },
  { id:3, label:"Fast", ms:400 },
  { id:4, label:"Ultra", ms:150 },
];

async function fetchHistoricalData(symbol, interval="1h") {
  try {
    const proxyUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=3mo&includePrePost=false`;
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(proxyUrl)}`);
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) throw new Error("No data");
    const timestamps = result.timestamp;
    const ohlcv = result.indicators.quote[0];
    const candles = timestamps.map((t, i) => ({
      time: t * 1000,
      open: parseFloat(ohlcv.open[i]?.toFixed(2)) || 0,
      high: parseFloat(ohlcv.high[i]?.toFixed(2)) || 0,
      low: parseFloat(ohlcv.low[i]?.toFixed(2)) || 0,
      close: parseFloat(ohlcv.close[i]?.toFixed(2)) || 0,
      volume: ohlcv.volume[i] || 0,
    })).filter(c => c.open > 0 && c.high > 0 && c.low > 0 && c.close > 0);
    return candles;
  } catch(e) {
    console.error("Failed to fetch:", e);
    return generateMockData(symbol);
  }
}

function generateMockData(symbol) {
  const candles = [];
  let price = symbol.includes("BTC") ? 45000 : symbol.includes("ES") ? 5200 : symbol.includes("EUR") ? 1.08 : 180;
  const now = Date.now();
  for (let i = 100; i >= 0; i--) {
    const change = (Math.random() - 0.48) * price * 0.008;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * price * 0.003;
    const low = Math.min(open, close) - Math.random() * price * 0.003;
    candles.push({ time: now - i * 3600000, open: parseFloat(open.toFixed(2)), high: parseFloat(high.toFixed(2)), low: parseFloat(low.toFixed(2)), close: parseFloat(close.toFixed(2)), volume: Math.floor(Math.random() * 100000) });
    price = close;
  }
  return candles;
}

function pickScenarioStart(candles, scenario) {
  if (candles.length < 60) return 0;
  const maxStart = candles.length - 50;
  if (scenario === "random") return Math.floor(Math.random() * maxStart);
  const segments = [];
  for (let i = 20; i < maxStart; i += 10) {
    const seg = candles.slice(i, i + 30);
    const high = Math.max(...seg.map(c => c.high));
    const low = Math.min(...seg.map(c => c.low));
    const range = (high - low) / low * 100;
    const direction = (seg[seg.length-1].close - seg[0].open) / seg[0].open * 100;
    segments.push({ start: i, range, direction: Math.abs(direction) });
  }
  if (scenario === "trend") {
    segments.sort((a,b) => b.direction - a.direction);
  } else if (scenario === "range") {
    segments.sort((a,b) => a.direction - b.direction);
  } else if (scenario === "volatile") {
    segments.sort((a,b) => b.range - a.range);
  }
  return segments[0]?.start || 0;
}

function CandleChart({ candles, currentIndex, position, entryPrice }) {
  const svgRef = useRef(null);
  const visible = candles.slice(Math.max(0, currentIndex - 39), currentIndex + 1);
  if (!visible.length) return null;

  const highs = visible.map(c => c.high);
  const lows = visible.map(c => c.low);
  const maxP = Math.max(...highs);
  const minP = Math.min(...lows);
  const range = maxP - minP || 1;
  const pad = { top: 20, bottom: 30, left: 8, right: 55 };
  const W = 340, H = 200;
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const candleW = Math.max(4, chartW / visible.length - 2);

  const toY = price => pad.top + chartH - ((price - minP) / range) * chartH;
  const toX = i => pad.left + (i + 0.5) * (chartW / visible.length);

  const priceLabels = [];
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const price = minP + (range / steps) * i;
    priceLabels.push({ price, y: toY(price) });
  }

  return (
    <div style={{ background: C.bg, borderRadius: 10, padding: 8, border: `1px solid ${C.bord}`, marginBottom: 12 }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        {priceLabels.map((pl, i) => (
          <g key={i}>
            <line x1={pad.left} y1={pl.y} x2={W - pad.right} y2={pl.y} stroke={C.bord} strokeWidth="0.5"/>
            <text x={W - pad.right + 4} y={pl.y + 3} fill={C.muted} fontSize="7" textAnchor="start">
              {pl.price.toFixed(pl.price > 100 ? 0 : 4)}
            </text>
          </g>
        ))}
        {entryPrice && position && (
          <line x1={pad.left} y1={toY(entryPrice)} x2={W - pad.right} y2={toY(entryPrice)}
            stroke={position === "long" ? C.green : C.red} strokeWidth="1.5" strokeDasharray="4,3"/>
        )}
        {visible.map((c, i) => {
          const x = toX(i);
          const isGreen = c.close >= c.open;
          const color = isGreen ? C.green : C.red;
          const bodyTop = toY(Math.max(c.open, c.close));
          const bodyBot = toY(Math.min(c.open, c.close));
          const bodyH = Math.max(1, bodyBot - bodyTop);
          const isLast = i === visible.length - 1;
          return (
            <g key={i}>
              <line x1={x} y1={toY(c.high)} x2={x} y2={toY(c.low)} stroke={color} strokeWidth="1"/>
              <rect x={x - candleW/2} y={bodyTop} width={candleW} height={bodyH}
                fill={color} opacity={isLast ? 1 : 0.85} rx="0.5"
                stroke={isLast ? "#fff" : "none"} strokeWidth={isLast ? "0.5" : "0"}/>
            </g>
          );
        })}
        {visible.length > 0 && (
          <g>
            <rect x={W - pad.right + 2} y={toY(visible[visible.length-1].close) - 7} width={50} height={12}
              fill={visible[visible.length-1].close >= visible[visible.length-1].open ? C.green : C.red} rx="2"/>
            <text x={W - pad.right + 5} y={toY(visible[visible.length-1].close) + 3} fill="#000" fontSize="7" fontWeight="bold">
              {visible[visible.length-1].close.toFixed(visible[visible.length-1].close > 100 ? 1 : 4)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function TradeReplay({ userPlan = "free" }) {
  const [screen, setScreen] = useState("select");
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedSpeed, setSelectedSpeed] = useState(2);
  const [allCandles, setAllCandles] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(null);
  const [entryPrice, setEntryPrice] = useState(null);
  const [entryIndex, setEntryIndex] = useState(null);
  const [trades, setTrades] = useState([]);
  const [pnl, setPnl] = useState(0);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionPnl, setSessionPnl] = useState(0);
  const intervalRef = useRef(null);

  const speed = SPEEDS.find(s => s.id === selectedSpeed);
  const currentCandle = allCandles[currentIndex];
  const isComplete = currentIndex >= endIndex;

  if (userPlan !== "elite") {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Elite Feature</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24, lineHeight: 1.7 }}>
          Trade Replay is available on the Elite plan. Practice on real historical market data without risking a dollar.
        </div>
        <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.gold, marginBottom: 8, fontWeight: 700 }}>ELITE — $50/month</div>
          {["Trade Replay Simulator","AI Trading Tutor","Weekly AI Coaching","Smart Money Courses","Psychology Module"].map((f,i) => (
            <div key={i} style={{ fontSize: 12, color: C.dim, padding: "5px 0", borderBottom: `1px solid ${C.bord}`, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color: C.green }}>✓</span>{f}
            </div>
          ))}
        </div>
        <button style={{ width:"100%", padding:14, background:C.gold, color:"#000", border:"none", borderRadius:10, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700 }}>
          Upgrade to Elite
        </button>
      </div>
    );
  }

  async function startSession() {
    if (!selectedMarket || !selectedScenario) return;
    setLoading(true);
    setScreen("loading");
    const candles = await fetchHistoricalData(selectedMarket.id);
    const start = pickScenarioStart(candles, selectedScenario);
    const end = Math.min(start + 60, candles.length - 1);
    setAllCandles(candles);
    setStartIndex(start);
    setCurrentIndex(start + 20);
    setEndIndex(end);
    setPosition(null);
    setEntryPrice(null);
    setEntryIndex(null);
    setTrades([]);
    setPnl(0);
    setSessionPnl(0);
    setDecisions([]);
    setLoading(false);
    setScreen("replay");
    setIsPlaying(true);
  }

  useEffect(() => {
    if (!isPlaying || isComplete) {
      clearInterval(intervalRef.current);
      if (isComplete) {
        if (position && entryPrice) exitPosition();
        setTimeout(() => setScreen("result"), 500);
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= endIndex) {
          clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, speed.ms);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed.ms, endIndex, isComplete]);

  function enterLong() {
    if (position) return;
    const price = currentCandle?.close;
    setPosition("long");
    setEntryPrice(price);
    setEntryIndex(currentIndex);
    setDecisions(prev => [...prev, { index: currentIndex, action: "BUY", price, candle: currentCandle }]);
  }

  function enterShort() {
    if (position) return;
    const price = currentCandle?.close;
    setPosition("short");
    setEntryPrice(price);
    setEntryIndex(currentIndex);
    setDecisions(prev => [...prev, { index: currentIndex, action: "SELL", price, candle: currentCandle }]);
  }

  function exitPosition() {
    if (!position || !entryPrice || !currentCandle) return;
    const exitPrice = currentCandle.close;
    const tradePnl = position === "long" ? exitPrice - entryPrice : entryPrice - exitPrice;
    const pnlDollars = parseFloat((tradePnl * (selectedMarket?.id.includes("=F") ? 50 : 100)).toFixed(2));
    setTrades(prev => [...prev, { entry: entryPrice, exit: exitPrice, direction: position, pnl: pnlDollars, entryIndex, exitIndex: currentIndex }]);
    setSessionPnl(prev => prev + pnlDollars);
    setPnl(prev => prev + pnlDollars);
    setPosition(null);
    setEntryPrice(null);
    setEntryIndex(null);
    setDecisions(prev => [...prev, { index: currentIndex, action: "EXIT", price: exitPrice, pnl: pnlDollars }]);
  }

  function wait() {
    setDecisions(prev => [...prev, { index: currentIndex, action: "WAIT", price: currentCandle?.close }]);
  }

  function resetSession() {
    setScreen("select");
    setAllCandles([]);
    setPosition(null);
    setEntryPrice(null);
    setTrades([]);
    setPnl(0);
    setSessionPnl(0);
    setDecisions([]);
    setIsPlaying(false);
  }

  const candles = allCandles.slice(startIndex, currentIndex + 1);
  const progress = endIndex > startIndex ? ((currentIndex - startIndex) / (endIndex - startIndex)) * 100 : 0;

  if (screen === "select") {
    const categories = [...new Set(MARKETS.map(m => m.category))];
    return (
      <div style={{ padding: "16px 16px 20px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: C.red, letterSpacing: "0.2em", marginBottom: 6 }}>ELITE FEATURE</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Trade Replay</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>Practice on real historical market data. Make buy, sell, and wait decisions candle by candle.</div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>SELECT MARKET</div>
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: C.dim, letterSpacing: "0.1em", marginBottom: 6 }}>{cat}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {MARKETS.filter(m => m.category === cat).map(m => (
                  <button key={m.id} onClick={() => setSelectedMarket(m)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${selectedMarket?.id === m.id ? m.color : C.bord}`, background: selectedMarket?.id === m.id ? m.color + "20" : "transparent", color: selectedMarket?.id === m.id ? m.color : C.dim, fontFamily: "inherit", fontSize: 11, cursor: "pointer", fontWeight: selectedMarket?.id === m.id ? 700 : 400 }}>
                    {m.name.split(" — ")[0]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>SELECT SCENARIO</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {SCENARIOS.map(s => (
              <button key={s.id} onClick={() => setSelectedScenario(s.id)}
                style={{ padding: 12, borderRadius: 10, border: `1px solid ${selectedScenario === s.id ? C.blue : C.bord}`, background: selectedScenario === s.id ? C.blue + "18" : C.surf, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: selectedScenario === s.id ? C.blue : C.txt, marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.5 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>REPLAY SPEED</div>
          <div style={{ display: "flex", gap: 8 }}>
            {SPEEDS.map(s => (
              <button key={s.id} onClick={() => setSelectedSpeed(s.id)}
                style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${selectedSpeed === s.id ? C.gold : C.bord}`, background: selectedSpeed === s.id ? C.gold + "18" : "transparent", color: selectedSpeed === s.id ? C.gold : C.muted, fontFamily: "inherit", fontSize: 11, cursor: "pointer", fontWeight: selectedSpeed === s.id ? 700 : 400 }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={startSession} disabled={!selectedMarket || !selectedScenario}
          style={{ width: "100%", padding: 16, background: !selectedMarket || !selectedScenario ? C.muted : C.green, color: "#000", border: "none", borderRadius: 12, cursor: !selectedMarket || !selectedScenario ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 800 }}>
          {!selectedMarket ? "Select a Market" : !selectedScenario ? "Select a Scenario" : "▶ START REPLAY"}
        </button>
      </div>
    );
  }

  if (screen === "loading") {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 14, color: C.txt, fontWeight: 700, marginBottom: 8 }}>Loading Market Data</div>
        <div style={{ fontSize: 12, color: C.muted }}>Fetching {selectedMarket?.name}...</div>
      </div>
    );
  }

  if (screen === "replay") {
    return (
      <div style={{ padding: "12px 16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em" }}>{selectedMarket?.name}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{SCENARIOS.find(s=>s.id===selectedScenario)?.name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: C.muted }}>SESSION P&L</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: sessionPnl >= 0 ? C.green : C.red }}>
              {sessionPnl >= 0 ? "+" : ""}${sessionPnl.toFixed(2)}
            </div>
          </div>
        </div>
        <div style={{ height: 4, background: C.surf, borderRadius: 2, marginBottom: 12 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: C.blue, borderRadius: 2, transition: "width 0.3s" }}/>
        </div>
        <CandleChart candles={candles} currentIndex={currentIndex - startIndex} position={position} entryPrice={entryPrice}/>
        {currentCandle && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
            {[
              { l: "OPEN", v: currentCandle.open.toFixed(currentCandle.open > 100 ? 1 : 4), c: C.txt },
              { l: "HIGH", v: currentCandle.high.toFixed(currentCandle.high > 100 ? 1 : 4), c: C.green },
              { l: "LOW", v: currentCandle.low.toFixed(currentCandle.low > 100 ? 1 : 4), c: C.red },
              { l: "CLOSE", v: currentCandle.close.toFixed(currentCandle.close > 100 ? 1 : 4), c: currentCandle.close >= currentCandle.open ? C.green : C.red },
            ].map(s => (
              <div key={s.l} style={{ background: C.surf, borderRadius: 8, padding: "8px 6px", textAlign: "center", border: `1px solid ${C.bord}` }}>
                <div style={{ fontSize: 7, color: C.muted, marginBottom: 3 }}>{s.l}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        )}
        {position && entryPrice && currentCandle && (
          <div style={{ background: position === "long" ? C.green + "15" : C.red + "15", border: `1px solid ${position === "long" ? C.green + "40" : C.red + "40"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 9, color: C.muted }}>POSITION</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: position === "long" ? C.green : C.red }}>{position === "long" ? "▲ LONG" : "▼ SHORT"}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: C.muted }}>ENTRY</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.txt }}>{entryPrice.toFixed(entryPrice > 100 ? 1 : 4)}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: C.muted }}>UNREALIZED</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: (() => { const u = position === "long" ? currentCandle.close - entryPrice : entryPrice - currentCandle.close; return u >= 0 ? C.green : C.red; })() }}>
                {(() => { const u = position === "long" ? currentCandle.close - entryPrice : entryPrice - currentCandle.close; const d = u * (selectedMarket?.id.includes("=F") ? 50 : 100); return `${d >= 0 ? "+" : ""}$${d.toFixed(0)}`; })()}
              </div>
            </div>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: position ? "1fr 1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          {!position ? (
            <>
              <button onClick={enterLong} style={{ padding: "14px 8px", background: C.green + "20", border: `1px solid ${C.green + "50"}`, color: C.green, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 800 }}>
                ▲ BUY
              </button>
              <button onClick={wait} style={{ padding: "14px 8px", background: C.gold + "15", border: `1px solid ${C.gold + "40"}`, color: C.gold, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 800 }}>
                ⏸ WAIT
              </button>
              <button onClick={enterShort} style={{ padding: "14px 8px", background: C.red + "20", border: `1px solid ${C.red + "50"}`, color: C.red, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 800 }}>
                ▼ SELL
              </button>
            </>
          ) : (
            <>
              <button onClick={wait} style={{ padding: "14px 8px", background: C.gold + "15", border: `1px solid ${C.gold + "40"}`, color: C.gold, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 800 }}>
                ⏸ HOLD
              </button>
              <button onClick={exitPosition} style={{ padding: "14px 8px", background: C.blue + "20", border: `1px solid ${C.blue + "50"}`, color: C.blue, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 800 }}>
                ✓ EXIT
              </button>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setIsPlaying(p => !p)} style={{ flex: 1, padding: 10, background: isPlaying ? C.muted + "20" : C.green + "20", border: `1px solid ${isPlaying ? C.muted + "40" : C.green + "40"}`, color: isPlaying ? C.muted : C.green, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700 }}>
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          {SPEEDS.map(s => (
            <button key={s.id} onClick={() => setSelectedSpeed(s.id)} style={{ padding: "10px 8px", background: selectedSpeed === s.id ? C.blue + "20" : "transparent", border: `1px solid ${selectedSpeed === s.id ? C.blue + "50" : C.bord}`, color: selectedSpeed === s.id ? C.blue : C.muted, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 700 }}>
              {s.label}
            </button>
          ))}
          <button onClick={resetSession} style={{ padding: "10px 10px", background: "transparent", border: `1px solid ${C.bord}`, color: C.muted, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 10 }}>
            ✕
          </button>
        </div>
        {trades.length > 0 && (
          <div style={{ marginTop: 12, background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", marginBottom: 8 }}>TRADES THIS SESSION</div>
            {trades.map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.bord}` }}>
                <span style={{ fontSize: 11, color: t.direction === "long" ? C.green : C.red }}>{t.direction === "long" ? "▲ Long" : "▼ Short"}</span>
                <span style={{ fontSize: 11, color: C.muted }}>{t.entry.toFixed(t.entry > 100 ? 1 : 4)} → {t.exit.toFixed(t.exit > 100 ? 1 : 4)}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.pnl >= 0 ? C.green : C.red }}>{t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (screen === "result") {
    const totalTrades = trades.length;
    const totalWins = trades.filter(t => t.pnl > 0).length;
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const avgWin = totalWins ? trades.filter(t=>t.pnl>0).reduce((s,t)=>s+t.pnl,0)/totalWins : 0;
    const avgLoss = totalTrades - totalWins ? Math.abs(trades.filter(t=>t.pnl<0).reduce((s,t)=>s+t.pnl,0)/(totalTrades-totalWins)) : 0;
    const wr = totalTrades ? (totalWins/totalTrades*100).toFixed(0) : 0;
    const grade = totalPnl > 500 ? "A" : totalPnl > 200 ? "B" : totalPnl > 0 ? "C" : totalPnl > -200 ? "D" : "F";
    const gradeColor = {A:C.green,B:"#6ee7b7",C:C.gold,D:"#fb923c",F:C.red}[grade];

    return (
      <div style={{ padding: "16px 16px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.2em", marginBottom: 8 }}>SESSION COMPLETE</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: totalPnl >= 0 ? C.green : C.red, marginTop: 8 }}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{selectedMarket?.name} — {SCENARIOS.find(s=>s.id===selectedScenario)?.name}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { l: "TRADES", v: totalTrades, c: C.txt },
            { l: "WIN RATE", v: `${wr}%`, c: parseInt(wr) >= 50 ? C.green : C.red },
            { l: "NET P&L", v: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(0)}`, c: totalPnl >= 0 ? C.green : C.red },
            { l: "AVG WIN", v: `$${avgWin.toFixed(0)}`, c: C.green },
            { l: "AVG LOSS", v: `$${avgLoss.toFixed(0)}`, c: C.red },
            { l: "R/R", v: avgLoss ? (avgWin/avgLoss).toFixed(1) : "N/A", c: avgWin > avgLoss ? C.green : C.red },
          ].map(s => (
            <div key={s.l} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 8, color: C.muted, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: C.blue, letterSpacing: "0.1em", marginBottom: 10 }}>SESSION FEEDBACK</div>
          {totalTrades === 0 && <div style={{ fontSize: 12, color: C.dim }}>You didn't take any trades this session. Don't be afraid to enter — practice requires action. Try again and focus on finding one clear setup.</div>}
          {totalTrades > 0 && parseInt(wr) >= 60 && <div style={{ fontSize: 12, color: C.green, lineHeight: 1.7 }}>✓ Strong win rate! Your entry timing was solid. Focus on letting your winners run further to improve your R/R ratio.</div>}
          {totalTrades > 0 && parseInt(wr) < 60 && parseInt(wr) >= 40 && <div style={{ fontSize: 12, color: C.gold, lineHeight: 1.7 }}>⚠ Average win rate. Work on being more selective with your entries. Fewer trades with better setups beats more trades with weak setups.</div>}
          {totalTrades > 0 && parseInt(wr) < 40 && <div style={{ fontSize: 12, color: C.red, lineHeight: 1.7 }}>✗ Win rate needs work. Focus on waiting for clear setups — support/resistance levels, BOS confirmations. Don't force trades.</div>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={startSession} style={{ flex: 2, padding: 14, background: C.green, color: "#000", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 800 }}>
            ▶ Play Again
          </button>
          <button onClick={resetSession} style={{ flex: 1, padding: 14, background: "transparent", border: `1px solid ${C.bord}`, color: C.dim, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
            Change Setup
          </button>
        </div>
      </div>
    );
  }

  return null;
}