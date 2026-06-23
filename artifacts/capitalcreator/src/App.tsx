import { useState, useEffect, useRef } from "react";

// ── TYPES ──────────────────────────────────────────────────────────────────────
type Role = "student" | "mentor";
interface User { id: string; email: string; name: string; role: Role; }
interface Homework { id: string; title: string; desc: string; pillar: number; done: boolean; dueDate: string; feedback?: string; studentNotes?: string; }
interface CheckIn { id: string; week: number; workedOn: string; challenged: string; questions: string; date: string; mentorReply?: string; }
interface DirectMsg { id: string; from: "student" | "mentor"; text: string; date: string; }
interface Student {
  id: string; name: string; email: string; week: number;
  pillarsComplete: number[]; homework: Homework[]; notes: string;
  joinDate: string; nextCall?: string;
  checkIns: CheckIn[];
  pillarNotes: Record<string, string>;
  messages: DirectMsg[];
}
interface Announcement { id: string; title: string; body: string; date: string; pinned?: boolean; }
interface Resource { id: string; title: string; category: string; desc: string; locked: boolean; size?: string; }

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const MENTOR_EMAIL = "adrian@capitalcreator.cc";
const C = {
  bg: "#050508", surf: "#0c1018", surf2: "#111826", bord: "#1a2640",
  blue: "#1A6BFF", white: "#ffffff", muted: "#637394", dim: "#8fa3c4",
  gold: "#d4a843", green: "#34d399", red: "#f87171",
};

const PILLARS = [
  { n: 1, title: "Foundations",              desc: "Core concepts, vocabulary, and the mental models required before anything else." },
  { n: 2, title: "Market Structure",         desc: "How markets move, form, and communicate intent through price action." },
  { n: 3, title: "Bias & Context",           desc: "Reading the broader picture before committing to any directional idea." },
  { n: 4, title: "Liquidity & Confirmations",desc: "Understanding where orders live and what confirms a valid setup." },
  { n: 5, title: "Risk & Execution",         desc: "Position sizing, stop placement, and the mechanics of professional execution." },
  { n: 6, title: "Habits & Discipline",      desc: "The behavioral infrastructure that separates consistent traders from impulsive ones." },
  { n: 7, title: "Refinement",               desc: "Systematic review, journaling, and the process of improving through evidence." },
  { n: 8, title: "Independence",             desc: "Operating without external guidance — making decisions with clarity and conviction." },
];

const DELIVERS = [
  { icon: "◈", t: "Private 1:1 Guidance",             d: "Direct access to structured mentorship tailored to your current level and goals." },
  { icon: "⊞", t: "Structured Weekly Progression",    d: "A clear, week-by-week framework that builds on itself without skipping fundamentals." },
  { icon: "◎", t: "Trade Review Feedback",            d: "Detailed feedback on your actual trades — what worked, what didn't, and why." },
  { icon: "✦", t: "Process Correction",               d: "Identification and correction of behavioral and technical errors before they compound." },
  { icon: "⬡", t: "Risk Framework Refinement",        d: "A personalised approach to position sizing, stop placement, and capital protection." },
  { icon: "◈", t: "Weekly Tracking & Accountability", d: "Consistent check-ins and progress tracking to maintain momentum and direction." },
  { icon: "⊞", t: "Onboarding System & Structure",    d: "A complete onboarding pack, mentorship agreement, and clear next-step instructions from day one." },
  { icon: "◎", t: "Clear Next-Step Guidance",         d: "You always know what to work on next — no confusion, no guesswork." },
];

const FAQS = [
  { q: "Who is this for?",                       a: "Serious individuals who want to build real trading skill through structure, discipline, and professional guidance." },
  { q: "Do I need prior experience?",             a: "No. The framework is adapted to your current level, but you need seriousness, consistency, and willingness to learn." },
  { q: "Is this signals or education?",           a: "This is education and advisory. The goal is to build self-sufficient traders, not dependent followers." },
  { q: "How does onboarding work?",               a: "You apply first. If accepted, you receive the onboarding pack, mentorship structure, agreement, and next-step instructions." },
  { q: "Is the framework fixed?",                 a: "The core structure is fixed, but pacing is adapted to your current level, work ethic, and execution quality." },
  { q: "What if I'm not ready for private advisory?", a: "Start with the free PDF, Blueprint Starter Pack, or Mastering Markets Bundle. These build your foundation before you apply." },
  { q: "What is the best first step?",            a: "If you want direct guidance, apply for private advisory. If you want to begin at your own pace, start with the free PDF." },
];

const MOCK_STUDENTS: Student[] = [
  {
    id: "s1", name: "Amanda R.", email: "amanda@example.com", week: 4,
    pillarsComplete: [1, 2, 3],
    homework: [
      { id: "h1", title: "Mark up 3 charts using market structure", desc: "Use the structure framework from Pillar 2. Identify BOS and CHoCH.", pillar: 2, done: true, dueDate: "2025-06-15", feedback: "Good work on BOS identification. Work on CHoCH timing.", studentNotes: "CHoCH is tricky on lower timeframes — keeping extra notes on this." },
      { id: "h2", title: "Journal your last 5 trades", desc: "Full entry, exit, reasoning, and emotional state for each.", pillar: 3, done: false, dueDate: "2025-06-28" },
      { id: "h3", title: "Identify 5 liquidity levels on NQ", desc: "Mark buy-side and sell-side liquidity on the daily chart.", pillar: 4, done: false, dueDate: "2025-06-28" }
    ],
    notes: "Strong mindset, needs work on entry confirmation. Consistent with homework. Push harder on liquidity.",
    joinDate: "2025-05-01", nextCall: "2025-06-25",
    checkIns: [
      { id: "ci1", week: 3, workedOn: "Reviewed bias & context, practiced market structure identification on 20 charts.", challenged: "Finding clean context when price is ranging — hard to know when to sit out.", questions: "How do you handle choppy markets — do you avoid them entirely?", date: "2025-06-16", mentorReply: "Yes. When you can't identify a clean bias, that IS your answer — no trade. Clean trend days are your best friend." }
    ],
    pillarNotes: {
      "1": "Foundations: structure, bias, execution. Review vocabulary list weekly.",
      "2": "BOS = Break of Structure. CHoCH = Change of Character. Practice on live charts daily."
    },
    messages: [
      { id: "msg1", from: "student", text: "Should I be looking at the weekly chart for bias before going into daily?", date: "2025-06-19" },
      { id: "msg2", from: "mentor", text: "Always. Weekly = macro picture. Daily = execution window. Never trade against the weekly bias.", date: "2025-06-19" }
    ]
  },
  {
    id: "s2", name: "Jacob M.", email: "jacob@example.com", week: 9,
    pillarsComplete: [1, 2, 3, 4, 5, 6, 7],
    homework: [
      { id: "h4", title: "Build your personal trading playbook", desc: "Document your 3 best setups with full rules, entry criteria, and examples.", pillar: 8, done: true, dueDate: "2025-06-20", feedback: "Excellent. This is exactly what a professional playbook looks like.", studentNotes: "Documented 3 setups: structural BOS play, liquidity sweep + confirmation, daily bias + intraday alignment." }
    ],
    notes: "Top performer. Almost ready for independence phase. Final pillar focus on his personal playbook.",
    joinDate: "2025-03-15", nextCall: "2025-06-24",
    checkIns: [
      { id: "ci2", week: 8, workedOn: "Refined execution rules and removed low-quality setups from my playbook.", challenged: "Patience. Still tempted to take B-grade setups when the market is slow.", questions: "At what point do you consider a student ready to trade fully independently?", date: "2025-06-10", mentorReply: "When your process is repeatable, your losses are clean, and you're not chasing. You're close." }
    ],
    pillarNotes: {
      "7": "Refinement = cutting what doesn't work, not adding more setups.",
      "8": "Independence = trusting my own read without needing external validation."
    },
    messages: []
  },
  {
    id: "s3", name: "Marcus T.", email: "marcus@example.com", week: 2,
    pillarsComplete: [1],
    homework: [
      { id: "h5", title: "Read Foundations PDF + take notes", desc: "Write down the 10 most important concepts in your own words.", pillar: 1, done: true, dueDate: "2025-06-18", studentNotes: "Top 10: market structure, bias, confirmation, risk, execution, discipline, refinement, process, patience, independence." },
      { id: "h6", title: "10 annotated structure charts", desc: "Manually annotate market structure on 10 charts.", pillar: 2, done: false, dueDate: "2025-06-28" }
    ],
    notes: "New student. Focused, asks good questions. Keep him on foundations — wants to skip ahead.",
    joinDate: "2025-06-10", nextCall: "2025-06-27",
    checkIns: [],
    pillarNotes: {},
    messages: []
  },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", title: "Week 6 Group Review — Friday 6PM EST", body: "We'll be doing a live chart review this Friday. Make sure your journals are updated and bring 2 charts you want feedback on. Link sent to your email 1 hour before.", date: "2025-06-18", pinned: true },
  { id: "a2", title: "New Resource: Liquidity PDF v2 is Live", body: "Updated version of the Liquidity & Confirmations PDF is now in your resources. Key changes to the confluence framework on pages 8–12. Re-read those sections if you're on Pillar 4.", date: "2025-06-14" },
  { id: "a3", title: "Reminder: Trade Journals Due This Week", body: "If you haven't submitted your weekly trade journal, get it done before your next call. This is non-negotiable — the review only works if you're tracking.", date: "2025-06-10" },
];

const MOCK_RESOURCES: Resource[] = [
  { id: "r1",  title: "Foundations PDF",               category: "Pillar 01",   desc: "Core concepts, vocabulary, and the mental models required before anything else.", locked: false, size: "2.4 MB" },
  { id: "r2",  title: "Market Structure Guide",         category: "Pillar 02",   desc: "How markets move, form, and communicate intent through price action.", locked: false, size: "3.8 MB" },
  { id: "r3",  title: "Bias & Context Workbook",        category: "Pillar 03",   desc: "Reading the broader picture before committing to any directional idea.", locked: false, size: "1.9 MB" },
  { id: "r4",  title: "Liquidity & Confirmations v2",   category: "Pillar 04",   desc: "Understanding where orders live and what confirms a valid setup. Updated June 2025.", locked: true, size: "4.1 MB" },
  { id: "r5",  title: "Risk & Execution Framework",     category: "Pillar 05",   desc: "Position sizing, stop placement, and the mechanics of professional execution.", locked: true, size: "2.7 MB" },
  { id: "r6",  title: "Habits & Discipline System",     category: "Pillar 06",   desc: "The behavioral infrastructure that separates consistent traders from impulsive ones.", locked: true, size: "3.2 MB" },
  { id: "r7",  title: "Blueprint Starter Pack",         category: "Free",        desc: "Build your foundation before applying to the private advisory.", locked: false, size: "5.6 MB" },
  { id: "r8",  title: "Weekly Review Template",         category: "Tools",       desc: "Adrian's personal template for weekly trade and process review.", locked: false, size: "0.8 MB" },
  { id: "r9",  title: "Trade Journal Template",         category: "Tools",       desc: "Structured journal format used by all Capital Creator students.", locked: false, size: "1.2 MB" },
  { id: "r10", title: "Mastering Markets Bundle",       category: "Bonus",       desc: "Extended deep-dives on structure, execution, and refinement for advanced students.", locked: true, size: "8.4 MB" },
];

// ── HELPERS ────────────────────────────────────────────────────────────────────
function loadStudents(): Student[] {
  const raw = localStorage.getItem("cc_students");
  const base: Student[] = raw ? JSON.parse(raw) : MOCK_STUDENTS;
  return base.map(s => ({ ...s, checkIns: s.checkIns ?? [], pillarNotes: s.pillarNotes ?? {}, messages: s.messages ?? [] }));
}
function saveStudents(students: Student[]) { localStorage.setItem("cc_students", JSON.stringify(students)); }
function loadResources(): Resource[] { const raw = localStorage.getItem("cc_resources"); return raw ? JSON.parse(raw) : MOCK_RESOURCES; }
function saveResources(r: Resource[]) { localStorage.setItem("cc_resources", JSON.stringify(r)); }
function daysUntil(d: string): number { return Math.ceil((new Date(d + "T12:00:00").getTime() - Date.now()) / 86400000); }

const inp = (x: React.CSSProperties = {}): React.CSSProperties => ({ width: "100%", background: "#080c14", border: `1px solid ${C.bord}`, color: C.white, padding: "13px 16px", borderRadius: 8, fontSize: 15, outline: "none", transition: "border-color .2s", ...x });

function CCLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, background: C.blue, borderRadius: size * 0.22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 ${size * 0.45}px #1A6BFF44` }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 20 20" fill="none">
        <path d="M9 5C7.5 5 5 6.5 5 10C5 13.5 7.5 15 9 15" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M15 5C13.5 5 11 6.5 11 10C11 13.5 13.5 15 15 15" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 28, height: 1.5, background: C.blue }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: C.blue, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>{children}</span>
    </div>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed" as const, bottom: 96, left: "50%", transform: "translateX(-50%)", background: C.surf2, border: `1px solid ${C.blue}55`, borderRadius: 12, padding: "12px 22px", fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 8px 40px #00000099", whiteSpace: "nowrap" as const, animation: "fadeUp .3s ease" }}>
      {msg}
    </div>
  );
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── AUTH ───────────────────────────────────────────────────────────────────────
function AuthPage({ onAuth, onBack }: { onAuth: (u: User) => void; onBack: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState(""); const [error, setError] = useState("");

  function submit() {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }
    const role: Role = email.toLowerCase() === MENTOR_EMAIL ? "mentor" : "student";
    const users: User[] = JSON.parse(localStorage.getItem("cc_users") || "[]");
    if (mode === "login") {
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) { setError("No account found. Sign up first."); return; }
      localStorage.setItem("cc_session", JSON.stringify(found)); onAuth(found);
    } else {
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) { setError("Account exists. Sign in instead."); return; }
      const u: User = { id: `u_${Date.now()}`, email, name: name || email.split("@")[0], role };
      localStorage.setItem("cc_users", JSON.stringify([...users, u]));
      localStorage.setItem("cc_session", JSON.stringify(u)); onAuth(u);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><CCLogo size={52} /></div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>Capital Creator</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 5, letterSpacing: "0.1em" }}>STUDENT PORTAL</div>
        </div>
        <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{mode === "login" ? "Welcome back" : "Create your account"}</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>{mode === "login" ? "Sign in to access your portal" : "Get access to your curriculum and resources"}</div>
          {error && <div style={{ background: "#f8717118", border: "1px solid #f8717140", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16 }}>{error}</div>}
          {mode === "signup" && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>FULL NAME</div><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inp()} /></div>}
          <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>EMAIL</div><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inp()} /></div>
          <div style={{ marginBottom: 24 }}><div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>PASSWORD</div><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp()} onKeyDown={e => e.key === "Enter" && submit()} /></div>
          <button onClick={submit} className="btn-blue" style={{ width: "100%", padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 16 }}>
            {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
          <div style={{ textAlign: "center", fontSize: 13, color: C.muted }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ color: C.blue, cursor: "pointer", fontWeight: 600 }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, fontSize: 13 }}>← Back to site</button>
        </div>
      </div>
    </div>
  );
}

// ── HOMEWORK TAB ───────────────────────────────────────────────────────────────
function HomeworkTab({ student, allStudents, setToast }: { student: Student; allStudents: Student[]; setToast: (s: string) => void }) {
  const [submitOpen, setSubmitOpen] = useState<string | null>(null);
  const [submitNote, setSubmitNote] = useState("");
  const [msgText, setMsgText] = useState("");
  const hwDone = student.homework.filter(h => h.done).length;

  function markComplete(hwId: string) {
    const updated = allStudents.map(s => {
      if (s.id !== student.id) return s;
      return { ...s, homework: s.homework.map(h => h.id === hwId ? { ...h, done: true, studentNotes: submitNote || h.studentNotes } : h) };
    });
    saveStudents(updated);
    setSubmitOpen(null); setSubmitNote("");
    setToast("✓ Assignment marked complete");
  }

  function sendMsg() {
    if (!msgText.trim()) return;
    const msg: DirectMsg = { id: `msg_${Date.now()}`, from: "student", text: msgText.trim(), date: new Date().toISOString().slice(0, 10) };
    const updated = allStudents.map(s => s.id === student.id ? { ...s, messages: [...s.messages, msg] } : s);
    saveStudents(updated);
    setMsgText(""); setToast("✓ Message sent to Adrian");
  }

  return (
    <div style={{ paddingTop: 24, animation: "fadeUp .5s ease" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Homework</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>{hwDone} of {student.homework.length} completed</div>
      </div>

      <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em" }}>COMPLETION</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: hwDone === student.homework.length ? C.green : C.gold }}>{hwDone}/{student.homework.length}</span>
        </div>
        <div style={{ height: 5, background: "#1a2640", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${student.homework.length ? (hwDone / student.homework.length) * 100 : 0}%`, height: "100%", background: hwDone === student.homework.length ? C.green : C.blue, borderRadius: 3, transition: "width 1s ease" }} />
        </div>
      </div>

      {student.homework.map(hw => (
        <div key={hw.id} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: hw.done ? `${C.blue}22` : "#1a2640", border: `1.5px solid ${hw.done ? C.blue : C.bord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              {hw.done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: hw.done ? 500 : 700, color: hw.done ? C.muted : C.white, textDecoration: hw.done ? "line-through" : "none", marginBottom: 4 }}>{hw.title}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 6 }}>{hw.desc}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: C.muted }}>Pillar 0{hw.pillar} · Due {hw.dueDate}</span>
                {hw.done && <span style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>✓ Complete</span>}
                {!hw.done && submitOpen !== hw.id && (
                  <button onClick={() => { setSubmitOpen(hw.id); setSubmitNote(""); }} style={{ fontSize: 11, color: C.blue, fontWeight: 700, background: `${C.blue}18`, border: `1px solid ${C.blue}35`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>
                    + Submit
                  </button>
                )}
              </div>

              {/* Submit form */}
              {!hw.done && submitOpen === hw.id && (
                <div style={{ marginTop: 12, animation: "fadeUp .2s ease" }}>
                  <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", marginBottom: 6 }}>SUBMISSION NOTES (optional)</div>
                  <textarea value={submitNote} onChange={e => setSubmitNote(e.target.value)} placeholder="Describe what you did, observations, or questions about this assignment…" rows={3} style={{ ...inp({ fontSize: 13 }), resize: "none", lineHeight: 1.6 } as React.CSSProperties} />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => markComplete(hw.id)} className="btn-blue" style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none" }}>MARK COMPLETE</button>
                    <button onClick={() => setSubmitOpen(null)} className="btn-outline" style={{ padding: "9px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Cancel</button>
                  </div>
                </div>
              )}

              {hw.studentNotes && hw.done && (
                <div style={{ marginTop: 8, background: "#0c101833", border: `1px solid ${C.bord}`, borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", marginBottom: 3 }}>YOUR NOTES</div>
                  <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>{hw.studentNotes}</div>
                </div>
              )}
              {hw.feedback && (
                <div style={{ marginTop: 8, background: `${C.blue}0d`, border: `1px solid ${C.blue}30`, borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>MENTOR FEEDBACK</div>
                  <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{hw.feedback}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {student.homework.length === 0 && (
        <div style={{ textAlign: "center", color: C.muted, fontSize: 14, paddingTop: 32, paddingBottom: 16 }}>No assignments yet. Check back after your next call.</div>
      )}

      {/* Message Adrian */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 14 }}>DIRECT MESSAGE</div>
        {student.messages.length > 0 && (
          <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
            {student.messages.slice(-4).map(m => (
              <div key={m.id} style={{ marginBottom: 12, display: "flex", flexDirection: "column" as const, alignItems: m.from === "student" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "85%", background: m.from === "student" ? `${C.blue}22` : C.surf2, border: `1px solid ${m.from === "student" ? C.blue + "40" : C.bord}`, borderRadius: 10, padding: "9px 13px" }}>
                  <div style={{ fontSize: 12, color: m.from === "student" ? C.blue : C.dim, lineHeight: 1.6 }}>{m.text}</div>
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{m.from === "mentor" ? "Adrian" : "You"} · {m.date}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Ask Adrian a question…" style={{ ...inp(), padding: "11px 14px", fontSize: 14, flex: 1 }} />
          <button onClick={sendMsg} disabled={!msgText.trim()} className="btn-blue" style={{ padding: "0 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", opacity: msgText.trim() ? 1 : 0.4 }}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ── RESOURCES TAB ──────────────────────────────────────────────────────────────
function ResourcesTab({ resources }: { resources: Resource[] }) {
  const [filter, setFilter] = useState("All");
  const FILTERS = ["All", "Free", "Pillars", "Tools", "Bonus"];
  const filtered = resources.filter(r => {
    if (filter === "All") return true;
    if (filter === "Free") return r.category === "Free";
    if (filter === "Pillars") return r.category.startsWith("Pillar");
    if (filter === "Tools") return r.category === "Tools";
    if (filter === "Bonus") return r.category === "Bonus";
    return true;
  });

  return (
    <div style={{ paddingTop: 24, animation: "fadeUp .5s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Resources</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>PDFs, guides, and course materials</div>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 18, scrollbarWidth: "none" }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1px solid ${filter === f ? C.blue : C.bord}`, background: filter === f ? `${C.blue}22` : "transparent", color: filter === f ? C.blue : C.muted, cursor: "pointer", transition: "all .15s" }}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", color: C.muted, fontSize: 14, paddingTop: 40 }}>No resources in this category.</div>
      )}

      {filtered.map(r => (
        <div key={r.id} className={r.locked ? "" : "card-hover"} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 10, opacity: r.locked ? 0.5 : 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 5 }}>{r.category.toUpperCase()}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 4 }}>{r.desc}</div>
              {r.size && <div style={{ fontSize: 11, color: C.muted }}>{r.size}</div>}
            </div>
            <button style={{ flexShrink: 0, padding: "9px 16px", background: r.locked ? "transparent" : C.blue, border: `1px solid ${r.locked ? C.bord : C.blue}`, color: r.locked ? C.muted : "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: r.locked ? "default" : "pointer" }}>
              {r.locked ? "Locked" : "Download"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CURRICULUM TAB ─────────────────────────────────────────────────────────────
function CurriculumTab({ student, allStudents }: { student: Student; allStudents: Student[] }) {
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);
  const [noteVal, setNoteVal] = useState("");

  function openPillar(n: number) {
    if (expandedPillar === n) { setExpandedPillar(null); return; }
    setExpandedPillar(n);
    setNoteVal(student.pillarNotes[String(n)] ?? "");
  }

  function saveNote(pillarN: number) {
    const updated = allStudents.map(s => {
      if (s.id !== student.id) return s;
      return { ...s, pillarNotes: { ...s.pillarNotes, [String(pillarN)]: noteVal } };
    });
    saveStudents(updated);
  }

  return (
    <div style={{ paddingTop: 24, animation: "fadeUp .5s ease" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Your Curriculum</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>12-week framework · 8 core pillars</div>
      </div>

      <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em" }}>12-WEEK FRAMEWORK</span>
          <span style={{ fontSize: 11, color: C.blue, fontWeight: 700 }}>Week {student.week} of 12</span>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 2, background: i < student.week ? C.blue : "#1a2640", opacity: i < student.week ? (i === student.week - 1 ? 1 : 0.55) : 0.3 }} />
          ))}
        </div>
      </div>

      {PILLARS.map(p => {
        const done = student.pillarsComplete.includes(p.n);
        const current = !done && student.pillarsComplete.length === p.n - 1;
        const locked = !done && !current;
        const isOpen = expandedPillar === p.n;
        const hasNote = !!student.pillarNotes[String(p.n)];

        return (
          <div key={p.n} style={{ background: C.surf, border: `1px solid ${isOpen ? C.blue + "55" : current ? C.blue + "33" : C.bord}`, borderRadius: 12, marginBottom: 10, overflow: "hidden", opacity: locked ? 0.45 : 1, transition: "border-color .2s" }}>
            <div onClick={() => !locked && openPillar(p.n)} style={{ display: "flex", gap: 14, alignItems: "center", padding: 16, cursor: locked ? "default" : "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: done ? `${C.blue}22` : current ? `${C.blue}15` : "#1a2640", border: `1px solid ${done ? C.blue + "55" : current ? C.blue + "35" : C.bord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {done
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  : <span style={{ fontSize: 12, fontWeight: 800, color: current ? C.blue : C.muted }}>0{p.n}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" as const }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{p.title}</span>
                  {done    && <span style={{ fontSize: 10, color: C.blue,  background: `${C.blue}18`,  border: `1px solid ${C.blue}30`,  borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>COMPLETE</span>}
                  {current && <span style={{ fontSize: 10, color: C.gold,  background: `${C.gold}18`,  border: `1px solid ${C.gold}30`,  borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>IN PROGRESS</span>}
                  {locked  && <span style={{ fontSize: 10, color: C.muted, background: "#1a264018", border: `1px solid ${C.bord}`, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>LOCKED</span>}
                  {hasNote && !locked && <span style={{ fontSize: 10, color: C.dim, background: "#1a264033", border: `1px solid ${C.bord}`, borderRadius: 20, padding: "2px 8px" }}>notes</span>}
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>{p.desc}</div>
              </div>
              {!locked && <span style={{ color: C.muted, fontSize: 14, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>›</span>}
            </div>

            {isOpen && (
              <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.bord}`, paddingTop: 14, animation: "fadeUp .2s ease" }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", marginBottom: 8 }}>MY NOTES</div>
                <textarea
                  value={noteVal}
                  onChange={e => setNoteVal(e.target.value)}
                  placeholder="Write your notes, key concepts, or observations for this pillar…"
                  rows={4}
                  style={{ ...inp(), resize: "none", lineHeight: 1.65, fontSize: 13 } as React.CSSProperties}
                />
                <button onClick={() => saveNote(p.n)} className="btn-blue" style={{ marginTop: 10, padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none" }}>
                  SAVE NOTES
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── STUDENT PORTAL ─────────────────────────────────────────────────────────────
function StudentPortal({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [tab, setTab] = useState<"home"|"curriculum"|"resources"|"updates"|"homework">("home");
  const [toast, setToast] = useState("");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [ciWorkedOn, setCiWorkedOn] = useState("");
  const [ciChallenged, setCiChallenged] = useState("");
  const [ciQuestions, setCiQuestions] = useState("");

  const allStudents = loadStudents();
  const student = allStudents.find(s => s.email.toLowerCase() === user.email.toLowerCase()) ?? allStudents[0];
  const announcements: Announcement[] = JSON.parse(localStorage.getItem("cc_announcements") || JSON.stringify(MOCK_ANNOUNCEMENTS));
  const pct = Math.round((student.pillarsComplete.length / 8) * 100);
  const hwDone = student.homework.filter(h => h.done).length;
  const thisWeekCI = student.checkIns.find(c => c.week === student.week);

  function submitCheckIn() {
    if (!ciWorkedOn || !ciChallenged || !ciQuestions) return;
    const updated = allStudents.map(s => {
      if (s.id !== student.id) return s;
      const ci: CheckIn = { id: `ci_${Date.now()}`, week: student.week, workedOn: ciWorkedOn, challenged: ciChallenged, questions: ciQuestions, date: new Date().toISOString().slice(0, 10) };
      return { ...s, checkIns: [...s.checkIns, ci] };
    });
    saveStudents(updated);
    setCiWorkedOn(""); setCiChallenged(""); setCiQuestions(""); setCheckInOpen(false);
    setToast("✓ Week " + student.week + " check-in submitted");
  }

  const NAV = [
    { id: "home",       label: "Home",       svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> },
    { id: "curriculum", label: "Curriculum", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
    { id: "resources",  label: "Resources",  svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg> },
    { id: "updates",    label: "Updates",    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { id: "homework",   label: "Homework",   svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      {/* TOP NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: `1px solid ${C.bord}`, position: "sticky", top: 0, background: `${C.bg}ee`, backdropFilter: "blur(20px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CCLogo size={32} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "-0.01em" }}>Capital Creator</div>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.06em" }}>STUDENT PORTAL</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, color: C.dim, display: "none" }}>{user.name}</div>
          <button onClick={onSignOut} className="btn-outline" style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 96px" }}>

        {/* HOME TAB */}
        {tab === "home" && (
          <div style={{ paddingTop: 24, animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Hey, {user.name.split(" ")[0]}.</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>Week {student.week} of 12 · Keep building.</div>
            </div>

            {/* Progress card */}
            <div style={{ background: "linear-gradient(135deg, #0d1830 0%, #0f1f3d 100%)", border: `1px solid ${C.bord}`, borderRadius: 16, padding: 20, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>OVERALL PROGRESS</div>
                  <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-0.03em" }}>{pct}<span style={{ fontSize: 18, color: C.muted, fontWeight: 600 }}>%</span></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 4 }}>PILLARS</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{student.pillarsComplete.length}<span style={{ fontSize: 13, color: C.muted }}>/8</span></div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Week {student.week}/12</div>
                </div>
              </div>
              <div style={{ height: 6, background: "#1a2640", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, #6db3ff)`, borderRadius: 3, transition: "width 1.2s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: C.muted }}>Joined {student.joinDate}</span>
                {student.pillarsComplete.length < 8 && <span style={{ fontSize: 11, color: C.blue, fontWeight: 600 }}>Pillar {student.pillarsComplete.length + 1} is next →</span>}
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>HOMEWORK</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: hwDone === student.homework.length ? C.green : C.gold }}>{hwDone}<span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>/{student.homework.length}</span></div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Completed</div>
              </div>
              {student.nextCall ? (
                <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>NEXT CALL</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{new Date(student.nextCall).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Scheduled</div>
                </div>
              ) : (
                <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>CURRENT WEEK</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>Week {student.week}</div>
                </div>
              )}
            </div>

            {/* Weekly check-in */}
            {!thisWeekCI ? (
              <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: checkInOpen ? 16 : 0 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Weekly Check-In</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Week {student.week} · Not yet submitted</div>
                  </div>
                  <button onClick={() => setCheckInOpen(!checkInOpen)} className={checkInOpen ? "btn-outline" : "btn-blue"} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {checkInOpen ? "Cancel" : "SUBMIT →"}
                  </button>
                </div>
                {checkInOpen && (
                  <div style={{ animation: "fadeUp .25s ease" }}>
                    {[
                      { label: "What did you work on this week?", val: ciWorkedOn, set: setCiWorkedOn, ph: "Describe what you studied or practiced…" },
                      { label: "What challenged you?", val: ciChallenged, set: setCiChallenged, ph: "Be specific — this helps Adrian prepare your call." },
                      { label: "Questions for your next call?", val: ciQuestions, set: setCiQuestions, ph: "Any setups, concepts, or situations you want to cover." },
                    ].map(f => (
                      <div key={f.label} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", marginBottom: 6 }}>{f.label.toUpperCase()}</div>
                        <textarea value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} rows={2} style={{ ...inp(), resize: "none", lineHeight: 1.6 } as React.CSSProperties} />
                      </div>
                    ))}
                    <button onClick={submitCheckIn} disabled={!ciWorkedOn || !ciChallenged || !ciQuestions} className="btn-blue" style={{ width: "100%", padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 700, opacity: ciWorkedOn && ciChallenged && ciQuestions ? 1 : 0.45 }}>
                      SUBMIT CHECK-IN
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: C.surf, border: `1px solid ${C.green}33`, borderLeft: `3px solid ${C.green}`, borderRadius: "0 12px 12px 0", padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: C.green, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>WEEK {student.week} CHECK-IN SUBMITTED</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{thisWeekCI.workedOn.substring(0, 90)}{thisWeekCI.workedOn.length > 90 ? "…" : ""}</div>
                {thisWeekCI.mentorReply && (
                  <div style={{ marginTop: 10, background: `${C.blue}0d`, border: `1px solid ${C.blue}25`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>ADRIAN'S REPLY</div>
                    <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{thisWeekCI.mentorReply}</div>
                  </div>
                )}
              </div>
            )}

            {/* Next call countdown */}
            {student.nextCall && (() => {
              const days = daysUntil(student.nextCall);
              return (
                <div style={{ background: C.surf, border: `1px solid ${days <= 2 ? C.gold + "55" : C.bord}`, borderRadius: 12, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 3 }}>NEXT 1:1 CALL</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{new Date(student.nextCall + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: days <= 1 ? C.gold : days <= 3 ? C.blue : C.white }}>{days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}</div>
                    {days > 1 && <div style={{ fontSize: 10, color: C.muted }}>away</div>}
                  </div>
                </div>
              );
            })()}

            {/* Latest update */}
            {announcements[0] && (
              <div onClick={() => setTab("updates")} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderLeft: `3px solid ${C.blue}`, borderRadius: "0 12px 12px 0", padding: 16, marginBottom: 12, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 5 }}>LATEST UPDATE</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{announcements[0].title}</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{announcements[0].body.substring(0, 110)}…</div>
                  </div>
                  <span style={{ color: C.blue, fontSize: 18, flexShrink: 0 }}>›</span>
                </div>
              </div>
            )}

            {/* Next pillar */}
            {student.pillarsComplete.length < 8 && (() => {
              const next = PILLARS[student.pillarsComplete.length];
              return (
                <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 12 }}>UP NEXT IN YOUR CURRICULUM</div>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ width: 42, height: 42, background: `${C.blue}18`, border: `1px solid ${C.blue}40`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.blue, flexShrink: 0 }}>0{next.n}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{next.title}</div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{next.desc}</div>
                    </div>
                  </div>
                  <button onClick={() => setTab("curriculum")} className="btn-blue" style={{ width: "100%", padding: 11, borderRadius: 8, fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>
                    GO TO CURRICULUM →
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* CURRICULUM TAB */}
        {tab === "curriculum" && (
          <CurriculumTab student={student} allStudents={allStudents} />
        )}

        {/* RESOURCES TAB */}
        {tab === "resources" && (
          <ResourcesTab resources={loadResources()} />
        )}

        {/* UPDATES TAB */}
        {tab === "updates" && (
          <div style={{ paddingTop: 24, animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Updates</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>Messages from Adrian</div>
            </div>
            {announcements.map((a, i) => (
              <div key={a.id} style={{ background: C.surf, border: `1px solid ${a.pinned ? C.blue + "44" : C.bord}`, borderLeft: `3px solid ${i === 0 ? C.blue : a.pinned ? C.blue : C.bord}`, borderRadius: "0 12px 12px 0", padding: 18, marginBottom: 12 }}>
                {a.pinned && <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>PINNED</div>}
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{a.date}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.75 }}>{a.body}</div>
              </div>
            ))}
          </div>
        )}

        {/* HOMEWORK TAB */}
        {tab === "homework" && (
          <HomeworkTab student={student} allStudents={allStudents} setToast={setToast} />
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: `${C.bg}f2`, backdropFilter: "blur(20px)", borderTop: `1px solid ${C.bord}`, display: "flex", padding: "10px 0 max(18px, env(safe-area-inset-bottom))" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id as typeof tab)} className="nav-item" style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: tab === n.id ? C.blue : C.muted, padding: "4px 0" }}>
            {n.svg}
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MENTOR REPLY INPUT ─────────────────────────────────────────────────────────
function MentorReplyInput({ sel, updateStudent, onSent }: { sel: Student; updateStudent: (id: string, patch: Partial<Student>) => void; onSent: () => void }) {
  const [val, setVal] = useState("");
  function send() {
    if (!val.trim()) return;
    const msg: DirectMsg = { id: `msg_${Date.now()}`, from: "mentor", text: val.trim(), date: new Date().toISOString().slice(0, 10) };
    updateStudent(sel.id, { messages: [...sel.messages, msg] });
    setVal(""); onSent();
  }
  return (
    <>
      <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Reply to student…" style={{ ...inp(), padding: "11px 14px", fontSize: 14, flex: 1 }} />
      <button onClick={send} disabled={!val.trim()} className="btn-blue" style={{ padding: "0 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", opacity: val.trim() ? 1 : 0.4 }}>Send</button>
    </>
  );
}

// ── MENTOR DASHBOARD ────────────────────────────────────────────────────────────
function MentorDashboard({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [tab, setTab] = useState<"students"|"announce"|"library"|"schedule">("students");
  const [selected, setSelected] = useState<Student | null>(null);
  const [detailTab, setDetailTab] = useState<"overview"|"homework"|"checkins"|"messages"|"notes">("overview");
  const [annTitle, setAnnTitle] = useState(""); const [annBody, setAnnBody] = useState(""); const [toast, setToast] = useState("");
  const [editingNotes, setEditingNotes] = useState(false); const [notesVal, setNotesVal] = useState("");
  const [addHwOpen, setAddHwOpen] = useState(false);
  const [hwTitle, setHwTitle] = useState(""); const [hwDesc, setHwDesc] = useState(""); const [hwPillar, setHwPillar] = useState("1"); const [hwDue, setHwDue] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null); const [feedbackVal, setFeedbackVal] = useState("");
  const [replyOpen, setReplyOpen] = useState<string | null>(null); const [replyVal, setReplyVal] = useState("");

  const students = loadStudents();
  const resources = loadResources();
  const announcements: Announcement[] = JSON.parse(localStorage.getItem("cc_announcements") || JSON.stringify(MOCK_ANNOUNCEMENTS));

  const sel = selected ? students.find(s => s.id === selected.id) ?? selected : null;

  function studentStatus(s: Student) {
    const hwPct = s.homework.length ? s.homework.filter(h => h.done).length / s.homework.length : 1;
    if (hwPct === 1 && s.week >= 3) return { label: "On Track", color: C.green };
    if (hwPct >= 0.5) return { label: "Needs Attention", color: C.gold };
    return { label: "Behind", color: C.red };
  }

  function updateStudent(id: string, patch: Partial<Student>) {
    const updated = students.map(s => s.id === id ? { ...s, ...patch } : s);
    saveStudents(updated);
    if (sel && sel.id === id) setSelected({ ...sel, ...patch });
  }

  function togglePillar(pillarN: number) {
    if (!sel) return;
    const pillars = sel.pillarsComplete.includes(pillarN)
      ? sel.pillarsComplete.filter(p => p !== pillarN)
      : [...sel.pillarsComplete, pillarN].sort((a, b) => a - b);
    updateStudent(sel.id, { pillarsComplete: pillars });
  }

  function saveNotes() { if (!sel) return; updateStudent(sel.id, { notes: notesVal }); setEditingNotes(false); setToast("✓ Notes saved"); }

  function postAnn() {
    if (!annTitle || !annBody) return;
    const a: Announcement = { id: `a_${Date.now()}`, title: annTitle, body: annBody, date: new Date().toISOString().slice(0, 10) };
    localStorage.setItem("cc_announcements", JSON.stringify([a, ...announcements]));
    setAnnTitle(""); setAnnBody(""); setToast("✓ Announcement posted");
  }

  function addHomework() {
    if (!sel || !hwTitle || !hwDue) return;
    const hw: Homework = { id: `hw_${Date.now()}`, title: hwTitle, desc: hwDesc, pillar: parseInt(hwPillar), done: false, dueDate: hwDue };
    updateStudent(sel.id, { homework: [...sel.homework, hw] });
    setHwTitle(""); setHwDesc(""); setHwPillar("1"); setHwDue(""); setAddHwOpen(false); setToast("✓ Homework assigned");
  }

  function saveFeedback(hwId: string) {
    if (!sel) return;
    updateStudent(sel.id, { homework: sel.homework.map(h => h.id === hwId ? { ...h, feedback: feedbackVal } : h) });
    setFeedbackOpen(null); setFeedbackVal(""); setToast("✓ Feedback saved");
  }

  function replyToCheckIn(ciId: string) {
    if (!sel) return;
    updateStudent(sel.id, { checkIns: sel.checkIns.map(c => c.id === ciId ? { ...c, mentorReply: replyVal } : c) });
    setReplyOpen(null); setReplyVal(""); setToast("✓ Reply sent to student");
  }

  function toggleResource(rId: string) {
    const updated = resources.map(r => r.id === rId ? { ...r, locked: !r.locked } : r);
    saveResources(updated); setToast("✓ Resource updated");
  }

  const NAV = [
    { id: "students", label: "Students", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: "announce", label: "Post",     svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { id: "library",  label: "Library",  svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg> },
    { id: "schedule", label: "Schedule", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: `1px solid ${C.bord}`, position: "sticky", top: 0, background: `${C.bg}ee`, backdropFilter: "blur(20px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CCLogo size={32} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Capital Creator</div>
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.06em" }}>MENTOR DASHBOARD</div>
          </div>
        </div>
        <button onClick={onSignOut} className="btn-outline" style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Sign Out</button>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 96px" }}>

        {/* ── STUDENTS LIST ── */}
        {tab === "students" && !sel && (
          <div style={{ paddingTop: 24, animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Your Students</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>{students.length} active</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { l: "TOTAL",    v: students.length, c: C.white },
                { l: "AVG WEEK", v: Math.round(students.reduce((a, s) => a + s.week, 0) / students.length), c: C.blue },
                { l: "HW DONE",  v: `${students.reduce((a, s) => a + s.homework.filter(h => h.done).length, 0)}/${students.reduce((a, s) => a + s.homework.length, 0)}`, c: C.green },
              ].map(s => (
                <div key={s.l} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 4 }}>{s.l}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>

            {students.map(s => {
              const status = studentStatus(s);
              const pct = Math.round((s.pillarsComplete.length / 8) * 100);
              const hwDone = s.homework.filter(h => h.done).length;
              const pendingCI = s.checkIns.filter(c => !c.mentorReply).length;
              return (
                <div key={s.id} className="card-hover" onClick={() => { setSelected(s); setDetailTab("overview"); }} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 18, marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>Week {s.week} · Joined {s.joinDate}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" as const, justifyContent: "flex-end" }}>
                      {pendingCI > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: C.gold, background: `${C.gold}18`, border: `1px solid ${C.gold}40`, borderRadius: 8, padding: "3px 8px" }}>{pendingCI} check-in</span>}
                      <span style={{ fontSize: 11, fontWeight: 700, color: status.color, background: `${status.color}18`, border: `1px solid ${status.color}30`, borderRadius: 8, padding: "4px 10px", whiteSpace: "nowrap" as const }}>{status.label}</span>
                    </div>
                  </div>
                  <div style={{ height: 4, background: "#1a2640", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, #6db3ff)`, borderRadius: 2 }} />
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: 11, color: C.muted }}>{s.pillarsComplete.length}/8 pillars</span>
                    <span style={{ fontSize: 11, color: hwDone === s.homework.length ? C.green : C.muted }}>{hwDone}/{s.homework.length} hw done</span>
                    {s.nextCall && <span style={{ fontSize: 11, color: C.blue }}>Call: {s.nextCall}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── STUDENT DETAIL ── */}
        {tab === "students" && sel && (
          <div style={{ paddingTop: 24, animation: "fadeUp .4s ease" }}>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              ← All Students
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{sel.name}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{sel.email}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: studentStatus(sel).color, background: `${studentStatus(sel).color}18`, border: `1px solid ${studentStatus(sel).color}30`, borderRadius: 8, padding: "5px 12px" }}>{studentStatus(sel).label}</span>
            </div>

            {/* Detail sub-nav */}
            <div style={{ display: "flex", gap: 0, background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 10, padding: 3, marginBottom: 20, overflowX: "auto", scrollbarWidth: "none" }}>
              {(["overview", "homework", "checkins", "messages", "notes"] as const).map(t => (
                <button key={t} onClick={() => setDetailTab(t)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", background: detailTab === t ? C.surf2 : "transparent", color: detailTab === t ? C.white : C.muted, border: "none", cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap", textTransform: "capitalize" }}>
                  {t === "checkins" ? "Check-Ins" : t.charAt(0).toUpperCase() + t.slice(1)}
                  {t === "checkins" && sel.checkIns.filter(c => !c.mentorReply).length > 0 && <span style={{ marginLeft: 4, background: C.gold, color: "#000", borderRadius: "50%", fontSize: 9, padding: "1px 5px", fontWeight: 800 }}>{sel.checkIns.filter(c => !c.mentorReply).length}</span>}
                </button>
              ))}
            </div>

            {/* OVERVIEW SUB-TAB */}
            {detailTab === "overview" && (
              <div style={{ animation: "fadeUp .3s ease" }}>
                {/* Week + pillars editor */}
                <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 18, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 14 }}>PROGRESS — CLICK TO EDIT</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: C.dim }}>Current Week</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button onClick={() => updateStudent(sel.id, { week: Math.max(1, sel.week - 1) })} style={{ width: 30, height: 30, borderRadius: 8, background: "#1a2640", border: `1px solid ${C.bord}`, color: C.white, fontSize: 16, cursor: "pointer" }}>−</button>
                      <span style={{ fontSize: 18, fontWeight: 800, color: C.blue, minWidth: 60, textAlign: "center" }}>Week {sel.week}</span>
                      <button onClick={() => updateStudent(sel.id, { week: Math.min(12, sel.week + 1) })} style={{ width: 30, height: 30, borderRadius: 8, background: "#1a2640", border: `1px solid ${C.bord}`, color: C.white, fontSize: 16, cursor: "pointer" }}>+</button>
                    </div>
                  </div>
                  <div style={{ height: 4, background: "#1a2640", borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ width: `${Math.round(sel.pillarsComplete.length / 8 * 100)}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, #6db3ff)`, borderRadius: 2, transition: "width .4s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", marginBottom: 10 }}>PILLARS — TAP TO TOGGLE</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                    {PILLARS.map(p => {
                      const done = sel.pillarsComplete.includes(p.n);
                      return (
                        <button key={p.n} onClick={() => togglePillar(p.n)} style={{ width: 44, height: 44, borderRadius: 10, background: done ? `${C.blue}22` : "#1a2640", border: `1px solid ${done ? C.blue + "66" : C.bord}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer", transition: "all .15s" }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: done ? C.blue : C.muted }}>0{p.n}</span>
                          {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next call editor */}
                <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 12 }}>NEXT 1:1 CALL</div>
                  <input type="date" defaultValue={sel.nextCall ?? ""} onChange={e => updateStudent(sel.id, { nextCall: e.target.value })} style={{ ...inp(), colorScheme: "dark" }} />
                </div>
              </div>
            )}

            {/* HOMEWORK SUB-TAB */}
            {detailTab === "homework" && (
              <div style={{ animation: "fadeUp .3s ease" }}>
                <button onClick={() => setAddHwOpen(!addHwOpen)} className="btn-blue" style={{ width: "100%", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", marginBottom: 16 }}>
                  {addHwOpen ? "Cancel" : "+ ASSIGN HOMEWORK"}
                </button>

                {addHwOpen && (
                  <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 18, marginBottom: 16, animation: "fadeUp .25s ease" }}>
                    {[
                      { label: "TITLE", node: <input value={hwTitle} onChange={e => setHwTitle(e.target.value)} placeholder="Assignment title" style={inp()} /> },
                      { label: "DESCRIPTION", node: <textarea value={hwDesc} onChange={e => setHwDesc(e.target.value)} placeholder="What exactly should the student do?" rows={3} style={{ ...inp(), resize: "none", lineHeight: 1.6 } as React.CSSProperties} /> },
                    ].map(f => (
                      <div key={f.label} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", marginBottom: 6 }}>{f.label}</div>
                        {f.node}
                      </div>
                    ))}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", marginBottom: 6 }}>PILLAR</div>
                        <select value={hwPillar} onChange={e => setHwPillar(e.target.value)} style={{ ...inp(), appearance: "none", cursor: "pointer" }}>
                          {PILLARS.map(p => <option key={p.n} value={String(p.n)}>0{p.n} — {p.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", marginBottom: 6 }}>DUE DATE</div>
                        <input type="date" value={hwDue} onChange={e => setHwDue(e.target.value)} style={{ ...inp(), colorScheme: "dark" }} />
                      </div>
                    </div>
                    <button onClick={addHomework} disabled={!hwTitle || !hwDue} className="btn-blue" style={{ width: "100%", padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", opacity: hwTitle && hwDue ? 1 : 0.45 }}>
                      ASSIGN TO {sel.name.split(" ")[0].toUpperCase()}
                    </button>
                  </div>
                )}

                {sel.homework.length === 0 && <div style={{ textAlign: "center", color: C.muted, fontSize: 14, paddingTop: 24 }}>No assignments yet.</div>}
                {sel.homework.map(hw => (
                  <div key={hw.id} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: hw.done ? `${C.blue}22` : "#1a2640", border: `1.5px solid ${hw.done ? C.blue : C.bord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        {hw.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, color: hw.done ? C.muted : C.white, textDecoration: hw.done ? "line-through" : "none" }}>{hw.title}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Pillar 0{hw.pillar} · Due {hw.dueDate}</div>
                        {hw.studentNotes && <div style={{ fontSize: 12, color: C.dim, background: "#0c101833", border: `1px solid ${C.bord}`, borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}><span style={{ color: C.dim, fontWeight: 600 }}>Student notes: </span>{hw.studentNotes}</div>}
                        {hw.feedback
                          ? <div style={{ fontSize: 12, color: C.dim, background: `${C.blue}0d`, border: `1px solid ${C.blue}25`, borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}><span style={{ color: C.blue, fontWeight: 700 }}>Your feedback: </span>{hw.feedback}</div>
                          : hw.done && feedbackOpen !== hw.id && <button onClick={() => { setFeedbackOpen(hw.id); setFeedbackVal(""); }} style={{ fontSize: 11, color: C.blue, fontWeight: 700, background: `${C.blue}18`, border: `1px solid ${C.blue}35`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", marginBottom: 6 }}>+ Add Feedback</button>
                        }
                        {feedbackOpen === hw.id && (
                          <div style={{ animation: "fadeUp .2s ease" }}>
                            <textarea value={feedbackVal} onChange={e => setFeedbackVal(e.target.value)} placeholder="Your feedback on this submission…" rows={2} style={{ ...inp({ fontSize: 13 }), resize: "none", lineHeight: 1.6, marginBottom: 8 } as React.CSSProperties} />
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => saveFeedback(hw.id)} className="btn-blue" style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none" }}>SAVE FEEDBACK</button>
                              <button onClick={() => setFeedbackOpen(null)} className="btn-outline" style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12 }}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CHECK-INS SUB-TAB */}
            {detailTab === "checkins" && (
              <div style={{ animation: "fadeUp .3s ease" }}>
                {sel.checkIns.length === 0 && <div style={{ textAlign: "center", color: C.muted, fontSize: 14, paddingTop: 32 }}>No check-ins submitted yet.</div>}
                {[...sel.checkIns].reverse().map(ci => (
                  <div key={ci.id} style={{ background: C.surf, border: `1px solid ${ci.mentorReply ? C.bord : C.gold + "44"}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.06em" }}>WEEK {ci.week} CHECK-IN</span>
                      <span style={{ fontSize: 11, color: C.muted }}>{ci.date}</span>
                    </div>
                    {[{ label: "WORKED ON", val: ci.workedOn }, { label: "CHALLENGED BY", val: ci.challenged }, { label: "QUESTIONS", val: ci.questions }].map(f => (
                      <div key={f.label} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", marginBottom: 4 }}>{f.label}</div>
                        <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65 }}>{f.val}</div>
                      </div>
                    ))}
                    {ci.mentorReply
                      ? <div style={{ background: `${C.blue}0d`, border: `1px solid ${C.blue}25`, borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>YOUR REPLY</div>
                          <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{ci.mentorReply}</div>
                        </div>
                      : replyOpen !== ci.id
                        ? <button onClick={() => { setReplyOpen(ci.id); setReplyVal(""); }} className="btn-blue" style={{ width: "100%", padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none" }}>REPLY TO CHECK-IN</button>
                        : <div style={{ animation: "fadeUp .2s ease" }}>
                            <textarea value={replyVal} onChange={e => setReplyVal(e.target.value)} placeholder="Write your reply to the student…" rows={3} style={{ ...inp({ fontSize: 13 }), resize: "none", lineHeight: 1.6, marginBottom: 8 } as React.CSSProperties} />
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => replyToCheckIn(ci.id)} className="btn-blue" style={{ flex: 1, padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none" }}>SEND REPLY</button>
                              <button onClick={() => setReplyOpen(null)} className="btn-outline" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 12 }}>Cancel</button>
                            </div>
                          </div>
                    }
                  </div>
                ))}
              </div>
            )}

            {/* MESSAGES SUB-TAB */}
            {detailTab === "messages" && (
              <div style={{ animation: "fadeUp .3s ease" }}>
                {sel.messages.length === 0 && <div style={{ textAlign: "center", color: C.muted, fontSize: 14, paddingTop: 32 }}>No messages yet.</div>}
                <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  {sel.messages.map(m => (
                    <div key={m.id} style={{ marginBottom: 12, display: "flex", flexDirection: "column", alignItems: m.from === "mentor" ? "flex-end" : "flex-start" }}>
                      <div style={{ maxWidth: "85%", background: m.from === "mentor" ? `${C.blue}22` : C.surf2, border: `1px solid ${m.from === "mentor" ? C.blue + "40" : C.bord}`, borderRadius: 10, padding: "9px 13px" }}>
                        <div style={{ fontSize: 12, color: m.from === "mentor" ? C.blue : C.dim, lineHeight: 1.6 }}>{m.text}</div>
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{m.from === "mentor" ? "You" : sel.name.split(" ")[0]} · {m.date}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <MentorReplyInput sel={sel} updateStudent={updateStudent} onSent={() => setToast("✓ Message sent")} />
                </div>
              </div>
            )}

            {/* NOTES SUB-TAB */}
            {detailTab === "notes" && (
              <div style={{ animation: "fadeUp .3s ease" }}>
                <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em" }}>MENTOR NOTES</div>
                    {!editingNotes
                      ? <button onClick={() => { setEditingNotes(true); setNotesVal(sel.notes); }} style={{ fontSize: 12, color: C.blue, fontWeight: 700, background: `${C.blue}18`, border: `1px solid ${C.blue}35`, borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>Edit</button>
                      : <button onClick={saveNotes} className="btn-blue" style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, fontWeight: 700, border: "none" }}>Save</button>
                    }
                  </div>
                  {editingNotes
                    ? <textarea value={notesVal} onChange={e => setNotesVal(e.target.value)} rows={6} style={{ ...inp({ fontSize: 14 }), resize: "none", lineHeight: 1.75 } as React.CSSProperties} />
                    : <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{sel.notes || "No notes yet. Click Edit to add."}</div>
                  }
                </div>
                <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 18, marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 12 }}>STUDENT INFO</div>
                  {[{ l: "Joined", v: sel.joinDate }, { l: "Current Week", v: `Week ${sel.week}` }, { l: "Pillars", v: `${sel.pillarsComplete.length}/8 complete` }, { l: "Next Call", v: sel.nextCall ?? "Not scheduled" }].map(r => (
                    <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.bord}` }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{r.l}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ANNOUNCE TAB ── */}
        {tab === "announce" && (
          <div style={{ paddingTop: 24, animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Post Announcement</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>Visible to all students immediately</div>
            </div>
            <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>TITLE</div>
                <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="e.g. Week 6 Group Review — Friday 6PM EST" style={inp()} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>MESSAGE</div>
                <textarea value={annBody} onChange={e => setAnnBody(e.target.value)} placeholder="Write your message to all students…" rows={5} style={{ ...inp(), resize: "vertical", lineHeight: 1.6 } as React.CSSProperties} />
              </div>
              <button onClick={postAnn} disabled={!annTitle || !annBody} className={annTitle && annBody ? "btn-blue" : ""} style={{ width: "100%", padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 700, background: annTitle && annBody ? C.blue : "#1a2640", border: "none", color: annTitle && annBody ? "#fff" : C.muted }}>
                POST TO ALL STUDENTS
              </button>
            </div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 14 }}>RECENT</div>
            {announcements.slice(0, 4).map(a => (
              <div key={a.id} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{a.date}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{a.body.substring(0, 100)}…</div>
              </div>
            ))}
          </div>
        )}

        {/* ── LIBRARY TAB ── */}
        {tab === "library" && (
          <div style={{ paddingTop: 24, animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Resource Library</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>Toggle access — students see changes instantly</div>
            </div>
            <div style={{ background: `${C.blue}0d`, border: `1px solid ${C.blue}25`, borderRadius: 12, padding: 16, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>Upload a Resource</div><div style={{ fontSize: 12, color: C.muted }}>Full upload in production build</div></div>
              <button className="btn-blue" style={{ padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>+ Upload</button>
            </div>
            {loadResources().map(r => (
              <div key={r.id} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 3 }}>{r.category.toUpperCase()}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{r.title}</div>
                    {r.size && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{r.size}</div>}
                  </div>
                  <button onClick={() => toggleResource(r.id)} style={{ fontSize: 11, fontWeight: 700, color: r.locked ? C.muted : C.green, background: r.locked ? "#1a264022" : `${C.green}18`, border: `1px solid ${r.locked ? C.bord : C.green + "40"}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", transition: "all .15s" }}>
                    {r.locked ? "Locked" : "Published"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {tab === "schedule" && (
          <div style={{ paddingTop: 24, animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Schedule</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>Upcoming 1:1 calls</div>
            </div>
            {(() => {
              const withCalls = [...students]
                .filter(s => s.nextCall)
                .sort((a, b) => new Date(a.nextCall!).getTime() - new Date(b.nextCall!).getTime());
              const noCalls = students.filter(s => !s.nextCall);
              return (
                <>
                  {withCalls.length === 0 && <div style={{ textAlign: "center", color: C.muted, fontSize: 14, paddingTop: 32 }}>No calls scheduled.</div>}
                  {withCalls.map(s => {
                    const days = daysUntil(s.nextCall!);
                    const isUrgent = days <= 2;
                    return (
                      <div key={s.id} onClick={() => { setSelected(s); setDetailTab("overview"); setTab("students"); }} className="card-hover" style={{ background: C.surf, border: `1px solid ${isUrgent ? C.gold + "55" : C.bord}`, borderRadius: 14, padding: 18, marginBottom: 10, cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{s.name}</div>
                            <div style={{ fontSize: 12, color: C.muted }}>Week {s.week} · {s.pillarsComplete.length}/8 pillars</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: days <= 0 ? C.gold : days <= 2 ? C.gold : C.white }}>
                              {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : new Date(s.nextCall! + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                            {days > 1 && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{days} days away</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {noCalls.length > 0 && (
                    <>
                      <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginTop: 20, marginBottom: 12 }}>NO CALL SCHEDULED</div>
                      {noCalls.map(s => (
                        <div key={s.id} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, opacity: 0.6 }}>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Week {s.week} — set a call date from student detail</div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: `${C.bg}f2`, backdropFilter: "blur(20px)", borderTop: `1px solid ${C.bord}`, display: "flex", padding: "10px 0 max(18px, env(safe-area-inset-bottom))" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => { setTab(n.id as typeof tab); setSelected(null); }} className="nav-item" style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: tab === n.id ? C.gold : C.muted, padding: "4px 0" }}>
            {n.svg}
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── LANDING PAGE ───────────────────────────────────────────────────────────────
function LandingPage({ onPortal }: { onPortal: () => void }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const GLOW_CX_FRAC = 0.45, GLOW_CY_FRAC = 0.40, GLOW_RADIUS = 280;
    const PARTICLE_COUNT = 80, LINK_DISTANCE = 150, MIN_SPEED = 0.3, MAX_SPEED = 0.5;
    let W = 0, H = 0, glowCX = 0, glowCY = 0, rafId = 0;
    let particles: { x: number; y: number; vx: number; vy: number; radius: number; baseOpacity: number }[] = [];

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      glowCX = W * GLOW_CX_FRAC;
      glowCY = H * GLOW_CY_FRAC;
    }
    function rand(min: number, max: number) { return min + Math.random() * (max - min); }
    function createParticle() {
      const speed = rand(MIN_SPEED, MAX_SPEED), angle = rand(0, Math.PI * 2);
      return { x: rand(0, W), y: rand(0, H), vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: rand(1.0, 2.2), baseOpacity: rand(0.25, 0.50) };
    }
    function getColor(p: typeof particles[0]) {
      const dx = p.x - glowCX, dy = p.y - glowCY;
      const t = Math.max(0, 1 - Math.sqrt(dx*dx + dy*dy) / GLOW_RADIUS);
      if (t > 0) { const r = Math.round(176 + (26-176)*t), g = Math.round(196 + (107-196)*t), b = Math.round(232 + (255-232)*t); return `rgba(${r},${g},${b},${p.baseOpacity})`; }
      return `rgba(180,200,230,${p.baseOpacity})`;
    }
    function draw() {
      ctx!.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < LINK_DISTANCE) {
            const alpha = (1 - dist / LINK_DISTANCE) * 0.18;
            const mx = (a.x+b.x)/2, my = (a.y+b.y)/2;
            const t2 = Math.max(0, 1 - Math.sqrt((mx-glowCX)**2+(my-glowCY)**2)/GLOW_RADIUS);
            const r = Math.round(140+(26-140)*t2), g = Math.round(160+(107-160)*t2), bl = Math.round(200+(255-200)*t2);
            ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y);
            ctx!.strokeStyle = `rgba(${r},${g},${bl},${alpha})`; ctx!.lineWidth = 0.8; ctx!.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        ctx!.fillStyle = getColor(p); ctx!.fill();
      }
      rafId = requestAnimationFrame(draw);
    }
    function onResize() { resize(); glowCX = W*GLOW_CX_FRAC; glowCY = H*GLOW_CY_FRAC; }

    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    rafId = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", onResize); };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const tickerItems = ["Education First", "Process Over Hype", "Risk Before Reward", "Discipline Over Emotion", "Structure Creates Freedom", "Clarity Before Capital"];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'Space Grotesk', sans-serif", overflowX: "hidden" }}>

      {/* PARTICLE CANVAS */}
      <canvas ref={canvasRef} id="particle-canvas" />

      {/* HERO SECTION */}
      <section style={{ position: "relative", width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* BG layers */}
        <div className="hero-bg" />
        <div className="scanlines" />

        {/* Col divider */}
        <div style={{ position: "absolute", top: 88, bottom: 80, left: "50%", width: 1, background: "linear-gradient(to bottom, transparent, rgba(26,40,64,0.6) 30%, rgba(26,40,64,0.6) 70%, transparent)", zIndex: 5, pointerEvents: "none" }} />

        {/* NAV */}
        <nav style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CCLogo size={32} />
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Capital<span style={{ color: C.blue }}>Creator</span></span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {["Program", "Process", "Results", "About"].map(l => (
              <span key={l} className="nav-item" style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.muted, cursor: "pointer" }}>{l}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={onPortal} style={{ background: "transparent", border: `1px solid rgba(26,107,255,0.35)`, color: C.blue, padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", cursor: "pointer" }}>Student Login</button>
            <a href="https://form.typeform.com/to/iTdy92qq" target="_blank" rel="noopener noreferrer" className="btn-blue" style={{ padding: "9px 20px", borderRadius: 7, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", display: "inline-block" }}>Apply Now</a>
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div style={{ position: "relative", zIndex: 10, flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", padding: "0 64px", paddingTop: 120, paddingBottom: 80, maxWidth: 1280, margin: "0 auto", width: "100%" }}>

          {/* LEFT: Copy */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <div className="eyebrow-dot" />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: C.blue }}>Private 1:1 Advisory — By Application Only</span>
            </div>

            <h1 style={{ fontSize: "clamp(38px, 4.5vw, 58px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.03em", textTransform: "uppercase" as const, marginBottom: 8 }}>
              <span style={{ display: "block" }}>BUILD</span>
              <span style={{ display: "block" }}>DISCIPLINED,</span>
              <span style={{ display: "block", color: "transparent", WebkitTextStroke: "1.5px rgba(26,107,255,0.9)", fontStyle: "italic", letterSpacing: "-0.025em" }}>SELF-SUFFICIENT</span>
              <span style={{ display: "block", color: C.blue, textShadow: "0 0 40px rgba(26,107,255,0.5), 0 0 80px rgba(26,107,255,0.2)" }}>TRADERS.</span>
            </h1>

            <p style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.65, color: C.muted, maxWidth: 440, marginTop: 28, marginBottom: 40 }}>
              Private 1:1 advisory for <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>ambitious professionals</strong> who want <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>structure, clarity,</strong> and <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>repeatable execution</strong> — without the noise.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" as const }}>
              <a href="https://form.typeform.com/to/iTdy92qq" target="_blank" rel="noopener noreferrer" className="btn-blue" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 28px", borderRadius: 8, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, boxShadow: "0 0 30px rgba(26,107,255,0.4), 0 4px 20px rgba(26,107,255,0.25)" }}>
                Apply for Private Advisory <span style={{ fontSize: 16 }}>→</span>
              </a>
              <button className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                Book a Clarity Call
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 36 }}>
              <div style={{ display: "flex" }}>
                {["JR","MK","AC","TP"].map((initials, i) => (
                  <div key={initials} style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${C.bg}`, marginLeft: i === 0 ? 0 : -8, background: "linear-gradient(135deg, #1a2a4a, #2a3a60)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", zIndex: 4-i, position: "relative" as const }}>
                    {initials}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
                <strong style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>47 traders</strong> accepted this year<br />
                Applications reviewed within 48 hours
              </div>
            </div>
          </div>

          {/* RIGHT: Bento Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: C.muted }}>Program Snapshot</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(99,115,148,0.7)" }}>
                <div style={{ width: 20, height: 1, background: C.bord }} />
                <span>What's included</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="bento-card card-blue">
                <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", color: C.blue, textShadow: "0 0 30px rgba(26,107,255,0.4)" }}>12</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: C.blue, marginTop: 2 }}>Weeks</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.4 }}>Guided Framework</div>
              </div>
              <div className="bento-card">
                <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em" }}>8</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: C.blue, marginTop: 2 }}>Pillars</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.4 }}>Core Curriculum</div>
              </div>
              <div className="bento-card">
                <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em" }}>1:1</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: C.blue, marginTop: 2 }}>Private</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.4 }}>Advisory Access</div>
              </div>
              <div className="bento-card card-app">
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 6 }}>By<br />Application</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>Limited spots<br />available</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,107,255,0.15)", border: "1px solid rgba(26,107,255,0.3)", color: "#7ab0ff", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, padding: "5px 10px", borderRadius: 100, width: "fit-content", marginTop: 14 }}>
                  <div style={{ width: 5, height: 5, background: C.blue, borderRadius: "50%", boxShadow: "0 0 6px rgba(26,107,255,0.8)" }} />
                  Serious Applicants Only
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TICKER */}
        <div className="ticker-strip">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="ticker-item-new">
                <span className="ticker-dot-sm" />
                {item}
              </span>
            ))}
          </div>
        </div>

      </section>

      {/* WHAT CC IS */}
      <section style={{ padding: "80px 20px", maxWidth: 580, margin: "0 auto" }}>
        <div className="reveal">
          <Label>What Capital Creator Is</Label>
          <h2 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 16 }}>
            THIS IS NOT SIGNAL SELLING.<br />
            <span style={{ color: C.blue }}>THIS IS SKILL BUILDING.</span>
          </h2>
          <p style={{ fontSize: 15, color: C.dim, lineHeight: 1.8, marginBottom: 48, maxWidth: 500 }}>
            Capital Creator is designed to help serious individuals develop structure, decision-making, and execution in financial markets — so progress is built through skill, not impulse.
          </p>
        </div>
        {[
          { n: "01", t: "THINK",   b: "Understand structure, context, and market behavior. Develop the ability to read what is actually happening — not what you hope is happening." },
          { n: "02", t: "EXECUTE", b: "Build a repeatable framework for entries, exits, and risk. Execution is a skill, not an impulse — and it can be trained." },
          { n: "03", t: "REFINE",  b: "Review, correct, and improve until consistency becomes normal. Progress is built through iteration, not inspiration." },
        ].map(step => (
          <div key={step.n} className="reveal" style={{ background: C.surf, border: `1px solid ${C.bord}`, borderLeft: `3px solid ${C.blue}`, borderRadius: "0 14px 14px 0", padding: 22, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 10 }}>{step.n}</div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 8 }}>{step.t}</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.75 }}>{step.b}</div>
          </div>
        ))}
      </section>

      {/* SELECTIVITY */}
      <section style={{ padding: "80px 20px", maxWidth: 580, margin: "0 auto" }}>
        <div className="reveal">
          <Label>Selectivity</Label>
          <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 40 }}>KNOW WHERE YOU STAND.</h2>
        </div>
        <div className="reveal" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 36 }}>
          <div style={{ background: C.surf, border: `1px solid ${C.blue}30`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
              <div style={{ width: 24, height: 24, background: `${C.blue}22`, border: `1px solid ${C.blue}44`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em" }}>WHO IT'S FOR</span>
            </div>
            {["Ambitious professionals who want a second high-value skill", "Founders, students, and serious learners", "People willing to study, execute, and improve", "People who value structure over hype", "Traders who want independence, not dependence"].map(item => (
              <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12" /></svg>
                <span style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.surf, border: `1px solid #f8717122`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
              <div style={{ width: 24, height: 24, background: "#f8717118", border: "1px solid #f8717140", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em" }}>WHO IT'S NOT FOR</span>
            </div>
            {["Signal chasers", "Shortcut seekers", "Dopamine traders", "People unwilling to review their mistakes", "Anyone looking for hype, gambling, or fast unrealistic results"].map(item => (
              <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                <span style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="reveal" style={{ textAlign: "center" }}>
          <a href="https://form.typeform.com/to/iTdy92qq" target="_blank" rel="noopener noreferrer" className="btn-blue" style={{ display: "inline-block", padding: "15px 32px", borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", boxShadow: `0 0 28px #1A6BFF44` }}>
            APPLY FOR PRIVATE ADVISORY →
          </a>
        </div>
      </section>

      {/* FRAMEWORK */}
      <section style={{ padding: "80px 20px", maxWidth: 580, margin: "0 auto" }}>
        <div className="reveal">
          <Label>The Accelerator</Label>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 6 }}>THE CAPITAL CREATOR</h2>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.025em", color: C.blue, marginBottom: 16 }}>ACCELERATOR FRAMEWORK</h2>
          <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.75, marginBottom: 12 }}>A guided 12-week private advisory framework built around 8 core pillars.</p>
          <div style={{ background: `${C.blue}0d`, border: `1px solid ${C.blue}25`, borderRadius: 8, padding: "12px 16px", marginBottom: 36 }}>
            <span style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>Pace is adapted to the client's current level, work ethic, and execution quality.</span>
          </div>
        </div>
        {PILLARS.map(p => (
          <div key={p.n} className="reveal card-hover" style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 18, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: C.blue, minWidth: 22, marginTop: 1 }}>0{p.n}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, letterSpacing: "0.02em" }}>{p.title.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* DELIVERABLES */}
      <section style={{ padding: "80px 20px", maxWidth: 580, margin: "0 auto" }}>
        <div className="reveal">
          <Label>Deliverables</Label>
          <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 10 }}>WHAT YOU ACTUALLY GET</h2>
          <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.75, marginBottom: 40 }}>This is built to improve decision quality — not just increase activity.</p>
        </div>
        {DELIVERS.map((d, i) => (
          <div key={d.t} className={`reveal card-hover`} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 18, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, background: `${C.blue}18`, border: `1px solid ${C.blue}30`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{d.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, letterSpacing: "0.03em" }}>{d.t.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{d.d}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* FOUNDER */}
      <section style={{ padding: "80px 20px", maxWidth: 580, margin: "0 auto" }}>
        <div className="reveal">
          <Label>Founder Philosophy</Label>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 6 }}>WHY I BUILT</h2>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.025em", color: C.blue, marginBottom: 32 }}>CAPITAL CREATOR</h2>
          <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderLeft: `3px solid ${C.blue}`, borderRadius: "0 12px 12px 0", padding: "22px 24px", marginBottom: 24 }}>
            <p style={{ fontSize: 19, fontStyle: "italic", color: C.white, lineHeight: 1.6, letterSpacing: "-0.01em" }}>"Too many people are taught entries, but not how to think."</p>
          </div>
          <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.85, marginBottom: 28 }}>
            I built Capital Creator to solve one of the biggest problems in trading education: too many people are taught entries, but not how to think. My focus is helping serious individuals build structure, discipline, and independence — so they can stop relying on noise and start making decisions like professionals.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, background: `${C.blue}22`, border: `1px solid ${C.blue}44`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: C.blue }}>A</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Adrian Ladosz</div>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", marginTop: 3 }}>FOUNDER · CAPITAL CREATOR</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section style={{ padding: "80px 20px", maxWidth: 580, margin: "0 auto" }}>
        <div className="reveal">
          <Label>Credibility</Label>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 6 }}>PROOF. PROCESS.</h2>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.025em", color: C.blue, marginBottom: 16 }}>DOCUMENTED EXECUTION.</h2>
          <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.75, marginBottom: 36 }}>Capital Creator is built around real structure, real refinement, and real decision-making — not empty motivation.</p>
        </div>
        {[
          { n: "PROOF 01", label: "Process. Progress. Documented execution." },
          { n: "PROOF 02", label: "Refined framework. Measured improvement." },
          { n: "PROOF 03", label: "Structure built for longevity." },
        ].map(p => (
          <div key={p.n} className="reveal card-hover" style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: 130, background: "linear-gradient(135deg, #0d1830, #0f2040)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.07 }}>
                <CCLogo size={90} />
              </div>
              <div style={{ position: "absolute", bottom: 10, right: 12 }}>
                <button style={{ background: "#080c1499", border: `1px solid ${C.bord}`, color: C.muted, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                  ↗ VIEW ON INSTAGRAM
                </button>
              </div>
            </div>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 4 }}>{p.n}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* APPLICATION CTA */}
      <section style={{ padding: "80px 20px", maxWidth: 580, margin: "0 auto" }}>
        <div className="reveal" style={{ background: "linear-gradient(135deg, #0d1830, #0f2040)", border: `1px solid ${C.blue}30`, borderRadius: 20, padding: "52px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, background: `radial-gradient(circle, ${C.blue}18 0%, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: "0.14em", marginBottom: 18 }}>BY APPLICATION ONLY</div>
          <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 6 }}>1:1 MENTORSHIP</h2>
          <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.025em", color: C.gold, marginBottom: 24 }}>(LIMITED SPOTS)</h2>
          <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.8, maxWidth: 420, margin: "0 auto 36px" }}>
            The Capital Creator Accelerator is a private, application-only program. Spots are limited to ensure quality of guidance and individual attention.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}>
            <a href="https://form.typeform.com/to/iTdy92qq" target="_blank" rel="noopener noreferrer" className="btn-blue" style={{ display: "inline-block", padding: "16px 36px", borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", boxShadow: `0 0 32px #1A6BFF55` }}>APPLY NOW →</a>
            <button className="btn-outline" style={{ padding: "16px 26px", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>BOOK A CLARITY CALL</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 20px", maxWidth: 580, margin: "0 auto" }}>
        <div className="reveal">
          <Label>FAQ</Label>
          <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 40, lineHeight: 1.1 }}>FREQUENTLY ASKED<br />QUESTIONS</h2>
        </div>
        {FAQS.map((f, i) => (
          <div key={i} className="faq-item reveal" onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ borderBottom: `1px solid ${C.bord}`, padding: "18px 12px", background: "transparent", borderRadius: faqOpen === i ? "0" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.02em" }}>{f.q.toUpperCase()}</span>
              <div style={{ width: 28, height: 28, background: `${C.blue}18`, border: `1px solid ${C.blue}35`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, color: C.blue, transform: faqOpen === i ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</div>
            </div>
            {faqOpen === i && <div style={{ marginTop: 14, fontSize: 14, color: C.dim, lineHeight: 1.78, animation: "slideDown .25s ease" }}>{f.a}</div>}
          </div>
        ))}
      </section>

      {/* STUDENT PORTAL BANNER */}
      <section style={{ padding: "20px 20px 72px", maxWidth: 580, margin: "0 auto" }}>
        <div className="reveal" onClick={onPortal} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "border-color .2s, transform .2s" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Already a student?</div>
            <div style={{ fontSize: 13, color: C.muted }}>Access your curriculum, resources, and updates.</div>
          </div>
          <button className="btn-blue" style={{ padding: "11px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" as const }}>
            Student Login →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.bord}`, padding: "22px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: C.muted, flexWrap: "wrap" as const, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CCLogo size={22} />
          <span>© 2025 Capital Creator</span>
        </div>
        <span>capitalcreator.cc</span>
      </footer>
    </div>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<"landing"|"auth"|"student"|"mentor">("landing");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("cc_session");
    if (s) {
      try { const u = JSON.parse(s) as User; setUser(u); setView(u.role === "mentor" ? "mentor" : "student"); } catch {}
    }
  }, []);

  function handleAuth(u: User) { setUser(u); setView(u.role === "mentor" ? "mentor" : "student"); }
  function handleSignOut() { localStorage.removeItem("cc_session"); setUser(null); setView("landing"); }

  if (view === "auth")    return <AuthPage onAuth={handleAuth} onBack={() => setView("landing")} />;
  if (view === "student" && user) return <StudentPortal user={user} onSignOut={handleSignOut} />;
  if (view === "mentor"  && user) return <MentorDashboard user={user} onSignOut={handleSignOut} />;
  return <LandingPage onPortal={() => setView("auth")} />;
}
