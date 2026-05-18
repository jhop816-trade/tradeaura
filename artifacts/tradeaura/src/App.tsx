import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ── SUPABASE ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const INSTRUMENTS = ["ES1!","NQ1!","MES","MNQ","CL","GC","RTY","YM","XAU/USD"];
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
const inp = (x: React.CSSProperties = {}): React.CSSProperties => ({ width:"100%", background:"#0a0d14", border:`1px solid ${C.bord}`, color:C.txt, padding:"11px 14px", borderRadius:8, fontSize:13, fontFamily:"inherit", boxSizing:"border-box", outline:"none", ...x });

function Tag({color,children}: {color:string,children:React.ReactNode}){ return <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:color+"22",color,fontWeight:600}}>{children}</span>; }
function Pill({active,color=C.blue,onClick,children}: {active:boolean,color?:string,onClick:()=>void,children:React.ReactNode}){ return <button onClick={onClick} style={{padding:"8px 14px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:active?color+"22":"transparent",color:active?color:C.muted,border:`1px solid ${active?color+"55":C.bord}`}}>{children}</button>; }

async function callAI(prompt: string, maxTokens=600) {
  const res = await fetch("/api/ai/grade", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ prompt, maxTokens })
  });
  if (!res.ok) throw new Error("AI request failed");
  return res.json();
}

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }: {onAuth:(u:any)=>void}) {
  const [mode, setMode] = useState("login");
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
        setSuccess("Account created! Check your email to confirm then log in.");
        setMode("login");
      }
    } catch(e: any) { setError(e.message); }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Mono','Courier New',monospace"}}>
      <div style={{width:"100%",maxWidth:400}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:48,height:48,background:C.green,borderRadius:12,marginBottom:12}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          </div>
          <div style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:"-0.02em"}}>TradeAura</div>
          <div style={{fontSize:11,color:C.muted,marginTop:4,letterSpacing:"0.1em"}}>TRADE SMARTER. GROW FASTER.</div>
        </div>

        <div style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:16,padding:28}}>
          <div style={{fontSize:16,fontWeight:700,color:C.txt,marginBottom:6}}>{mode==="login"?"Welcome back":"Create account"}</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:24}}>{mode==="login"?"Sign in to your trading journal":"Start tracking your trades today"}</div>

          {error && <div style={{background:C.red+"18",border:`1px solid ${C.red}40`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.red,marginBottom:16}}>{error}</div>}
          {success && <div style={{background:C.green+"18",border:`1px solid ${C.green}40`,borderRadius:8,padding:"10px 14px",fontSize:12,color:C.green,marginBottom:16}}>{success}</div>}

          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>EMAIL</div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={inp()} />
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>PASSWORD</div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp()} onKeyDown={e=>e.key==="Enter"&&submit()} />
          </div>

          <button onClick={submit} disabled={loading} style={{width:"100%",padding:14,background:loading?C.muted:C.green,color:"#000",border:"none",borderRadius:10,cursor:loading?"wait":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,marginBottom:16}}>
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
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeView({trades,account,onEditBalance}: {trades:any[],account:any,onEditBalance:(v:number)=>void}) {
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

  return (
    <div style={{padding:"16px 16px 20px"}}>
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

      <div style={Object.assign({},CS,{marginBottom:12})}>
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
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[{l:"WIN RATE",v:`${winRate}%`,c:parseFloat(winRate as string)>=50?C.green:C.red},{l:"STREAK",v:`${streak}${sType?"W":"L"}`,c:sType?C.green:C.red},{l:"TRADES",v:trades.length,c:C.txt},{l:"AVG WIN",v:`$${avgWin.toFixed(0)}`,c:C.green},{l:"AVG LOSS",v:`$${avgLoss.toFixed(0)}`,c:C.red},{l:"NET P&L",v:`${totalPnl>=0?"+":""}$${totalPnl.toFixed(0)}`,c:tpClr}].map(s=>(
          <div key={s.l} style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:10,padding:"11px 8px",textAlign:"center"}}>
            <div style={{fontSize:8,color:C.muted,letterSpacing:"0.1em",marginBottom:5}}>{s.l}</div>
            <div style={{fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {chartData.length>1&&(
        <div style={CS}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>CUMULATIVE P&L</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData}>
              <YAxis hide domain={["auto","auto"]}/><XAxis dataKey="i" hide/>
              <Tooltip formatter={(v: any)=>[`$${v}`,"P&L"]} contentStyle={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:8,fontSize:11}}/>
              <Line type="monotone" dataKey="v" stroke={totalPnl>=0?C.green:C.red} strokeWidth={2.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── TRADE FORM ────────────────────────────────────────────────────────────────
function TradeForm({initial,isEdit,onSave,onCancel}: {initial?:any,isEdit?:boolean,onSave:(t:any)=>void,onCancel?:()=>void}) {
  const [form,setForm]=useState(initial||{date:new Date().toISOString().slice(0,10),instrument:"ES1!",session:"New York",direction:"Long",entry:"",exit:"",contracts:"1",stop_loss:"",setup:"BOS + Retest",mood:"Focused",rules_followed:[],notes:"",screenshot:null,ai_grade:null,ai_feedback:null,account_type:"Live",manual_pnl:""});
  const [loading,setLoading]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);
  const set=(k: string,v: any)=>setForm((p: any)=>({...p,[k]:v}));
  const pnlPreview=calcPnl({...form,manualPnl:form.manual_pnl,stopLoss:form.stop_loss,rulesFollowed:form.rules_followed});

  async function submit() {
    let pnl=calcPnl({...form,manualPnl:form.manual_pnl}); if(pnl===null)pnl=0;
    setLoading(true); let grade=null;
    try {
      grade=await callAI(`Expert futures trading coach. Analyze this trade briefly. ${form.instrument} ${form.direction} | ${form.setup} | ${form.session} Entry:${form.entry} Exit:${form.exit} Contracts:${form.contracts} P&L:$${pnl.toFixed(2)} Stop:${form.stop_loss||"None"} Mood:${form.mood} Rules:${(form.rules_followed||[]).join(",")||"None"} Notes:${form.notes||"None"} JSON only: {"grade":"A/B/C/D/F","score":0,"strengths":[""],"weaknesses":[""],"lesson":"","verdict":""}`);
    } catch(e){console.error("AI grade failed:",e);}
    setLoading(false);
    onSave({...form,id:form.id||makeId(),pnl,ai_grade:grade?.grade||null,ai_feedback:grade});
  }

  return (
    <div style={Object.assign({},CS,{marginBottom:12})}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:C.txt}}>{isEdit?"Edit Trade":"New Trade"}</div>
        {onCancel&&<button onClick={onCancel} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>×</button>}
      </div>

      <div style={{marginBottom:12}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>ACCOUNT TYPE</div>
        <div style={{display:"flex",gap:6}}>{ACCT_TYPES.map(a=><Pill key={a} active={form.account_type===a} color={typeColor(a)} onClick={()=>set("account_type",a)}>{a}</Pill>)}</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>DATE</div><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={inp()}/></div>
        <div><div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>INSTRUMENT</div><select value={form.instrument} onChange={e=>set("instrument",e.target.value)} style={inp()}>{INSTRUMENTS.map(o=><option key={o}>{o}</option>)}</select></div>
      </div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>DIRECTION</div>
        <div style={{display:"flex",gap:8}}>
          {["Long","Short"].map(d=>{const active=form.direction===d,col=d==="Long"?C.green:C.red;return(<button key={d} onClick={()=>set("direction",d)} style={{flex:1,padding:11,borderRadius:8,fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",background:active?col+"20":"transparent",color:active?col:C.muted,border:`1px solid ${active?col+"50":C.bord}`}}>{d==="Long"?"▲ Long":"▼ Short"}</button>);})}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>ENTRY</div><input type="number" value={form.entry} onChange={e=>set("entry",e.target.value)} placeholder="7288.50" style={inp()}/></div>
        <div><div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>EXIT</div><input type="number" value={form.exit} onChange={e=>set("exit",e.target.value)} placeholder="7300.00" style={inp()}/></div>
        <div><div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>CONTRACTS</div><input type="number" value={form.contracts} onChange={e=>set("contracts",e.target.value)} placeholder="1" style={inp()}/></div>
        <div><div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>STOP LOSS</div><input type="number" value={form.stop_loss} onChange={e=>set("stop_loss",e.target.value)} placeholder="7280.00" style={inp()}/></div>
      </div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>PROFIT / LOSS $ <span style={{fontWeight:400,fontSize:10}}>(override)</span></div>
        <input type="number" value={form.manual_pnl} onChange={e=>set("manual_pnl",e.target.value)} placeholder="Enter exact dollar amount..." style={inp()}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>SESSION</div><select value={form.session} onChange={e=>set("session",e.target.value)} style={inp()}>{SESSIONS.map(o=><option key={o}>{o}</option>)}</select></div>
        <div><div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>SETUP</div><select value={form.setup} onChange={e=>set("setup",e.target.value)} style={inp()}>{SETUPS.map(o=><option key={o}>{o}</option>)}</select></div>
      </div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>MOOD</div>
        <select value={form.mood} onChange={e=>set("mood",e.target.value)} style={inp()}>{MOODS.map(o=><option key={o}>{o}</option>)}</select>
      </div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>RULES CHECKLIST</div>
        {RULES.map(r=>{const checked=(form.rules_followed||[]).includes(r);return(
          <label key={r} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"9px 12px",background:checked?C.green+"15":"#0a0d14",borderRadius:8,border:`1px solid ${checked?C.green+"40":C.bord}`,marginBottom:6}}>
            <input type="checkbox" checked={checked} onChange={e=>set("rules_followed",e.target.checked?[...(form.rules_followed||[]),r]:(form.rules_followed||[]).filter((x: string)=>x!==r))} style={{accentColor:C.green,width:15,height:15}}/>
            <span style={{fontSize:12,color:checked?C.green:C.dim}}>{r}</span>
          </label>
        );})}
      </div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>NOTES</div>
        <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} placeholder="Setup context, emotions, what you saw..." style={inp({resize:"vertical",lineHeight:1.6} as any)}/>
      </div>

      <div style={{marginBottom:14}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>CHART SCREENSHOT</div>
        <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${C.bord}`,borderRadius:10,padding:14,textAlign:"center",cursor:"pointer",color:C.muted,fontSize:12}}>{form.screenshot?"✅ Screenshot attached":"📸 Tap to upload"}</div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>set("screenshot",(ev.target as any).result);r.readAsDataURL(f);}}/>
        {form.screenshot&&<img src={form.screenshot} alt="chart" style={{width:"100%",borderRadius:8,marginTop:8,border:`1px solid ${C.bord}`}}/>}
      </div>

      {pnlPreview!==null&&(
        <div style={{padding:"13px 16px",borderRadius:10,background:pnlPreview>=0?C.green+"18":C.red+"18",border:`1px solid ${pnlPreview>=0?C.green+"35":C.red+"35"}`,marginBottom:14}}>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em"}}>TRADE P&L</div>
          <div style={{fontSize:24,fontWeight:800,color:pnlPreview>=0?C.green:C.red,marginTop:3}}>{pnlPreview>=0?"+":""}${pnlPreview.toFixed(2)}</div>
        </div>
      )}

      <button onClick={submit} disabled={loading} style={{width:"100%",padding:14,background:loading?C.muted:C.blue,color:"#fff",border:"none",borderRadius:10,cursor:loading?"wait":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700}}>
        {loading?"🤖 Grading...":isEdit?"Save Changes":"Log Trade"}
      </button>
    </div>
  );
}

// ── JOURNAL ───────────────────────────────────────────────────────────────────
function JournalView({trades,onSave,onDelete}: {trades:any[],onSave:(t:any)=>void,onDelete:(id:any)=>void}) {
  const [expandedId,setExpandedId]=useState<any>(null);
  const [editingTrade,setEditingTrade]=useState<any>(null);
  const today=new Date().toISOString().slice(0,10);
  const todayPnl=trades.filter(t=>t.date===today).reduce((s,t)=>s+(t.pnl||0),0);
  const todayCount=trades.filter(t=>t.date===today).length;

  if(!trades.length&&!editingTrade)return(
    <div style={{textAlign:"center",padding:"80px 20px",color:C.muted}}>
      <div style={{fontSize:44,marginBottom:12}}>📋</div>
      <div style={{fontSize:13,fontWeight:600}}>No trades yet</div>
      <div style={{fontSize:12,marginTop:6}}>Tap + to log your first trade</div>
    </div>
  );

  return(
    <div style={{padding:"16px 16px 20px"}}>
      {trades.length>0&&(
        <div style={Object.assign({},CS,{marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"})}>
          <div><div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em"}}>TODAY'S P&L</div><div style={{fontSize:22,fontWeight:800,color:todayPnl>=0?C.green:C.red,marginTop:2}}>{todayPnl>=0?"+":""}${todayPnl.toFixed(2)}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em"}}>TODAY TRADES</div><div style={{fontSize:22,fontWeight:800,color:C.txt,marginTop:2}}>{todayCount}</div></div>
        </div>
      )}
      {trades.map(trade=>{
        const pnl=trade.pnl||0,exp=expandedId===trade.id;
        if(editingTrade?.id===trade.id)return(<TradeForm key={trade.id} initial={editingTrade} isEdit onSave={t=>{onSave(t);setEditingTrade(null);}} onCancel={()=>setEditingTrade(null)}/>);
        return(
          <div key={trade.id} style={{background:C.surf,border:`1px solid ${C.bord}`,borderLeft:`3px solid ${pnl>=0?C.green:C.red}`,borderRadius:12,padding:16,marginBottom:10}}>
            <div onClick={()=>setExpandedId(exp?null:trade.id)} style={{cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:15,fontWeight:700,color:"#fff"}}>{trade.instrument}</span>
                  <Tag color={trade.direction==="Long"?C.green:C.red}>{trade.direction}</Tag>
                  {trade.account_type&&<Tag color={typeColor(trade.account_type)}>{trade.account_type}</Tag>}
                  {trade.ai_grade&&<Tag color={gradeColor(trade.ai_grade)}>{trade.ai_grade}</Tag>}
                </div>
                <div style={{fontSize:18,fontWeight:700,color:pnl>=0?C.green:C.red,flexShrink:0,marginLeft:8}}>{pnl>=0?"+":""}${pnl.toFixed(2)}</div>
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:6}}>{trade.date} · {trade.session} · {trade.setup}</div>
            </div>
            {exp&&(
              <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bord}`}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12,marginBottom:10}}>
                  {[["Entry",trade.entry||"—"],["Exit",trade.exit||"—"],["Contracts",trade.contracts],["Stop",trade.stop_loss||"—"],["Mood",trade.mood],["Rules",`${(trade.rules_followed||[]).length}/${RULES.length} ✓`]].map(([l,v])=>(<div key={l}><span style={{color:C.muted}}>{l}: </span><span style={{color:C.txt}}>{v}</span></div>))}
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
                  <button onClick={()=>setEditingTrade({...trade})} style={{flex:1,padding:10,background:C.blue+"20",border:`1px solid ${C.blue}35`,color:C.blue,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>✏️ Edit</button>
                  <button onClick={()=>onDelete(trade.id)} style={{flex:1,padding:10,background:C.red+"20",border:`1px solid ${C.red}35`,color:C.red,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>🗑 Delete</button>
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
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:8}}>
          {["S","M","T","W","T","F","S"].map((d,i)=>(<div key={i} style={{textAlign:"center",fontSize:9,color:C.muted,padding:"4px 0",fontWeight:700}}>{d}</div>))}
          {cells.map((d,i)=>{
            if(!d)return <div key={i}/>;
            const key=dateKey(d),data=dailyMap[key],isToday=key===today,isSelected=selectedDay===d,pnl=data?.pnl;
            const bgColor=pnl>0?C.green+"25":pnl<0?C.red+"25":"transparent";
            const borderColor=isSelected?C.blue:isToday?C.gold:pnl>0?C.green+"60":pnl<0?C.red+"60":C.bord;
            return(<div key={i} onClick={()=>setSelectedDay(isSelected?null:d)} style={{textAlign:"center",padding:"6px 2px",borderRadius:6,background:bgColor,border:`1px solid ${borderColor}`,cursor:data?"pointer":"default",minHeight:36,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:10,color:isToday?C.gold:C.txt,fontWeight:isToday?700:400}}>{d}</div>
              {pnl!==undefined&&<div style={{fontSize:7,color:pnl>=0?C.green:C.red,fontWeight:700,marginTop:1}}>{pnl>=0?"+":""}${Math.abs(pnl).toFixed(0)}</div>}
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
function StatsView({trades}: {trades:any[]}) {
  if(!trades.length)return<div style={{textAlign:"center",padding:"80px 20px",color:C.muted}}><div style={{fontSize:44}}>📊</div><div style={{fontSize:13,fontWeight:600,marginTop:12}}>No data yet</div></div>;
  const setupStats=SETUPS.map(s=>{const st=trades.filter(t=>t.setup===s);return{name:s,pnl:st.reduce((a,t)=>a+(t.pnl||0),0),count:st.length,wins:st.filter(t=>(t.pnl||0)>0).length};}).filter(s=>s.count>0).sort((a,b)=>b.pnl-a.pnl);
  return(
    <div style={{padding:"16px 16px 20px"}}>
      <div style={Object.assign({},CS,{marginBottom:12})}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>SETUP PERFORMANCE</div>
        {setupStats.map(s=>(<div key={s.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.bord}`}}><div><div style={{fontSize:13,color:C.txt,fontWeight:500}}>{s.name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.count} trades · {s.count?(s.wins/s.count*100).toFixed(0):0}% win</div></div><div style={{fontSize:15,fontWeight:700,color:s.pnl>=0?C.green:C.red}}>{s.pnl>=0?"+":""}${s.pnl.toFixed(0)}</div></div>))}
      </div>
      <div style={Object.assign({},CS,{marginBottom:12})}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>RULES COMPLIANCE</div>
        {RULES.map(r=>{const pct=trades.length?(trades.filter(t=>(t.rules_followed||[]).includes(r)).length/trades.length*100).toFixed(0):0;const col=parseFloat(pct as string)>=80?C.green:parseFloat(pct as string)>=50?C.gold:C.red;return(<div key={r} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}><span style={{color:C.dim}}>{r}</span><span style={{color:col,fontWeight:600}}>{pct}%</span></div><div style={{height:5,background:C.bg,borderRadius:3}}><div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:3}}/></div></div>);})}
      </div>
      {trades.some(t=>t.ai_grade)&&(<div style={CS}><div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:12}}>AI GRADES</div><div style={{display:"flex",gap:8}}>{["A","B","C","D","F"].map(g=>{const count=trades.filter(t=>t.ai_grade===g).length;return(<div key={g} style={{flex:1,textAlign:"center",padding:"10px 0",background:count>0?gradeColor(g)+"15":C.bg,borderRadius:8,border:`1px solid ${count>0?gradeColor(g)+"35":C.bord}`}}><div style={{fontSize:18,fontWeight:800,color:gradeColor(g)}}>{count}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{g}</div></div>);})}</div></div>)}
    </div>
  );
}

// ── REVIEW ────────────────────────────────────────────────────────────────────
function ReviewView({trades}: {trades:any[]}) {
  const [period,setPeriod]=useState("week"),[cs,setCs]=useState(""),[ce,setCe]=useState("");
  const [tab,setTab]=useState("generate"),[review,setReview]=useState<any>(null),[loading,setLoading]=useState(false);
  const [copied,setCopied]=useState(false),[paste,setPaste]=useState("");

  function getRange(){const n=new Date();if(period==="week"){const d=n.getDay();const s=new Date(n);s.setDate(n.getDate()-(d===0?6:d-1));const e=new Date(s);e.setDate(s.getDate()+6);return{s:s.toISOString().slice(0,10),e:e.toISOString().slice(0,10)};}if(period==="lastweek"){const d=n.getDay();const e=new Date(n);e.setDate(n.getDate()-(d===0?0:d));const s=new Date(e);s.setDate(e.getDate()-6);return{s:s.toISOString().slice(0,10),e:e.toISOString().slice(0,10)};}if(period==="month")return{s:`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-01`,e:n.toISOString().slice(0,10)};if(period==="lastmonth"){const lm=new Date(n.getFullYear(),n.getMonth()-1,1);const lme=new Date(n.getFullYear(),n.getMonth(),0);return{s:lm.toISOString().slice(0,10),e:lme.toISOString().slice(0,10)};}return{s:cs,e:ce};}
  const rng=getRange();
  const ft=trades.filter(t=>t.date>=rng.s&&t.date<=rng.e);
  const fTotal=ft.reduce((s,t)=>s+(t.pnl||0),0);
  function buildReport(ts: any[]){const wins=ts.filter(t=>(t.pnl||0)>0),total=ts.reduce((s,t)=>s+(t.pnl||0),0);const lines=["=== TRADING REPORT ===",`Period: ${rng.s} to ${rng.e}`,`Trades:${ts.length} Wins:${wins.length} Losses:${ts.length-wins.length} P&L:$${total.toFixed(2)}`,`WinRate:${ts.length?(wins.length/ts.length*100).toFixed(1):0}%`,""];ts.forEach((t,i)=>{lines.push(`#${i+1} ${t.date} | ${t.instrument} ${t.direction}`);lines.push(`Entry:${t.entry} Exit:${t.exit} P&L:$${(t.pnl||0).toFixed(2)}`);lines.push(`Setup:${t.setup} Mood:${t.mood}`);lines.push(`Notes:${t.notes||"—"}`);lines.push("");});return lines.join("\n");}

  async function runReview(text: string){setLoading(true);setReview(null);try{const result=await callAI(`Professional futures trading coach. Analyze this log with honest feedback.\n\n${text}\n\nJSON only: {"overallGrade":"A-F","overallScore":0,"verdict":"","topStrengths":[""],"criticalWeaknesses":[""],"riskManagement":"","psychologyInsights":"","bestTrade":"","worstTrade":"","actionItems":[""],"nextPeriodGoals":[""],"coachMessage":""}`,2000);setReview(result);setTab("result");}catch(e){console.error(e);}setLoading(false);}

  return(
    <div style={{padding:"16px 16px 20px"}}>
      <div style={{display:"flex",gap:6,marginBottom:16}}>{[{id:"generate",l:"Generate"},{id:"paste",l:"Paste"},{id:"result",l:"Results"}].map(t=><Pill key={t.id} active={tab===t.id} color={C.purp} onClick={()=>setTab(t.id)}>{t.l}</Pill>)}</div>
      {tab==="generate"&&(<div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>{[{id:"week",l:"This Week"},{id:"lastweek",l:"Last Week"},{id:"month",l:"This Month"},{id:"lastmonth",l:"Last Month"},{id:"custom",l:"Custom"}].map(p=><Pill key={p.id} active={period===p.id} color={C.purp} onClick={()=>setPeriod(p.id)}>{p.l}</Pill>)}</div>
        {period==="custom"&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}><div><div style={{fontSize:9,color:C.muted,marginBottom:6}}>FROM</div><input type="date" value={cs} onChange={e=>setCs(e.target.value)} style={inp()}/></div><div><div style={{fontSize:9,color:C.muted,marginBottom:6}}>TO</div><input type="date" value={ce} onChange={e=>setCe(e.target.value)} style={inp()}/></div></div>)}
        {ft.length>0?(<div><div style={Object.assign({},CS,{marginBottom:12})}><div style={{fontSize:11,color:C.purp,marginBottom:6}}>{rng.s} → {rng.e} · {ft.length} trades</div><div style={{fontSize:20,fontWeight:800,color:fTotal>=0?C.green:C.red}}>{fTotal>=0?"+":""}${fTotal.toFixed(2)}</div></div><div style={{display:"flex",gap:8}}><button onClick={()=>{navigator.clipboard.writeText(buildReport(ft)).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}} style={{flex:1,padding:12,background:copied?C.green+"20":C.blue+"20",color:copied?C.green:C.blue,border:`1px solid ${copied?C.green+"35":C.blue+"35"}`,borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>{copied?"✓ Copied!":"📋 Copy Log"}</button><button onClick={()=>runReview(buildReport(ft))} disabled={loading} style={{flex:1,padding:12,background:C.purp+"20",color:C.purp,border:`1px solid ${C.purp}35`,borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>{loading?"Analyzing…":"🤖 AI Critique"}</button></div></div>):(<div style={{textAlign:"center",padding:40,color:C.muted}}><div style={{fontSize:32}}>📭</div><div style={{marginTop:10,fontSize:12}}>No trades in this period</div></div>)}
      </div>)}
      {tab==="paste"&&(<div><div style={{fontSize:12,color:C.muted,marginBottom:12,lineHeight:1.7}}>Paste your trade log or notes for an AI coaching critique.</div><textarea value={paste} onChange={e=>setPaste(e.target.value)} rows={10} placeholder="Paste trade log or notes here…" style={inp({resize:"vertical",lineHeight:1.6,marginBottom:10} as any)}/><button onClick={()=>runReview(paste)} disabled={loading||!paste.trim()} style={{width:"100%",padding:13,background:loading||!paste.trim()?C.bord:C.purp,color:loading||!paste.trim()?C.muted:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700}}>{loading?"Analyzing…":"🤖 Get AI Critique"}</button></div>)}
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

// ── EDUCATION CENTER ──────────────────────────────────────────────────────────
function EducationView() {
  const [activeModule, setActiveModule] = useState<number|null>(null);

  const modules = [
    { id:1, title:"Stocks 101", icon:"📈", color:C.blue, desc:"Learn the fundamentals of stock trading, market structure, and how equities work.", lessons:["What is a stock?","How stock markets work","Reading a stock quote","Market cap & valuation","Bull vs bear markets"], status:"coming_soon" },
    { id:2, title:"Futures 101", icon:"⚡", color:C.green, desc:"Master futures contracts, margin, leverage, and the instruments you trade every day.", lessons:["What are futures contracts?","Understanding ES1! & NQ1!","Margin & leverage explained","Contract specifications","Trading hours & sessions"], status:"coming_soon" },
    { id:3, title:"Options 101", icon:"🎯", color:C.gold, desc:"Understand options, calls, puts, and how to use them in your trading strategy.", lessons:["Calls vs puts","Strike price & expiration","Options pricing basics","Greeks overview","Simple strategies"], status:"coming_soon" },
    { id:4, title:"Candle Patterns", icon:"🕯️", color:C.purp, desc:"Master the candle patterns that signal reversals, continuations, and key turning points.", lessons:["Doji & indecision","Hammer & shooting star","Engulfing patterns","Three soldiers & crows","Morning & evening star"], status:"coming_soon" },
    { id:5, title:"Smart Money", icon:"🏦", color:"#f472b6", desc:"Learn institutional order flow, BOS, order blocks, and how the big players move markets.", lessons:["What is smart money?","Break of Structure (BOS)","Order blocks","Fair value gaps","Liquidity sweeps"], status:"coming_soon" },
    { id:6, title:"Risk Management", icon:"🛡️", color:C.green, desc:"The most important skill in trading. Position sizing, stop losses, and protecting your capital.", lessons:["Why risk management matters","Position sizing formulas","Stop loss placement","Risk/reward ratios","Max daily loss rules"], status:"coming_soon" },
    { id:7, title:"Trading Psychology", icon:"🧠", color:C.gold, desc:"Control your emotions, build discipline, and develop the mindset of a professional trader.", lessons:["Fear & greed in trading","Revenge trading traps","Building a routine","Journaling for growth","Mindset of a pro trader"], status:"coming_soon" },
    { id:8, title:"Trading Library", icon:"📚", color:C.blue, desc:"Curated list of must-read trading books recommended by professional traders.", lessons:["Books coming soon…"], status:"coming_soon" },
  ];

  return (
    <div style={{padding:"16px 16px 20px"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:9,color:C.blue,letterSpacing:"0.2em",marginBottom:6}}>TRADEAURA</div>
        <div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:6}}>Education Center</div>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>Master trading from the ground up. Courses coming soon.</div>
      </div>

      <div style={{background:C.gold+"18",border:`1px solid ${C.gold}40`,borderRadius:10,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:18}}>🚧</div>
        <div>
          <div style={{fontSize:12,color:C.gold,fontWeight:700}}>Content Coming Soon</div>
          <div style={{fontSize:11,color:C.dim,marginTop:2}}>We're building out each module. Check back soon!</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {modules.map(m=>(
          <div key={m.id} onClick={()=>setActiveModule(activeModule===m.id?null:m.id)}
            style={{background:C.surf,border:`1px solid ${activeModule===m.id?m.color+"60":C.bord}`,borderRadius:12,padding:14,cursor:"pointer"}}>
            <div style={{fontSize:24,marginBottom:8}}>{m.icon}</div>
            <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>{m.title}</div>
            <div style={{fontSize:10,color:C.muted,lineHeight:1.5,marginBottom:8}}>{m.desc}</div>
            <span style={{fontSize:9,padding:"3px 8px",borderRadius:20,background:C.gold+"22",color:C.gold,fontWeight:700,letterSpacing:"0.08em"}}>COMING SOON</span>
            {activeModule===m.id&&(
              <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bord}`}}>
                <div style={{fontSize:9,color:C.muted,letterSpacing:"0.1em",marginBottom:8}}>LESSONS PREVIEW</div>
                {m.lessons.map((l,i)=><div key={i} style={{fontSize:11,color:C.dim,padding:"5px 0",borderBottom:`1px solid ${C.bord}`,display:"flex",alignItems:"center",gap:8}}><span style={{color:C.muted,fontSize:10}}>{i+1}.</span>{l}</div>)}
              </div>
            )}
          </div>
        ))}
      </div>
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
    setLoading(true);
    try{
      await supabase.from("feedback").insert({user_id:user.id,type,message,rating,created_at:new Date().toISOString()});
      setSuccess(true); setMessage(""); setTimeout(()=>setSuccess(false),3000);
    }catch(e){console.error(e);}
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
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>YOUR MESSAGE</div>
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
function AccountModal({accounts,activeId,onSelect,onAdd,onClose}: {accounts:any[],activeId:any,onSelect:(id:any)=>void,onAdd:(name:string,type:string)=>void,onClose:()=>void}) {
  const [name,setName]=useState(""),[type,setType]=useState("Live");
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",background:C.surf,borderRadius:"20px 20px 0 0",padding:"24px 20px 44px",maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:C.bord,borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontSize:16,fontWeight:700,marginBottom:16,color:C.txt}}>My Accounts</div>
        {accounts.map(a=>(<div key={a.id} onClick={()=>onSelect(a.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderRadius:10,marginBottom:8,background:a.id===activeId?C.blue+"18":C.bg,border:`1px solid ${a.id===activeId?C.blue+"50":C.bord}`,cursor:"pointer"}}>
          <span style={{width:10,height:10,borderRadius:"50%",background:typeColor(a.type),flexShrink:0,display:"inline-block"}}/>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:C.txt}}>{a.name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{a.type} · ${(a.starting_balance||0).toLocaleString()}</div></div>
          {a.id===activeId&&<span style={{color:C.blue,fontSize:14,fontWeight:700}}>✓</span>}
        </div>))}
        <div style={{height:1,background:C.bord,margin:"14px 0"}}/>
        <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",marginBottom:10}}>ADD ACCOUNT</div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>{ACCT_TYPES.map(t=><Pill key={t} active={type===t} color={typeColor(t)} onClick={()=>setType(t)}>{t}</Pill>)}</div>
        <div style={{display:"flex",gap:8}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Account name…" style={inp({flex:1} as any)}/>
          <button onClick={()=>{if(name.trim()){onAdd(name.trim(),type);setName("");onClose();}}} style={{padding:"11px 18px",background:C.blue,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700}}>Add</button>
        </div>
      </div>
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
    async function loadTrades(){
      const {data}=await supabase.from("trades").select("*").eq("account_id",activeAccountId).order("date",{ascending:false});
      if(data)setTrades(data);
    }
    loadTrades();
  },[activeAccountId]);

  // ── TRADE ACTIONS ──
  async function saveTrade(trade: any){
    const pnl=trade.pnl||0;
    const payload={...trade,account_id:activeAccountId,user_id:user.id,pnl};
    if(trade.id&&!trade.id.startsWith("id_")){
      await supabase.from("trades").update(payload).eq("id",trade.id);
      setTrades(prev=>prev.map(t=>t.id===trade.id?payload:t));
    } else {
      const newPayload={...payload,id:undefined};
      const {data}=await supabase.from("trades").insert(newPayload).select().single();
      if(data)setTrades(prev=>[data,...prev]);
    }
    setShowNewTrade(false); setEditingTrade(null);
  }

  async function deleteTrade(id: any){
    await supabase.from("trades").delete().eq("id",id);
    setTrades(prev=>prev.filter(t=>t.id!==id));
  }

  // ── ACCOUNT ACTIONS ──
  async function addAccount(name: string,type: string){
    const {data}=await supabase.from("accounts").insert({user_id:user.id,name,type,starting_balance:25000,max_daily_trades:5}).select().single();
    if(data){setAccounts(prev=>[...prev,data]);setActiveAccountId(data.id);}
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

  if(loading)return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontFamily:"monospace",fontSize:13}}>Loading…</div>;
  if(!user)return<AuthScreen onAuth={setUser}/>;

  const nav=[{id:"home",icon:"⌂",label:"HOME"},{id:"journal",icon:"≡",label:"JOURNAL"},{id:"calendar",icon:"◻",label:"CALENDAR"},{id:"stats",icon:"◈",label:"STATS"},{id:"review",icon:"◉",label:"REVIEW"},{id:"learn",icon:"🎓",label:"LEARN"},{id:"feedback",icon:"💬",label:"FEEDBACK"}];

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.txt,fontFamily:"'DM Mono','Fira Code','Courier New',monospace",maxWidth:480,margin:"0 auto"}}>
      {/* HEADER */}
      <div style={{background:C.surf,borderBottom:`1px solid ${C.bord}`,padding:"13px 16px",position:"sticky",top:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
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
          <button onClick={signOut} style={{background:"transparent",border:`1px solid ${C.bord}`,color:C.muted,padding:"7px 10px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Out</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{paddingBottom:100}}>
        {view==="home"&&<HomeView trades={trades} account={activeAccount} onEditBalance={updateBalance}/>}
        {view==="journal"&&(<div>{(showNewTrade||editingTrade)&&<div style={{padding:"16px 16px 0"}}><TradeForm initial={editingTrade||undefined} isEdit={!!editingTrade} onSave={saveTrade} onCancel={()=>{setShowNewTrade(false);setEditingTrade(null);}}/></div>}<JournalView trades={trades} onSave={saveTrade} onDelete={deleteTrade}/></div>)}
        {view==="calendar"&&<CalendarView trades={trades}/>}
        {view==="stats"&&<StatsView trades={trades}/>}
        {view==="review"&&<ReviewView trades={trades}/>}
        {view==="learn"&&<EducationView/>}
        {view==="feedback"&&<FeedbackView user={user}/>}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.surf,borderTop:`1px solid ${C.bord}`,display:"flex",padding:"8px 0 18px",zIndex:20,overflowX:"auto"}}>
        {nav.map(n=>(<button key={n.id} onClick={()=>{setView(n.id);setShowNewTrade(false);setEditingTrade(null);}} style={{flex:1,minWidth:50,background:"transparent",border:"none",cursor:"pointer",color:view===n.id?C.blue:C.muted,fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"0 4px"}}>
          <span style={{fontSize:16,lineHeight:1}}>{n.icon}</span>
          <span style={{fontSize:7,letterSpacing:"0.06em",fontWeight:view===n.id?700:400}}>{n.label}</span>
        </button>))}
        <div style={{position:"absolute",top:-22,left:"50%",transform:"translateX(-50%)"}}>
          <button onClick={()=>{setView("journal");setEditingTrade(null);setShowNewTrade(s=>!s);}} style={{width:48,height:48,borderRadius:"50%",background:C.blue,border:`3px solid ${C.bg}`,color:"#fff",fontSize:24,cursor:"pointer",boxShadow:`0 4px 20px ${C.blue}55`,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>+</button>
        </div>
      </div>

      {showModal&&<AccountModal accounts={accounts} activeId={activeAccountId} onSelect={id=>{setActiveAccountId(id);setShowModal(false);const acct=accounts.find(a=>a.id===id);if(acct)supabase.from("trades").select("*").eq("account_id",id).order("date",{ascending:false}).then(({data})=>{if(data)setTrades(data);});}} onAdd={addAccount} onClose={()=>setShowModal(false)}/>}
    </div>
  );
}
