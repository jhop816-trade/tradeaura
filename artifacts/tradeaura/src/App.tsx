import React, { useState, useEffect, useRef, lazy, Suspense, Component, type ReactNode, type ErrorInfo } from "react";

class ErrorBoundary extends Component<{children:ReactNode},{hasError:boolean,error:string|null}> {
  constructor(props:{children:ReactNode}){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(e:Error){return{hasError:true,error:e.message};}
  componentDidCatch(e:Error,info:ErrorInfo){console.error("App error:",e,info);}
  render(){
    if(this.state.hasError)return(
      <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{textAlign:"center",maxWidth:320}}>
          <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
          <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:8}}>Something went wrong</div>
          <div style={{fontSize:13,color:"#888",marginBottom:24,lineHeight:1.6}}>{this.state.error||"An unexpected error occurred."}</div>
          <button onClick={()=>window.location.reload()} style={{padding:"12px 24px",background:"#3b82f6",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>Reload App</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}
import { createClient } from "@supabase/supabase-js";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Analytics } from "@vercel/analytics/react";
const EducationCenter = lazy(() => import("./EducationCenter"));
import OnboardingTour from "./OnboardingTour";

// ── SUPABASE ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
// Favorites stored in localStorage — no fixed instrument list
const SETUPS = ["BOS + Retest","Bullish Engulfing","Bearish Engulfing","Hammer","Shooting Star","Three White Soldiers","Doji Reversal","Order Block","Break & Retest","Other"];
const SESSIONS = ["New York","London","Asia","NY/London Overlap"];
const MOODS = ["Focused","Anxious","Confident","Tired","Frustrated","Neutral"];
const RULES = ["Followed my plan","Proper position size","Valid setup","Good entry timing","Respected stop loss"];
const ACCT_TYPES = ["Live","Funded","Demo"];
const TICK_VAL: Record<string,number> = {"ES1!":12.5,"NQ1!":5,"MES":1.25,"MNQ":0.5,"CL":10,"GC":10,"RTY":5,"YM":5,"XAU/USD":1};
const TICK_SZ: Record<string,number>  = {"ES1!":0.25,"NQ1!":0.25,"MES":0.25,"MNQ":0.25,"CL":0.01,"GC":0.1,"RTY":0.1,"YM":1,"XAU/USD":0.01};

function calcPnl(t: any) {
  if (t.manual_pnl !== "" && t.manual_pnl != null) { const v = parseFloat(t.manual_pnl); if (!isNaN(v)) return v; }
  const e = parseFloat(t.entry), x = parseFloat(t.exit), c = parseInt(t.contracts) || 1;
  if (!e || !x) return null;
  return ((t.direction === "Long" ? x - e : e - x) / (TICK_SZ[t.instrument] || 0.25)) * (TICK_VAL[t.instrument] || 12.5) * c;
}

function makeId() { return "id_" + Date.now() + "_" + Math.random().toString(36).slice(2,7); }

// ── COLORS ────────────────────────────────────────────────────────────────────
const C = {
  bg:"#0f1117", surf:"#161b27", surf2:"#1c2333", bord:"#232d40",
  blue:"#4f8ef7", green:"#34d399", red:"#f87171", gold:"#fbbf24", purp:"#a78bfa",
  txt:"#e2e8f0", muted:"#64748b", dim:"#94a3b8"
};
const gradeColor = (g: string) => (({A:C.green,B:"#6ee7b7",C:C.gold,D:"#fb923c",F:C.red} as Record<string,string>)[g]||C.muted);
const typeColor  = (t: string) => (({Live:C.green,Funded:C.gold,Demo:C.blue} as Record<string,string>)[t]||C.muted);
const CS: React.CSSProperties = { background:C.surf, border:`1px solid ${C.bord}`, borderRadius:12, padding:16 };
const inp = (x: React.CSSProperties = {}): React.CSSProperties => ({ width:"100%", background:"#0a0d14", border:`1px solid ${C.bord}`, color:C.txt, padding:"11px 14px", borderRadius:8, fontSize:16, fontFamily:"inherit", boxSizing:"border-box", outline:"none", ...x });

function Tag({color,children}: {color:string,children:React.ReactNode}){ return <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:color+"22",color,fontWeight:600}}>{children}</span>; }
function Pill({active,color=C.blue,onClick,children}: {active:boolean,color?:string,onClick:()=>void,children:React.ReactNode}){ return <button onClick={onClick} style={{padding:"8px 14px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:active?color+"22":"transparent",color:active?color:C.muted,border:`1px solid ${active?color+"55":C.bord}`}}>{children}</button>; }
function HowItWorks({points}: {points: string[]}){
  return (
    <div style={{background:"#1a2235",border:"1px solid #1e3a5f",borderRadius:10,padding:"12px 14px",marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:700,color:"#3b82f6",letterSpacing:"0.06em",marginBottom:8}}>HOW IT WORKS</div>
      {points.map((p,i)=>(
        <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<points.length-1?6:0}}>
          <span style={{color:"#3b82f6",fontSize:12,marginTop:1,flexShrink:0}}>→</span>
          <span style={{fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{p}</span>
        </div>
      ))}
    </div>
  );
}

// ── API CLIENT ────────────────────────────────────────────────────────────────
// Set VITE_API_URL in Vercel env vars to the api-server deployment URL.
// Leave unset (or empty) for local dev where /api is served from the same origin.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? "";
}

async function apiCall(method: string, path: string, body?: unknown): Promise<any> {
  const token = await getAuthToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  let res: Response;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (networkErr: any) {
    clearTimeout(timeoutId);
    if (networkErr?.name === "AbortError") {
      throw new Error("Request timed out — please try again.");
    }
    throw new Error(`Network error: ${networkErr?.message || networkErr?.toString() || "fetch failed"}`);
  }
  clearTimeout(timeoutId);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    const errMsg = err.error != null
      ? (typeof err.error === "string" ? err.error : JSON.stringify(err.error))
      : `API error ${res.status}`;
    throw new Error(errMsg);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Map frontend form shape → API request payload
function toApiPayload(trade: any, accountId: string | null) {
  const n = (v: any) => { if (v === "" || v == null) return null; const num = Number(v); return isNaN(num) ? null : num; };
  const dateStr = trade.date || new Date().toISOString().slice(0, 10);
  return {
    accountId: accountId ?? null,
    symbol: trade.instrument,
    direction: (trade.direction || "long").toLowerCase() as "long" | "short",
    entryPrice: n(trade.entry) ?? 0,
    exitPrice: n(trade.exit) ?? 0,
    quantity: n(trade.contracts) ?? 1,
    entryDate: `${dateStr}T12:00:00Z`,
    exitDate: `${dateStr}T12:00:00Z`,
    stopLoss: n(trade.stop_loss),
    manualPnl: n(trade.manual_pnl),
    setup: trade.setup || null,
    session: trade.session || null,
    mood: trade.mood || null,
    rulesFollowed: (trade.rules_followed?.length ? trade.rules_followed : null) as string[] | null,
    notes: trade.notes || null,
    screenshot: trade.screenshot || null,
    accountType: (trade.account_type || "live").toLowerCase(),
    aiGrade: trade.ai_grade || null,
    aiFeedback: trade.ai_feedback || null,
    tags: trade.option_type ? JSON.stringify({ optionType: trade.option_type, strike: trade.strike || "", expiry: trade.option_expiry || "" }) : null,
  };
}

// Map API response → frontend trade shape used by all views
function fromApiTrade(t: any) {
  const capFirst = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  return {
    id: t.id,
    _accountId: t.accountId ?? null,
    date: (t.entryDate ?? t.exitDate ?? "").slice(0, 10),
    instrument: t.symbol,
    direction: t.direction === "long" ? "Long" : "Short",
    entry: t.entryPrice != null ? String(t.entryPrice) : "",
    exit: t.exitPrice != null ? String(t.exitPrice) : "",
    contracts: t.quantity != null ? String(t.quantity) : "1",
    stop_loss: t.stopLoss != null ? String(t.stopLoss) : "",
    manual_pnl: t.manualPnl != null ? String(t.manualPnl) : "",
    pnl: t.pnl ?? 0,
    session: t.session ?? null,
    setup: t.setup ?? null,
    mood: t.mood ?? null,
    rules_followed: t.rulesFollowed ?? [],
    notes: t.notes ?? null,
    screenshot: t.screenshot ?? null,
    account_type: t.accountType ? capFirst(t.accountType) : "Live",
    ai_grade: t.aiGrade ?? null,
    ai_feedback: t.aiFeedback ?? null,
    ...(() => { try { const o=t.tags?JSON.parse(t.tags):{};return{option_type:o.optionType||"",strike:o.strike||"",option_expiry:o.expiry||""};}catch{return{option_type:"",strike:"",option_expiry:""};} })(),
  };
}

async function callAI(prompt: string, maxTokens=600) {
  return apiCall("POST", "/api/ai/grade", { prompt, maxTokens });
}

// ── LANDING PAGE + AUTH ───────────────────────────────────────────────────────
function LandingPage({ onAuth }: {onAuth:(u:any)=>void}) {
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<"login"|"signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit() {
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Account created! Check your email to confirm then sign in.");
        setMode("login");
      }
    } catch(e: any) { setError(e.message); }
    setLoading(false);
  }

  function openAuth(m: "login"|"signup") { setMode(m); setError(""); setSuccess(""); setShowAuth(true); }
  const [activeFeature, setActiveFeature] = useState<number|null>(null);

  const FEATURE_PREVIEWS = [
    // Trade Journal
    <div>
      <div style={{background:C.surf2,border:`1px solid ${C.bord}`,borderRadius:14,padding:14,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}><span style={{fontSize:13,fontWeight:800,color:C.txt}}>NQ FUTURES</span><span style={{fontSize:10,fontWeight:700,color:C.green,background:C.green+"18",border:`1px solid ${C.green}40`,borderRadius:5,padding:"2px 6px"}}>LONG</span></div><div style={{fontSize:11,color:C.muted}}>Trend Follow · Jun 7</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:900,color:C.green}}>+$2,187</div><div style={{fontSize:10,color:C.muted}}>3.2R</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:4,background:C.bord,borderRadius:2,overflow:"hidden"}}><div style={{width:"78%",height:"100%",background:`linear-gradient(90deg,${C.green},${C.blue})`,borderRadius:2}}/></div><span style={{fontSize:10,color:C.green,fontWeight:700,whiteSpace:"nowrap"}}>✓ Rules followed</span></div>
      </div>
      <div style={{background:C.surf2,border:`1px solid ${C.bord}`,borderRadius:14,padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}><span style={{fontSize:13,fontWeight:800,color:C.txt}}>ES FUTURES</span><span style={{fontSize:10,fontWeight:700,color:C.red,background:C.red+"18",border:`1px solid ${C.red}40`,borderRadius:5,padding:"2px 6px"}}>SHORT</span></div><div style={{fontSize:11,color:C.muted}}>Order Block · Jun 6</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:900,color:C.red}}>-$312</div><div style={{fontSize:10,color:C.muted}}>-0.8R</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:4,background:C.bord,borderRadius:2,overflow:"hidden"}}><div style={{width:"35%",height:"100%",background:C.red,borderRadius:2}}/></div><span style={{fontSize:10,color:C.red,fontWeight:700,whiteSpace:"nowrap"}}>✗ Broke rules</span></div>
      </div>
    </div>,
    // AI Coach
    <div>
      <div style={{background:C.surf2,border:`1px solid ${C.purp}44`,borderRadius:14,padding:14,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:32,height:32,background:C.purp+"22",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:C.purp}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 4v2M15 4v2M9 18v2M15 18v2M4 9h2M4 15h2M18 9h2M18 15h2"/></svg></div><div><div style={{fontSize:13,fontWeight:800,color:C.txt}}>AI Grade: <span style={{color:C.green}}>A+</span></div><div style={{fontSize:10,color:C.muted}}>NQ Futures · Jun 7</div></div></div>
        <div style={{fontSize:12,color:C.dim,lineHeight:1.6,marginBottom:10,fontStyle:"italic"}}>"Clean entry on the BOS retest. Stop placement was precise and you respected your risk. Took full 3R — this is textbook execution."</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["✓ Entry timing","✓ Risk management","✓ Exit discipline"].map(s=><span key={s} style={{fontSize:10,color:C.green,background:C.green+"14",border:`1px solid ${C.green}30`,borderRadius:20,padding:"3px 8px",fontWeight:600}}>{s}</span>)}</div>
      </div>
      <div style={{background:C.surf2,border:`1px solid ${C.bord}`,borderRadius:14,padding:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",marginBottom:8}}>WEEKLY REVIEW</div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:C.dim}}>Win Rate</span><span style={{fontSize:12,fontWeight:700,color:C.green}}>68%</span></div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:C.dim}}>Biggest weakness</span><span style={{fontSize:12,fontWeight:700,color:C.gold}}>Overtrading Fri</span></div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.dim}}>Coach note</span><span style={{fontSize:12,fontWeight:700,color:C.blue}}>Cut Fridays</span></div>
      </div>
    </div>,
    // Playbook
    <div>
      {[{name:"Trend Follow BOS",pct:74,trades:23,r:"+2.4R",col:C.green},{name:"Order Block Retest",pct:61,trades:16,r:"+1.9R",col:C.blue},{name:"VWAP Reclaim",pct:48,trades:11,r:"+0.7R",col:C.gold}].map(s=>(
        <div key={s.name} style={{background:C.surf2,border:`1px solid ${C.bord}`,borderRadius:14,padding:14,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:700,color:C.txt}}>{s.name}</div>
            <div style={{fontSize:16,fontWeight:900,color:s.col}}>{s.pct}%</div>
          </div>
          <div style={{height:5,background:C.bord,borderRadius:3,overflow:"hidden",marginBottom:6}}><div style={{width:`${s.pct}%`,height:"100%",background:`linear-gradient(90deg,${s.col},${s.col}88)`,borderRadius:3}}/></div>
          <div style={{display:"flex",gap:12}}><span style={{fontSize:10,color:C.muted}}>{s.trades} trades</span><span style={{fontSize:10,color:s.col,fontWeight:700}}>Avg {s.r}</span></div>
        </div>
      ))}
    </div>,
    // Analytics
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        {[{l:"Win Rate",v:"68.4%",c:C.green},{l:"Avg Win",v:"+$847",c:C.green},{l:"Avg Loss",v:"-$312",c:C.red},{l:"Profit Factor",v:"2.7",c:C.blue}].map(s=>(
          <div key={s.l} style={{background:C.surf2,border:`1px solid ${C.bord}`,borderRadius:12,padding:12,textAlign:"center"}}>
            <div style={{fontSize:20,fontWeight:900,color:s.c,letterSpacing:"-0.02em"}}>{s.v}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.surf2,border:`1px solid ${C.bord}`,borderRadius:14,padding:14}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:700,letterSpacing:"0.08em"}}>P&L CURVE — LAST 10 TRADES</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:48}}>
          {[40,55,45,65,50,70,60,80,72,90].map((h,i)=><div key={i} style={{flex:1,height:`${h}%`,background:h>55?`${C.green}88`:`${C.red}66`,borderRadius:"3px 3px 0 0"}}/>)}
        </div>
      </div>
    </div>,
    // Calendar View
    <div>
      <div style={{background:C.surf2,border:`1px solid ${C.bord}`,borderRadius:14,padding:14}}>
        <div style={{fontSize:13,fontWeight:800,color:C.txt,marginBottom:12}}>June 2025</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:6}}>
          {["M","T","W","T","F"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:C.muted,fontWeight:700}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
          {[
            {d:2,p:847,c:C.green},{d:3,p:1240,c:C.green},{d:4,p:-312,c:C.red},{d:5,p:620,c:C.green},{d:6,p:930,c:C.green},
            {d:9,p:1100,c:C.green},{d:10,p:-180,c:C.red},{d:11,p:760,c:C.green},{d:12,p:2187,c:C.green},{d:13,p:440,c:C.green},
            {d:16,p:-550,c:C.red},{d:17,p:310,c:C.green},{d:18,p:880,c:C.green},{d:19,p:1350,c:C.green},{d:20,p:-220,c:C.red},
          ].map(day=>(
            <div key={day.d} style={{background:day.c+"18",border:`1px solid ${day.c}40`,borderRadius:8,padding:"5px 4px",textAlign:"center"}}>
              <div style={{fontSize:10,color:C.muted}}>{day.d}</div>
              <div style={{fontSize:9,fontWeight:700,color:day.c}}>{day.p>0?"+":""}{day.p>0?(day.p/1000).toFixed(1)+"k":"-"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    // Market Prep
    <div>
      <div style={{background:C.surf2,border:`1px solid ${C.bord}`,borderRadius:14,padding:14,marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",marginBottom:10}}>TODAY'S LEVELS</div>
        {[{sym:"SPY",px:"512.40",chg:"+0.82%",c:C.green},{sym:"QQQ",px:"434.12",chg:"+1.14%",c:C.green},{sym:"NQ",px:"19,840",chg:"-0.31%",c:C.red},{sym:"BTC",px:"68,420",chg:"+2.10%",c:C.green}].map(t=>(
          <div key={t.sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:12,fontWeight:700,color:C.txt,width:40}}>{t.sym}</span>
            <span style={{fontSize:12,color:C.dim}}>${t.px}</span>
            <span style={{fontSize:12,fontWeight:700,color:t.c}}>{t.chg}</span>
          </div>
        ))}
      </div>
      <div style={{background:C.surf2,border:`1px solid ${C.bord}`,borderRadius:14,padding:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",marginBottom:8}}>AI BRIEFING</div>
        <div style={{fontSize:12,color:C.dim,lineHeight:1.6,fontStyle:"italic"}}>"Fed minutes at 2PM ET. Expect elevated volatility around the release. Bias cautiously bullish above SPY 510. Watch NQ 19,800 as key support."</div>
      </div>
    </div>,
  ];

  const FEATURES = [
    { emoji:"📓", col:C.blue,  title:"Trade Journal",      desc:"Log every trade with full context — setup, mood, rules, screenshots. Your future self will thank you.", previewIdx:0 },
    { emoji:"🤖", col:C.purp,  title:"AI Grading",         desc:"Every trade gets an A–F grade based on your own rules. No excuses, no bias — just cold data on your discipline.", previewIdx:1 },
    { emoji:"📊", col:C.green, title:"Pattern Analysis",   desc:"Win rate, profit factor, session heatmaps. See exactly which setups print and which ones are bleeding you.", previewIdx:3 },
    { emoji:"📖", col:C.gold,  title:"Playbook",           desc:"Build a personal strategy library. TradeAura tracks which setups make you money so you can double down on what works.", previewIdx:2 },
  ];

  const logoMark = (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:34,height:34,background:C.green,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
      </div>
      <span style={{fontSize:17,fontWeight:800,color:C.txt,letterSpacing:"-0.02em"}}>TradeAura</span>
    </div>
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (showAuth) return;
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;
    if (!canvas || !ctx) return;
    let animId: number;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    const bgStars = Array.from({length:130},()=>({x:Math.random()*100,y:Math.random()*100,r:Math.random()*1.1+0.2,o:Math.random()*0.45+0.08}));
    interface Shooter{x:number;y:number;vx:number;vy:number;trail:number;life:number;maxLife:number;color:string}
    const shooters: Shooter[] = [];
    function spawn(){
      const angle=(Math.random()*22+18)*Math.PI/180;
      const speed=Math.random()*4+3.5;
      shooters.push({x:Math.random()*canvas.width*1.3-canvas.width*0.15,y:Math.random()*canvas.height*0.45-60,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,trail:Math.random()*110+70,life:0,maxLife:Math.random()*85+65,color:Math.random()>0.5?"52,211,153":"79,142,247"});
    }
    [0,500,1100].forEach(d=>setTimeout(spawn,d));
    let frame=0;
    function draw(){
      animId=requestAnimationFrame(draw);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      bgStars.forEach(s=>{ctx.beginPath();ctx.arc(s.x/100*canvas.width,s.y/100*canvas.height,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${s.o})`;ctx.fill();});
      frame++;
      if(frame%55===0&&shooters.length<7)spawn();
      for(let i=shooters.length-1;i>=0;i--){
        const s=shooters[i];s.life++;s.x+=s.vx;s.y+=s.vy;
        let op=1;
        if(s.life<15)op=s.life/15;
        else if(s.life>s.maxLife-20)op=(s.maxLife-s.life)/20;
        if(s.life>=s.maxLife){shooters.splice(i,1);continue;}
        const mag=Math.hypot(s.vx,s.vy);
        const tx=s.x-s.vx/mag*s.trail,ty=s.y-s.vy/mag*s.trail;
        const g=ctx.createLinearGradient(tx,ty,s.x,s.y);
        g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(0.6,`rgba(${s.color},${op*0.25})`);g.addColorStop(1,`rgba(${s.color},${op*0.85})`);
        ctx.beginPath();ctx.strokeStyle=g;ctx.lineWidth=1.8;ctx.moveTo(tx,ty);ctx.lineTo(s.x,s.y);ctx.stroke();
        const rg=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,6);
        rg.addColorStop(0,`rgba(255,255,255,${op})`);rg.addColorStop(0.4,`rgba(${s.color},${op*0.5})`);rg.addColorStop(1,"rgba(0,0,0,0)");
        ctx.beginPath();ctx.fillStyle=rg;ctx.arc(s.x,s.y,6,0,Math.PI*2);ctx.fill();
      }
    }
    draw();
    return()=>{cancelAnimationFrame(animId);window.removeEventListener("resize",resize);};
  },[showAuth]);

  const css = `
    @keyframes ta-sheet-up{from{transform:translateY(100%)}to{transform:translateY(0)}}
    @keyframes ta-pulse{0%,100%{opacity:.65}50%{opacity:1}}
    @keyframes ta-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    @keyframes ta-orb1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,-15px) scale(1.08)}}
    @keyframes ta-orb2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-18px,12px) scale(1.05)}}
    .ta-badge{animation:ta-pulse 2.8s ease-in-out infinite}
    .ta-cta-primary{transition:box-shadow .2s,transform .15s}
    .ta-cta-primary:hover{box-shadow:0 0 36px ${C.green}99!important;transform:translateY(-2px)}
    .ta-cta-secondary:hover{border-color:${C.txt}55!important;background:${C.surf2}!important}
    .ta-feat-card{transition:transform .2s,border-color .2s,box-shadow .2s}
    .ta-feat-card:hover{transform:translateY(-4px);border-color:rgba(255,255,255,.18)!important;box-shadow:0 8px 32px #00000044}
    .ta-signin-btn:hover{background:${C.surf2}!important;border-color:${C.txt}44!important}
    .ta-stat-num{background:linear-gradient(120deg,#fff 60%,${C.green});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  `;

  if (showAuth) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Space Grotesk',sans-serif"}}>
      <style>{css}</style>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:48,height:48,background:C.green,borderRadius:12,marginBottom:12,boxShadow:`0 0 24px ${C.green}66`}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          </div>
          <div style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:"-0.02em"}}>TradeAura</div>
          <div style={{fontSize:11,color:C.muted,marginTop:4,letterSpacing:"0.1em"}}>TRADE SMARTER. GROW FASTER.</div>
        </div>
        <button onClick={()=>{setShowAuth(false);setError("");}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit",marginBottom:16,padding:0,display:"flex",alignItems:"center",gap:4}}>← Back</button>
        <div style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:16,padding:28}}>
          <div style={{fontSize:16,fontWeight:700,color:C.txt,marginBottom:6}}>{mode==="login"?"Welcome back":"Create your free account"}</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:24}}>{mode==="login"?"Sign in to your trading journal":"Start tracking your trades today"}</div>
          {error&&<div style={{background:C.red+"18",border:`1px solid ${C.red}40`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.red,marginBottom:16}}>{error}</div>}
          {success&&<div style={{background:C.green+"18",border:`1px solid ${C.green}40`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.green,marginBottom:16}}>{success}</div>}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>EMAIL</div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={inp()} />
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>PASSWORD</div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp()} onKeyDown={e=>e.key==="Enter"&&submit()} />
          </div>
          <button onClick={submit} disabled={loading} className="ta-cta-primary" style={{width:"100%",padding:14,background:loading?C.muted:C.green,color:"#000",border:"none",borderRadius:10,cursor:loading?"wait":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,marginBottom:16,boxShadow:`0 0 20px ${C.green}44`}}>
            {loading?"Loading...":(mode==="login"?"Sign In":"Create Account")}
          </button>
          <div style={{textAlign:"center",fontSize:12,color:C.muted}}>
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
            <span onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");setSuccess("");}} style={{color:C.green,cursor:"pointer",fontWeight:700}}>
              {mode==="login"?"Sign up":"Sign in"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Space Grotesk',sans-serif",color:C.txt,overflowX:"hidden"}}>
      <style>{css}</style>
      <canvas ref={canvasRef} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>

      {/* NAV */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${C.bord}`,position:"sticky",top:0,background:`${C.bg}dd`,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",zIndex:10}}>
        {logoMark}
        <button onClick={()=>openAuth("login")} className="ta-signin-btn" style={{background:"transparent",border:`1px solid ${C.bord}`,color:C.txt,padding:"8px 18px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,transition:"all .2s"}}>
          Sign In
        </button>
      </nav>

      {/* HERO */}
      <div style={{position:"relative",padding:"60px 24px 52px",textAlign:"center",maxWidth:520,margin:"0 auto",overflow:"hidden",zIndex:1}}>
        {/* glow orbs */}
        <div style={{position:"absolute",top:-40,left:"50%",transform:"translateX(-120px)",width:280,height:280,background:`radial-gradient(circle, ${C.green}22 0%, transparent 70%)`,borderRadius:"50%",pointerEvents:"none",animation:"ta-orb1 6s ease-in-out infinite"}}/>
        <div style={{position:"absolute",top:20,left:"50%",transform:"translateX(20px)",width:220,height:220,background:`radial-gradient(circle, ${C.blue}1a 0%, transparent 70%)`,borderRadius:"50%",pointerEvents:"none",animation:"ta-orb2 7s ease-in-out infinite"}}/>

        <div className="ta-badge" style={{display:"inline-flex",alignItems:"center",gap:6,background:C.green+"18",border:`1px solid ${C.green}40`,borderRadius:20,padding:"5px 14px",fontSize:11,color:C.green,fontWeight:700,letterSpacing:"0.08em",marginBottom:24,position:"relative"}}>
          ✦ AI-POWERED TRADING JOURNAL
        </div>

        <h1 style={{fontSize:40,fontWeight:900,lineHeight:1.1,margin:"0 0 18px",letterSpacing:"-0.03em",position:"relative"}}>
          <span style={{color:C.txt}}>Stop Guessing.<br/></span>
          <span style={{background:`linear-gradient(120deg, ${C.green} 0%, ${C.blue} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Start Trading with an Edge.</span>
        </h1>

        <p style={{fontSize:15,color:C.dim,lineHeight:1.7,margin:"0 auto 36px",maxWidth:420,position:"relative"}}>
          Most traders lose money because they repeat the same mistakes. TradeAura shows you exactly what's costing you — and how to fix it.
        </p>

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",position:"relative",marginBottom:44}}>
          <button onClick={()=>openAuth("signup")} className="ta-cta-primary" style={{background:C.green,color:"#000",border:"none",padding:"15px 32px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:15,fontWeight:700,letterSpacing:"-0.01em",boxShadow:`0 0 28px ${C.green}55`}}>
            Get Started Free
          </button>
          <button onClick={()=>openAuth("login")} className="ta-cta-secondary" style={{background:C.surf,color:C.txt,border:`1px solid ${C.bord}`,padding:"15px 24px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:15,fontWeight:600,transition:"all .2s"}}>
            Sign In
          </button>
        </div>


        {/* Mock trade card */}
        <div style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:16,padding:"14px 16px",maxWidth:340,margin:"0 auto",textAlign:"left",position:"relative",boxShadow:`0 8px 32px #00000066`,animation:"ta-float 4.5s ease-in-out infinite"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                <span style={{fontSize:13,fontWeight:800,color:C.txt,letterSpacing:"-0.01em"}}>NQ FUTURES</span>
                <span style={{fontSize:10,fontWeight:700,color:C.green,background:C.green+"18",border:`1px solid ${C.green}40`,borderRadius:6,padding:"2px 7px"}}>LONG</span>
              </div>
              <div style={{fontSize:11,color:C.muted}}>Trend Follow · Jun 7, 2025</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:18,fontWeight:900,color:C.green,letterSpacing:"-0.02em"}}>+$2,187.50</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,marginTop:2}}>
                <span style={{fontSize:10,fontWeight:700,background:C.green+"22",color:C.green,border:`1px solid ${C.green}44`,borderRadius:6,padding:"1px 7px"}}>A+</span>
                <span style={{fontSize:10,color:C.muted}}>3.2R</span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{flex:1,height:4,background:C.bord,borderRadius:2,overflow:"hidden"}}>
              <div style={{width:"78%",height:"100%",background:`linear-gradient(90deg,${C.green},${C.blue})`,borderRadius:2}}/>
            </div>
            <span style={{fontSize:10,color:C.green,fontWeight:700}}>✓ All rules followed</span>
          </div>
        </div>
      </div>

      {/* PILLARS BAR */}
      <div style={{display:"flex",borderTop:`1px solid ${C.bord}`,borderBottom:`1px solid ${C.bord}`,marginBottom:56,position:"relative",zIndex:1}}>
        {([
          {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="12" width="5" height="10" rx="1"/><rect x="9.5" y="7" width="5" height="15" rx="1"/><rect x="16" y="3" width="5" height="19" rx="1"/></svg>,label:"Track Every Trade",col:C.green},
          {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 4v2M15 4v2M9 18v2M15 18v2M4 9h2M4 15h2M18 9h2M18 15h2"/></svg>,label:"AI Coaching",col:C.purp},
          {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 12 6 12 8 4 10 20 12 12 14 16 16 12 22 12"/></svg>,label:"Live Market Data",col:C.blue},
          {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>,label:"Mobile First",col:"#38bdf8"},
        ]).map(({icon,label,col},i,arr)=>(
          <div key={label} style={{flex:1,textAlign:"center",padding:"14px 4px",borderRight:i<arr.length-1?`1px solid ${C.bord}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:18,marginBottom:4,color:col}}>{icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:C.dim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"0.02em"}}>{label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div style={{padding:"0 16px 64px",maxWidth:520,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:11,fontWeight:700,color:C.blue,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>Why TradeAura</div>
          <div style={{fontSize:24,fontWeight:900,color:C.txt,letterSpacing:"-0.02em",lineHeight:1.15}}>Your trading journal<br/><span style={{background:`linear-gradient(120deg,${C.green},${C.blue})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>that actually thinks.</span></div>
          <div style={{fontSize:13,color:C.muted,marginTop:10}}>Built by traders, for traders who are serious about improving.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {FEATURES.map((f,i)=>(
            <div key={f.title} className="ta-feat-card" onClick={()=>setActiveFeature(f.previewIdx)} style={{background:C.surf,border:`1px solid ${C.bord}`,borderTop:`3px solid ${f.col}`,borderRadius:16,padding:"20px 16px",cursor:"pointer"}}>
              <div style={{fontSize:32,marginBottom:14,lineHeight:1}}>{f.emoji}</div>
              <div style={{fontSize:14,fontWeight:800,color:C.txt,marginBottom:8,letterSpacing:"-0.01em"}}>{f.title}</div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.65}}>{f.desc}</div>
              <div style={{fontSize:11,color:f.col,fontWeight:700,marginTop:12,display:"flex",alignItems:"center",gap:4}}>See it in action <span style={{fontSize:14}}>→</span></div>
            </div>
          ))}
        </div>

        {/* FEATURE BOTTOM SHEET */}
        {activeFeature!==null&&(
          <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={()=>setActiveFeature(null)}>
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}/>
            <div onClick={e=>e.stopPropagation()} style={{position:"relative",background:C.surf,borderRadius:"20px 20px 0 0",padding:"0 0 40px",maxHeight:"82vh",overflowY:"auto",boxShadow:"0 -8px 48px #00000088"}}>
              <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}>
                <div style={{width:36,height:4,background:C.bord,borderRadius:2}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:44,height:44,background:FEATURES.find(f=>f.previewIdx===activeFeature)?.col+"1a",border:`1px solid ${FEATURES.find(f=>f.previewIdx===activeFeature)?.col}44`,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
                    {FEATURES.find(f=>f.previewIdx===activeFeature)?.emoji}
                  </div>
                  <div>
                    <div style={{fontSize:16,fontWeight:800,color:C.txt}}>{FEATURES.find(f=>f.previewIdx===activeFeature)?.title}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2,maxWidth:220}}>{FEATURES.find(f=>f.previewIdx===activeFeature)?.desc}</div>
                  </div>
                </div>
                <button onClick={()=>setActiveFeature(null)} style={{background:C.surf2,border:`1px solid ${C.bord}`,color:C.muted,width:32,height:32,borderRadius:8,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",flexShrink:0}}>×</button>
              </div>
              <div style={{padding:"0 16px 16px"}}>{FEATURE_PREVIEWS[activeFeature]}</div>
              <div style={{padding:"0 16px"}}>
                <button onClick={()=>openAuth("signup")} style={{width:"100%",padding:14,background:C.green,color:"#000",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,boxShadow:`0 0 20px ${C.green}44`}}>
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HOW IT WORKS */}
      <div style={{padding:"0 16px 72px",maxWidth:520,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:11,fontWeight:700,color:C.green,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>How It Works</div>
          <div style={{fontSize:24,fontWeight:900,color:C.txt,letterSpacing:"-0.02em",lineHeight:1.15}}>Three steps to a<br/>sharper edge.</div>
        </div>
        {([
          {n:"01",col:C.green,emoji:"✏️",title:"Log your trade (30 seconds)",body:"Enter ticker, direction, P&L, and which rules you followed. Fast enough that you'll actually do it every time."},
          {n:"02",col:C.blue,emoji:"🤖",title:"AI grades it instantly",body:"Your AI coach scores your discipline A–F and calls out exactly what you did right and what to fix — no sugarcoating."},
          {n:"03",col:C.purp,emoji:"📈",title:"Your patterns surface over time",body:"Your Playbook builds itself — best setups, worst habits, the rules that actually make you money. Data beats guesswork."},
        ]).map((step,i)=>(
          <div key={step.n} style={{display:"flex",gap:16,marginBottom:i<2?32:0,alignItems:"flex-start"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
              <div style={{width:52,height:52,borderRadius:14,background:step.col+"18",border:`1.5px solid ${step.col}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{step.emoji}</div>
              {i<2&&<div style={{width:2,height:32,marginTop:6,background:`linear-gradient(${step.col}55,transparent)`,flexShrink:0}}/>}
            </div>
            <div style={{paddingTop:10}}>
              <div style={{fontSize:10,fontWeight:700,color:step.col,letterSpacing:"0.1em",marginBottom:5}}>STEP {step.n}</div>
              <div style={{fontSize:16,fontWeight:800,color:C.txt,marginBottom:6,letterSpacing:"-0.01em"}}>{step.title}</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{step.body}</div>
            </div>
          </div>
        ))}
        <div style={{marginTop:40,textAlign:"center"}}>
          <button onClick={()=>openAuth("signup")} className="ta-cta-primary" style={{background:C.green,color:"#000",border:"none",padding:"15px 36px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:15,fontWeight:700,boxShadow:`0 0 24px ${C.green}44`}}>
            Start for free →
          </button>
        </div>
      </div>

      {/* COMPARISON */}
      <div style={{padding:"0 16px 64px",maxWidth:520,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:11,fontWeight:700,color:C.purp,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Why TradeAura</div>
          <div style={{fontSize:22,fontWeight:800,color:C.txt,letterSpacing:"-0.02em",marginBottom:10}}>Other tools show you data.</div>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.02em",background:`linear-gradient(120deg,${C.green},${C.blue})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>TradeAura goes over it with you.</div>
        </div>
        <div style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:16,overflow:"hidden"}}>
          {/* header row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:`1px solid ${C.bord}`}}>
            <div style={{padding:"12px 14px",fontSize:11,fontWeight:700,color:C.muted}}></div>
            <div style={{padding:"12px 10px",textAlign:"center",borderLeft:`1px solid ${C.bord}`,fontSize:11,fontWeight:700,color:C.muted}}>Others</div>
            <div style={{padding:"12px 10px",textAlign:"center",borderLeft:`1px solid ${C.bord}`,fontSize:11,fontWeight:700,color:C.green,background:C.green+"0d"}}>TradeAura</div>
          </div>
          {([
            ["Track trades & P&L","✓","✓"],
            ["Win rate & stats","✓","✓"],
            ["Rule tracking","Limited","✓"],
            ["AI trade review","✗","✓"],
            ["Personal Playbook","✗","✓"],
            ["Pattern recognition","✗","✓"],
            ["Tells you WHY you're losing","✗","✓"],
          ] as const).map((row,i)=>(
            <div key={row[0]} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:i<6?`1px solid ${C.bord}33`:"none",background:i%2===0?"transparent":C.surf2+"66"}}>
              <div style={{padding:"11px 14px",fontSize:12,color:C.dim,fontWeight:500}}>{row[0]}</div>
              <div style={{padding:"11px 10px",textAlign:"center",borderLeft:`1px solid ${C.bord}33`,fontSize:12,color:row[1]==="✗"?C.red:row[1]==="✓"?C.dim:C.gold,fontWeight:row[1]==="✗"||row[1]==="✓"?700:600}}>{row[1]}</div>
              <div style={{padding:"11px 10px",textAlign:"center",borderLeft:`1px solid ${C.bord}33`,fontSize:12,color:row[2]==="✓"?C.green:C.dim,fontWeight:700,background:C.green+"08"}}>{row[2]}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:16,padding:"14px 16px",background:C.surf,border:`1px solid ${C.bord}`,borderRadius:12,display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{flexShrink:0,color:C.gold,display:"flex",alignItems:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><circle cx="12" cy="16" r=".5" fill="currentColor" strokeWidth="0"/></svg></span>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}><span style={{color:C.txt,fontWeight:700}}>The real difference:</span> Tradezilla, spreadsheets, and most journals are rearview mirrors. TradeAura is the coach in your corner telling you what to do differently next time.</div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{margin:"0 16px 60px",position:"relative",zIndex:1,borderRadius:20,padding:2,background:`linear-gradient(135deg,${C.green}55,${C.blue}44,${C.purp}33)`,maxWidth:488,marginLeft:"auto",marginRight:"auto"}}>
        <div style={{background:C.surf,borderRadius:18,padding:"48px 28px",textAlign:"center"}}>
          <div style={{fontSize:14,fontWeight:700,color:C.green,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>Ready to find your edge?</div>
          <div style={{fontSize:30,fontWeight:900,letterSpacing:"-0.025em",marginBottom:14,color:C.txt,lineHeight:1.15}}>Stop guessing.<br/>Start growing.</div>
          <div style={{fontSize:14,color:C.muted,marginBottom:32,lineHeight:1.65,maxWidth:320,marginLeft:"auto",marginRight:"auto"}}>Join traders who stopped guessing and started growing. Free to start, no credit card required.</div>
          <button onClick={()=>openAuth("signup")} className="ta-cta-primary" style={{background:C.green,color:"#000",border:"none",padding:"16px 44px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:16,fontWeight:700,boxShadow:`0 0 32px ${C.green}66`,letterSpacing:"-0.01em"}}>
            Get Started Free
          </button>
          <div style={{fontSize:12,color:C.muted,marginTop:14}}>No credit card required · Free forever plan</div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{borderTop:`1px solid ${C.bord}`,padding:"20px 24px",display:"flex",justifyContent:"space-between",position:"relative",zIndex:1,alignItems:"center",fontSize:11,color:C.muted}}>
        <span>© 2025 TradeAura</span>
        <span>tradeauraapp.com</span>
      </div>

    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
// ── WEEKLY RECAP CARD ─────────────────────────────────────────────────────────
function WeeklyRecapCard() {
  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState<string|null>(null);
  const [expanded,setExpanded]=useState(false);

  useEffect(()=>{
    let cancelled=false;
    apiCall("GET","/api/recap/weekly").then(d=>{if(!cancelled){setData(d);setLoading(false);}}).catch(e=>{if(!cancelled){setErr(e?.message||"Failed to load recap");setLoading(false);}});
    return()=>{cancelled=true;};
  },[]);

  if(loading)return(
    <div style={{...CS,marginTop:12,display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:10,height:10,borderRadius:"50%",background:C.purp,opacity:0.7,animation:"pulse 1.2s infinite"}}/>
      <span style={{fontSize:12,color:C.muted}}>Loading weekly recap…</span>
    </div>
  );
  if(err||!data||data.stats?.totalTrades===0)return null;

  const tiltColor=data.tiltDetected?C.red:C.green;
  return(
    <div style={{...CS,marginTop:12,border:`1px solid ${C.purp}40`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontSize:9,color:C.purp,letterSpacing:"0.15em",fontWeight:700}}>WEEKLY RECAP — AI</div>
        {data.cached&&<span style={{fontSize:9,color:C.muted,background:C.bord,borderRadius:4,padding:"2px 6px"}}>cached</span>}
      </div>
      <div style={{fontSize:14,fontWeight:700,color:C.txt,marginBottom:8,lineHeight:1.4}}>{data.focusForNextWeek}</div>
      <div style={{fontSize:12,color:C.dim,lineHeight:1.6,marginBottom:10}}>{data.summary}</div>
      {data.stats&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
          {[
            {l:"TRADES",v:String(data.stats.totalTrades),c:C.txt},
            {l:"WIN RATE",v:`${Math.round((data.stats.winRate||0)*100)/100}%`,c:data.stats.winRate>=50?C.green:C.red},
            {l:"NET P&L",v:`${(data.stats.netPnl||0)>=0?"+":""}$${Math.abs(data.stats.netPnl||0).toFixed(0)}`,c:(data.stats.netPnl||0)>=0?C.green:C.red},
          ].map(s=>(
            <div key={s.l} style={{background:C.bg,borderRadius:8,padding:"8px 6px",textAlign:"center",border:`1px solid ${C.bord}`}}>
              <div style={{fontSize:7,color:C.muted,letterSpacing:"0.08em",marginBottom:3}}>{s.l}</div>
              <div style={{fontSize:13,fontWeight:700,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
      )}
      <button onClick={()=>setExpanded(e=>!e)} style={{background:"transparent",border:"none",color:C.purp,fontSize:11,fontWeight:600,cursor:"pointer",padding:0,fontFamily:"inherit"}}>
        {expanded?"Hide details":"Show details"}
      </button>
      {expanded&&(
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
          {data.bestPattern&&(
            <div style={{background:C.green+"10",border:`1px solid ${C.green}25`,borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:9,color:C.green,letterSpacing:"0.1em",marginBottom:4}}>WORKING WELL</div>
              <div style={{fontSize:12,color:C.txt,lineHeight:1.5}}>{data.bestPattern}</div>
            </div>
          )}
          {data.worstHabit&&(
            <div style={{background:C.red+"10",border:`1px solid ${C.red}25`,borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:9,color:C.red,letterSpacing:"0.1em",marginBottom:4}}>TOP WEAKNESS</div>
              <div style={{fontSize:12,color:C.txt,lineHeight:1.5}}>{data.worstHabit}</div>
            </div>
          )}
          {data.tiltDetected&&data.tiltEvidence&&(
            <div style={{background:tiltColor+"10",border:`1px solid ${tiltColor}25`,borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:9,color:tiltColor,letterSpacing:"0.1em",marginBottom:4}}>TILT DETECTED</div>
              <div style={{fontSize:12,color:C.txt,lineHeight:1.5}}>{data.tiltEvidence}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HomeView({trades,account,onEditBalance,onNavigate}: {trades:any[],account:any,onEditBalance:(v:number)=>void,onNavigate:(v:string)=>void}) {
  const [editingBal,setEditingBal]=useState(false);
  const [balInput,setBalInput]=useState("");
  const wins=trades.filter(t=>(t.pnl||0)>0);
  const losses=trades.filter(t=>(t.pnl||0)<0);
  const totalPnl=trades.reduce((s,t)=>s+(t.pnl||0),0);
  const winRate=trades.length?(wins.length/trades.length*100).toFixed(1):0;
  const avgWin=wins.length?wins.reduce((s,t)=>s+t.pnl,0)/wins.length:0;
  const avgLoss=losses.length?Math.abs(losses.reduce((s,t)=>s+t.pnl,0)/losses.length):0;
  const today=new Date().toISOString().slice(0,10);
  const todayTrades=trades.filter(t=>t.date===today);
  const dailyPnl=todayTrades.reduce((s,t)=>s+(t.pnl||0),0);
  const currentBalance=(account?.starting_balance||0)+totalPnl;
  let streak=0,sType: boolean|null=null;
  for(const t of trades){const w=(t.pnl||0)>0;if(sType===null){sType=w;streak=1;}else if(w===sType)streak++;else break;}
  let cum=0;
  const chartData=trades.slice().reverse().map((t,i)=>{cum+=t.pnl||0;return{i:i+1,v:parseFloat(cum.toFixed(2))};});
  const tpClr=totalPnl>=0?C.green:C.red;
  const dpClr=dailyPnl>=0?C.green:C.red;
  const grossWins=wins.reduce((s,t)=>s+(t.pnl||0),0);
  const grossLosses=Math.abs(losses.reduce((s,t)=>s+(t.pnl||0),0));
  const profitFactor=grossLosses>0?grossWins/grossLosses:grossWins>0?999:0;
  const pfDisplay=profitFactor>=999?"∞":profitFactor.toFixed(2);
  const pfColor=profitFactor>=1.5?C.green:profitFactor>=1?C.gold:C.red;
  const rulesScore=trades.length?trades.filter(t=>(t.rules_followed||[]).length>0).length/trades.length*100:50;
  const pfScore=Math.min(profitFactor>=999?100:profitFactor/3*100,100);
  const consistencyScore=trades.length?Math.round(rulesScore*0.4+parseFloat(winRate as string)*0.35+pfScore*0.25):0;
  const consColor=consistencyScore>=70?C.green:consistencyScore>=50?C.gold:C.red;
  const dailyLimit=(account?.starting_balance||0)*0.05;
  const showDailyWarning=dailyLimit>0&&dailyPnl<0&&Math.abs(dailyPnl)>=dailyLimit*0.8;
  const hitDailyLimit=dailyLimit>0&&dailyPnl<0&&Math.abs(dailyPnl)>=dailyLimit;
  let ddPeak=0,ddCum=0;
  const drawdownData=trades.length>1?trades.slice().reverse().map((t,i)=>{ddCum+=t.pnl||0;ddPeak=Math.max(ddPeak,ddCum);const dd=ddPeak>0?-((ddPeak-ddCum)/ddPeak*100):0;return{i:i+1,dd:parseFloat(dd.toFixed(2))};}):[];

  return (
    <div style={{padding:"16px 16px 20px"}}>
      {(showDailyWarning||hitDailyLimit)&&(
        <div style={{background:hitDailyLimit?C.red+"22":C.gold+"22",border:`1px solid ${hitDailyLimit?C.red+"60":C.gold+"60"}`,borderRadius:10,padding:"12px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>{hitDailyLimit?"🚨":"⚠️"}</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:hitDailyLimit?C.red:C.gold}}>{hitDailyLimit?"DAILY LOSS LIMIT HIT":"APPROACHING DAILY LIMIT"}</div>
            <div style={{fontSize:11,color:C.dim,marginTop:2}}>{hitDailyLimit?"Step away. Come back tomorrow.": `Down $${Math.abs(dailyPnl).toFixed(0)} of your ~$${dailyLimit.toFixed(0)} daily limit (80%+ reached).`}</div>
          </div>
        </div>
      )}
      <div style={{background:"linear-gradient(145deg,#19243d,#161b27)",border:`1px solid ${C.bord}`,borderRadius:12,padding:18,marginBottom:12}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",marginBottom:8}}>ACCOUNT BALANCE</div>
        {editingBal?(
          <input type="number" value={balInput} onChange={e=>setBalInput(e.target.value)} autoFocus
            onBlur={()=>{const v=parseFloat(balInput);if(!isNaN(v))onEditBalance(v);setEditingBal(false);}}
            style={inp({fontSize:26,fontWeight:800,marginBottom:8} as any)}/>
        ):(
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{fontSize:30,fontWeight:800,color:"#fff",letterSpacing:"-0.02em",lineHeight:1.1}}>${currentBalance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              <div style={{fontSize:12,color:tpClr,marginTop:6,fontWeight:600}}>{totalPnl>=0?"▲":"▼"} ${Math.abs(totalPnl).toFixed(2)} ({account?.starting_balance?(totalPnl/account.starting_balance*100).toFixed(2):0}%)</div>
            </div>
            <button onClick={()=>{setBalInput(currentBalance.toFixed(2));setEditingBal(true);}} style={{background:C.blue+"22",border:`1px solid ${C.blue}35`,color:C.blue,padding:"7px 14px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600}}>Edit</button>
          </div>
        )}
        <div style={{marginTop:12,display:"flex",gap:10,alignItems:"center"}}>
          <Tag color={typeColor(account?.type)}>{account?.type||"Live"}</Tag>
          <span style={{fontSize:11,color:C.muted}}>Started: ${(account?.starting_balance||0).toLocaleString()}</span>
        </div>
      </div>

      {trades.length===0&&(
        <div style={{background:'#1a1f2e',borderRadius:16,padding:'40px 24px',textAlign:'center',margin:'24px 0'}}>
          <div style={{fontSize:52}}>📈</div>
          <div style={{color:'#fff',fontSize:20,fontWeight:700,marginTop:16}}>Start tracking your edge</div>
          <div style={{color:'#9ca3af',fontSize:14,lineHeight:1.6,marginTop:10}}>Log your first trade to start seeing your win rate, P&L curve, and AI grades.</div>
          <button onClick={()=>onNavigate('journal')} style={{background:'#3b82f6',color:'#fff',border:'none',borderRadius:8,padding:'12px 24px',fontSize:15,fontWeight:700,cursor:'pointer',marginTop:24,fontFamily:'inherit'}}>Log First Trade</button>
        </div>
      )}

      {trades.length>0&&<div style={Object.assign({},CS,{marginBottom:12})}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>TODAY</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{padding:"12px 14px",borderRadius:10,background:dailyPnl>=0?C.green+"18":C.red+"18",border:`1px solid ${dailyPnl>=0?C.green+"30":C.red+"30"}`}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:4}}>DAILY P&L</div>
            <div style={{fontSize:22,fontWeight:800,color:dpClr}}>{dailyPnl>=0?"+":""}${dailyPnl.toFixed(2)}</div>
          </div>
          <div style={{padding:"12px 14px",borderRadius:10,background:C.surf2,border:`1px solid ${C.bord}`}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:4}}>TRADES TODAY</div>
            <div style={{fontSize:22,fontWeight:800,color:C.txt}}>{todayTrades.length}<span style={{fontSize:12,color:C.muted}}>/{account?.max_daily_trades||5}</span></div>
          </div>
        </div>
      </div>}

      {trades.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[{l:"WIN RATE",v:`${winRate}%`,c:parseFloat(winRate as string)>=50?C.green:C.red},{l:"PROFIT FACTOR",v:pfDisplay,c:pfColor},{l:"STREAK",v:`${streak}${sType?"W":"L"}`,c:sType?C.green:C.red},{l:"TRADES",v:String(trades.length),c:C.txt},{l:"AVG WIN",v:`$${avgWin.toFixed(0)}`,c:C.green},{l:"AVG LOSS",v:`$${avgLoss.toFixed(0)}`,c:C.red},{l:"NET P&L",v:`${totalPnl>=0?"+":""}$${totalPnl.toFixed(0)}`,c:tpClr},{l:"CONSISTENCY",v:`${consistencyScore}`,c:consColor}].map(s=>(
          <div key={s.l} style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:10,padding:"11px 8px",textAlign:"center"}}>
            <div style={{fontSize:8,color:C.muted,letterSpacing:"0.1em",marginBottom:5}}>{s.l}</div>
            <div style={{fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>}

      {chartData.length>1&&(
        <div style={CS}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>EQUITY CURVE</div>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={chartData}>
              <YAxis hide domain={["auto","auto"]}/><XAxis dataKey="i" hide/>
              <Tooltip formatter={(v: any)=>[`$${v}`,"P&L"]} contentStyle={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:8,fontSize:11}}/>
              <ReferenceLine y={0} stroke={C.bord} strokeDasharray="3 3"/>
              <Line type="monotone" dataKey="v" stroke={totalPnl>=0?C.green:C.red} strokeWidth={2.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
          {drawdownData.length>1&&(
            <>
              <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",margin:"14px 0 8px"}}>DRAWDOWN %</div>
              <ResponsiveContainer width="100%" height={70}>
                <AreaChart data={drawdownData}>
                  <YAxis hide domain={["auto",0]}/><XAxis dataKey="i" hide/>
                  <Tooltip formatter={(v: any)=>[`${Math.abs(v).toFixed(2)}%`,"Drawdown"]} contentStyle={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:8,fontSize:11}}/>
                  <Area type="monotone" dataKey="dd" stroke={C.red} fill={C.red+"33"} strokeWidth={1.5} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}

      {/* Weekly & Monthly P&L summary */}
      {(()=>{
        const now=new Date();
        const todayStr=now.toISOString().slice(0,10);
        const dayOfWeek=now.getDay();
        const weekStart=new Date(now);weekStart.setDate(now.getDate()-(dayOfWeek===0?6:dayOfWeek-1));
        const weekStartStr=weekStart.toISOString().slice(0,10);
        const monthStartStr=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
        const weekTrades=trades.filter(t=>t.date>=weekStartStr&&t.date<=todayStr);
        const monthTrades=trades.filter(t=>t.date>=monthStartStr&&t.date<=todayStr);
        const weekPnl=weekTrades.reduce((s,t)=>s+(t.pnl||0),0);
        const monthPnl=monthTrades.reduce((s,t)=>s+(t.pnl||0),0);
        if(!trades.length)return null;
        return(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
            {[{l:"THIS WEEK",pnl:weekPnl,count:weekTrades.length},{l:"THIS MONTH",pnl:monthPnl,count:monthTrades.length}].map(s=>(
              <div key={s.l} style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:10,padding:"11px 12px"}}>
                <div style={{fontSize:8,color:C.muted,letterSpacing:"0.1em",marginBottom:5}}>{s.l}</div>
                <div style={{fontSize:15,fontWeight:700,color:s.pnl>=0?C.green:C.red}}>{s.pnl>=0?"+":""}${s.pnl.toFixed(2)}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:3}}>{s.count} trades</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Personal Records */}
      {trades.length>0&&(()=>{
        const sortedTrades=trades.slice().sort((a,b)=>a.date.localeCompare(b.date));
        const biggestWin=Math.max(...trades.map(t=>t.pnl||0));
        const biggestLoss=Math.min(...trades.map(t=>t.pnl||0));
        const dailyMap2: Record<string,number>={};
        trades.forEach(t=>{dailyMap2[t.date]=(dailyMap2[t.date]||0)+(t.pnl||0);});
        const dayPnls=Object.values(dailyMap2);
        const bestDay2=dayPnls.length?Math.max(...dayPnls):0;
        const worstDay2=dayPnls.length?Math.min(...dayPnls):0;
        let maxWinStreak=0,maxLossStreak=0,curWin=0,curLoss=0;
        sortedTrades.forEach(t=>{if((t.pnl||0)>0){curWin++;curLoss=0;maxWinStreak=Math.max(maxWinStreak,curWin);}else if((t.pnl||0)<0){curLoss++;curWin=0;maxLossStreak=Math.max(maxLossStreak,curLoss);}});
        const records=[{l:"BIGGEST WIN",v:`+$${biggestWin.toFixed(0)}`,c:C.green},{l:"BIGGEST LOSS",v:`-$${Math.abs(biggestLoss).toFixed(0)}`,c:C.red},{l:"BEST DAY",v:`+$${bestDay2.toFixed(0)}`,c:C.green},{l:"WORST DAY",v:`-$${Math.abs(worstDay2).toFixed(0)}`,c:C.red},{l:"WIN STREAK",v:`${maxWinStreak}W`,c:C.green},{l:"LOSS STREAK",v:`${maxLossStreak}L`,c:C.red}];
        return(
          <div style={Object.assign({},CS,{marginTop:12,border:`1px solid ${C.gold}30`})}>
            <div style={{fontSize:9,color:C.gold,letterSpacing:"0.15em",marginBottom:12}}>🏆 PERSONAL RECORDS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {records.map(r=>(
                <div key={r.l} style={{background:C.bg,borderRadius:8,padding:"10px 6px",textAlign:"center",border:`1px solid ${C.bord}`}}>
                  <div style={{fontSize:7,color:C.muted,letterSpacing:"0.08em",marginBottom:4}}>{r.l}</div>
                  <div style={{fontSize:13,fontWeight:700,color:r.c}}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      <WeeklyRecapCard/>
    </div>
  );
}

// ── TRADE FORM ────────────────────────────────────────────────────────────────
function TradeForm({initial,isEdit,onSave,onCancel,balance,pnlMode,onPnlModeChange}: {initial?:any,isEdit?:boolean,onSave:(t:any)=>void,onCancel?:()=>void,balance?:number,pnlMode:"$"|"%",onPnlModeChange:(m:"$"|"%")=>void}) {
  const [form,setForm]=useState(initial||{date:new Date().toISOString().slice(0,10),instrument:"",session:"New York",direction:"Long",entry:"",exit:"",contracts:"1",stop_loss:"",setup:"BOS + Retest",mood:"Focused",rules_followed:[],notes:"",screenshot:null,ai_grade:null,ai_feedback:null,account_type:"Live",manual_pnl:"",option_type:"",strike:"",option_expiry:""});
  const [loading,setLoading]=useState(false);
  const [formError,setFormError]=useState<string|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);
  const set=(k: string,v: any)=>setForm((p: any)=>({...p,[k]:v}));
  const [favSymbols,setFavSymbols]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem("fav_symbols")||"[]");}catch{return [];}});
  function toggleFav(sym: string){if(!sym.trim())return;setFavSymbols(prev=>{const next=prev.includes(sym)?prev.filter(s=>s!==sym):[...prev,sym];localStorage.setItem("fav_symbols",JSON.stringify(next));return next;});}
  const [customSetups,setCustomSetups]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem("custom_setups")||"[]");}catch{return [];}});
  const [newSetup,setNewSetup]=useState("");
  function addCustomSetup(){if(!newSetup.trim())return;const s=newSetup.trim();if([...SETUPS,...customSetups].includes(s)){set("setup",s);setNewSetup("");return;}const next=[...customSetups,s];setCustomSetups(next);localStorage.setItem("custom_setups",JSON.stringify(next));set("setup",s);setNewSetup("");}
  function removeCustomSetup(s: string){const next=customSetups.filter(x=>x!==s);setCustomSetups(next);localStorage.setItem("custom_setups",JSON.stringify(next));}
  const allSetups=[...SETUPS,...customSetups.filter(s=>!SETUPS.includes(s))];
  const [customRules,setCustomRules]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem("custom_rules")||"[]");}catch{return [];}});
  const [newRule,setNewRule]=useState("");
  const [showRuleTemplates,setShowRuleTemplates]=useState(false);
  const [activeTemplate,setActiveTemplate]=useState<string|null>(null);
  const [expandEditor,setExpandEditor]=useState(false);
  const [checklistName,setChecklistName]=useState(()=>localStorage.getItem("checklist_name")||"");
  const [savedChecklists,setSavedChecklists]=useState<any[]>(()=>{try{return JSON.parse(localStorage.getItem("saved_checklists")||"[]");}catch{return [];}});
  const [hiddenRules,setHiddenRules]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem("hidden_rules")||"[]");}catch{return [];}});
  function saveHidden(next: string[]){setHiddenRules(next);localStorage.setItem("hidden_rules",JSON.stringify(next));}
  function saveRules(next: string[]){setCustomRules(next);localStorage.setItem("custom_rules",JSON.stringify(next));}
  function addCustomRule(){if(!newRule.trim())return;const r=newRule.trim();if(!allRules.includes(r))saveRules([...customRules,r]);setNewRule("");}
  function addBulkRules(){const lines=newRule.split("\n").map(l=>l.trim()).filter(l=>l&&!allRules.includes(l));if(lines.length)saveRules([...customRules,...lines]);setNewRule("");}
  function removeRule(r: string){if(RULES.includes(r)){saveHidden([...hiddenRules,r]);}else{saveRules(customRules.filter(x=>x!==r));}set("rules_followed",(form.rules_followed||[]).filter((x: string)=>x!==r));}
  const RULE_TEMPLATES: Record<string,string[]> = {
    Scalp:["HTF pullback confirmed","Momentum in direction","Target within 5 bars","Risk ≤ 0.5%","News window clear"],
    Swing:["HTF trend aligned","Key S/R level","RR ≥ 2:1","Catalyst identified","Overnight risk accepted"],
    "Day Trade":["Opening range noted","Pre-market news checked","Volume confirmation","Daily bias set","Max 3 trades/day"],
    SMC:["Market structure shift","FVG or OB identified","Liquidity swept","Session time valid","Confluences stacked ≥3"],
  };
  function applyTemplate(tpl: string){
    let current=[...customRules];
    if(activeTemplate)current=current.filter(r=>!(RULE_TEMPLATES[activeTemplate]||[]).includes(r));
    if(activeTemplate===tpl){saveRules(current);setActiveTemplate(null);}
    else{const toAdd=RULE_TEMPLATES[tpl].filter(r=>!RULES.includes(r)&&!current.includes(r));saveRules([...current,...toAdd]);setActiveTemplate(tpl);}
    setShowRuleTemplates(false);
  }
  function saveChecklist(){if(!checklistName.trim())return;const entry={id:makeId(),name:checklistName.trim(),rules:customRules,fav:false};const next=[entry,...savedChecklists.filter((c:any)=>c.name!==checklistName.trim())];setSavedChecklists(next);localStorage.setItem("saved_checklists",JSON.stringify(next));localStorage.setItem("checklist_name",checklistName.trim());}
  function loadChecklist(c: any){saveRules(c.rules);setChecklistName(c.name);localStorage.setItem("checklist_name",c.name);setActiveTemplate(null);}
  function toggleFavChecklist(id: string){const next=savedChecklists.map((c:any)=>({...c,fav:c.id===id?!c.fav:c.fav}));setSavedChecklists(next);localStorage.setItem("saved_checklists",JSON.stringify(next));}
  function deleteChecklist(id: string){const next=savedChecklists.filter((c:any)=>c.id!==id);setSavedChecklists(next);localStorage.setItem("saved_checklists",JSON.stringify(next));}
  const allRules=[...RULES.filter(r=>!hiddenRules.includes(r)),...customRules.filter(r=>!RULES.includes(r))];
  const acctBal=balance||25000;
  function fmtPnl(v: number){if(pnlMode==="%"){const pct=(v/acctBal)*100;return `${pct>=0?"+":""}${pct.toFixed(2)}%`;}return `${v>=0?"+":""}$${v.toFixed(2)}`;}
  const resolvedManualPnl=form.manual_pnl;
  const pnlPreview=calcPnl({...form,manual_pnl:resolvedManualPnl,stopLoss:form.stop_loss,rulesFollowed:form.rules_followed});

  async function submit() {
    setFormError(null);
    const entryVal = parseFloat(form.entry);
    const exitVal = parseFloat(form.exit);
    const contractsVal = parseFloat(form.contracts);
    if (form.entry !== "" && (isNaN(entryVal) || entryVal <= 0)) { setFormError("Entry price must be a positive number."); return; }
    if (form.exit !== "" && (isNaN(exitVal) || exitVal <= 0)) { setFormError("Exit price must be a positive number."); return; }
    if (isNaN(contractsVal) || contractsVal <= 0) { setFormError("Quantity must be a positive number."); return; }
    let pnl=calcPnl({...form,manual_pnl:resolvedManualPnl}); if(pnl===null)pnl=0;
    setLoading(true); let grade=null;
    try {
      const optStr=form.option_type?` | ${form.option_type} option${form.strike?` $${form.strike} strike`:""}${form.option_expiry?` exp ${form.option_expiry}`:""}`:"";
      grade=await callAI(`Expert trading coach. Analyze this trade briefly. ${form.instrument} ${form.direction}${optStr} | ${form.setup} | ${form.session} Entry:${form.entry} Exit:${form.exit} Contracts:${form.contracts} P&L:$${pnl.toFixed(2)} Stop:${form.stop_loss||"None"} Mood:${form.mood} Rules:${(form.rules_followed||[]).join(",")||"None"} Notes:${form.notes||"None"} JSON only: {"grade":"A/B/C/D/F","score":0,"strengths":[""],"weaknesses":[""],"lesson":"","verdict":""}`);
    } catch{/* AI grading unavailable — trade still saves cleanly */}
    setLoading(false);
    onSave({...form,manual_pnl:resolvedManualPnl,id:form.id||makeId(),pnl,ai_grade:grade?.grade||null,ai_feedback:grade});
  }

  return (
    <div style={Object.assign({},CS,{marginBottom:12})}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:C.txt}}>{isEdit?"Edit Trade":"New Trade"}</div>
        {onCancel&&<button onClick={onCancel} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:22,padding:"8px 10px",minWidth:44,minHeight:44,lineHeight:1}}>×</button>}
      </div>

      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>ACCOUNT TYPE</div>
        <div style={{display:"flex",gap:6}}>{ACCT_TYPES.map(a=><Pill key={a} active={form.account_type===a} color={typeColor(a)} onClick={()=>set("account_type",a)}>{a}</Pill>)}</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>DATE</div><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={inp()}/></div>
        <div>
          <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>SYMBOL</div>
          <div style={{position:"relative"}}>
            <input type="text" value={form.instrument} onChange={e=>set("instrument",e.target.value.toUpperCase())} placeholder="ES1!, NQ1!, AAPL…" style={inp({paddingRight:38})}/>
            <button onClick={()=>toggleFav(form.instrument)} title={favSymbols.includes(form.instrument)?"Remove from favorites":"Save as favorite"} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",fontSize:18,color:favSymbols.includes(form.instrument)?C.gold:C.muted,lineHeight:1,padding:0}}>★</button>
          </div>
          {favSymbols.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>{favSymbols.map(s=><button key={s} onClick={()=>set("instrument",s)} style={{fontSize:10,padding:"3px 10px",borderRadius:20,background:form.instrument===s?C.gold+"22":"#ffffff0d",color:form.instrument===s?C.gold:C.dim,border:`1px solid ${form.instrument===s?C.gold+"55":C.bord}`,cursor:"pointer",fontFamily:"inherit"}}>★ {s}</button>)}</div>}
        </div>
      </div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>DIRECTION</div>
        <div style={{display:"flex",gap:8}}>
          {["Long","Short"].map(d=>{const active=form.direction===d,col=d==="Long"?C.green:C.red;return(<button key={d} onClick={()=>set("direction",d)} style={{flex:1,padding:11,borderRadius:8,fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",background:active?col+"20":"transparent",color:active?col:C.muted,border:`1px solid ${active?col+"50":C.bord}`}}>{d==="Long"?"▲ Long":"▼ Short"}</button>);})}
        </div>
      </div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>OPTION TYPE <span style={{fontSize:10,fontWeight:400,textTransform:"none"}}>(leave blank for futures/stocks)</span></div>
        <div style={{display:"flex",gap:8}}>
          {(["","Call","Put"] as const).map(o=>{
            const active=form.option_type===o;
            const col=o==="Call"?C.green:o==="Put"?C.red:C.muted;
            return(<button key={o||"none"} onClick={()=>set("option_type",o)} style={{flex:1,padding:10,borderRadius:8,fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",background:active&&o?col+"20":"transparent",color:active?o?col:C.txt:C.muted,border:`1px solid ${active&&o?col+"60":C.bord}`}}>{o||"None"}</button>);
          })}
        </div>
        {form.option_type&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
            <div><div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>STRIKE</div><input type="number" value={form.strike} onChange={e=>set("strike",e.target.value)} placeholder="500" style={inp()}/></div>
            <div><div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>EXPIRY</div><input type="date" value={form.option_expiry} onChange={e=>set("option_expiry",e.target.value)} style={inp()}/></div>
          </div>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>ENTRY</div><input type="number" value={form.entry} onChange={e=>set("entry",e.target.value)} placeholder="7288.50" style={inp()}/></div>
        <div><div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>EXIT</div><input type="number" value={form.exit} onChange={e=>set("exit",e.target.value)} placeholder="7300.00" style={inp()}/></div>
        <div><div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>CONTRACTS</div><input type="number" value={form.contracts} onChange={e=>set("contracts",e.target.value)} placeholder="1" style={inp()}/></div>
        <div><div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>STOP LOSS</div><input type="number" value={form.stop_loss} onChange={e=>set("stop_loss",e.target.value)} placeholder="7280.00" style={inp()}/></div>
      </div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>
          <span>PROFIT / LOSS $ <span style={{fontWeight:400,fontSize:10}}>(override — enter dollar amount)</span></span>
        </div>
        <input type="number" value={form.manual_pnl} onChange={e=>set("manual_pnl",e.target.value)} placeholder="Enter dollar amount e.g. 300" style={inp()}/>
        {form.manual_pnl!==""&&!isNaN(parseFloat(form.manual_pnl))&&<div style={{fontSize:11,color:C.muted,marginTop:4}}>= {((parseFloat(form.manual_pnl)/acctBal)*100).toFixed(2)}% of ${acctBal.toLocaleString()} account</div>}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>SESSION</div><select value={form.session} onChange={e=>set("session",e.target.value)} style={inp()}>{SESSIONS.map(o=><option key={o}>{o}</option>)}</select></div>
        <div>
          <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>SETUP</div>
          <select value={form.setup} onChange={e=>set("setup",e.target.value)} style={inp()}>{allSetups.map(o=><option key={o}>{o}</option>)}</select>
          {customSetups.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>{customSetups.map(s=><span key={s} style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:C.purp+"18",color:C.purp,border:`1px solid ${C.purp}40`,display:"flex",alignItems:"center",gap:4}}>{s}<button onClick={()=>removeCustomSetup(s)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,padding:0,lineHeight:1}}>×</button></span>)}</div>}
          <div style={{display:"flex",gap:6,marginTop:6}}>
            <input value={newSetup} onChange={e=>setNewSetup(e.target.value)} placeholder="Add custom setup…" style={inp({fontSize:12,padding:"7px 10px"})} onKeyDown={e=>e.key==="Enter"&&addCustomSetup()}/>
            <button onClick={addCustomSetup} style={{padding:"7px 12px",background:C.purp+"20",border:`1px solid ${C.purp}40`,color:C.purp,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,flexShrink:0}}>+ Add</button>
          </div>
        </div>
      </div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>MOOD</div>
        <select value={form.mood} onChange={e=>set("mood",e.target.value)} style={inp()}>{MOODS.map(o=><option key={o}>{o}</option>)}</select>
      </div>

      <div style={{marginBottom:10}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em"}}>RULES CHECKLIST</div>
            {checklistName&&<span style={{fontSize:10,color:C.blue,background:C.blue+"15",padding:"2px 8px",borderRadius:10,fontWeight:600}}>{checklistName}</span>}
          </div>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>{setExpandEditor(s=>!s);setShowRuleTemplates(false);}} style={{padding:"4px 10px",background:expandEditor?C.blue+"22":"transparent",border:`1px solid ${expandEditor?C.blue+"50":C.bord}`,color:expandEditor?C.blue:C.muted,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700}}>✏️ Edit</button>
            <button onClick={()=>{setShowRuleTemplates(s=>!s);setExpandEditor(false);}} style={{padding:"4px 10px",background:activeTemplate?C.gold+"22":C.gold+"12",border:`1px solid ${activeTemplate?C.gold+"70":C.gold+"40"}`,color:C.gold,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700}}>{activeTemplate?`✓ ${activeTemplate}`:"Templates"}</button>
          </div>
        </div>

        {/* Templates panel */}
        {showRuleTemplates&&(
          <div style={{background:C.bg,border:`1px solid ${C.bord}`,borderRadius:10,padding:10,marginBottom:10}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:8}}>Tap to apply — switching removes previous template rules:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {Object.keys(RULE_TEMPLATES).map(tpl=>(
                <button key={tpl} onClick={()=>applyTemplate(tpl)} style={{padding:"8px 14px",background:activeTemplate===tpl?C.gold+"35":"transparent",border:`2px solid ${activeTemplate===tpl?C.gold:C.gold+"40"}`,color:C.gold,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700}}>
                  {activeTemplate===tpl?"✓ ":""}{tpl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expanded editor */}
        {expandEditor&&(
          <div style={{background:C.bg,border:`1px solid ${C.blue}35`,borderRadius:12,padding:14,marginBottom:10}}>
            {/* Name + save */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em",marginBottom:6}}>CHECKLIST NAME</div>
              <div style={{display:"flex",gap:6}}>
                <input value={checklistName} onChange={e=>setChecklistName(e.target.value)} placeholder="e.g. My FTMO Rules, SMC List…" style={inp({flex:1,fontSize:14,padding:"10px 14px"})}/>
                <button onClick={saveChecklist} style={{padding:"10px 16px",background:C.blue,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,flexShrink:0}}>Save</button>
              </div>
            </div>
            {/* Saved checklists */}
            {savedChecklists.length>0&&(
              <div style={{marginBottom:12}}>
                <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em",marginBottom:8}}>SAVED CHECKLISTS</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {savedChecklists.map((c:any)=>(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,background:C.surf2,border:`1px solid ${C.bord}`,borderRadius:8,padding:"8px 10px"}}>
                      <button onClick={()=>toggleFavChecklist(c.id)} style={{background:"none",border:"none",color:c.fav?C.gold:C.muted,cursor:"pointer",fontSize:16,padding:0,lineHeight:1,flexShrink:0}}>★</button>
                      <button onClick={()=>loadChecklist(c)} style={{background:"none",border:"none",color:C.txt,cursor:"pointer",fontFamily:"inherit",fontSize:13,padding:0,flex:1,textAlign:"left",fontWeight:600}}>{c.name}</button>
                      <span style={{fontSize:10,color:C.muted}}>{c.rules.length} rules</span>
                      <button onClick={()=>deleteChecklist(c.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,padding:0,lineHeight:1,flexShrink:0}}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Restore hidden defaults */}
            {hiddenRules.length>0&&(
              <div style={{marginBottom:12}}>
                <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em",marginBottom:8}}>HIDDEN DEFAULT RULES</div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {hiddenRules.map((r:string)=>(
                    <div key={r} style={{display:"flex",alignItems:"center",gap:8,background:C.surf2,border:`1px solid ${C.bord}`,borderRadius:8,padding:"7px 10px"}}>
                      <span style={{flex:1,fontSize:12,color:C.muted}}>{r}</span>
                      <button onClick={()=>saveHidden(hiddenRules.filter(x=>x!==r))} style={{background:"none",border:`1px solid ${C.green}40`,color:C.green,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:11,padding:"3px 8px",fontWeight:700}}>Restore</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Bulk add textarea */}
            <div>
              <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em",marginBottom:6}}>ADD RULES (one per line)</div>
              <textarea value={newRule} onChange={e=>setNewRule(e.target.value)} rows={5} placeholder={"Rule 1\nRule 2\nRule 3\n..."} style={inp({resize:"vertical",lineHeight:1.8,fontSize:14,padding:"12px 14px"} as any)}/>
              <button onClick={addBulkRules} style={{width:"100%",padding:"11px",background:C.green+"20",border:`1px solid ${C.green}40`,color:C.green,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,marginTop:6}}>+ Add Rules</button>
            </div>
          </div>
        )}

        {/* Checklist items */}
        {allRules.map(r=>{const checked=(form.rules_followed||[]).includes(r);return(
          <label key={r} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"9px 12px",background:checked?C.green+"15":"#0a0d14",borderRadius:8,border:`1px solid ${checked?C.green+"40":C.bord}`,marginBottom:6}}>
            <input type="checkbox" checked={checked} onChange={e=>set("rules_followed",e.target.checked?[...(form.rules_followed||[]),r]:(form.rules_followed||[]).filter((x: string)=>x!==r))} style={{accentColor:C.green,width:15,height:15}}/>
            <span style={{fontSize:12,color:checked?C.green:C.dim,flex:1}}>{r}</span>
            <button onClick={e=>{e.preventDefault();removeRule(r);}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,padding:"0 4px",lineHeight:1}}>×</button>
          </label>
        );})}

        {/* Quick add (collapsed mode only) */}
        {!expandEditor&&(
          <div style={{display:"flex",gap:6,marginTop:8}}>
            <input value={newRule} onChange={e=>setNewRule(e.target.value)} placeholder="Quick add rule…" style={inp({fontSize:13,padding:"9px 12px"})} onKeyDown={e=>e.key==="Enter"&&addCustomRule()}/>
            <button onClick={addCustomRule} style={{padding:"9px 14px",background:C.green+"18",border:`1px solid ${C.green}40`,color:C.green,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,flexShrink:0}}>+ Add</button>
          </div>
        )}
      </div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>NOTES</div>
        <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} placeholder="Setup context, emotions, what you saw..." style={inp({resize:"vertical",lineHeight:1.6} as any)}/>
      </div>

      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>CHART SCREENSHOT</div>
        <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${C.bord}`,borderRadius:10,padding:14,textAlign:"center",cursor:"pointer",color:C.muted,fontSize:12}}>{form.screenshot?"✅ Screenshot attached":"📸 Tap to upload"}</div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>set("screenshot",(ev.target as any).result);r.readAsDataURL(f);}}/>
        {form.screenshot&&<img src={form.screenshot} alt="chart" style={{width:"100%",borderRadius:8,marginTop:8,border:`1px solid ${C.bord}`}}/>}
      </div>

      {pnlPreview!==null&&(
        <div style={{padding:"13px 16px",borderRadius:10,background:pnlPreview>=0?C.green+"18":C.red+"18",border:`1px solid ${pnlPreview>=0?C.green+"35":C.red+"35"}`,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em"}}>TRADE P&L</div>
            <div style={{display:"flex",gap:4}}>
              {(["$","%"] as const).map(m=><button key={m} onClick={()=>onPnlModeChange(m)} style={{padding:"2px 8px",borderRadius:20,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:pnlMode===m?"#ffffff22":"transparent",color:pnlMode===m?"#fff":C.muted,border:`1px solid ${pnlMode===m?"#ffffff44":C.bord}`}}>{m}</button>)}
            </div>
          </div>
          <div style={{fontSize:24,fontWeight:800,color:pnlPreview>=0?C.green:C.red}}>{pnlMode==="%"&&form.manual_pnl!==""?`${parseFloat(form.manual_pnl)>=0?"+":""}${parseFloat(form.manual_pnl).toFixed(2)}%`:fmtPnl(pnlPreview)}</div>
          {pnlMode==="%"&&form.manual_pnl===""&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>of ${acctBal.toLocaleString()} account</div>}
        </div>
      )}

      {formError&&<div style={{background:C.red+"18",border:`1px solid ${C.red}40`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.red,marginBottom:10}}>{formError}</div>}
      <button onClick={submit} disabled={loading} style={{width:"100%",padding:14,background:loading?C.muted:C.blue,color:"#fff",border:"none",borderRadius:10,cursor:loading?"wait":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700}}>
        {loading?"🤖 Grading...":isEdit?"Save Changes":"Log Trade"}
      </button>
    </div>
  );
}

// ── CSV IMPORT ────────────────────────────────────────────────────────────────
interface ParsedTrade {
  ticker: string;
  direction: 'long' | 'short';
  pnl: number;
  date: string;
  setup: string;
  notes: string;
}

function splitCSV(line: string): string[] {
  const result: string[] = [];
  let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur.trim());
  return result;
}

function normalizeDate(raw: string): string {
  if (!raw) return new Date().toISOString().slice(0, 10);
  const s = raw.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parts = raw.split(/[\/\s]/);
  if (parts.length >= 3) {
    const [m, d, y] = parts;
    if (y && y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return new Date().toISOString().slice(0, 10);
}

function parsePnl(raw: string): number {
  if (!raw) return NaN;
  return parseFloat(raw.replace(/[$,\s]/g, ''));
}

function parseCSV(text: string): { broker: string; trades: ParsedTrade[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { broker: 'Unknown Broker', trades: [] };

  const rawHeaders = splitCSV(lines[0]);
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/[\s_]/g, ''));
  const idx = (names: string[]): number => {
    for (const n of names) { const i = headers.indexOf(n); if (i >= 0) return i; }
    // partial match
    for (const n of names) { const i = headers.findIndex(h => h.includes(n)); if (i >= 0) return i; }
    return -1;
  };

  let broker = 'Unknown Broker';
  let tickerIdx = -1, dirIdx = -1, pnlIdx = -1, dateIdx = -1;
  let setup = 'Import';
  let dirMapper: (v: string) => 'long' | 'short' = v => v.toLowerCase().includes('sell') || v === 'S' || v === 's' ? 'short' : 'long';

  const hasAll = (...names: string[]) => names.every(n => headers.some(h => h === n || h.includes(n)));
  const hasAny = (...names: string[]) => names.some(n => headers.some(h => h === n || h.includes(n)));

  // Webull
  if (hasAny('realizedpl', 'realizedp&l') || (hasAny('filledqty') && hasAny('avgprice'))) {
    broker = 'Webull';
    tickerIdx = idx(['symbol']);
    dirIdx = idx(['side']);
    pnlIdx = idx(['realizedpl', 'realizedp&l', 'netamount']);
    dateIdx = idx(['closedate', 'date', 'ordertime']);
    setup = 'Webull Import';
    dirMapper = v => (v.toLowerCase() === 'buy' || v.toLowerCase() === 'b') ? 'long' : 'short';
  }
  // Robinhood
  else if (hasAny('realizedprofitloss', 'totalprofitloss') || (hasAny('averageprice') && hasAny('quantity'))) {
    broker = 'Robinhood';
    tickerIdx = idx(['symbol']);
    dirIdx = idx(['side']);
    pnlIdx = idx(['realizedprofitloss', 'totalprofitloss', 'netreturn']);
    dateIdx = idx(['activitydate', 'date', 'processdate']);
    setup = 'Robinhood Import';
    dirMapper = v => v.toLowerCase() === 'buy' ? 'long' : 'short';
  }
  // MT4/MT5
  else if (hasAny('openprice') && hasAny('closeprice') && hasAny('profit')) {
    broker = 'MT4/MT5';
    tickerIdx = idx(['symbol']);
    dirIdx = idx(['type']);
    pnlIdx = idx(['profit']);
    dateIdx = idx(['closetime', 'opentime']);
    setup = 'MT4/MT5 Import';
    dirMapper = v => v.toLowerCase().includes('sell') ? 'short' : 'long';
  }
  // Tradovate
  else if ((hasAny('b/s', 'bs')) && hasAny('fillprice', 'price')) {
    broker = 'Tradovate';
    tickerIdx = idx(['symbol']);
    dirIdx = idx(['b/s', 'bs']);
    pnlIdx = idx(['pnl', 'realizedpnl', 'profit']);
    dateIdx = idx(['date', 'filltime', 'timestamp']);
    setup = 'Tradovate Import';
    dirMapper = v => (v.toUpperCase() === 'B') ? 'long' : 'short';
  }
  // Rithmic
  else if ((hasAny('buysells', 'buysell')) && hasAny('closedpnl')) {
    broker = 'Rithmic';
    tickerIdx = idx(['instrument', 'symbol']);
    dirIdx = idx(['buysells', 'buysell']);
    pnlIdx = idx(['closedpnl']);
    dateIdx = idx(['date', 'filltime']);
    setup = 'Rithmic Import';
    dirMapper = v => (v.toUpperCase() === 'B') ? 'long' : 'short';
  }
  // Unknown — best-effort
  else {
    broker = 'Unknown Broker';
    tickerIdx = headers.findIndex(h => !h.includes('date') && !h.includes('pnl') && !h.includes('profit') && !h.includes('price') && !h.includes('qty') && !h.includes('side') && !h.includes('type') && !h.includes('note'));
    dirIdx = headers.findIndex(h => h.includes('side') || h.includes('direction') || h.includes('buysell') || h === 'type');
    pnlIdx = headers.findIndex(h => h.includes('pnl') || h.includes('profit') || h.includes('gain') || h.includes('loss') || h.includes('p&l'));
    dateIdx = headers.findIndex(h => h.includes('date'));
    setup = 'Imported Trade';
  }

  const trades: ParsedTrade[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSV(lines[i]);
    if (cols.length < 2) continue;
    const ticker = (tickerIdx >= 0 ? cols[tickerIdx] : '').replace(/"/g, '').trim().toUpperCase();
    if (!ticker) continue;
    const rawPnl = pnlIdx >= 0 ? cols[pnlIdx] : '';
    const pnl = parsePnl(rawPnl);
    if (isNaN(pnl) || pnl === 0) continue;
    const rawDir = dirIdx >= 0 ? cols[dirIdx] : '';
    const direction = dirMapper(rawDir.replace(/"/g, '').trim());
    const rawDate = dateIdx >= 0 ? cols[dateIdx] : '';
    const date = normalizeDate(rawDate.replace(/"/g, '').trim());
    trades.push({ ticker, direction, pnl, date, setup, notes: '' });
  }

  return { broker, trades };
}

interface ImportModalProps {
  accountId: string;
  onClose: () => void;
  onImported: (count: number) => void;
}

function ImportModal({ accountId, onClose, onImported }: ImportModalProps) {
  const [screen, setScreen] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [broker, setBroker] = useState('');
  const [parsed, setParsed] = useState<ParsedTrade[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      const text = (e.target as any).result as string;
      const result = parseCSV(text);
      setBroker(result.broker);
      setParsed(result.trades);
      setScreen('preview');
    };
    reader.readAsText(file);
  }

  async function doImport() {
    setScreen('importing');
    setImportError('');
    let count = 0;
    try {
      for (const t of parsed) {
        const payload = {
          accountId,
          symbol: t.ticker,
          direction: t.direction,
          entryPrice: 0,
          exitPrice: 0,
          quantity: 1,
          entryDate: `${t.date}T12:00:00Z`,
          exitDate: `${t.date}T12:00:00Z`,
          stopLoss: null,
          manualPnl: t.pnl,
          setup: t.setup,
          session: null,
          mood: null,
          rulesFollowed: [],
          notes: t.notes || null,
          screenshot: null,
          accountType: 'live',
          aiGrade: null,
          aiFeedback: null,
          tags: null,
        };
        await apiCall('POST', '/api/trades', payload);
        count++;
      }
      setImportedCount(count);
      setScreen('done');
      setTimeout(() => { onClose(); onImported(count); }, 1500);
    } catch (e: any) {
      setImportError(e.message || 'Import failed');
      setScreen('preview');
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surf, borderRadius: '20px 20px 0 0', padding: '0 0 40px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 -8px 48px #00000088' }}>
        {/* drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: C.bord, borderRadius: 2 }} />
        </div>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.txt }}>Import Trades</div>
          <button onClick={onClose} style={{ background: '#1c2333', border: `1px solid ${C.bord}`, color: C.muted, width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', flexShrink: 0 }}>×</button>
        </div>

        <div style={{ padding: '0 20px' }}>
          {/* SCREEN 1: UPLOAD */}
          {screen === 'upload' && (
            <div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>Upload a CSV export from your broker</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {['Webull', 'Robinhood', 'MetaTrader 4/5', 'Tradovate', 'Apex / TopstepX'].map(b => (
                  <span key={b} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 20, background: C.blue + '18', color: C.blue, border: `1px solid ${C.blue}35`, fontWeight: 600 }}>{b}</span>
                ))}
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: `2px dashed ${C.bord}`, borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', color: C.muted, marginBottom: 8, background: '#0a0d14' }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.dim }}>Tap to select CSV file</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Supports .csv exports from all major brokers</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}

          {/* SCREEN 2: PREVIEW */}
          {screen === 'preview' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 14px', background: broker === 'Unknown Broker' ? C.gold + '15' : C.green + '15', border: `1px solid ${broker === 'Unknown Broker' ? C.gold + '50' : C.green + '50'}`, borderRadius: 10 }}>
                <span style={{ fontSize: 18 }}>{broker === 'Unknown Broker' ? '⚠️' : '✓'}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: broker === 'Unknown Broker' ? C.gold : C.green }}>Detected: {broker}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{parsed.length} trade{parsed.length !== 1 ? 's' : ''} found</div>
                </div>
              </div>
              {broker === 'Unknown Broker' && (
                <div style={{ fontSize: 11, color: C.gold, background: C.gold + '12', border: `1px solid ${C.gold}30`, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                  Format not recognized. Showing best-effort parse.
                </div>
              )}
              {importError && (
                <div style={{ fontSize: 11, color: C.red, background: C.red + '12', border: `1px solid ${C.red}30`, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                  {importError}
                </div>
              )}
              {parsed.length > 0 ? (
                <div style={{ border: `1px solid ${C.bord}`, borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                  {/* table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.8fr 1fr', background: '#0a0d14', padding: '8px 12px', borderBottom: `1px solid ${C.bord}` }}>
                    {['Date', 'Ticker', 'Dir', 'P&L'].map(h => (
                      <div key={h} style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: '0.1em' }}>{h}</div>
                    ))}
                  </div>
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {parsed.slice(0, 20).map((t, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.8fr 1fr', padding: '8px 12px', borderBottom: i < Math.min(parsed.length, 20) - 1 ? `1px solid ${C.bord}33` : 'none', background: i % 2 === 0 ? 'transparent' : '#0a0d1422' }}>
                        <div style={{ fontSize: 11, color: C.dim }}>{t.date.slice(5)}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.txt }}>{t.ticker}</div>
                        <div>
                          <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: t.direction === 'long' ? C.green + '22' : C.red + '22', color: t.direction === 'long' ? C.green : C.red }}>
                            {t.direction === 'long' ? 'Long' : 'Short'}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: t.pnl >= 0 ? C.green : C.red }}>{t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  {parsed.length > 20 && (
                    <div style={{ padding: '6px 12px', fontSize: 10, color: C.muted, background: '#0a0d14', borderTop: `1px solid ${C.bord}` }}>
                      +{parsed.length - 20} more trades not shown
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted, fontSize: 12, marginBottom: 16 }}>No valid trades found in this file.</div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setParsed([]); setBroker(''); setImportError(''); setScreen('upload'); }} style={{ flex: 1, padding: 13, background: 'transparent', border: `1px solid ${C.bord}`, color: C.muted, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>Cancel</button>
                <button
                  onClick={doImport}
                  disabled={parsed.length === 0}
                  style={{ flex: 2, padding: 13, background: parsed.length === 0 ? C.muted : C.green, color: parsed.length === 0 ? C.bord : '#000', border: 'none', borderRadius: 10, cursor: parsed.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}
                >
                  Import {parsed.length} trade{parsed.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: IMPORTING / DONE */}
          {(screen === 'importing' || screen === 'done') && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              {screen === 'importing' ? (
                <>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.txt }}>Importing trades…</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>Please wait</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 42, marginBottom: 16 }}>✓</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.green }}>{importedCount} trade{importedCount !== 1 ? 's' : ''} imported!</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>Your journal has been updated.</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── JOURNAL ───────────────────────────────────────────────────────────────────
function JournalView({trades,onSave,onDelete,onImport,balance,pnlMode,onPnlModeChange}: {trades:any[],onSave:(t:any)=>void,onDelete:(id:any)=>void,onImport?:()=>void,balance?:number,pnlMode:"$"|"%",onPnlModeChange:(m:"$"|"%")=>void}) {
  const [expandedId,setExpandedId]=useState<any>(null);
  const [editingTrade,setEditingTrade]=useState<any>(null);
  const [filterSymbol,setFilterSymbol]=useState("");
  const [filterDir,setFilterDir]=useState("");
  const [filterSetup,setFilterSetup]=useState("");
  const [showGallery,setShowGallery]=useState(false);
  const acctBal=balance||25000;
  function fmtPnl(v: number){if(pnlMode==="%"){const pct=(v/acctBal)*100;return `${pct>=0?"+":""}${pct.toFixed(2)}%`;}return `${v>=0?"+":""}$${v.toFixed(2)}`;}
  const today=new Date().toISOString().slice(0,10);
  const todayPnl=trades.filter(t=>t.date===today).reduce((s,t)=>s+(t.pnl||0),0);
  const todayCount=trades.filter(t=>t.date===today).length;
  let lossStreak=0;for(const t of trades){if((t.pnl||0)<0)lossStreak++;else break;}
  const filtered=trades.filter(t=>{if(filterSymbol&&!t.instrument.toLowerCase().includes(filterSymbol.toLowerCase()))return false;if(filterDir&&t.direction!==filterDir)return false;if(filterSetup&&t.setup!==filterSetup)return false;return true;});
  const allSymbols=[...new Set(trades.map(t=>t.instrument).filter(Boolean))];
  const allSetupNames=[...new Set(trades.map(t=>t.setup).filter(Boolean))];
  const screenshotTrades=trades.filter(t=>t.screenshot);
  function exportCSV(){
    const hdrs=["Date","Symbol","Direction","Option","Strike","Expiry","Entry","Exit","Contracts","Stop","P&L","Setup","Session","Mood","Rules","Notes","AI Grade","Account Type"];
    const rows=trades.map(t=>[t.date,t.instrument,t.direction,t.option_type||"",t.strike||"",t.option_expiry||"",t.entry,t.exit,t.contracts,t.stop_loss||"",(t.pnl||0).toFixed(2),t.setup||"",t.session||"",t.mood||"",(t.rules_followed||[]).join("; "),(t.notes||"").replace(/"/g,'""'),t.ai_grade||"",t.account_type||""]);
    const csv=[hdrs,...rows].map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`tradeaura_${today}.csv`;a.click();
  }

  if(!trades.length&&!editingTrade)return(
    <div style={{textAlign:"center",padding:"80px 20px",color:C.muted}}>
      <div style={{fontSize:44,marginBottom:12}}>📋</div>
      <div style={{fontSize:13,fontWeight:600}}>No trades yet</div>
      <div style={{fontSize:12,marginTop:6}}>Tap + to log your first trade</div>
      {onImport&&<button onClick={onImport} style={{marginTop:16,padding:"9px 20px",background:"transparent",border:`1px solid ${C.bord}`,color:C.dim,borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>⬆ Import from CSV</button>}
    </div>
  );

  return(
    <div style={{padding:"16px 16px 20px"}}>
      {lossStreak>=3&&(
        <div style={{background:C.red+"22",border:`1px solid ${C.red}50`,borderRadius:10,padding:"12px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>🛑</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.red}}>{lossStreak} LOSSES IN A ROW</div>
            <div style={{fontSize:11,color:C.dim,marginTop:2}}>Step away. Review your last {lossStreak} trades before continuing.</div>
          </div>
        </div>
      )}
      {trades.length>0&&(
        <div style={Object.assign({},CS,{marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"})}>
          <div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em",marginBottom:2}}>TODAY'S P&L</div>
            <div style={{fontSize:22,fontWeight:800,color:todayPnl>=0?C.green:C.red}}>{fmtPnl(todayPnl)}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
            <div style={{display:"flex",gap:4}}>
              {(["$","%"] as const).map(m=><button key={m} onClick={()=>onPnlModeChange(m)} style={{padding:"6px 12px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:32,background:pnlMode===m?C.blue+"33":"transparent",color:pnlMode===m?C.blue:C.muted,border:`1px solid ${pnlMode===m?C.blue+"55":C.bord}`}}>{m}</button>)}
            </div>
            <div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em"}}>TODAY TRADES</div><div style={{fontSize:16,fontWeight:800,color:C.txt,marginTop:2}}>{todayCount}</div></div>
          </div>
        </div>
      )}
      {trades.length>0&&(
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",gap:6,marginBottom:6}}>
            <input value={filterSymbol} onChange={e=>setFilterSymbol(e.target.value)} placeholder="Search symbol…" style={inp({flex:1,fontSize:12,padding:"8px 10px"})}/>
            <select value={filterDir} onChange={e=>setFilterDir(e.target.value)} style={inp({fontSize:12,padding:"8px 10px"})}>
              <option value="">All</option><option>Long</option><option>Short</option>
            </select>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <select value={filterSetup} onChange={e=>setFilterSetup(e.target.value)} style={inp({fontSize:11,padding:"6px 8px",flex:1})}>
              <option value="">All setups</option>{allSetupNames.map(s=><option key={s}>{s}</option>)}
            </select>
            <button onClick={()=>{setFilterSymbol("");setFilterDir("");setFilterSetup("");}} style={{padding:"6px 10px",background:"transparent",border:`1px solid ${C.bord}`,color:C.muted,borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"inherit",flexShrink:0}}>Clear</button>
            {screenshotTrades.length>0&&<button onClick={()=>setShowGallery(s=>!s)} style={{padding:"6px 10px",background:showGallery?C.purp+"22":"transparent",border:`1px solid ${showGallery?C.purp+"60":C.bord}`,color:showGallery?C.purp:C.muted,borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"inherit",flexShrink:0}}>📸 Gallery</button>}
            <button onClick={exportCSV} style={{padding:"6px 10px",background:"transparent",border:`1px solid ${C.bord}`,color:C.muted,borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"inherit",flexShrink:0}}>⬇ CSV</button>
            {onImport&&<button onClick={onImport} style={{padding:"6px 10px",background:"transparent",border:`1px solid ${C.bord}`,color:C.dim,borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"inherit",flexShrink:0}}>⬆ Import</button>}
          </div>
        </div>
      )}
      {showGallery&&screenshotTrades.length>0&&(
        <div style={Object.assign({},CS,{marginBottom:12})}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:10}}>📸 CHART GALLERY ({screenshotTrades.length})</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {screenshotTrades.map(t=>(
              <div key={t.id} onClick={()=>setExpandedId(t.id)} style={{cursor:"pointer"}}>
                <img src={t.screenshot} alt="chart" style={{width:"100%",borderRadius:8,border:`1px solid ${C.bord}`,display:"block"}}/>
                <div style={{fontSize:9,color:C.muted,marginTop:4,textAlign:"center"}}>{t.instrument} · {t.date}</div>
                <div style={{fontSize:10,fontWeight:700,textAlign:"center",color:(t.pnl||0)>=0?C.green:C.red}}>{(t.pnl||0)>=0?"+":""}${(t.pnl||0).toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {(filterSymbol||filterDir||filterSetup)&&<div style={{fontSize:11,color:C.muted,marginBottom:8}}>{filtered.length} of {trades.length} trades</div>}
      {filtered.map(trade=>{
        const pnl=trade.pnl||0,exp=expandedId===trade.id;
        if(editingTrade?.id===trade.id)return(<TradeForm key={trade.id} initial={editingTrade} isEdit balance={balance} pnlMode={pnlMode} onPnlModeChange={onPnlModeChange} onSave={t=>{onSave(t);setEditingTrade(null);}} onCancel={()=>setEditingTrade(null)}/>);
        return(
          <div key={trade.id} style={{background:C.surf,border:`1px solid ${C.bord}`,borderLeft:`3px solid ${pnl>=0?C.green:C.red}`,borderRadius:12,padding:16,marginBottom:10}}>
            <div onClick={()=>setExpandedId(exp?null:trade.id)} style={{cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:15,fontWeight:700,color:"#fff"}}>{trade.instrument}</span>
                  <Tag color={trade.direction==="Long"?C.green:C.red}>{trade.direction}</Tag>
                  {trade.option_type&&<Tag color={trade.option_type==="Call"?C.green:C.red}>{trade.option_type}{trade.strike?` $${trade.strike}`:""}</Tag>}
                  {trade.account_type&&<Tag color={typeColor(trade.account_type)}>{trade.account_type}</Tag>}
                  {trade.ai_grade&&<Tag color={gradeColor(trade.ai_grade)}>{trade.ai_grade}</Tag>}
                </div>
                <div style={{fontSize:18,fontWeight:700,color:pnl>=0?C.green:C.red,flexShrink:0,marginLeft:8}}>{fmtPnl(pnl)}</div>
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:6}}>{trade.date} · {trade.session} · {trade.setup}</div>
            </div>
            {exp&&(
              <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bord}`}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12,marginBottom:10}}>
                  {([["Entry",trade.entry||"—"],["Exit",trade.exit||"—"],["Contracts",trade.contracts],["Stop",trade.stop_loss||"—"],["Mood",trade.mood],["Rules",`${(trade.rules_followed||[]).length} ✓`],...(trade.option_type?[["Strike",trade.strike?`$${trade.strike}`:"—"],["Expiry",trade.option_expiry||"—"]]:[])] as [string,string][]).map(([l,v])=>(<div key={l}><span style={{color:C.muted}}>{l}: </span><span style={{color:C.txt}}>{v}</span></div>))}
                </div>
                {trade.notes&&<div style={{fontSize:12,color:C.dim,fontStyle:"italic",padding:"10px 12px",background:C.bg,borderRadius:8,marginBottom:10}}>"{trade.notes}"</div>}
                {trade.screenshot&&<img src={trade.screenshot} alt="chart" style={{width:"100%",borderRadius:8,marginBottom:10,border:`1px solid ${C.bord}`}}/>}
                {trade.ai_feedback&&(
                  <div style={{background:C.bg,border:`1px solid ${C.bord}`,borderRadius:10,padding:12,marginBottom:10}}>
                    <div style={{fontSize:9,color:C.blue,letterSpacing:"0.1em",marginBottom:8}}>🤖 AI ANALYSIS</div>
                    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                      <div style={{fontSize:28,fontWeight:900,color:gradeColor(trade.ai_feedback.grade)}}>{trade.ai_feedback.grade}</div>
                      <div><div style={{fontSize:12,color:gradeColor(trade.ai_feedback.grade),fontWeight:600}}>{trade.ai_feedback.verdict}</div><div style={{fontSize:10,color:C.muted}}>Score: {trade.ai_feedback.score}/100</div></div>
                    </div>
                    {(trade.ai_feedback.strengths||[]).map((s: string,i: number)=><div key={i} style={{fontSize:11,color:C.green,marginBottom:3}}>✓ {s}</div>)}
                    {(trade.ai_feedback.weaknesses||[]).map((w: string,i: number)=><div key={i} style={{fontSize:11,color:C.red,marginBottom:3}}>✗ {w}</div>)}
                    {trade.ai_feedback.lesson&&<div style={{fontSize:11,color:C.gold,marginTop:8,fontWeight:600}}>💡 {trade.ai_feedback.lesson}</div>}
                  </div>
                )}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setEditingTrade({...trade})} style={{flex:1,padding:"13px 10px",background:C.blue+"20",border:`1px solid ${C.blue}35`,color:C.blue,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>✏️ Edit</button>
                  <button onClick={()=>onDelete(trade.id)} style={{flex:1,padding:"13px 10px",background:C.red+"20",border:`1px solid ${C.red}35`,color:C.red,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>🗑 Delete</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── CALENDAR ──────────────────────────────────────────────────────────────────
function CalendarView({trades}: {trades:any[]}) {
  const [currentMonth,setCurrentMonth]=useState(new Date());
  const [selectedDay,setSelectedDay]=useState<number|null>(null);
  const year=currentMonth.getFullYear(),month=currentMonth.getMonth();
  const monthName=currentMonth.toLocaleString("default",{month:"long",year:"numeric"});
  const dailyMap: Record<string,{pnl:number,trades:any[],wins:number,losses:number}> = {};
  trades.forEach(t=>{if(!dailyMap[t.date])dailyMap[t.date]={pnl:0,trades:[],wins:0,losses:0};dailyMap[t.date].pnl+=t.pnl||0;dailyMap[t.date].trades.push(t);if((t.pnl||0)>0)dailyMap[t.date].wins++;else if((t.pnl||0)<0)dailyMap[t.date].losses++;});
  const firstDay=new Date(year,month,1).getDay(),daysInMonth=new Date(year,month+1,0).getDate();
  const cells: (number|null)[] = [];for(let i=0;i<firstDay;i++)cells.push(null);for(let d=1;d<=daysInMonth;d++)cells.push(d);
  const dateKey=(d: number)=>`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const today=new Date().toISOString().slice(0,10);
  const monthTrades=trades.filter(t=>t.date.startsWith(`${year}-${String(month+1).padStart(2,"0")}`));
  const monthPnl=monthTrades.reduce((s,t)=>s+(t.pnl||0),0);
  const monthWins=monthTrades.filter(t=>(t.pnl||0)>0).length;
  const monthWinRate=monthTrades.length?(monthWins/monthTrades.length*100).toFixed(0):0;
  const greenDays=Object.entries(dailyMap).filter(([d,v])=>d.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)&&v.pnl>0).length;
  const redDays=Object.entries(dailyMap).filter(([d,v])=>d.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)&&v.pnl<0).length;
  const monthDays=Object.entries(dailyMap).filter(([d])=>d.startsWith(`${year}-${String(month+1).padStart(2,"0")}`));
  const bestDay=monthDays.length?monthDays.reduce((a,b)=>a[1].pnl>b[1].pnl?a:b):null;
  const worstDay=monthDays.length?monthDays.reduce((a,b)=>a[1].pnl<b[1].pnl?a:b):null;
  const selectedKey=selectedDay?dateKey(selectedDay):null;
  const selectedData=selectedKey?dailyMap[selectedKey]:null;
  const totalPnl=trades.reduce((s,t)=>s+(t.pnl||0),0);
  const wins=trades.filter(t=>(t.pnl||0)>0);
  const winRate=trades.length?(wins.length/trades.length*100).toFixed(1):0;

  return(
    <div style={{padding:"16px 16px 20px"}}>
      <div style={{background:"linear-gradient(145deg,#19243d,#161b27)",border:`1px solid ${C.bord}`,borderRadius:12,padding:16,marginBottom:12}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",marginBottom:10}}>OVERALL PERFORMANCE</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><div style={{fontSize:9,color:C.muted,marginBottom:4}}>NET P&L</div><div style={{fontSize:22,fontWeight:800,color:totalPnl>=0?C.green:C.red}}>{totalPnl>=0?"+":""}${totalPnl.toFixed(2)}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {[{l:"WIN RATE",v:`${winRate}%`,c:parseFloat(winRate as string)>=50?C.green:C.red},{l:"TRADES",v:trades.length,c:C.txt}].map(s=>(<div key={s.l} style={{background:C.surf,borderRadius:8,padding:"8px 6px",textAlign:"center",border:`1px solid ${C.bord}`}}><div style={{fontSize:7,color:C.muted,letterSpacing:"0.08em",marginBottom:3}}>{s.l}</div><div style={{fontSize:12,fontWeight:700,color:s.c}}>{s.v}</div></div>))}
          </div>
        </div>
      </div>

      <div style={Object.assign({},CS,{marginBottom:12})}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <button onClick={()=>setCurrentMonth(new Date(year,month-1,1))} style={{background:"transparent",border:`1px solid ${C.bord}`,color:C.txt,width:32,height:32,borderRadius:8,cursor:"pointer",fontSize:16}}>‹</button>
          <div style={{fontSize:13,fontWeight:700,color:C.txt}}>{monthName}</div>
          <button onClick={()=>setCurrentMonth(new Date(year,month+1,1))} style={{background:"transparent",border:`1px solid ${C.bord}`,color:C.txt,width:32,height:32,borderRadius:8,cursor:"pointer",fontSize:16}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:12}}>
          {[{l:"MONTH P&L",v:`${monthPnl>=0?"+":""}$${monthPnl.toFixed(0)}`,c:monthPnl>=0?C.green:C.red},{l:"WIN RATE",v:`${monthWinRate}%`,c:parseFloat(monthWinRate as string)>=50?C.green:C.red},{l:"GREEN",v:greenDays,c:C.green},{l:"RED",v:redDays,c:C.red}].map(s=>(<div key={s.l} style={{background:C.bg,borderRadius:8,padding:"8px 4px",textAlign:"center",border:`1px solid ${C.bord}`}}><div style={{fontSize:7,color:C.muted,letterSpacing:"0.06em",marginBottom:3}}>{s.l}</div><div style={{fontSize:13,fontWeight:700,color:s.c}}>{s.v}</div></div>))}
        </div>
        {trades.length===0&&<div style={{textAlign:'center',padding:'32px 0',color:'#6b7280',fontSize:14}}>📅 No trades logged yet — your calendar fills in as you trade.</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:8}}>
          {["S","M","T","W","T","F","S"].map((d,i)=>(<div key={i} style={{textAlign:"center",fontSize:9,color:C.muted,padding:"4px 0",fontWeight:700}}>{d}</div>))}
          {cells.map((d,i)=>{
            if(!d)return <div key={i}/>;
            const key=dateKey(d),data=dailyMap[key],isToday=key===today,isSelected=selectedDay===d,pnl=data?.pnl;
            const bgColor=pnl>0?C.green+"25":pnl<0?C.red+"25":"transparent";
            const borderColor=isSelected?C.blue:isToday?C.gold:pnl>0?C.green+"60":pnl<0?C.red+"60":C.bord;
            return(<div key={i} onClick={()=>setSelectedDay(isSelected?null:d)} style={{textAlign:"center",padding:"6px 2px",borderRadius:6,background:bgColor,border:`1px solid ${borderColor}`,cursor:data?"pointer":"default",minHeight:44,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:12,color:isToday?C.gold:C.txt,fontWeight:isToday?700:400}}>{d}</div>
              {pnl!==undefined&&<div style={{fontSize:9,color:pnl>=0?C.green:C.red,fontWeight:700,marginTop:1}}>{pnl>=0?"+":""}${Math.abs(pnl).toFixed(0)}</div>}
            </div>);
          })}
        </div>
        <div style={{display:"flex",gap:12,fontSize:10,color:C.muted}}>
          <span><span style={{color:C.green}}>■</span> Profit</span>
          <span><span style={{color:C.red}}>■</span> Loss</span>
          <span><span style={{color:C.gold}}>■</span> Today</span>
        </div>
      </div>

      {selectedDay&&selectedData&&(
        <div style={Object.assign({},CS,{marginBottom:12,border:`1px solid ${C.blue}40`})}>
          <div style={{fontSize:10,color:C.blue,letterSpacing:"0.12em",marginBottom:10}}>{new Date(selectedKey!+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[{l:"DAY P&L",v:`${selectedData.pnl>=0?"+":""}$${selectedData.pnl.toFixed(2)}`,c:selectedData.pnl>=0?C.green:C.red},{l:"TRADES",v:selectedData.trades.length,c:C.txt},{l:"W/L",v:`${selectedData.wins}/${selectedData.losses}`,c:C.txt}].map(s=>(<div key={s.l} style={{background:C.bg,borderRadius:8,padding:"10px 8px",textAlign:"center"}}><div style={{fontSize:8,color:C.muted,marginBottom:4}}>{s.l}</div><div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.v}</div></div>))}
          </div>
          {selectedData.trades.map((t: any)=>(<div key={t.id} style={{padding:"10px 12px",background:C.bg,borderRadius:8,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:`3px solid ${(t.pnl||0)>=0?C.green:C.red}`}}><div><div style={{fontSize:13,fontWeight:700,color:C.txt}}>{t.instrument} <span style={{fontSize:10,color:(t.pnl||0)>=0?C.green:C.red}}>{t.direction}</span></div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{t.setup}</div></div><div style={{fontSize:15,fontWeight:700,color:(t.pnl||0)>=0?C.green:C.red}}>{(t.pnl||0)>=0?"+":""}${(t.pnl||0).toFixed(2)}</div></div>))}
        </div>
      )}

      {(bestDay||worstDay)&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {bestDay&&(<div style={Object.assign({},CS,{border:`1px solid ${C.green}30`})}><div style={{fontSize:9,color:C.green,letterSpacing:"0.12em",marginBottom:6}}>🏆 BEST DAY</div><div style={{fontSize:18,fontWeight:800,color:C.green}}>+${bestDay[1].pnl.toFixed(0)}</div><div style={{fontSize:10,color:C.muted,marginTop:4}}>{new Date(bestDay[0]+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div></div>)}
          {worstDay&&(<div style={Object.assign({},CS,{border:`1px solid ${C.red}30`})}><div style={{fontSize:9,color:C.red,letterSpacing:"0.12em",marginBottom:6}}>💀 WORST DAY</div><div style={{fontSize:18,fontWeight:800,color:C.red}}>${worstDay[1].pnl.toFixed(0)}</div><div style={{fontSize:10,color:C.muted,marginTop:4}}>{new Date(worstDay[0]+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div></div>)}
        </div>
      )}
    </div>
  );
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function StatsView({trades,account}: {trades:any[],account?:any}) {
  if(!trades.length)return<div style={{textAlign:"center",padding:"80px 20px",color:C.muted}}><div style={{fontSize:44}}>📊</div><div style={{fontSize:13,fontWeight:600,marginTop:12}}>No data yet</div></div>;
  function calcRR(t: any){const e=parseFloat(t.entry),x=parseFloat(t.exit),sl=parseFloat(t.stop_loss);if(!e||!x||!sl||isNaN(e)||isNaN(x)||isNaN(sl))return null;const risk=Math.abs(e-sl);if(risk===0)return null;const reward=t.direction==="Long"?x-e:e-x;return reward/risk;}
  const allSetupNames=[...new Set([...SETUPS,...trades.map(t=>t.setup).filter(Boolean)])];
  const setupStats=allSetupNames.map(s=>{const st=trades.filter(t=>t.setup===s);const rrs=st.map(calcRR).filter((r): r is number=>r!==null);const avgRR=rrs.length?rrs.reduce((a,b)=>a+b,0)/rrs.length:null;return{name:s,pnl:st.reduce((a,t)=>a+(t.pnl||0),0),count:st.length,wins:st.filter(t=>(t.pnl||0)>0).length,avgRR};}).filter(s=>s.count>0).sort((a,b)=>b.pnl-a.pnl);
  const DAYS=["Mon","Tue","Wed","Thu","Fri"];
  const dayStats=[1,2,3,4,5].map(d=>{const dt=trades.filter(t=>new Date(t.date+"T12:00:00").getDay()===d);const w=dt.filter(t=>(t.pnl||0)>0);return{name:DAYS[d-1],count:dt.length,wins:w.length,pnl:dt.reduce((s,t)=>s+(t.pnl||0),0),wr:dt.length?w.length/dt.length*100:0};}).filter(d=>d.count>0);
  const maxDayPnl=dayStats.length?Math.max(...dayStats.map(d=>Math.abs(d.pnl))):1;

  // Session performance
  const sessionStats=SESSIONS.map(s=>{const st=trades.filter(t=>t.session===s);return{name:s,count:st.length,wins:st.filter(t=>(t.pnl||0)>0).length,pnl:st.reduce((a,t)=>a+(t.pnl||0),0)};}).filter(s=>s.count>0).sort((a,b)=>b.pnl-a.pnl);
  const maxSessionCount=sessionStats.length?Math.max(...sessionStats.map(s=>s.count)):1;

  // Drawdown
  const startBal=account?.starting_balance||25000;
  const sortedTrades=trades.slice().reverse();
  let bal=startBal,peak=startBal,maxDD=0;
  sortedTrades.forEach(t=>{bal+=(t.pnl||0);if(bal>peak)peak=bal;const dd=peak-bal;if(dd>maxDD)maxDD=dd;});
  const currentDD=Math.max(0,peak-bal);
  const maxDDPct=peak>0?(maxDD/peak*100):0;
  const currentDDPct=peak>0?(currentDD/peak*100):0;
  const ddColor=(pct: number)=>pct>5?C.red:pct>=2?C.gold:C.green;

  return(
    <div style={{padding:"16px 16px 20px"}}>
      <div style={Object.assign({},CS,{marginBottom:12})}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>SETUP PERFORMANCE</div>
        {setupStats.map(s=>(<div key={s.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.bord}`}}><div><div style={{fontSize:13,color:C.txt,fontWeight:500}}>{s.name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.count} trades · {s.count?(s.wins/s.count*100).toFixed(0):0}% win{s.avgRR!=null?` · R:R ${s.avgRR>=0?"+":""}${s.avgRR.toFixed(2)}R`:""}</div></div><div style={{fontSize:15,fontWeight:700,color:s.pnl>=0?C.green:C.red}}>{s.pnl>=0?"+":""}${s.pnl.toFixed(0)}</div></div>))}
      </div>

      {sessionStats.length>0&&(
        <div style={Object.assign({},CS,{marginBottom:12})}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>SESSION PERFORMANCE</div>
          {sessionStats.map(s=>(
            <div key={s.name} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div>
                  <span style={{fontSize:13,color:C.txt,fontWeight:500}}>{s.name}</span>
                  <span style={{fontSize:10,color:C.muted,marginLeft:8}}>{s.count} trades · {s.count?(s.wins/s.count*100).toFixed(0):0}% win</span>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:s.pnl>=0?C.green:C.red}}>{s.pnl>=0?"+":""}${s.pnl.toFixed(0)}</span>
              </div>
              <div style={{height:4,background:C.bg,borderRadius:2}}><div style={{height:"100%",width:`${(s.count/maxSessionCount)*100}%`,background:s.pnl>=0?C.green:C.red,borderRadius:2}}/></div>
            </div>
          ))}
        </div>
      )}

      {dayStats.length>0&&(
        <div style={Object.assign({},CS,{marginBottom:12})}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>P&L BY DAY OF WEEK</div>
          {dayStats.map(d=>(
            <div key={d.name} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div><span style={{fontSize:13,color:C.txt,fontWeight:600}}>{d.name}</span><span style={{fontSize:10,color:C.muted,marginLeft:8}}>{d.count} trades · {d.wr.toFixed(0)}% win</span></div>
                <span style={{fontSize:14,fontWeight:700,color:d.pnl>=0?C.green:C.red}}>{d.pnl>=0?"+":""}${d.pnl.toFixed(0)}</span>
              </div>
              <div style={{height:5,background:C.bg,borderRadius:3}}><div style={{height:"100%",width:`${Math.abs(d.pnl)/maxDayPnl*100}%`,background:d.pnl>=0?C.green:C.red,borderRadius:3}}/></div>
            </div>
          ))}
        </div>
      )}

      <div style={Object.assign({},CS,{marginBottom:12})}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>DRAWDOWN</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[{l:"MAX DRAWDOWN",v:`$${maxDD.toFixed(0)}`,pct:maxDDPct},{l:"MAX DD %",v:`${maxDDPct.toFixed(2)}%`,pct:maxDDPct},{l:"CURRENT DD",v:`$${currentDD.toFixed(0)}`,pct:currentDDPct},{l:"CURRENT DD %",v:`${currentDDPct.toFixed(2)}%`,pct:currentDDPct}].map(d=>(
            <div key={d.l} style={{background:C.bg,borderRadius:8,padding:"10px 10px",border:`1px solid ${C.bord}`}}>
              <div style={{fontSize:8,color:C.muted,letterSpacing:"0.08em",marginBottom:4}}>{d.l}</div>
              <div style={{fontSize:15,fontWeight:700,color:ddColor(d.pct)}}>{d.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={Object.assign({},CS,{marginBottom:12})}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>RULES COMPLIANCE</div>
        {[...new Set([...RULES,...trades.flatMap(t=>t.rules_followed||[])])].map(r=>{const pct=trades.length?(trades.filter(t=>(t.rules_followed||[]).includes(r)).length/trades.length*100).toFixed(0):0;const col=parseFloat(pct as string)>=80?C.green:parseFloat(pct as string)>=50?C.gold:C.red;return(<div key={r} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}><span style={{color:C.dim}}>{r}</span><span style={{color:col,fontWeight:600}}>{pct}%</span></div><div style={{height:5,background:C.bg,borderRadius:3}}><div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:3}}/></div></div>);})}
      </div>
      {trades.some(t=>t.ai_grade)&&(<div style={CS}><div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>AI GRADES</div><div style={{display:"flex",gap:8}}>{["A","B","C","D","F"].map(g=>{const count=trades.filter(t=>t.ai_grade===g).length;return(<div key={g} style={{flex:1,textAlign:"center",padding:"10px 0",background:count>0?gradeColor(g)+"15":C.bg,borderRadius:8,border:`1px solid ${count>0?gradeColor(g)+"35":C.bord}`}}><div style={{fontSize:18,fontWeight:800,color:gradeColor(g)}}>{count}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{g}</div></div>);})}</div></div>)}
    </div>
  );
}

// ── PLAYBOOK ──────────────────────────────────────────────────────────────────
function PlaybookView({trades}: {trades:any[]}) {
  const [entries,setEntries]=useState<any[]>(()=>{try{return JSON.parse(localStorage.getItem("playbook")||"[]");}catch(e){console.warn("Failed to parse playbook from localStorage",e);return [];}});
  const [showForm,setShowForm]=useState(false);
  const [formName,setFormName]=useState("");
  const [formDesc,setFormDesc]=useState("");
  const [formRules,setFormRules]=useState("");
  const [formShot,setFormShot]=useState<string|null>(null);
  const [confirmDel,setConfirmDel]=useState<string|null>(null);
  const fileRef2=useRef<HTMLInputElement>(null);

  function save(){
    if(!formName.trim())return;
    const entry={id:makeId(),name:formName.trim(),description:formDesc.trim(),rules:formRules.split("\n").map((r:string)=>r.trim()).filter(Boolean),screenshot:formShot,createdAt:new Date().toISOString()};
    const next=[entry,...entries];
    setEntries(next);localStorage.setItem("playbook",JSON.stringify(next));
    setShowForm(false);setFormName("");setFormDesc("");setFormRules("");setFormShot(null);
  }

  function del(id: string){
    const next=entries.filter((e:any)=>e.id!==id);
    setEntries(next);localStorage.setItem("playbook",JSON.stringify(next));setConfirmDel(null);
  }

  function setupStats(name: string){
    const st=trades.filter(t=>t.setup===name);
    const wins=st.filter(t=>(t.pnl||0)>0);
    const pnl=st.reduce((s:number,t:any)=>s+(t.pnl||0),0);
    return{count:st.length,winRate:st.length?(wins.length/st.length*100).toFixed(0):0,pnl};
  }

  return(
    <div style={{padding:"16px 16px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:800,color:C.txt}}>📖 PLAYBOOK</div>
        <button onClick={()=>setShowForm(s=>!s)} style={{padding:"8px 14px",background:C.blue+"22",border:`1px solid ${C.blue}50`,color:C.blue,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700}}>+ Add Setup</button>
      </div>
      <HowItWorks points={[
        "Add your go-to setups and tag each trade with which one you used.",
        "TradeAura tracks win rate and average R per setup so you know what's actually working.",
      ]}/>

      {showForm&&(
        <div style={Object.assign({},CS,{marginBottom:16,border:`1px solid ${C.blue}30`})}>
          <div style={{fontSize:11,color:C.blue,letterSpacing:"0.12em",marginBottom:12}}>NEW SETUP</div>
          <div style={{marginBottom:10}}><div style={{fontSize:10,color:C.muted,marginBottom:5}}>SETUP NAME</div><input value={formName} onChange={e=>setFormName(e.target.value)} placeholder="e.g. BOS + Retest" style={inp()}/></div>
          <div style={{marginBottom:10}}><div style={{fontSize:10,color:C.muted,marginBottom:5}}>DESCRIPTION</div><textarea value={formDesc} onChange={e=>setFormDesc(e.target.value)} rows={3} placeholder="Describe the setup, when to take it…" style={inp({resize:"vertical",lineHeight:1.6} as any)}/></div>
          <div style={{marginBottom:10}}><div style={{fontSize:10,color:C.muted,marginBottom:5}}>RULES (one per line)</div><textarea value={formRules} onChange={e=>setFormRules(e.target.value)} rows={4} placeholder={"HTF trend aligned\nLiquidity swept\nEntry on retest"} style={inp({resize:"vertical",lineHeight:1.6} as any)}/></div>
          <div style={{marginBottom:14}}><div style={{fontSize:10,color:C.muted,marginBottom:5}}>CHART SCREENSHOT</div><div onClick={()=>fileRef2.current?.click()} style={{border:`2px dashed ${C.bord}`,borderRadius:8,padding:12,textAlign:"center",cursor:"pointer",color:C.muted,fontSize:12}}>{formShot?"✅ Screenshot attached":"📸 Tap to upload"}</div><input ref={fileRef2} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>setFormShot((ev.target as any).result);r.readAsDataURL(f);}}/>{formShot&&<img src={formShot} alt="chart" style={{width:"100%",borderRadius:8,marginTop:8,border:`1px solid ${C.bord}`}}/>}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={{flex:1,padding:12,background:C.blue,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700}}>Save</button>
            <button onClick={()=>setShowForm(false)} style={{padding:"12px 16px",background:"transparent",border:`1px solid ${C.bord}`,color:C.muted,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>Cancel</button>
          </div>
        </div>
      )}

      {entries.length===0&&!showForm&&(
        <div style={{textAlign:"center",padding:"80px 20px",color:C.muted}}>
          <div style={{fontSize:44,marginBottom:12}}>📖</div>
          <div style={{fontSize:13,fontWeight:600}}>No setups yet</div>
          <div style={{fontSize:12,marginTop:6}}>Tap "+ Add Setup" to document your first trading setup</div>
        </div>
      )}

      {entries.map((entry:any)=>{
        const stats=setupStats(entry.name);
        return(
          <div key={entry.id} style={Object.assign({},CS,{marginBottom:12})}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{fontSize:15,fontWeight:700,color:C.txt}}>{entry.name}</div>
              {confirmDel===entry.id
                ?<div style={{display:"flex",gap:6}}>
                    <button onClick={()=>del(entry.id)} style={{padding:"5px 10px",background:C.red+"20",border:`1px solid ${C.red}40`,color:C.red,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>Confirm</button>
                    <button onClick={()=>setConfirmDel(null)} style={{padding:"5px 8px",background:"transparent",border:`1px solid ${C.bord}`,color:C.muted,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>Cancel</button>
                  </div>
                :<button onClick={()=>setConfirmDel(entry.id)} style={{background:"transparent",border:`1px solid ${C.bord}`,color:C.muted,borderRadius:6,cursor:"pointer",fontSize:13,padding:"5px 8px",fontFamily:"inherit"}}>🗑</button>
              }
            </div>
            {stats.count>0&&(
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:C.blue+"18",color:C.blue,fontWeight:600}}>{stats.count} trades</span>
                <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:C.green+"18",color:C.green,fontWeight:600}}>{stats.winRate}% win</span>
                <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:(stats.pnl>=0?C.green:C.red)+"18",color:stats.pnl>=0?C.green:C.red,fontWeight:600}}>{stats.pnl>=0?"+":""}${stats.pnl.toFixed(0)}</span>
              </div>
            )}
            {entry.description&&<div style={{fontSize:12,color:C.dim,lineHeight:1.7,marginBottom:10}}>{entry.description}</div>}
            {entry.rules.length>0&&(
              <div style={{marginBottom:10}}>
                {entry.rules.map((r:string,i:number)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:C.bg,borderRadius:6,marginBottom:4,fontSize:12,color:C.txt}}>
                    <span style={{color:C.green,fontSize:14}}>☐</span>{r}
                  </div>
                ))}
              </div>
            )}
            {entry.screenshot&&<img src={entry.screenshot} alt="chart" style={{width:"100%",borderRadius:8,border:`1px solid ${C.bord}`,marginBottom:8}}/>}
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>Added {new Date(entry.createdAt).toLocaleDateString()}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── REVIEW ────────────────────────────────────────────────────────────────────
function ReviewView({trades}: {trades:any[]}) {
  const [period,setPeriod]=useState("week"),[cs,setCs]=useState(""),[ce,setCe]=useState("");
  const [tab,setTab]=useState("generate"),[review,setReview]=useState<any>(null),[loading,setLoading]=useState(false);
  const [reviewError,setReviewError]=useState<string|null>(null);
  const [copied,setCopied]=useState(false),[paste,setPaste]=useState("");
  const [patterns,setPatterns]=useState<any[]>([]);
  const [aiPatternResult,setAiPatternResult]=useState<any>(null),[aiPatternLoading,setAiPatternLoading]=useState(false);
  useEffect(()=>{setPatterns(computePatterns());},[trades]);

  function getRange(){const n=new Date();if(period==="week"){const d=n.getDay();const s=new Date(n);s.setDate(n.getDate()-(d===0?6:d-1));const e=new Date(s);e.setDate(s.getDate()+6);return{s:s.toISOString().slice(0,10),e:e.toISOString().slice(0,10)};}if(period==="lastweek"){const d=n.getDay();const e=new Date(n);e.setDate(n.getDate()-(d===0?0:d));const s=new Date(e);s.setDate(e.getDate()-6);return{s:s.toISOString().slice(0,10),e:e.toISOString().slice(0,10)};}if(period==="month")return{s:`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-01`,e:n.toISOString().slice(0,10)};if(period==="lastmonth"){const lm=new Date(n.getFullYear(),n.getMonth()-1,1);const lme=new Date(n.getFullYear(),n.getMonth(),0);return{s:lm.toISOString().slice(0,10),e:lme.toISOString().slice(0,10)};}return{s:cs,e:ce};}
  const rng=getRange();
  const ft=trades.filter(t=>t.date>=rng.s&&t.date<=rng.e);
  const fTotal=ft.reduce((s,t)=>s+(t.pnl||0),0);
  function buildReport(ts: any[]){const wins=ts.filter(t=>(t.pnl||0)>0),total=ts.reduce((s,t)=>s+(t.pnl||0),0);const lines=["=== TRADING REPORT ===",`Period: ${rng.s} to ${rng.e}`,`Trades:${ts.length} Wins:${wins.length} Losses:${ts.length-wins.length} P&L:$${total.toFixed(2)}`,`WinRate:${ts.length?(wins.length/ts.length*100).toFixed(1):0}%`,""];ts.forEach((t,i)=>{lines.push(`#${i+1} ${t.date} | ${t.instrument} ${t.direction}`);lines.push(`Entry:${t.entry} Exit:${t.exit} P&L:$${(t.pnl||0).toFixed(2)}`);lines.push(`Setup:${t.setup} Mood:${t.mood}`);lines.push(`Notes:${t.notes||"—"}`);lines.push("");});return lines.join("\n");}

  async function runReview(text: string){setLoading(true);setReview(null);setReviewError(null);try{const result=await callAI(`Professional futures trading coach. Analyze this log with honest feedback.\n\n${text}\n\nJSON only: {"overallGrade":"A-F","overallScore":0,"verdict":"","topStrengths":[""],"criticalWeaknesses":[""],"riskManagement":"","psychologyInsights":"","bestTrade":"","worstTrade":"","actionItems":[""],"nextPeriodGoals":[""],"coachMessage":""}`,2000);setReview(result);setTab("result");}catch(e:any){setReviewError(e?.message||"AI analysis failed. Please try again.");}setLoading(false);}

  function computePatterns(){
    if(!trades.length)return[];
    const winRate=(ts:any[])=>ts.length?ts.filter(t=>(t.pnl||0)>0).length/ts.length*100:0;
    const sessions=[...new Set(trades.map(t=>t.session).filter(Boolean))];
    const sessionWR=sessions.map(s=>{const st=trades.filter(t=>t.session===s);return{name:s,wr:winRate(st),count:st.length};});
    const bestSess=sessionWR.sort((a,b)=>b.wr-a.wr)[0];
    const worstSess=[...sessionWR].sort((a,b)=>a.wr-b.wr)[0];
    const moods=[...new Set(trades.map(t=>t.mood).filter(Boolean))];
    const moodWR=moods.map(m=>{const mt=trades.filter(t=>t.mood===m);return{name:m,wr:winRate(mt),count:mt.length};});
    const bestMood=moodWR.sort((a,b)=>b.wr-a.wr)[0];
    const worstMood=[...moodWR].sort((a,b)=>a.wr-b.wr)[0];
    const setups=[...new Set(trades.map(t=>t.setup).filter(Boolean))];
    const setupWR=setups.map(s=>{const st=trades.filter(t=>t.setup===s);return{name:s,wr:winRate(st),count:st.length};}).filter(s=>s.count>=2);
    const bestSetup=setupWR.sort((a,b)=>b.wr-a.wr)[0];
    const followed=trades.filter(t=>(t.rules_followed||[]).length>0&&(t.rules_followed||[]).length>=(t.rules_followed||[]).length);
    const allFollowed=trades.filter(t=>{const rules=t.rules_followed||[];return rules.length>=3;});
    const notFollowed=trades.filter(t=>{const rules=t.rules_followed||[];return rules.length<2;});
    const avgPnlFollowed=allFollowed.length?allFollowed.reduce((s:number,t:any)=>s+(t.pnl||0),0)/allFollowed.length:0;
    const avgPnlNotFollowed=notFollowed.length?notFollowed.reduce((s:number,t:any)=>s+(t.pnl||0),0)/notFollowed.length:0;
    const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dowStats=days.map((d,i)=>{const dt=trades.filter(t=>{const day=new Date(t.date+"T12:00:00").getDay();return day===i;});return{day:d,wr:winRate(dt),count:dt.length,pnl:dt.reduce((s:number,t:any)=>s+(t.pnl||0),0)};}).filter(d=>d.count>0).sort((a,b)=>b.wr-a.wr);
    const bestDay=dowStats[0],worstDay=dowStats[dowStats.length-1];
    const result:any[]=[];
    if(bestSess)result.push({label:"Best Session",insight:`${bestSess.name} has your highest win rate at ${bestSess.wr.toFixed(0)}% over ${bestSess.count} trades`,color:C.green});
    if(worstSess&&worstSess.name!==bestSess?.name)result.push({label:"Worst Session",insight:`${worstSess.name} is dragging you down at ${worstSess.wr.toFixed(0)}% win rate — consider reducing size`,color:C.red});
    if(bestMood)result.push({label:"Best Mood",insight:`You trade best when ${bestMood.name} — ${bestMood.wr.toFixed(0)}% win rate`,color:C.green});
    if(worstMood&&worstMood.name!==bestMood?.name)result.push({label:"Worst Mood",insight:`Avoid trading when ${worstMood.name} — only ${worstMood.wr.toFixed(0)}% win rate`,color:C.red});
    if(bestSetup)result.push({label:"Best Setup",insight:`${bestSetup.name} wins ${bestSetup.wr.toFixed(0)}% of the time (${bestSetup.count} trades) — focus here`,color:C.green});
    if(allFollowed.length>0||notFollowed.length>0)result.push({label:"Rules Discipline",insight:`Avg P&L with 3+ rules: $${avgPnlFollowed.toFixed(0)} vs <2 rules: $${avgPnlNotFollowed.toFixed(0)}`,color:avgPnlFollowed>avgPnlNotFollowed?C.green:C.gold});
    if(bestDay)result.push({label:"Best Day of Week",insight:`${bestDay.day} is your strongest day at ${bestDay.wr.toFixed(0)}% win rate`,color:C.green});
    if(worstDay&&worstDay.day!==bestDay?.day)result.push({label:"Worst Day of Week",insight:`${worstDay.day} is your weakest — ${worstDay.wr.toFixed(0)}% win rate, consider fewer trades`,color:C.red});
    return result;
  }

  async function runAiPatternAnalysis(){
    const pts=computePatterns();
    if(!pts.length)return;
    setAiPatternLoading(true);setAiPatternResult(null);
    const summary=pts.map(p=>`${p.label}: ${p.insight}`).join("\n");
    try{
      const result=await callAI(`You are an elite trading coach. Based on these trading patterns, give actionable insights.\n\n${summary}\n\nJSON: {"insights":["..."],"topPattern":"","biggestWeakness":"","weeklyGoal":"","coachNote":""}`,1200);
      setAiPatternResult(result);
    }catch(e:any){setAiPatternResult({_error:e?.message||"AI analysis failed. Please try again."});}
    setAiPatternLoading(false);
  }

  const todayDow=new Date().getDay();

  return(
    <div style={{padding:"16px 16px 20px"}}>
      <HowItWorks points={[
        "AI scans your recent trades to detect patterns — overtrading, revenge trading, session bias.",
        "Get a performance score and specific rules to tighten up your edge.",
      ]}/>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>{[{id:"generate",l:"Generate"},{id:"paste",l:"Paste"},{id:"patterns",l:"Patterns"},{id:"result",l:"Results"}].map(t=><Pill key={t.id} active={tab===t.id} color={C.purp} onClick={()=>{setTab(t.id);if(t.id==="patterns")setPatterns(computePatterns());setReviewError(null);}}>{t.l}</Pill>)}</div>
      {reviewError&&<div style={{background:C.red+"18",border:`1px solid ${C.red}40`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.red,marginBottom:14}}>{reviewError}</div>}
      {tab==="generate"&&(<div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>{[{id:"week",l:"This Week"},{id:"lastweek",l:"Last Week"},{id:"month",l:"This Month"},{id:"lastmonth",l:"Last Month"},{id:"custom",l:"Custom"}].map(p=><Pill key={p.id} active={period===p.id} color={C.purp} onClick={()=>setPeriod(p.id)}>{p.l}</Pill>)}</div>
        {period==="custom"&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}><div><div style={{fontSize:9,color:C.muted,marginBottom:6}}>FROM</div><input type="date" value={cs} onChange={e=>setCs(e.target.value)} style={inp()}/></div><div><div style={{fontSize:9,color:C.muted,marginBottom:6}}>TO</div><input type="date" value={ce} onChange={e=>setCe(e.target.value)} style={inp()}/></div></div>)}

        {/* Weekly Report banner */}
        <div style={Object.assign({},CS,{marginBottom:14,border:`1px solid ${todayDow===0?C.gold+"60":C.bord}`})}>
          <div style={{fontSize:9,color:todayDow===0?C.gold:C.muted,letterSpacing:"0.12em",marginBottom:8}}>📅 WEEKLY REPORT</div>
          {todayDow===0?(
            <div>
              <div style={{fontSize:12,color:C.txt,marginBottom:10}}>It's Sunday! Generate your weekly review now.</div>
              <button onClick={()=>{setPeriod("week");const wt=trades.filter(t=>{const n=new Date();const d=n.getDay();const s=new Date(n);s.setDate(n.getDate()-(d===0?6:d-1));const eDate=new Date(s);eDate.setDate(s.getDate()+6);const sStr=s.toISOString().slice(0,10),eStr=eDate.toISOString().slice(0,10);return t.date>=sStr&&t.date<=eStr;});if(wt.length){const n=new Date();const d=n.getDay();const s=new Date(n);s.setDate(n.getDate()-(d===0?6:d-1));const eDate=new Date(s);eDate.setDate(s.getDate()+6);const sStr=s.toISOString().slice(0,10),eStr=eDate.toISOString().slice(0,10);const wins=wt.filter(t=>(t.pnl||0)>0),total=wt.reduce((s:number,t:any)=>s+(t.pnl||0),0);const lines=["=== TRADING REPORT ===",`Period: ${sStr} to ${eStr}`,`Trades:${wt.length} Wins:${wins.length} Losses:${wt.length-wins.length} P&L:$${total.toFixed(2)}`,`WinRate:${wt.length?(wins.length/wt.length*100).toFixed(1):0}%`,""];wt.forEach((t:any,i:number)=>{lines.push(`#${i+1} ${t.date} | ${t.instrument} ${t.direction}`);lines.push(`Entry:${t.entry} Exit:${t.exit} P&L:$${(t.pnl||0).toFixed(2)}`);lines.push(`Setup:${t.setup} Mood:${t.mood}`);lines.push(`Notes:${t.notes||"—"}`);lines.push("");});runReview(lines.join("\n"));}}} style={{width:"100%",padding:12,background:C.gold,color:"#000",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:800}}>🏆 Generate This Week's Report</button>
            </div>
          ):(
            <button onClick={()=>{setPeriod("week");const n=new Date();const d=n.getDay();const s=new Date(n);s.setDate(n.getDate()-(d===0?6:d-1));const eDate=new Date(s);eDate.setDate(s.getDate()+6);const sStr=s.toISOString().slice(0,10),eStr=eDate.toISOString().slice(0,10);const wt=trades.filter(t=>t.date>=sStr&&t.date<=eStr);if(wt.length){const wins=wt.filter(t=>(t.pnl||0)>0),total=wt.reduce((s:number,t:any)=>s+(t.pnl||0),0);const lines=["=== TRADING REPORT ===",`Period: ${sStr} to ${eStr}`,`Trades:${wt.length} Wins:${wins.length} Losses:${wt.length-wins.length} P&L:$${total.toFixed(2)}`,`WinRate:${wt.length?(wins.length/wt.length*100).toFixed(1):0}%`,""];wt.forEach((t:any,i:number)=>{lines.push(`#${i+1} ${t.date} | ${t.instrument} ${t.direction}`);lines.push(`Entry:${t.entry} Exit:${t.exit} P&L:$${(t.pnl||0).toFixed(2)}`);lines.push(`Setup:${t.setup} Mood:${t.mood}`);lines.push(`Notes:${t.notes||"—"}`);lines.push("");});runReview(lines.join("\n"));}}} style={{width:"100%",padding:10,background:"transparent",border:`1px solid ${C.purp}40`,color:C.purp,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>📅 Generate Week Report</button>
          )}
        </div>

        {ft.length>0?(<div><div style={Object.assign({},CS,{marginBottom:12})}><div style={{fontSize:11,color:C.purp,marginBottom:6}}>{rng.s} → {rng.e} · {ft.length} trades</div><div style={{fontSize:20,fontWeight:800,color:fTotal>=0?C.green:C.red}}>{fTotal>=0?"+":""}${fTotal.toFixed(2)}</div></div><div style={{display:"flex",gap:8}}><button onClick={()=>{navigator.clipboard.writeText(buildReport(ft)).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}} style={{flex:1,padding:12,background:copied?C.green+"20":C.blue+"20",color:copied?C.green:C.blue,border:`1px solid ${copied?C.green+"35":C.blue+"35"}`,borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>{copied?"✓ Copied!":"📋 Copy Log"}</button><button onClick={()=>runReview(buildReport(ft))} disabled={loading} style={{flex:1,padding:12,background:C.purp+"20",color:C.purp,border:`1px solid ${C.purp}35`,borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>{loading?"Analyzing…":"🤖 AI Critique"}</button></div></div>):(<div style={{textAlign:"center",padding:40,color:C.muted}}><div style={{fontSize:32}}>📭</div><div style={{marginTop:10,fontSize:12}}>No trades in this period</div></div>)}
      </div>)}
      {tab==="paste"&&(<div><div style={{fontSize:12,color:C.muted,marginBottom:12,lineHeight:1.7}}>Paste your trade log or notes for an AI coaching critique.</div><textarea value={paste} onChange={e=>setPaste(e.target.value)} rows={10} placeholder="Paste trade log or notes here…" style={inp({resize:"vertical",lineHeight:1.6,marginBottom:10} as any)}/><button onClick={()=>runReview(paste)} disabled={loading||!paste.trim()} style={{width:"100%",padding:13,background:loading||!paste.trim()?C.bord:C.purp,color:loading||!paste.trim()?C.muted:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700}}>{loading?"Analyzing…":"🤖 Get AI Critique"}</button></div>)}
      {tab==="patterns"&&(
        <div>
          {!trades.length?(<div style={{textAlign:"center",padding:60,color:C.muted}}><div style={{fontSize:40}}>🔍</div><div style={{marginTop:12,fontSize:12}}>No trades to analyze</div></div>):(
            <div>
              {patterns.map((p:any,i:number)=>(
                <div key={i} style={{background:C.surf,border:`1px solid ${p.color}30`,borderLeft:`3px solid ${p.color}`,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
                  <div style={{fontSize:9,color:p.color,letterSpacing:"0.12em",marginBottom:4}}>{p.label.toUpperCase()}</div>
                  <div style={{fontSize:12,color:C.txt,lineHeight:1.6}}>{p.insight}</div>
                </div>
              ))}
              <button onClick={runAiPatternAnalysis} disabled={aiPatternLoading} style={{width:"100%",padding:13,background:aiPatternLoading?C.muted:C.purp,color:"#fff",border:"none",borderRadius:10,cursor:aiPatternLoading?"wait":"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,marginTop:8}}>
                {aiPatternLoading?"🤖 Analyzing…":"🤖 AI Deep Analysis"}
              </button>
              {aiPatternResult&&(
                <div style={Object.assign({},CS,{marginTop:12,border:`1px solid ${C.purp}25`})}>
                  <div style={{fontSize:9,color:C.purp,letterSpacing:"0.12em",marginBottom:10}}>🤖 AI COACH INSIGHTS</div>
                  {(aiPatternResult.insights||[]).map((ins:string,i:number)=><div key={i} style={{fontSize:12,color:C.txt,marginBottom:8,lineHeight:1.6}}>· {ins}</div>)}
                  {aiPatternResult.topPattern&&<div style={{fontSize:11,color:C.green,marginTop:8,fontWeight:600}}>🏆 Top Pattern: {aiPatternResult.topPattern}</div>}
                  {aiPatternResult.biggestWeakness&&<div style={{fontSize:11,color:C.red,marginTop:6,fontWeight:600}}>⚠ Weakness: {aiPatternResult.biggestWeakness}</div>}
                  {aiPatternResult.weeklyGoal&&<div style={{fontSize:11,color:C.gold,marginTop:6,fontWeight:600}}>🎯 Goal: {aiPatternResult.weeklyGoal}</div>}
                  {aiPatternResult.coachNote&&<div style={{fontSize:11,color:C.dim,marginTop:8,fontStyle:"italic"}}>"{aiPatternResult.coachNote}"</div>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {tab==="result"&&(loading?<div style={{textAlign:"center",padding:60,color:C.purp,fontSize:13}}>🤖 Analyzing your trades…</div>:review?<ReviewResult review={review}/>:<div style={{textAlign:"center",padding:60,color:C.muted}}><div style={{fontSize:40}}>🤖</div><div style={{marginTop:12,fontSize:12}}>No review yet</div></div>)}
    </div>
  );
}

function ReviewResult({review:r}: {review:any}){
  const gc=gradeColor(r.overallGrade);
  return(<div>
    <div style={Object.assign({},CS,{marginBottom:12,textAlign:"center"})}><div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:8}}>OVERALL GRADE</div><div style={{fontSize:52,fontWeight:900,color:gc,lineHeight:1}}>{r.overallGrade}</div><div style={{fontSize:13,color:C.txt,marginTop:8,fontWeight:500}}>{r.verdict}</div><div style={{fontSize:11,color:C.muted,marginTop:4}}>{r.overallScore}/100</div></div>
    <div style={{background:"#0d1020",border:`1px solid ${C.purp}25`,borderRadius:12,padding:16,marginBottom:10}}><div style={{fontSize:9,color:C.purp,letterSpacing:"0.12em",marginBottom:8}}>💬 COACH SAYS</div><div style={{fontSize:12,color:C.txt,lineHeight:1.8,fontStyle:"italic"}}>"{r.coachMessage}"</div></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
      <div style={Object.assign({},CS,{border:`1px solid ${C.green}25`})}><div style={{fontSize:9,color:C.green,letterSpacing:"0.1em",marginBottom:8}}>✓ STRENGTHS</div>{(r.topStrengths||[]).map((s: string,i: number)=><div key={i} style={{fontSize:11,color:C.txt,marginBottom:5,lineHeight:1.5}}>· {s}</div>)}</div>
      <div style={Object.assign({},CS,{border:`1px solid ${C.red}25`})}><div style={{fontSize:9,color:C.red,letterSpacing:"0.1em",marginBottom:8}}>✗ WEAKNESSES</div>{(r.criticalWeaknesses||[]).map((w: string,i: number)=><div key={i} style={{fontSize:11,color:C.txt,marginBottom:5,lineHeight:1.5}}>· {w}</div>)}</div>
    </div>
    {(r.actionItems||[]).length>0&&(<div style={{background:"#0a0f1a",border:`1px solid ${C.blue}20`,borderRadius:12,padding:16,marginBottom:10}}><div style={{fontSize:9,color:C.blue,letterSpacing:"0.12em",marginBottom:10}}>⚡ ACTION ITEMS</div>{r.actionItems.map((a: string,i: number)=><div key={i} style={{display:"flex",gap:10,marginBottom:8}}><span style={{color:C.blue,fontSize:12,fontWeight:700,minWidth:18}}>{i+1}.</span><span style={{fontSize:12,color:C.txt,lineHeight:1.6}}>{a}</span></div>)}</div>)}
    {(r.nextPeriodGoals||[]).length>0&&(<div style={CS}><div style={{fontSize:9,color:C.gold,letterSpacing:"0.12em",marginBottom:10}}>🎯 GOALS</div>{r.nextPeriodGoals.map((g: string,i: number)=><div key={i} style={{fontSize:12,color:C.txt,marginBottom:6}}>☐ {g}</div>)}</div>)}
  </div>);
}

// ── AI VIEW ──────────────────────────────────────────────────────────────────
function AIView({trades,apiCall:apiFn}: {trades:any[],apiCall:any}) {
  const [tab,setTab]=useState("prep");
  const [prep,setPrep]=useState<any>(null),[prepLoading,setPrepLoading]=useState(false),[prepDate,setPrepDate]=useState("");
  const [marketCtx,setMarketCtx]=useState<any>(null);
  const [chatMsgs,setChatMsgs]=useState<{role:string,content:any,imgUrl?:string}[]>([]);
  const [chatInput,setChatInput]=useState(""),[chatLoading,setChatLoading]=useState(false);
  const [pendingImg,setPendingImg]=useState<{data:string,mimeType:string}|null>(null);
  const chatEndRef=useRef<any>(null);
  const fileInputRef=useRef<HTMLInputElement>(null);
  const systemCtxRef=useRef<{role:string,content:any}[]>([]);
  const [patterns,setPatterns]=useState<any[]>([]),[aiPR,setAiPR]=useState<any>(null),[aiPL,setAiPL]=useState(false);
  const [weekReview,setWeekReview]=useState<any>(null),[weekLoading,setWeekLoading]=useState(false);

  async function fetchMarketContext(){
    try{const ctx=await apiFn("GET","/api/ai/market-context");setMarketCtx(ctx);return ctx;}catch(e){return null;}
  }

  function resizeImage(file:File):Promise<{data:string,mimeType:string}>{
    return new Promise(resolve=>{
      const img=new Image();
      const url=URL.createObjectURL(file);
      img.onload=()=>{
        URL.revokeObjectURL(url);
        const MAX=1024;
        let {width,height}=img;
        if(width>MAX||height>MAX){if(width>height){height=Math.round(height*MAX/width);width=MAX;}else{width=Math.round(width*MAX/height);height=MAX;}}
        const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
        const ctx2=canvas.getContext("2d")!;ctx2.drawImage(img,0,0,width,height);
        const dataUrl=canvas.toDataURL("image/jpeg",0.85);
        resolve({data:dataUrl.split(",")[1],mimeType:"image/jpeg"});
      };
      img.src=url;
    });
  }

  async function generatePrep(){
    setPrepLoading(true);setPrep(null);
    const ctx=marketCtx||await fetchMarketContext();
    const today=new Date();
    const dayName=ctx?.dayName||today.toLocaleDateString("en-US",{weekday:"long"});
    const dateStr=ctx?.date||today.toISOString().slice(0,10);
    const timeET=ctx?.timeET||"";
    const recent=trades.slice(0,20);
    const recentPnl=recent.reduce((s,t)=>s+(t.pnl||0),0);
    const favSetups=[...new Set(recent.map(t=>t.setup).filter(Boolean))].slice(0,3).join(", ")||"various";
    const favSessions=[...new Set(recent.map(t=>t.session).filter(Boolean))].slice(0,2).join(", ")||"New York";
    const favInstruments=[...new Set(recent.map(t=>t.instrument).filter(Boolean))].slice(0,3).join(", ")||"futures";
    const wr=recent.length?(recent.filter(t=>(t.pnl||0)>0).length/recent.length*100).toFixed(0):0;
    const priceBlock=ctx?.hasPrices&&ctx.prices?.length
      ?`\n\nLIVE PRICE DATA (last trading day OHLC):\n${ctx.prices.map((p:any)=>`${p.symbol}: O=${p.lastOpen} H=${p.lastHigh} L=${p.lastLow} last=${p.lastClose} prevClose=${p.prevClose} (${p.changePct>0?"+":""}${p.changePct}%)`).join("\n")}`
      :"";
    const newsBlock=ctx?.hasNews
      ?`\n\nLIVE NEWS HEADLINES:\n${ctx.headlines.map((h:any)=>`- ${h.title} [${h.source}]`).join("\n")}`
      :"";
    const prompt=`You are an elite trading coach with access to today's live market data. Generate a morning market prep briefing.\nToday: ${dayName}, ${dateStr}${timeET?` at ${timeET} ET`:""}${priceBlock}${newsBlock}\nTrader: trades ${favInstruments} | sessions: ${favSessions} | setups: ${favSetups}\nRecent P&L (last 20 trades): $${recentPnl.toFixed(0)} | win rate: ${wr}%\n\nUse the live price data and headlines above. Reference actual price levels in your key levels section. JSON only: {"marketContext":"","keyLevels":[{"level":"","significance":""}],"tradingPlan":"","riskReminders":[""],"newsToWatch":[""],"mindset":"","sessionFocus":""}`;
    try{const r=await apiFn("POST","/api/ai/grade",{prompt,maxTokens:1000});setPrep(r);setPrepDate(dateStr);}catch(e:any){setPrep({_error:e?.message||"Failed to generate prep. Try again."});}
    setPrepLoading(false);
  }

  async function sendChat(){
    if(!chatInput.trim()&&!pendingImg)return;
    const imgUrl=pendingImg?`data:${pendingImg.mimeType};base64,${pendingImg.data}`:undefined;
    const msgContent=pendingImg
      ?[{type:"image",source:{type:"base64",media_type:pendingImg.mimeType,data:pendingImg.data}},{type:"text",text:chatInput||"Analyze this chart"}]
      :chatInput;
    const userMsg:{role:string,content:any,imgUrl?:string}={role:"user",content:msgContent,imgUrl};
    setPendingImg(null);
    // Ensure market context is loaded
    let ctx=marketCtx;
    if(!ctx){ctx=await fetchMarketContext();}
    // Build system context once per conversation (news + prices + prep if available)
    if(!systemCtxRef.current.length){
      const parts:string[]=[];
      const dateHeader=`Today is ${ctx?.dayName||""}, ${ctx?.date||""} at ${ctx?.timeET||""} ET.`;
      parts.push(dateHeader);
      if(ctx?.hasPrices&&ctx.prices?.length){
        const priceLines=ctx.prices.map((p:any)=>`${p.symbol}: O=${p.lastOpen} H=${p.lastHigh} L=${p.lastLow} last=${p.lastClose} prevClose=${p.prevClose} (${p.changePct>0?"+":""}${p.changePct}%)`);
        parts.push(`LIVE PRICE DATA (last trading session OHLC):\n${priceLines.join("\n")}`);
      }
      if(ctx?.hasNews){
        parts.push(`LIVE MARKET HEADLINES:\n${ctx.headlines.slice(0,8).map((h:any)=>`- ${h.title} [${h.source}]`).join("\n")}`);
      }
      if(prep){
        parts.push(`TODAY'S MARKET PREP:\nContext: ${prep.marketContext||""}\nPlan: ${prep.tradingPlan||""}\nKey Levels: ${(prep.keyLevels||[]).map((l:any)=>`${l.level} (${l.significance})`).join(", ")}\nRisk: ${(prep.riskReminders||[]).join("; ")}\nNews to Watch: ${(prep.newsToWatch||[]).join(", ")}`);
      }
      const prepNote=prep?" and your morning prep":"";
      systemCtxRef.current=[
        {role:"user",content:`[MARKET CONTEXT]\n${parts.join("\n\n")}`},
        {role:"assistant",content:`Got it — I have today's live price data${prepNote} loaded. I can answer questions about specific levels, previous day highs/lows, and current market conditions. What do you want to know?`}
      ];
    }
    const apiMsgs=[...systemCtxRef.current,...chatMsgs.map(({role,content})=>({role,content})),{role:userMsg.role,content:userMsg.content}];
    setChatMsgs(prev=>[...prev,userMsg]);setChatInput("");setChatLoading(true);
    try{const data=await apiFn("POST","/api/ai/chat",{messages:apiMsgs});setChatMsgs(prev=>[...prev,{role:"assistant",content:data.reply}]);}catch(e:any){setChatMsgs(prev=>[...prev,{role:"assistant",content:`Error: ${e?.message||"Failed to get response. Please try again."}`}]);}
    setChatLoading(false);
    setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:"smooth"}),100);
  }

  function clearChat(){setChatMsgs([]);systemCtxRef.current=[];}

  function computePatterns(){
    if(!trades.length)return[];
    const wr=(ts:any[])=>ts.length?ts.filter(t=>(t.pnl||0)>0).length/ts.length*100:0;
    const sessions=[...new Set(trades.map(t=>t.session).filter(Boolean))];
    const sessWR=sessions.map(s=>{const st=trades.filter(t=>t.session===s);return{name:s,wr:wr(st),count:st.length};});
    const bSess=sessWR.sort((a,b)=>b.wr-a.wr)[0],wSess=[...sessWR].sort((a,b)=>a.wr-b.wr)[0];
    const moods=[...new Set(trades.map(t=>t.mood).filter(Boolean))];
    const moodWR=moods.map(m=>{const mt=trades.filter(t=>t.mood===m);return{name:m,wr:wr(mt),count:mt.length};});
    const bMood=moodWR.sort((a,b)=>b.wr-a.wr)[0],wMood=[...moodWR].sort((a,b)=>a.wr-b.wr)[0];
    const setups=[...new Set(trades.map(t=>t.setup).filter(Boolean))];
    const setupWR=setups.map(s=>{const st=trades.filter(t=>t.setup===s);return{name:s,wr:wr(st),count:st.length};}).filter(s=>s.count>=2);
    const bSetup=setupWR.sort((a,b)=>b.wr-a.wr)[0];
    const withRules=trades.filter(t=>(t.rules_followed||[]).length>=3);
    const noRules=trades.filter(t=>(t.rules_followed||[]).length<2);
    const avgW=withRules.length?withRules.reduce((s:number,t:any)=>s+(t.pnl||0),0)/withRules.length:0;
    const avgN=noRules.length?noRules.reduce((s:number,t:any)=>s+(t.pnl||0),0)/noRules.length:0;
    const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dowStats=days.map((d,i)=>{const dt=trades.filter(t=>new Date(t.date+"T12:00:00").getDay()===i);return{day:d,wr:wr(dt),count:dt.length};}).filter(d=>d.count>0).sort((a,b)=>b.wr-a.wr);
    const bDay=dowStats[0],wDay=dowStats[dowStats.length-1];
    const result:any[]=[];
    if(bSess)result.push({label:"Best Session",insight:`${bSess.name} has your highest win rate at ${bSess.wr.toFixed(0)}% over ${bSess.count} trades`,color:C.green});
    if(wSess&&wSess.name!==bSess?.name)result.push({label:"Worst Session",insight:`${wSess.name} is dragging you at ${wSess.wr.toFixed(0)}% win rate — reduce size`,color:C.red});
    if(bMood)result.push({label:"Best Mood",insight:`You trade best when ${bMood.name} — ${bMood.wr.toFixed(0)}% win rate`,color:C.green});
    if(wMood&&wMood.name!==bMood?.name)result.push({label:"Worst Mood",insight:`Avoid trading when ${wMood.name} — only ${wMood.wr.toFixed(0)}% win rate`,color:C.red});
    if(bSetup)result.push({label:"Best Setup",insight:`${bSetup.name} wins ${bSetup.wr.toFixed(0)}% (${bSetup.count} trades) — focus here`,color:C.green});
    if(withRules.length>0||noRules.length>0)result.push({label:"Rules Discipline",insight:`Avg P&L 3+ rules: $${avgW.toFixed(0)} vs <2 rules: $${avgN.toFixed(0)}`,color:avgW>avgN?C.green:C.gold});
    if(bDay)result.push({label:"Best Day of Week",insight:`${bDay.day} is your strongest at ${bDay.wr.toFixed(0)}% win rate`,color:C.green});
    if(wDay&&wDay.day!==bDay?.day)result.push({label:"Worst Day of Week",insight:`${wDay.day} is your weakest — ${wDay.wr.toFixed(0)}% win rate`,color:C.red});
    return result;
  }

  async function runAiPatterns(){
    const pts=computePatterns();if(!pts.length)return;
    setAiPL(true);setAiPR(null);
    const summary=pts.map(p=>`${p.label}: ${p.insight}`).join("\n");
    try{const r=await apiFn("POST","/api/ai/grade",{prompt:`Elite trading coach. Actionable insights from these patterns:\n\n${summary}\n\nJSON: {"insights":[""],"topPattern":"","biggestWeakness":"","weeklyGoal":"","coachNote":""}`,maxTokens:1200});setAiPR(r);}catch(e:any){setAiPR({_error:e?.message||"AI analysis failed. Try again."});}
    setAiPL(false);
  }

  async function runWeeklyReport(){
    const ctx=marketCtx||await fetchMarketContext();
    const today=new Date();
    const dayName=ctx?.dayName||today.toLocaleDateString("en-US",{weekday:"long"});
    const dateStr=ctx?.date||today.toISOString().slice(0,10);
    const priceBlock=ctx?.hasPrices&&ctx.prices?.length
      ?`\n\nLIVE PRICE DATA (last trading session OHLC):\n${ctx.prices.map((p:any)=>`${p.symbol}: O=${p.lastOpen} H=${p.lastHigh} L=${p.lastLow} last=${p.lastClose} prevClose=${p.prevClose} (${p.changePct>0?"+":""}${p.changePct}%)`).join("\n")}`
      :"";
    const newsBlock=ctx?.hasNews
      ?`\n\nLIVE NEWS HEADLINES:\n${ctx.headlines.map((h:any)=>`- ${h.title} [${h.source}]`).join("\n")}`
      :"";
    const prompt=`You are an elite market analyst. Today is ${dayName}, ${dateStr}.${priceBlock}${newsBlock}\n\nUsing the real price data above, provide a direct opinionated market outlook. Reference actual price levels from the data. Be specific — give exact levels for entries, targets, stops. JSON only:\n{"weekSummary":"2-3 sentence overall market sentiment with specific price context","markets":[{"symbol":"SPY","name":"S&P 500","bias":"bullish|bearish|neutral","analysis":"2-3 sentences referencing actual price levels from the data","playbook":"Specific entry/target/stop levels based on real data","watchLevel":"Exact price level"},{"symbol":"QQQ","name":"Nasdaq 100","bias":"bullish|bearish|neutral","analysis":"...","playbook":"...","watchLevel":"..."},{"symbol":"BTC","name":"Bitcoin","bias":"bullish|bearish|neutral","analysis":"...","playbook":"...","watchLevel":"..."},{"symbol":"GC","name":"Gold","bias":"bullish|bearish|neutral","analysis":"...","playbook":"...","watchLevel":"..."}],"macro":"Key macro theme with price context","topOpportunity":"Specific trade with levels","riskWarning":"Biggest risk with key level to watch"}`;
    setWeekLoading(true);setWeekReview(null);
    try{const r=await apiFn("POST","/api/ai/grade",{prompt,maxTokens:2000});setWeekReview(r);}catch(e:any){setWeekReview({_error:e?.message||"Market outlook failed. Try again."});}
    setWeekLoading(false);
  }

  useEffect(()=>{fetchMarketContext();},[]);

  return(
    <div style={{padding:"16px 16px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:9,color:C.blue,letterSpacing:"0.2em",marginBottom:4}}>INTELLIGENCE</div>
          <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>AI Assistant</div>
        </div>
        {marketCtx?.hasPrices&&<Tag color={C.green}>📈 Live Prices</Tag>}
        {marketCtx?.hasNews&&<Tag color={C.blue}>🔴 Live News</Tag>}
      </div>
      <HowItWorks points={[
        "Market Prep gives you an AI briefing every morning with key price levels and news.",
        "Chat lets you ask your AI coach anything — paste a trade, upload a chart, get feedback.",
        "Patterns auto-analyzes your journal to surface your best sessions, setups, and habits.",
      ]}/>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {[{id:"prep",l:"📋 Market Prep"},{id:"chat",l:"💬 Chat"},{id:"patterns",l:"🔍 Patterns"},{id:"report",l:"📊 Weekly"}].map(t=>(
          <Pill key={t.id} active={tab===t.id} color={C.blue} onClick={()=>{setTab(t.id);if(t.id==="patterns"&&!patterns.length)setPatterns(computePatterns());}}>{t.l}</Pill>
        ))}
      </div>

      {tab==="prep"&&(
        <div>
          <div style={Object.assign({},CS,{marginBottom:12,background:"linear-gradient(145deg,#19243d,#161b27)"})}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:9,color:C.blue,letterSpacing:"0.15em",marginBottom:4}}>MORNING BRIEFING</div>
                <div style={{fontSize:13,fontWeight:700,color:C.txt}}>{marketCtx?.dayName||new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}{marketCtx?.timeET&&<span style={{fontSize:11,color:C.muted,fontWeight:400}}> · {marketCtx.timeET} ET</span>}</div>
              </div>
              {prep&&prepDate===new Date().toISOString().slice(0,10)&&<Tag color={C.green}>Today</Tag>}
            </div>
            {marketCtx?.hasNews&&(
              <div style={{marginBottom:10,padding:"8px 10px",background:"#0a0d14",borderRadius:8,border:`1px solid ${C.green}25`}}>
                <div style={{fontSize:9,color:C.green,letterSpacing:"0.1em",marginBottom:6}}>🔴 LIVE HEADLINES LOADED</div>
                {marketCtx.headlines.slice(0,3).map((h:any,i:number)=><div key={i} style={{fontSize:10,color:C.dim,marginBottom:3,lineHeight:1.4}}>· {h.title}</div>)}
                {marketCtx.headlines.length>3&&<div style={{fontSize:9,color:C.muted,marginTop:2}}>+{marketCtx.headlines.length-3} more</div>}
              </div>
            )}
            <button onClick={generatePrep} disabled={prepLoading} style={{width:"100%",padding:13,background:prepLoading?C.muted:C.blue,color:"#fff",border:"none",borderRadius:10,cursor:prepLoading?"wait":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700}}>
              {prepLoading?"🤖 Generating…":marketCtx?.hasNews?"📋 Generate Prep (Live News ✓)":"📋 Generate Today's Prep"}
            </button>
          </div>
          {prep&&(
            <div>
              <div style={Object.assign({},CS,{marginBottom:10})}>
                <div style={{fontSize:9,color:C.blue,letterSpacing:"0.12em",marginBottom:8}}>📈 MARKET CONTEXT</div>
                <div style={{fontSize:12,color:C.txt,lineHeight:1.7}}>{prep.marketContext}</div>
              </div>
              {prep.sessionFocus&&<div style={Object.assign({},CS,{marginBottom:10,border:`1px solid ${C.blue}30`})}><div style={{fontSize:9,color:C.blue,letterSpacing:"0.12em",marginBottom:6}}>🎯 SESSION FOCUS</div><div style={{fontSize:12,color:C.txt}}>{prep.sessionFocus}</div></div>}
              {prep.keyLevels?.length>0&&(
                <div style={Object.assign({},CS,{marginBottom:10})}>
                  <div style={{fontSize:9,color:C.gold,letterSpacing:"0.12em",marginBottom:10}}>📊 KEY LEVELS</div>
                  {prep.keyLevels.map((kl:any,i:number)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<prep.keyLevels.length-1?`1px solid ${C.bord}`:"none"}}>
                      <div style={{fontSize:14,fontWeight:700,color:C.gold,fontFamily:"monospace",flexShrink:0}}>{kl.level}</div>
                      <div style={{fontSize:11,color:C.dim,flex:1}}>{kl.significance}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={Object.assign({},CS,{marginBottom:10,border:`1px solid ${C.green}25`})}>
                <div style={{fontSize:9,color:C.green,letterSpacing:"0.12em",marginBottom:8}}>✅ TODAY'S PLAN</div>
                <div style={{fontSize:12,color:C.txt,lineHeight:1.7}}>{prep.tradingPlan}</div>
              </div>
              {prep.newsToWatch?.length>0&&(
                <div style={Object.assign({},CS,{marginBottom:10})}>
                  <div style={{fontSize:9,color:C.purp,letterSpacing:"0.12em",marginBottom:8}}>📰 NEWS TO WATCH</div>
                  {prep.newsToWatch.map((n:string,i:number)=><div key={i} style={{fontSize:12,color:C.txt,marginBottom:6,display:"flex",gap:8}}><span style={{color:C.purp,flexShrink:0}}>•</span>{n}</div>)}
                </div>
              )}
              {prep.riskReminders?.length>0&&(
                <div style={Object.assign({},CS,{marginBottom:10,border:`1px solid ${C.red}25`})}>
                  <div style={{fontSize:9,color:C.red,letterSpacing:"0.12em",marginBottom:8}}>⚠️ RISK REMINDERS</div>
                  {prep.riskReminders.map((r:string,i:number)=><div key={i} style={{fontSize:12,color:C.txt,marginBottom:6,display:"flex",gap:8}}><span style={{color:C.red,flexShrink:0}}>!</span>{r}</div>)}
                </div>
              )}
              {prep.mindset&&<div style={{background:"#0d1020",border:`1px solid ${C.purp}25`,borderRadius:12,padding:16}}><div style={{fontSize:9,color:C.purp,letterSpacing:"0.12em",marginBottom:8}}>🧠 MINDSET</div><div style={{fontSize:12,color:C.txt,lineHeight:1.8,fontStyle:"italic"}}>"{prep.mindset}"</div></div>}
              <button onClick={()=>{systemCtxRef.current=[];setTab("chat");}} style={{width:"100%",marginTop:12,padding:12,background:"#1a2035",color:C.blue,border:`1px solid ${C.blue}40`,borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700}}>💬 Ask questions about this prep →</button>
            </div>
          )}
        </div>
      )}

      {tab==="chat"&&(
        <div>
          <div style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:12,padding:12,minHeight:300,maxHeight:460,overflowY:"auto",marginBottom:10,display:"flex",flexDirection:"column",gap:10}}>
            {chatMsgs.length===0&&(
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:C.muted,padding:40,textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:12}}>🤖</div>
                <div style={{fontSize:13,fontWeight:700,color:C.txt}}>AI Trading Coach</div>
                <div style={{fontSize:11,marginTop:8,lineHeight:1.7}}>Ask about setups, risk management, trade psychology, market structure, strategies…</div>
              </div>
            )}
            {chatMsgs.map((m,i)=>{
              const textContent=typeof m.content==="string"?m.content:Array.isArray(m.content)?((m.content as any[]).find((b:any)=>b.type==="text")?.text||""):"";
              return(
              <div key={i} style={{display:"flex",gap:8,justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:C.blue+"22",border:`1px solid ${C.blue}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🤖</div>}
                <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",background:m.role==="user"?C.blue+"22":C.surf2,border:`1px solid ${m.role==="user"?C.blue+"40":C.bord}`,fontSize:12,color:C.txt,lineHeight:1.7}}>
                  {m.imgUrl&&<img src={m.imgUrl} alt="chart" style={{maxWidth:"100%",borderRadius:6,marginBottom:6,display:"block"}}/>}
                  {textContent}
                </div>
              </div>
              );
            })}
            {chatLoading&&<div style={{display:"flex",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:C.blue+"22",border:`1px solid ${C.blue}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🤖</div><div style={{padding:"10px 14px",borderRadius:"12px 12px 12px 4px",background:C.surf2,border:`1px solid ${C.bord}`,fontSize:12,color:C.muted}}>Thinking…</div></div>}
            <div ref={chatEndRef}/>
          </div>
          {pendingImg&&(
            <div style={{position:"relative",display:"inline-block",marginBottom:8}}>
              <img src={`data:${pendingImg.mimeType};base64,${pendingImg.data}`} alt="preview" style={{maxHeight:100,maxWidth:"100%",borderRadius:8,border:`1px solid ${C.bord}`,display:"block"}}/>
              <button onClick={()=>setPendingImg(null)} style={{position:"absolute",top:-8,right:-8,width:22,height:22,borderRadius:"50%",background:"#e53e3e",border:"none",color:"#fff",cursor:"pointer",fontSize:14,lineHeight:"22px",textAlign:"center",padding:0}}>×</button>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files?.[0];if(!f)return;const r=await resizeImage(f);setPendingImg(r);e.target.value="";}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>fileInputRef.current?.click()} style={{padding:"12px 14px",background:pendingImg?C.blue+"33":C.surf2,color:pendingImg?C.blue:C.muted,border:`1px solid ${pendingImg?C.blue+"60":C.bord}`,borderRadius:8,cursor:"pointer",fontSize:16,flexShrink:0}}>📷</button>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(chatInput.trim()||pendingImg)&&sendChat()} placeholder="Ask about today's market, your prep, setups…" style={inp({flex:1,fontSize:14,padding:"12px 14px"} as any)}/>
            <button onClick={sendChat} disabled={chatLoading||(!chatInput.trim()&&!pendingImg)} style={{padding:"12px 18px",background:chatLoading||(!chatInput.trim()&&!pendingImg)?C.muted:C.blue,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,flexShrink:0}}>Send</button>
          </div>
          {chatMsgs.length>0&&<button onClick={clearChat} style={{marginTop:8,width:"100%",padding:8,background:"transparent",color:C.muted,border:`1px solid ${C.bord}`,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>Clear conversation</button>}
        </div>
      )}

      {tab==="patterns"&&(
        <div>
          {!trades.length?<div style={{textAlign:"center",padding:60,color:C.muted}}><div style={{fontSize:40}}>🔍</div><div style={{marginTop:12,fontSize:12}}>No trades to analyze</div></div>:(
            <div>
              {patterns.map((p:any,i:number)=>(
                <div key={i} style={{background:C.surf,border:`1px solid ${p.color}30`,borderLeft:`3px solid ${p.color}`,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
                  <div style={{fontSize:9,color:p.color,letterSpacing:"0.12em",marginBottom:4}}>{p.label.toUpperCase()}</div>
                  <div style={{fontSize:12,color:C.txt,lineHeight:1.6}}>{p.insight}</div>
                </div>
              ))}
              <button onClick={runAiPatterns} disabled={aiPL} style={{width:"100%",padding:13,background:aiPL?C.muted:C.purp,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,marginTop:4}}>
                {aiPL?"🤖 Analyzing…":"🤖 AI Deep Analysis"}
              </button>
              {aiPR&&(
                <div style={Object.assign({},CS,{marginTop:12,border:`1px solid ${C.purp}25`})}>
                  <div style={{fontSize:9,color:C.purp,letterSpacing:"0.12em",marginBottom:10}}>🤖 AI COACH INSIGHTS</div>
                  {(aiPR.insights||[]).map((ins:string,i:number)=><div key={i} style={{fontSize:12,color:C.txt,marginBottom:8,lineHeight:1.6}}>· {ins}</div>)}
                  {aiPR.topPattern&&<div style={{fontSize:11,color:C.green,marginTop:8,fontWeight:600}}>🏆 {aiPR.topPattern}</div>}
                  {aiPR.biggestWeakness&&<div style={{fontSize:11,color:C.red,marginTop:6,fontWeight:600}}>⚠ {aiPR.biggestWeakness}</div>}
                  {aiPR.weeklyGoal&&<div style={{fontSize:11,color:C.gold,marginTop:6,fontWeight:600}}>🎯 {aiPR.weeklyGoal}</div>}
                  {aiPR.coachNote&&<div style={{fontSize:11,color:C.dim,marginTop:8,fontStyle:"italic"}}>"{aiPR.coachNote}"</div>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab==="report"&&(
        <div>
          <div style={Object.assign({},CS,{marginBottom:14,background:"linear-gradient(145deg,#1a1f2e,#161b27)"})}>
            <div style={{fontSize:9,color:C.gold,letterSpacing:"0.15em",marginBottom:6}}>📊 MARKET INTELLIGENCE</div>
            <div style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:4}}>Market Outlook</div>
            <div style={{fontSize:11,color:C.dim,marginBottom:10,lineHeight:1.6}}>AI analysis on key indexes — what's happening and how to play it.</div>
            {marketCtx?.hasNews&&<div style={{fontSize:10,color:C.green,marginBottom:10}}>🔴 Powered by live market news</div>}
            <button onClick={runWeeklyReport} disabled={weekLoading} style={{width:"100%",padding:14,background:weekLoading?C.muted:C.gold,color:"#000",border:"none",borderRadius:10,cursor:weekLoading?"wait":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:800}}>
              {weekLoading?"🤖 Analyzing markets…":"📊 Generate Market Outlook"}
            </button>
          </div>
          {weekReview&&(
            <div>
              {weekReview.weekSummary&&(
                <div style={Object.assign({},CS,{marginBottom:12,border:`1px solid ${C.gold}25`})}>
                  <div style={{fontSize:9,color:C.gold,letterSpacing:"0.12em",marginBottom:8}}>🌍 MARKET OVERVIEW</div>
                  <div style={{fontSize:12,color:C.txt,lineHeight:1.7}}>{weekReview.weekSummary}</div>
                </div>
              )}
              {(weekReview.markets||[]).map((m:any,i:number)=>(
                <div key={i} style={Object.assign({},CS,{marginBottom:12,borderLeft:`3px solid ${m.bias==="bullish"?C.green:m.bias==="bearish"?C.red:C.gold}`})}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div>
                      <div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:"monospace"}}>{m.symbol}</div>
                      <div style={{fontSize:10,color:C.muted}}>{m.name}</div>
                    </div>
                    <div style={{padding:"4px 12px",borderRadius:20,background:m.bias==="bullish"?C.green+"25":m.bias==="bearish"?C.red+"25":C.gold+"25",color:m.bias==="bullish"?C.green:m.bias==="bearish"?C.red:C.gold,fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{m.bias||"neutral"}</div>
                  </div>
                  <div style={{fontSize:12,color:C.dim,lineHeight:1.7,marginBottom:10}}>{m.analysis}</div>
                  {m.playbook&&<div style={{background:"#0d1020",borderRadius:8,padding:"10px 12px",marginBottom:8}}><div style={{fontSize:9,color:C.blue,letterSpacing:"0.1em",marginBottom:5}}>📋 HOW TO PLAY IT</div><div style={{fontSize:12,color:C.txt,lineHeight:1.6}}>{m.playbook}</div></div>}
                  {m.watchLevel&&<div style={{fontSize:11,color:C.gold,fontWeight:600}}>👁 Watch: {m.watchLevel}</div>}
                </div>
              ))}
              {weekReview.macro&&(
                <div style={Object.assign({},CS,{marginBottom:12,border:`1px solid ${C.purp}25`})}>
                  <div style={{fontSize:9,color:C.purp,letterSpacing:"0.12em",marginBottom:8}}>🔮 MACRO THEME</div>
                  <div style={{fontSize:12,color:C.txt,lineHeight:1.7}}>{weekReview.macro}</div>
                </div>
              )}
              {weekReview.topOpportunity&&(
                <div style={Object.assign({},CS,{marginBottom:12,background:"linear-gradient(145deg,#152015,#161b27)",border:`1px solid ${C.green}30`})}>
                  <div style={{fontSize:9,color:C.green,letterSpacing:"0.12em",marginBottom:8}}>🏆 TOP OPPORTUNITY</div>
                  <div style={{fontSize:12,color:C.txt,lineHeight:1.7}}>{weekReview.topOpportunity}</div>
                </div>
              )}
              {weekReview.riskWarning&&(
                <div style={{background:C.red+"15",border:`1px solid ${C.red}30`,borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontSize:9,color:C.red,letterSpacing:"0.12em",marginBottom:6}}>⚠️ RISK WARNING</div>
                  <div style={{fontSize:12,color:C.txt,lineHeight:1.7}}>{weekReview.riskWarning}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── FEEDBACK ──────────────────────────────────────────────────────────────────
function FeedbackView({user}: {user:any}) {
  const [type,setType]=useState("bug");
  const [message,setMessage]=useState("");
  const [rating,setRating]=useState(5);
  const [loading,setLoading]=useState(false);
  const [success,setSuccess]=useState(false);
  const [submitError,setSubmitError]=useState<string|null>(null);
  const [submitted,setSubmitted]=useState<any[]>([]);

  useEffect(()=>{
    async function load(){
      const {data}=await supabase.from("feedback").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(5);
      if(data)setSubmitted(data);
    }
    load();
  },[user.id,success]);

  async function submit(){
    if(!message.trim())return;
    setLoading(true); setSubmitError(null);
    try{
      await supabase.from("feedback").insert({user_id:user.id,type,message,rating,created_at:new Date().toISOString()});
      setSuccess(true); setMessage(""); setTimeout(()=>setSuccess(false),3000);
    }catch{setSubmitError("Failed to send feedback. Please try again.");}
    setLoading(false);
  }

  const types=[{id:"bug",label:"Bug Report",color:C.red},{id:"feature",label:"Feature Request",color:C.blue},{id:"general",label:"General Feedback",color:C.green},{id:"compliment",label:"Compliment",color:C.gold}];

  return(
    <div style={{padding:"16px 16px 20px"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:9,color:C.blue,letterSpacing:"0.2em",marginBottom:6}}>COMMUNITY</div>
        <div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:6}}>Share Feedback</div>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>Help us make TradeAura better. Report bugs, request features, or just let us know what you think.</div>
      </div>

      {success&&(<div style={{background:C.green+"18",border:`1px solid ${C.green}40`,borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:12,color:C.green,fontWeight:700}}>✓ Thanks for your feedback! We'll review it soon.</div>)}
      {submitError&&(<div style={{background:C.red+"18",border:`1px solid ${C.red}40`,borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:12,color:C.red,fontWeight:700}}>{submitError}</div>)}

      <div style={Object.assign({},CS,{marginBottom:16})}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:10}}>FEEDBACK TYPE</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {types.map(t=>(<button key={t.id} onClick={()=>setType(t.id)} style={{padding:"10px",borderRadius:8,border:`1px solid ${type===t.id?t.color+"60":C.bord}`,background:type===t.id?t.color+"18":"transparent",color:type===t.id?t.color:C.muted,fontFamily:"inherit",fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.label}</button>))}
        </div>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:8}}>RATE YOUR EXPERIENCE</div>
          <div style={{display:"flex",gap:8}}>
            {[1,2,3,4,5].map(n=>(<button key={n} onClick={()=>setRating(n)} style={{width:40,height:40,borderRadius:8,border:`1px solid ${rating>=n?C.gold+"60":C.bord}`,background:rating>=n?C.gold+"18":"transparent",color:rating>=n?C.gold:C.muted,fontFamily:"inherit",fontSize:16,cursor:"pointer"}}>★</button>))}
          </div>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>YOUR MESSAGE</div>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} placeholder="Tell us what's on your mind..." style={inp({resize:"vertical",lineHeight:1.6} as any)}/>
        </div>

        <button onClick={submit} disabled={loading||!message.trim()} style={{width:"100%",padding:14,background:loading||!message.trim()?C.muted:C.green,color:"#000",border:"none",borderRadius:10,cursor:loading||!message.trim()?"not-allowed":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700}}>
          {loading?"Sending...":"Send Feedback"}
        </button>
      </div>

      {submitted.length>0&&(
        <div style={CS}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>YOUR RECENT FEEDBACK</div>
          {submitted.map((f,i)=>(<div key={i} style={{padding:"10px 12px",background:C.bg,borderRadius:8,marginBottom:8,borderLeft:`3px solid ${types.find(t=>t.id===f.type)?.color||C.blue}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:10,color:types.find(t=>t.id===f.type)?.color||C.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>{f.type}</span>
              <span style={{fontSize:10,color:C.gold}}>{"★".repeat(f.rating)}</span>
            </div>
            <div style={{fontSize:12,color:C.dim}}>{f.message}</div>
          </div>))}
        </div>
      )}
    </div>
  );
}

// ── ACCOUNT MODAL ─────────────────────────────────────────────────────────────
function AccountModal({accounts,activeId,onSelect,onAdd,onDelete,onUpdateLimit,onClose}: {accounts:any[],activeId:any,onSelect:(id:any)=>void,onAdd:(name:string,type:string,limit:number)=>void,onDelete:(id:any)=>void,onUpdateLimit:(id:any,limit:number)=>void,onClose:()=>void}) {
  const [name,setName]=useState(""),[type,setType]=useState("Live"),[newLimit,setNewLimit]=useState("5");
  const [confirmDelete,setConfirmDelete]=useState<any>(null);
  const [editingLimit,setEditingLimit]=useState<any>(null),[limitInput,setLimitInput]=useState("");
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",background:C.surf,borderRadius:"20px 20px 0 0",padding:"24px 20px 44px",maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:C.bord,borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontSize:16,fontWeight:700,marginBottom:16,color:C.txt}}>My Accounts</div>
        {accounts.map(a=>(
          <div key={a.id} style={{borderRadius:10,marginBottom:8,background:a.id===activeId?C.blue+"18":C.bg,border:`1px solid ${a.id===activeId?C.blue+"50":C.bord}`}}>
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",cursor:"pointer"}} onClick={()=>onSelect(a.id)}>
              <span style={{width:10,height:10,borderRadius:"50%",background:typeColor(a.type),flexShrink:0,display:"inline-block"}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:C.txt}}>{a.name}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{a.type} · ${(a.starting_balance||0).toLocaleString()} · {a.max_daily_trades||5} trades/day</div>
              </div>
              {a.id===activeId&&<span style={{color:C.blue,fontSize:14,fontWeight:700}}>✓</span>}
              {accounts.length>1&&(confirmDelete===a.id
                ?<div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>{onDelete(a.id);setConfirmDelete(null);}} style={{padding:"5px 10px",background:C.red+"20",border:`1px solid ${C.red}40`,color:C.red,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>Delete</button>
                    <button onClick={()=>setConfirmDelete(null)} style={{padding:"5px 10px",background:"transparent",border:`1px solid ${C.bord}`,color:C.muted,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>Cancel</button>
                  </div>
                :<button onClick={e=>{e.stopPropagation();setConfirmDelete(a.id);}} style={{background:"transparent",border:`1px solid ${C.bord}`,color:C.muted,borderRadius:6,cursor:"pointer",fontSize:14,padding:"5px 8px",fontFamily:"inherit"}}>🗑</button>
              )}
            </div>
            <div style={{borderTop:`1px solid ${C.bord}`,padding:"8px 14px",display:"flex",alignItems:"center",gap:8}} onClick={e=>e.stopPropagation()}>
              <span style={{fontSize:10,color:C.muted,flex:1}}>DAILY TRADE LIMIT</span>
              {editingLimit===a.id
                ?<div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <input type="number" value={limitInput} onChange={e=>setLimitInput(e.target.value)} style={{...inp(),width:60,padding:"5px 8px",fontSize:13}} min="1" max="50"/>
                    <button onClick={()=>{const v=parseInt(limitInput);if(!isNaN(v)&&v>0){onUpdateLimit(a.id,v);setEditingLimit(null);}}} style={{padding:"5px 10px",background:C.green+"20",border:`1px solid ${C.green}40`,color:C.green,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>Save</button>
                    <button onClick={()=>setEditingLimit(null)} style={{padding:"5px 8px",background:"transparent",border:`1px solid ${C.bord}`,color:C.muted,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>✕</button>
                  </div>
                :<button onClick={()=>{setEditingLimit(a.id);setLimitInput(String(a.max_daily_trades||5));}} style={{padding:"5px 12px",background:C.surf2,border:`1px solid ${C.bord}`,color:C.txt,borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>{a.max_daily_trades||5} ✏️</button>
              }
            </div>
          </div>
        ))}
        <div style={{height:1,background:C.bord,margin:"14px 0"}}/>
        <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",marginBottom:10}}>ADD ACCOUNT</div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>{ACCT_TYPES.map(t=><Pill key={t} active={type===t} color={typeColor(t)} onClick={()=>setType(t)}>{t}</Pill>)}</div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,color:C.muted,letterSpacing:"0.08em",marginBottom:6}}>DAILY TRADE LIMIT</div>
          <input type="number" value={newLimit} onChange={e=>setNewLimit(e.target.value)} min="1" max="50" style={inp()} placeholder="5"/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Account name…" style={inp({flex:1} as any)}/>
          <button onClick={()=>{if(name.trim()){onAdd(name.trim(),type,parseInt(newLimit)||5);setName("");onClose();}}} style={{padding:"11px 18px",background:C.blue,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700}}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ── PAYWALL SCREEN ────────────────────────────────────────────────────────────
function PaywallScreen({onCheckout,onSignOut,onActivate,apiCall}: {onCheckout:()=>void,onSignOut:()=>void,onActivate:()=>void,apiCall:(m:string,u:string,b?:any)=>Promise<any>}){
  const [showCode,setShowCode]=useState(false);
  const [code,setCode]=useState("");
  const [codeError,setCodeError]=useState<string|null>(null);
  const [codeLoading,setCodeLoading]=useState(false);

  async function redeemCode(){
    if(!code.trim())return;
    setCodeLoading(true);setCodeError(null);
    try{
      await apiCall("POST","/api/billing/redeem",{code:code.trim()});
      onActivate();
    }catch(e:any){setCodeError(e.message||"Invalid code");}
    setCodeLoading(false);
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{maxWidth:400,width:"100%",textAlign:"center"}}>
        <div style={{width:60,height:60,background:C.green,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px"}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:C.green,letterSpacing:"0.12em",marginBottom:12}}>YOUR TRIAL HAS ENDED</div>
        <div style={{fontSize:32,fontWeight:900,color:C.txt,letterSpacing:"-0.03em",lineHeight:1.1,marginBottom:16}}>Keep your edge.<br/>Go Pro.</div>
        <div style={{fontSize:15,color:C.muted,lineHeight:1.6,marginBottom:32}}>Unlimited trades, AI coaching, playbook builder, and full analytics. Everything you used during your trial — plus more.</div>
        <div style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:16,padding:20,marginBottom:24}}>
          {[["📓","Unlimited trade journal"],["🤖","AI coaching after every session"],["📊","Full analytics + playbook builder"],["📅","P&L calendar & best-day insights"]].map(([icon,label])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.bord}`}}>
              <span style={{fontSize:18}}>{icon}</span>
              <span style={{fontSize:14,fontWeight:600,color:C.txt}}>{label}</span>
              <span style={{marginLeft:"auto",color:C.green,fontSize:16}}>✓</span>
            </div>
          ))}
        </div>
        <button onClick={onCheckout} style={{width:"100%",padding:"18px",background:C.green,color:"#000",border:"none",borderRadius:14,fontSize:18,fontWeight:900,cursor:"pointer",fontFamily:"inherit",letterSpacing:"-0.01em",boxShadow:`0 0 32px ${C.green}44`,marginBottom:12}}>
          Start Pro — $25/month
        </button>
        <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Cancel anytime · No hidden fees</div>

        {/* BETA CODE */}
        {!showCode?(
          <button onClick={()=>setShowCode(true)} style={{background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Have a beta code?</button>
        ):(
          <div style={{marginTop:4}}>
            <div style={{display:"flex",gap:8}}>
              <input value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&redeemCode()} placeholder="Enter code…" style={{...inp(),flex:1,fontSize:14}} autoFocus/>
              <button onClick={redeemCode} disabled={codeLoading} style={{padding:"11px 18px",background:C.blue,color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,opacity:codeLoading?0.6:1}}>
                {codeLoading?"…":"Activate"}
              </button>
            </div>
            {codeError&&<div style={{fontSize:12,color:C.red,marginTop:8}}>{codeError}</div>}
          </div>
        )}

        <button onClick={onSignOut} style={{display:"block",marginTop:20,background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Sign out</button>
      </div>
    </div>
  );
}

// ── IOS INSTALL BANNER ───────────────────────────────────────────────────────
function IOSInstallBanner() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = (window.navigator as any).standalone === true;
  const dismissed = localStorage.getItem("pwa_banner_dismissed") === "1";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOS || isStandalone || dismissed) return;
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem("pwa_banner_dismissed", "1");
    setVisible(false);
  }

  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:"#0f1520",borderTop:"1px solid #1e2c42",padding:"14px 16px 28px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 -4px 24px rgba(0,0,0,0.5)"}}>
      <div style={{width:40,height:40,flexShrink:0,borderRadius:10,overflow:"hidden",background:"#0a0d14",border:"1px solid #22c55e30",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <img src="/icons/icon-180.png" alt="" style={{width:40,height:40}} />
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:2}}>Install TradeAura</div>
        <div style={{fontSize:11,color:"#64748b",lineHeight:1.4}}>Tap <span style={{color:"#4f8ef7"}}>Share</span> then <span style={{color:"#4f8ef7"}}>"Add to Home Screen"</span></div>
      </div>
      <button onClick={dismiss} style={{background:"transparent",border:"none",color:"#64748b",cursor:"pointer",fontSize:20,padding:"4px 8px",lineHeight:1,flexShrink:0}}>×</button>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("home");
  const [accounts,setAccounts]=useState<any[]>([]);
  const [activeAccountId,setActiveAccountId]=useState<any>(null);
  const [trades,setTrades]=useState<any[]>([]);
  const [showModal,setShowModal]=useState(false);
  const [showNewTrade,setShowNewTrade]=useState(false);
  const [editingTrade,setEditingTrade]=useState<any>(null);
  const [showImport,setShowImport]=useState(false);
  const [pnlMode,setPnlMode]=useState<"$"|"%">("$");
  function changePnlMode(m: "$"|"%"){if(activeAccountId)localStorage.setItem(`pnl_display_mode_${activeAccountId}`,m);setPnlMode(m);}
  const [plan,setPlan]=useState<string>(()=>localStorage.getItem("user_plan")||"elite");
  function changePlan(p: string){localStorage.setItem("user_plan",p);setPlan(p);}
  const [showMenu,setShowMenu]=useState(false);
  const [appError,setAppError]=useState<string|null>(null);
  const [subStatus,setSubStatus]=useState<"trial"|"active"|"past_due"|"expired"|"canceled"|null>(null);
  const [trialDaysLeft,setTrialDaysLeft]=useState(0);
  const [showOnboarding,setShowOnboarding]=useState(false);
  const [onboardingStep,setOnboardingStep]=useState(0);

  // ── AUTH CHECK ──
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null); setLoading(false);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null);
    });
    return()=>subscription.unsubscribe();
  },[]);

  // ── ONBOARDING ──
  useEffect(()=>{
    if(!user)return;
    if(!localStorage.getItem("onboarding_complete")){setOnboardingStep(0);setShowOnboarding(true);}
  },[user]);

  function completeOnboarding(nextView?: string){
    localStorage.setItem("onboarding_complete","true");
    setShowOnboarding(false);
    if(nextView)setView(nextView);
  }

  function handleOnboardingNext(stepView: string|null){
    if(stepView)setView(stepView);
    if(onboardingStep<7){setOnboardingStep(s=>s+1);}
    else{completeOnboarding();}
  }

  // ── BILLING STATUS ──
  useEffect(()=>{
    if(!user)return;
    async function loadBillingStatus(){
      try{
        const data=await apiCall("GET","/api/billing/status");
        setSubStatus(data.status);
        if(data.daysLeft)setTrialDaysLeft(data.daysLeft);
      }catch{/* keep whatever status was set previously; don't downgrade to trial on transient errors */}
    }
    loadBillingStatus();
    // Check for ?subscribed=true on return from Stripe
    if(window.location.search.includes("subscribed=true")){
      window.history.replaceState({},"",window.location.pathname);
      loadBillingStatus();
    }
  },[user]);

  async function goToCheckout(){
    try{const{url}=await apiCall("POST","/api/billing/checkout");window.location.href=url;}
    catch(e:any){setAppError(e.message);}
  }
  async function goToPortal(){
    try{const{url}=await apiCall("POST","/api/billing/portal");window.location.href=url;}
    catch(e:any){setAppError(e.message);}
  }

  // ── AUTO-DISMISS APP ERROR ──
  useEffect(()=>{if(!appError)return;const t=setTimeout(()=>setAppError(null),5000);return()=>clearTimeout(t);},[appError]);

  // ── PNL MODE PER ACCOUNT ──
  useEffect(()=>{
    if(!activeAccountId)return;
    const saved=localStorage.getItem(`pnl_display_mode_${activeAccountId}`) as "$"|"%";
    setPnlMode(saved||"$");
  },[activeAccountId]);

  // ── LOAD ACCOUNTS ──
  useEffect(()=>{
    if(!user)return;
    async function loadAccounts(){
      const {data}=await supabase.from("accounts").select("*").eq("user_id",user.id).order("created_at");
      if(data&&data.length>0){setAccounts(data);setActiveAccountId(data[0].id);}
      else{const {data:newAcct}=await supabase.from("accounts").insert({user_id:user.id,name:"Main Account",type:"Live",starting_balance:25000,max_daily_trades:5}).select().single();if(newAcct){setAccounts([newAcct]);setActiveAccountId(newAcct.id);}}
    }
    loadAccounts();
  },[user]);

  // ── LOAD TRADES ──
  useEffect(()=>{
    if(!activeAccountId)return;
    apiCall("GET",`/api/trades?accountId=${activeAccountId}&limit=500`)
      .then((data: any[])=>setTrades(data.map(fromApiTrade)))
      .catch(()=>setAppError("Failed to load trades. Please refresh the page."));
  },[activeAccountId]);

  // ── TRADE ACTIONS ──
  async function saveTrade(trade: any){
    const payload = toApiPayload(trade, activeAccountId);
    const isExisting = trades.some(t=>t.id===trade.id);
    try {
      if(isExisting){
        const updated = await apiCall("PATCH",`/api/trades/${trade.id}`,payload);
        setTrades(prev=>prev.map(t=>t.id===trade.id?fromApiTrade(updated):t));
      } else {
        const created = await apiCall("POST","/api/trades",payload);
        setTrades(prev=>[fromApiTrade(created),...prev]);
      }
    } catch(e: any){ setAppError("Failed to save trade. Please try again."); return; }
    setShowNewTrade(false); setEditingTrade(null);
  }

  async function deleteTrade(id: any){
    try {
      await apiCall("DELETE",`/api/trades/${id}`);
      setTrades(prev=>prev.filter(t=>t.id!==id));
    } catch(e: any){ setAppError("Failed to delete trade. Please try again."); }
  }

  // ── ACCOUNT ACTIONS ──
  async function addAccount(name: string,type: string,limit=5){
    const {data,error}=await supabase.from("accounts").insert({user_id:user.id,name,type,starting_balance:25000,max_daily_trades:limit}).select().single();
    if(error){setAppError("Could not create account: "+error.message);return;}
    if(data){setAccounts(prev=>[...prev,data]);setActiveAccountId(data.id);}
  }

  async function deleteAccount(id: any){
    if(accounts.length<=1){setAppError("You need at least one account.");return;}
    const {error}=await supabase.from("accounts").delete().eq("id",id);
    if(error){setAppError("Delete failed: "+error.message);return;}
    const remaining=accounts.filter(a=>a.id!==id);
    setAccounts(remaining);
    if(activeAccountId===id)setActiveAccountId(remaining[0]?.id||null);
    setShowModal(false);
  }

  async function updateDailyLimit(id: any,limit: number){
    const {error}=await supabase.from("accounts").update({max_daily_trades:limit}).eq("id",id);
    if(error){setAppError("Update failed: "+error.message);return;}
    setAccounts(prev=>prev.map(a=>a.id===id?{...a,max_daily_trades:limit}:a));
  }

  async function updateBalance(newBal: number){
    const totalPnl=trades.reduce((s,t)=>s+(t.pnl||0),0);
    const newStart=newBal-totalPnl;
    await supabase.from("accounts").update({starting_balance:newStart}).eq("id",activeAccountId);
    setAccounts(prev=>prev.map(a=>a.id===activeAccountId?{...a,starting_balance:newStart}:a));
  }

  async function signOut(){
    await supabase.auth.signOut(); setUser(null); setAccounts([]); setTrades([]);
  }

  const activeAccount=accounts.find(a=>a.id===activeAccountId)||accounts[0];

  if(loading)return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontFamily:"'Space Grotesk',sans-serif",fontSize:13}}>Loading…</div>;
  if(!user)return<LandingPage onAuth={setUser}/>;

  if(subStatus==="expired"||subStatus==="canceled"){return(
    <PaywallScreen onCheckout={goToCheckout} onSignOut={()=>supabase.auth.signOut().then(()=>{setUser(null);setAccounts([]);setTrades([])})} onActivate={()=>setSubStatus("active")} apiCall={apiCall}/>
  );}



  const MENU_ITEMS=[
    {id:"home",icon:"⌂",label:"Home",desc:"Dashboard & stats"},
    {id:"journal",icon:"≡",label:"Journal",desc:"Your trade log"},
    {id:"calendar",icon:"◻",label:"Calendar",desc:"Monthly view"},
    {id:"stats",icon:"◈",label:"Stats",desc:"Performance analytics"},
    {id:"playbook",icon:"📖",label:"Playbook",desc:"My setups"},
    {id:"ai",icon:"🤖",label:"AI",desc:"Coach, prep & insights"},
    {id:"review",icon:"◉",label:"Review",desc:"AI performance review"},
    {id:"learn",icon:"🎓",label:"Learn",desc:"Trading education"},
    {id:"feedback",icon:"💬",label:"Feedback",desc:"Share ideas"},
  ];

  function navigate(id: string){setView(id);setShowNewTrade(false);setEditingTrade(null);setShowMenu(false);}

  return(
    <>
    {showOnboarding&&<OnboardingTour step={onboardingStep} onNext={handleOnboardingNext} onSkip={()=>completeOnboarding()}/>}
    <div style={{minHeight:"100vh",background:C.bg,color:C.txt,fontFamily:"'Space Grotesk',sans-serif",maxWidth:480,margin:"0 auto"}}>
      {/* TRIAL BANNER */}
      {subStatus==="trial"&&(
        <div style={{background:`linear-gradient(90deg,${C.green}18,${C.blue}18)`,borderBottom:`1px solid ${C.green}30`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <div style={{fontSize:13,fontWeight:700,color:C.txt}}>🎉 {trialDaysLeft} day{trialDaysLeft!==1?"s":""} left in your free trial</div>
          <button onClick={goToCheckout} style={{background:C.green,color:"#000",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Upgrade</button>
        </div>
      )}
      {/* PAST DUE BANNER */}
      {subStatus==="past_due"&&(
        <div style={{background:`${C.red}18`,borderBottom:`1px solid ${C.red}30`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <div style={{fontSize:13,fontWeight:700,color:C.red}}>⚠️ Payment failed — update billing info</div>
          <button onClick={goToPortal} style={{background:C.red,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Fix</button>
        </div>
      )}
      {/* HEADER */}
      <div style={{background:C.surf,borderBottom:`1px solid ${C.bord}`,padding:"13px 16px",position:"sticky",top:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>navigate("home")}>
          <div style={{width:28,height:28,background:C.green,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          </div>
          <div style={{fontSize:15,fontWeight:800,color:"#fff",letterSpacing:"-0.01em"}}>TradeAura</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setShowModal(true)} style={{display:"flex",alignItems:"center",gap:6,background:C.bg,border:`1px solid ${C.bord}`,color:C.txt,padding:"7px 12px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",maxWidth:140}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:typeColor(activeAccount?.type),display:"inline-block",flexShrink:0}}/>
            <span style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{activeAccount?.name||"Account"}</span>
            <span style={{color:C.muted,fontSize:10}}>▾</span>
          </button>
          <button onClick={()=>setShowMenu(true)} style={{background:"transparent",border:`1px solid ${C.bord}`,color:C.txt,padding:"7px 12px",borderRadius:8,cursor:"pointer",fontSize:18,fontFamily:"inherit",lineHeight:1}}>☰</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{paddingBottom:80}}>
        {view==="home"&&<HomeView trades={trades} account={activeAccount} onEditBalance={updateBalance} onNavigate={setView}/>}
        {view==="journal"&&(<div>{(showNewTrade||editingTrade)&&<div style={{padding:"16px 16px 0"}}><TradeForm initial={editingTrade||undefined} isEdit={!!editingTrade} balance={activeAccount?.starting_balance} pnlMode={pnlMode} onPnlModeChange={changePnlMode} onSave={saveTrade} onCancel={()=>{setShowNewTrade(false);setEditingTrade(null);}}/></div>}<JournalView trades={trades} onSave={saveTrade} onDelete={deleteTrade} onImport={()=>setShowImport(true)} balance={activeAccount?.starting_balance} pnlMode={pnlMode} onPnlModeChange={changePnlMode}/></div>)}
        {view==="calendar"&&<CalendarView trades={trades}/>}
        {view==="stats"&&<StatsView trades={trades} account={activeAccount}/>}
        {view==="playbook"&&<PlaybookView trades={trades}/>}
        {view==="ai"&&<AIView trades={trades} apiCall={apiCall}/>}
        {view==="review"&&<ReviewView trades={trades}/>}
        {view==="learn"&&<Suspense fallback={<div style={{textAlign:"center",padding:60,color:C.muted}}>Loading…</div>}><EducationCenter userPlan={plan} apiCall={apiCall}/></Suspense>}
        {view==="feedback"&&<FeedbackView user={user}/>}
      </div>

      {/* FLOATING + BUTTON */}
      <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:20}}>
        <button onClick={()=>{setView("journal");setEditingTrade(null);setShowNewTrade(s=>!s);}} style={{width:56,height:56,borderRadius:"50%",background:C.blue,border:`3px solid ${C.bg}`,color:"#fff",fontSize:28,cursor:"pointer",boxShadow:`0 4px 24px ${C.blue}66`,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>+</button>
      </div>

      {/* MENU OVERLAY */}
      {showMenu&&(
        <div onClick={()=>setShowMenu(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:50,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.surf,borderRadius:"20px 20px 0 0",padding:"24px 16px 44px",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{width:36,height:4,background:C.bord,borderRadius:2,margin:"0 auto 20px"}}/>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",marginBottom:16,textAlign:"center"}}>NAVIGATE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
              {MENU_ITEMS.map(n=>(
                <button key={n.id} onClick={()=>navigate(n.id)} style={{background:view===n.id?C.blue+"22":C.bg,border:`1px solid ${view===n.id?C.blue+"60":C.bord}`,borderRadius:14,padding:"16px 8px",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"none"}}>
                  <span style={{fontSize:24,lineHeight:1}}>{n.icon}</span>
                  <span style={{fontSize:12,fontWeight:700,color:view===n.id?C.blue:C.txt}}>{n.label}</span>
                  <span style={{fontSize:9,color:C.muted,textAlign:"center",lineHeight:1.3}}>{n.desc}</span>
                </button>
              ))}
            </div>
            {subStatus==="active"?(
              <button onClick={()=>{setShowMenu(false);goToPortal();}} style={{width:"100%",padding:"12px",background:"transparent",border:`1px solid ${C.green}40`,color:C.green,borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,marginBottom:10}}>⚙️ Manage Subscription</button>
            ):subStatus==="trial"&&(
              <button onClick={()=>{setShowMenu(false);goToCheckout();}} style={{width:"100%",padding:"12px",background:C.green,color:"#000",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:800,marginBottom:10}}>⚡ Upgrade to Pro — $25/mo</button>
            )}
            <button onClick={()=>{localStorage.removeItem("onboarding_complete");setOnboardingStep(0);setShowOnboarding(true);setShowMenu(false);}} style={{width:"100%",padding:"12px",background:"transparent",border:`1px solid ${C.blue}40`,color:C.blue,borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,marginBottom:10}}>🗺️ Take the Tour</button>
            <button onClick={signOut} style={{width:"100%",padding:"12px",background:"transparent",border:`1px solid ${C.red}30`,color:C.red,borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>Sign Out</button>
          </div>
        </div>
      )}

      {showModal&&<AccountModal accounts={accounts} activeId={activeAccountId} onSelect={id=>{setActiveAccountId(id);setShowModal(false);}} onAdd={addAccount} onDelete={deleteAccount} onUpdateLimit={updateDailyLimit} onClose={()=>setShowModal(false)}/>}
      {showImport&&activeAccountId&&<ImportModal accountId={activeAccountId} onClose={()=>setShowImport(false)} onImported={()=>{setShowImport(false);apiCall("GET",`/api/trades?accountId=${activeAccountId}&limit=500`).then((data:any[])=>setTrades(data.map(fromApiTrade))).catch(()=>setAppError("Trades imported but failed to refresh. Please reload."));}}/>}

      {/* ERROR TOAST */}
      {appError&&(
        <div style={{position:"fixed",bottom:96,left:"50%",transform:"translateX(-50%)",zIndex:100,maxWidth:380,width:"calc(100% - 32px)",background:"#1a0a0a",border:`1px solid ${C.red}50`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,boxShadow:`0 8px 32px rgba(0,0,0,0.5)`}}>
          <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
          <span style={{fontSize:13,color:C.red,flex:1,lineHeight:1.4}}>{appError}</span>
          <button onClick={()=>setAppError(null)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1,flexShrink:0}}>×</button>
        </div>
      )}
    </div>
    <Analytics />
    <IOSInstallBanner />
    </>
  );
}

export function WrappedApp(){return <ErrorBoundary><App/></ErrorBoundary>;}
