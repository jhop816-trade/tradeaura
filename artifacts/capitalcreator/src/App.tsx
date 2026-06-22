import { useState, useEffect } from "react";

// ── TYPES ─────────────────────────────────────────────────────────────────────
type Role = "student" | "mentor";
interface User { email: string; name: string; role: Role; id: string; }
interface Student {
  id: string; name: string; email: string; week: number;
  pillarsCompleted: number[]; homework: { id: string; title: string; done: boolean }[];
  joinDate: string; notes: string;
}
interface Announcement { id: string; title: string; body: string; date: string; }
interface Resource { id: string; title: string; category: string; desc: string; locked: boolean; }

// ── COLORS ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#050508", surf: "#0c1018", surf2: "#111826", bord: "#1a2640",
  blue: "#1A6BFF", blueDim: "#1558cc", white: "#ffffff",
  muted: "#637394", dim: "#8fa3c4", gold: "#d4a843",
};

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MENTOR_EMAIL = "adrian@capitalcreator.cc";

const MOCK_STUDENTS: Student[] = [
  { id: "s1", name: "Amanda R.", email: "amanda@example.com", week: 4, pillarsCompleted: [1, 2, 3], homework: [{ id: "h1", title: "Mark up 3 charts using market structure", done: true }, { id: "h2", title: "Journal your last 5 trades", done: false }], joinDate: "2025-05-01", notes: "Strong mindset, needs work on entries." },
  { id: "s2", name: "Jacob M.", email: "jacob@example.com", week: 7, pillarsCompleted: [1, 2, 3, 4, 5, 6], homework: [{ id: "h3", title: "Build your risk framework doc", done: true }, { id: "h4", title: "Refine stop placement on 3 setups", done: true }], joinDate: "2025-03-15", notes: "Progressing fast. Ready for pillar 7." },
  { id: "s3", name: "Marcus T.", email: "marcus@example.com", week: 2, pillarsCompleted: [1], homework: [{ id: "h5", title: "Read foundations PDF + take notes", done: false }], joinDate: "2025-06-10", notes: "New student, still building base." },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", title: "Week 6 Group Review — Friday 6PM EST", body: "We'll be doing a live chart review this Friday. Make sure your journals are updated and bring 2 charts you want feedback on. Link will be sent to your email.", date: "2025-06-18" },
  { id: "a2", title: "New Resource Added: Liquidity PDF v2", body: "Updated version of the Liquidity & Confirmations PDF is now in the resources section. Key changes to the confluence framework on pages 8–12.", date: "2025-06-14" },
  { id: "a3", title: "Reminder: Trade Journals Due This Week", body: "If you haven't submitted your weekly trade journal, get it done before your next call. This is non-negotiable — the review only works if you're tracking.", date: "2025-06-10" },
];

const MOCK_RESOURCES: Resource[] = [
  { id: "r1", title: "Foundations PDF", category: "Pillar 01", desc: "Core concepts, vocabulary, and the mental models required before anything else.", locked: false },
  { id: "r2", title: "Market Structure Guide", category: "Pillar 02", desc: "How markets move, form, and communicate intent through price action.", locked: false },
  { id: "r3", title: "Bias & Context Workbook", category: "Pillar 03", desc: "Reading the broader picture before committing to any directional idea.", locked: false },
  { id: "r4", title: "Liquidity & Confirmations PDF v2", category: "Pillar 04", desc: "Understanding where orders live and what confirms a valid setup.", locked: true },
  { id: "r5", title: "Risk & Execution Framework", category: "Pillar 05", desc: "Position sizing, stop placement, and the mechanics of professional execution.", locked: true },
  { id: "r6", title: "Habits & Discipline System", category: "Pillar 06", desc: "The behavioral infrastructure that separates consistent traders from impulsive ones.", locked: true },
  { id: "r7", title: "Blueprint Starter Pack", category: "Free Resource", desc: "Build your foundation before applying to the private advisory.", locked: false },
  { id: "r8", title: "Mastering Markets Bundle", category: "Bonus", desc: "Extended material for students who want to go deeper on structure and execution.", locked: true },
];

const PILLARS = [
  { n: 1, title: "Foundations", desc: "Core concepts, vocabulary, and the mental models required before anything else." },
  { n: 2, title: "Market Structure", desc: "How markets move, form, and communicate intent through price action." },
  { n: 3, title: "Bias & Context", desc: "Reading the broader picture before committing to any directional idea." },
  { n: 4, title: "Liquidity & Confirmations", desc: "Understanding where orders live and what confirms a valid setup." },
  { n: 5, title: "Risk & Execution", desc: "Position sizing, stop placement, and the mechanics of professional execution." },
  { n: 6, title: "Habits & Discipline", desc: "The behavioral infrastructure that separates consistent traders from impulsive ones." },
  { n: 7, title: "Refinement", desc: "Systematic review, journaling, and the process of improving through evidence." },
  { n: 8, title: "Independence", desc: "Operating without external guidance — making decisions with clarity and conviction." },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const inp = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  width: "100%", background: "#080c14", border: `1px solid ${C.bord}`,
  color: C.white, padding: "13px 16px", borderRadius: 8, fontSize: 15,
  outline: "none", transition: "border-color .2s", ...extra,
});

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 28, height: 1.5, background: C.blue }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: C.blue, letterSpacing: "0.14em", textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function CCLogo({ size = 36 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, background: C.blue, borderRadius: size * 0.22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 20 20" fill="none">
        <path d="M9 5C7.5 5 5 6.5 5 10C5 13.5 7.5 15 9 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M15 5C13.5 5 11 6.5 11 10C11 13.5 13.5 15 15 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── AUTH PAGE ─────────────────────────────────────────────────────────────────
function AuthPage({ onAuth }: { onAuth: (u: User) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function submit() {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }

    const role: Role = email.toLowerCase() === MENTOR_EMAIL ? "mentor" : "student";
    const stored = localStorage.getItem("cc_users");
    const users: User[] = stored ? JSON.parse(stored) : [];

    if (mode === "login") {
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) { setError("No account found. Sign up first."); return; }
      localStorage.setItem("cc_session", JSON.stringify(found));
      onAuth(found);
    } else {
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) { setError("Account already exists. Sign in instead."); return; }
      const user: User = { id: `u_${Date.now()}`, email, name: name || email.split("@")[0], role };
      users.push(user);
      localStorage.setItem("cc_users", JSON.stringify(users));
      localStorage.setItem("cc_session", JSON.stringify(user));
      onAuth(user);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><CCLogo size={52} /></div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>Capital Creator</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4, letterSpacing: "0.08em" }}>STUDENT PORTAL</div>
        </div>

        <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{mode === "login" ? "Welcome back" : "Create account"}</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>{mode === "login" ? "Sign in to your student portal" : "Get access to your curriculum"}</div>

          {error && <div style={{ background: "#ff4d4d18", border: "1px solid #ff4d4d40", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ff6b6b", marginBottom: 16 }}>{error}</div>}

          {mode === "signup" && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>FULL NAME</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inp()} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>EMAIL</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inp()} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>PASSWORD</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp()} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>

          <button onClick={submit} style={{ width: "100%", padding: "14px", background: C.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 16, transition: "background .2s" }}>
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
          <a href="/" style={{ fontSize: 12, color: C.muted }}>← Back to capitalcreator.cc</a>
        </div>
      </div>
    </div>
  );
}

// ── STUDENT PORTAL ────────────────────────────────────────────────────────────
function StudentPortal({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [tab, setTab] = useState<"dashboard" | "curriculum" | "resources" | "announcements" | "homework">("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const stored = localStorage.getItem("cc_students");
  const allStudents: Student[] = stored ? JSON.parse(stored) : MOCK_STUDENTS;
  const student = allStudents.find(s => s.email.toLowerCase() === user.email.toLowerCase()) ?? MOCK_STUDENTS[0];

  const announcements: Announcement[] = (() => { try { return JSON.parse(localStorage.getItem("cc_announcements") ?? "") } catch { return MOCK_ANNOUNCEMENTS; } })();
  const progressPct = Math.round((student.pillarsCompleted.length / 8) * 100);

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "⬡" },
    { id: "curriculum", label: "Curriculum", icon: "◈" },
    { id: "resources", label: "Resources", icon: "⊞" },
    { id: "announcements", label: "Updates", icon: "◎" },
    { id: "homework", label: "Homework", icon: "✦" },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* TOPBAR */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${C.bord}`, position: "sticky", top: 0, background: `${C.bg}ee`, backdropFilter: "blur(16px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CCLogo size={34} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Capital Creator</div>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>STUDENT PORTAL</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: C.muted, display: window.innerWidth > 400 ? "block" : "none" }}>{user.name}</div>
          <button onClick={onSignOut} style={{ background: C.surf2, border: `1px solid ${C.bord}`, color: C.muted, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 100px" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div style={{ paddingTop: 24, animation: "fadeUp 0.5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Hey, {user.name.split(" ")[0]}.</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Week {student.week} of 12 — keep building.</div>
            </div>

            {/* Progress card */}
            <div style={{ background: `linear-gradient(135deg, #0d1830, #111826)`, border: `1px solid ${C.bord}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>OVERALL PROGRESS</div>
                  <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", color: C.white }}>{progressPct}<span style={{ fontSize: 18, color: C.muted }}>%</span></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 4 }}>PILLARS</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{student.pillarsCompleted.length}<span style={{ fontSize: 13, color: C.muted }}>/8</span></div>
                </div>
              </div>
              <div style={{ height: 6, background: "#1a2640", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${progressPct}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, #5fa3ff)`, borderRadius: 3, transition: "width 1s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: C.muted }}>Week {student.week} of 12</span>
                <span style={{ fontSize: 11, color: C.blue, fontWeight: 600 }}>Pillar {student.pillarsCompleted.length + 1} next →</span>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { label: "CURRENT WEEK", value: `Week ${student.week}`, color: C.blue },
                { label: "HW COMPLETED", value: `${student.homework.filter(h => h.done).length}/${student.homework.length}`, color: student.homework.every(h => h.done) ? "#34d399" : C.gold },
              ].map(s => (
                <div key={s.label} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Latest announcement */}
            {announcements[0] && (
              <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderLeft: `3px solid ${C.blue}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>LATEST UPDATE</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{announcements[0].title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{announcements[0].body.substring(0, 120)}...</div>
                <button onClick={() => setTab("announcements")} style={{ background: "none", border: "none", color: C.blue, fontSize: 12, fontWeight: 600, marginTop: 8, padding: 0 }}>Read more →</button>
              </div>
            )}

            {/* Next pillar */}
            {student.pillarsCompleted.length < 8 && (() => {
              const next = PILLARS[student.pillarsCompleted.length];
              return (
                <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 8 }}>UP NEXT</div>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, background: `${C.blue}18`, border: `1px solid ${C.blue}44`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.blue, flexShrink: 0 }}>
                      0{next.n}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{next.title}</div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{next.desc}</div>
                    </div>
                  </div>
                  <button onClick={() => setTab("curriculum")} style={{ width: "100%", marginTop: 14, padding: "11px", background: C.blue, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                    GO TO CURRICULUM →
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* CURRICULUM */}
        {tab === "curriculum" && (
          <div style={{ paddingTop: 24, animation: "fadeUp 0.5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Your Curriculum</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>12-week framework · 8 core pillars</div>
            </div>

            {/* Week progress bar */}
            <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em" }}>12-WEEK FRAMEWORK</span>
                <span style={{ fontSize: 11, color: C.blue, fontWeight: 700 }}>Week {student.week} of 12</span>
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < student.week ? C.blue : "#1a2640", opacity: i === student.week - 1 ? 1 : i < student.week ? 0.7 : 0.3 }} />
                ))}
              </div>
            </div>

            {/* Pillars */}
            {PILLARS.map(p => {
              const done = student.pillarsCompleted.includes(p.n);
              const current = !done && student.pillarsCompleted.length === p.n - 1;
              const locked = !done && !current;
              return (
                <div key={p.n} style={{ background: C.surf, border: `1px solid ${current ? C.blue + "60" : C.bord}`, borderRadius: 12, padding: 16, marginBottom: 10, opacity: locked ? 0.5 : 1, transition: "all .2s" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: done ? `${C.blue}22` : current ? `${C.blue}18` : "#1a2640", border: `1px solid ${done ? C.blue + "60" : current ? C.blue + "40" : C.bord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {done ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 800, color: current ? C.blue : C.muted }}>0{p.n}</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{p.title}</span>
                        {done && <span style={{ fontSize: 10, color: C.blue, background: `${C.blue}18`, border: `1px solid ${C.blue}30`, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>COMPLETE</span>}
                        {current && <span style={{ fontSize: 10, color: C.gold, background: `${C.gold}18`, border: `1px solid ${C.gold}30`, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>IN PROGRESS</span>}
                        {locked && <span style={{ fontSize: 10, color: C.muted, background: "#1a264018", border: `1px solid ${C.bord}`, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>LOCKED</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{p.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* RESOURCES */}
        {tab === "resources" && (
          <div style={{ paddingTop: 24, animation: "fadeUp 0.5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Resources</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>PDFs, guides, and course materials</div>
            </div>
            {MOCK_RESOURCES.map(r => (
              <div key={r.id} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 10, opacity: r.locked ? 0.55 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 5 }}>{r.category}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{r.desc}</div>
                  </div>
                  <button style={{ flexShrink: 0, padding: "9px 16px", background: r.locked ? "transparent" : C.blue, border: `1px solid ${r.locked ? C.bord : C.blue}`, color: r.locked ? C.muted : "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                    {r.locked ? "🔒 Locked" : "Download"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {tab === "announcements" && (
          <div style={{ paddingTop: 24, animation: "fadeUp 0.5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Updates</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Messages from Adrian</div>
            </div>
            {announcements.map((a, i) => (
              <div key={a.id} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderLeft: `3px solid ${i === 0 ? C.blue : C.bord}`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.06em", marginBottom: 8 }}>{a.date}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{a.body}</div>
              </div>
            ))}
          </div>
        )}

        {/* HOMEWORK */}
        {tab === "homework" && (
          <div style={{ paddingTop: 24, animation: "fadeUp 0.5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Homework</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{student.homework.filter(h => h.done).length} of {student.homework.length} completed</div>
            </div>
            {student.homework.map(hw => (
              <div key={hw.id} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: hw.done ? `${C.blue}22` : "#1a2640", border: `1.5px solid ${hw.done ? C.blue : C.bord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {hw.done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: hw.done ? 500 : 700, color: hw.done ? C.muted : C.white, textDecoration: hw.done ? "line-through" : "none" }}>{hw.title}</div>
                </div>
              </div>
            ))}
            <div style={{ background: `${C.blue}10`, border: `1px solid ${C.blue}30`, borderRadius: 12, padding: 16, marginTop: 8 }}>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>✦ Complete all assignments before your next 1:1 call. Adrian reviews your progress before every session.</div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: `${C.bg}f0`, backdropFilter: "blur(20px)", borderTop: `1px solid ${C.bord}`, display: "flex", padding: "10px 0 18px" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: tab === n.id ? C.blue : C.muted, padding: "4px 0" }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MENTOR DASHBOARD ──────────────────────────────────────────────────────────
function MentorDashboard({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [tab, setTab] = useState<"students" | "announce" | "resources">("students");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annPosted, setAnnPosted] = useState(false);

  const students: Student[] = (() => { try { return JSON.parse(localStorage.getItem("cc_students") ?? "") } catch { return MOCK_STUDENTS; } })();
  const announcements: Announcement[] = (() => { try { return JSON.parse(localStorage.getItem("cc_announcements") ?? "") } catch { return MOCK_ANNOUNCEMENTS; } })();

  function postAnnouncement() {
    if (!annTitle || !annBody) return;
    const newAnn: Announcement = { id: `a_${Date.now()}`, title: annTitle, body: annBody, date: new Date().toISOString().slice(0, 10) };
    const updated = [newAnn, ...announcements];
    localStorage.setItem("cc_announcements", JSON.stringify(updated));
    setAnnTitle(""); setAnnBody(""); setAnnPosted(true);
    setTimeout(() => setAnnPosted(false), 3000);
  }

  const NAV = [
    { id: "students", label: "Students", icon: "◈" },
    { id: "announce", label: "Announce", icon: "◎" },
    { id: "resources", label: "Resources", icon: "⊞" },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Space Grotesk', sans-serif" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${C.bord}`, position: "sticky", top: 0, background: `${C.bg}ee`, backdropFilter: "blur(16px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CCLogo size={34} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Capital Creator</div>
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.08em" }}>MENTOR DASHBOARD</div>
          </div>
        </div>
        <button onClick={onSignOut} style={{ background: C.surf2, border: `1px solid ${C.bord}`, color: C.muted, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Sign Out</button>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 100px" }}>

        {/* STUDENTS */}
        {tab === "students" && !selectedStudent && (
          <div style={{ paddingTop: 24 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Your Students</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{students.length} active students</div>
            </div>

            {/* Summary row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "TOTAL", value: students.length, color: C.white },
                { label: "AVG WEEK", value: Math.round(students.reduce((s, st) => s + st.week, 0) / students.length), color: C.blue },
                { label: "HW DONE", value: `${students.reduce((s, st) => s + st.homework.filter(h => h.done).length, 0)}/${students.reduce((s, st) => s + st.homework.length, 0)}`, color: "#34d399" },
              ].map(s => (
                <div key={s.label} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {students.map(s => {
              const hwDone = s.homework.filter(h => h.done).length;
              const pct = Math.round((s.pillarsCompleted.length / 8) * 100);
              return (
                <div key={s.id} onClick={() => setSelectedStudent(s)} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 18, marginBottom: 10, cursor: "pointer", transition: "border-color .2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>Week {s.week} · Joined {s.joinDate}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, background: `${C.blue}18`, border: `1px solid ${C.blue}30`, borderRadius: 8, padding: "4px 10px" }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: "#1a2640", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, #5fa3ff)`, borderRadius: 2 }} />
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontSize: 11, color: C.muted }}>{s.pillarsCompleted.length}/8 pillars</span>
                    <span style={{ fontSize: 11, color: hwDone === s.homework.length ? "#34d399" : C.gold }}>{hwDone}/{s.homework.length} hw done</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STUDENT DETAIL */}
        {tab === "students" && selectedStudent && (
          <div style={{ paddingTop: 24, animation: "fadeUp 0.4s ease" }}>
            <button onClick={() => setSelectedStudent(null)} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
              ← All Students
            </button>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{selectedStudent.name}</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>{selectedStudent.email}</div>

            <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 12 }}>PROGRESS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div><div style={{ fontSize: 10, color: C.muted }}>CURRENT WEEK</div><div style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>Week {selectedStudent.week}</div></div>
                <div><div style={{ fontSize: 10, color: C.muted }}>PILLARS DONE</div><div style={{ fontSize: 22, fontWeight: 800 }}>{selectedStudent.pillarsCompleted.length}/8</div></div>
              </div>
              <div style={{ height: 5, background: "#1a2640", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${Math.round(selectedStudent.pillarsCompleted.length / 8 * 100)}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, #5fa3ff)`, borderRadius: 3 }} />
              </div>
            </div>

            <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 12 }}>HOMEWORK</div>
              {selectedStudent.homework.map(hw => (
                <div key={hw.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: hw.done ? `${C.blue}22` : "#1a2640", border: `1.5px solid ${hw.done ? C.blue : C.bord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {hw.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <span style={{ fontSize: 13, color: hw.done ? C.muted : C.white, textDecoration: hw.done ? "line-through" : "none" }}>{hw.title}</span>
                </div>
              ))}
            </div>

            <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 10 }}>MENTOR NOTES</div>
              <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.7 }}>{selectedStudent.notes}</div>
            </div>
          </div>
        )}

        {/* ANNOUNCE */}
        {tab === "announce" && (
          <div style={{ paddingTop: 24, animation: "fadeUp 0.5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Post Announcement</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Sent to all students instantly</div>
            </div>

            <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
              {annPosted && <div style={{ background: "#34d39918", border: "1px solid #34d39940", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#34d399", marginBottom: 16 }}>✓ Announcement posted to all students.</div>}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>TITLE</div>
                <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="e.g. Week 6 Group Review — Friday 6PM EST" style={inp()} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>MESSAGE</div>
                <textarea value={annBody} onChange={e => setAnnBody(e.target.value)} placeholder="Write your message to students..." rows={5} style={{ ...inp(), resize: "vertical", lineHeight: 1.6 } as React.CSSProperties} />
              </div>
              <button onClick={postAnnouncement} disabled={!annTitle || !annBody} style={{ width: "100%", padding: "13px", background: annTitle && annBody ? C.blue : "#1a2640", color: annTitle && annBody ? "#fff" : C.muted, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, transition: "all .2s" }}>
                POST TO ALL STUDENTS
              </button>
            </div>

            <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 14 }}>RECENT ANNOUNCEMENTS</div>
            {announcements.slice(0, 3).map(a => (
              <div key={a.id} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{a.date}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{a.body.substring(0, 100)}...</div>
              </div>
            ))}
          </div>
        )}

        {/* RESOURCES */}
        {tab === "resources" && (
          <div style={{ paddingTop: 24, animation: "fadeUp 0.5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Resource Library</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Manage student materials</div>
            </div>
            <div style={{ background: `${C.blue}10`, border: `1px solid ${C.blue}30`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Upload New Resource</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>PDF uploads and resource management coming in full version.</div>
              <button style={{ padding: "11px 20px", background: C.blue, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>+ Upload PDF</button>
            </div>
            {MOCK_RESOURCES.map(r => (
              <div key={r.id} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: C.blue, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>{r.category}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{r.title}</div>
                  </div>
                  <span style={{ fontSize: 11, color: r.locked ? C.muted : "#34d399", fontWeight: 700 }}>{r.locked ? "Locked" : "Published"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: `${C.bg}f0`, backdropFilter: "blur(20px)", borderTop: `1px solid ${C.bord}`, display: "flex", padding: "10px 0 18px" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => { setTab(n.id); setSelectedStudent(null); }} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: tab === n.id ? C.gold : C.muted, padding: "4px 0" }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
function LandingPage({ onGoToPortal }: { onGoToPortal: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const css = `
    .btn-primary { transition: box-shadow .2s, transform .15s; }
    .btn-primary:hover { box-shadow: 0 0 32px #1A6BFF88; transform: translateY(-2px); }
    .btn-outline:hover { border-color: #ffffff55 !important; background: #111826 !important; }
    .pillar-card { transition: border-color .2s, transform .2s; }
    .pillar-card:hover { border-color: #1A6BFF44 !important; transform: translateY(-2px); }
    .deliver-card { transition: border-color .2s; }
    .deliver-card:hover { border-color: #1A6BFF44 !important; }
    .faq-row { transition: background .15s; }
    .faq-row:hover { background: #111826 !important; }
  `;

  const FAQS = [
    { q: "Who is this for?", a: "This is for serious individuals who want to build real trading skill through structure, discipline, and professional guidance." },
    { q: "Do I need prior experience?", a: "No. The framework is adapted to your current level, but you do need seriousness, consistency, and willingness to learn." },
    { q: "Is this signals or education?", a: "This is education and advisory. The goal is to build self-sufficient traders, not dependent followers." },
    { q: "How does onboarding work?", a: "You apply first. If accepted, you receive the onboarding pack, mentorship structure, agreement, and next-step instructions." },
    { q: "Is the framework fixed?", a: "The core structure is fixed, but pacing is adapted to the client's current level, work ethic, and execution quality." },
    { q: "What if I'm not ready for private advisory?", a: "Start with the free PDF, Blueprint Starter Pack, or Mastering Markets Bundle. These are designed to build your foundation before you apply." },
    { q: "What is the best first step?", a: "If you are serious and want direct guidance, apply for private advisory. If you want to begin at your own pace, start with the free PDF." },
  ];

  const DELIVERS = [
    { icon: "◈", title: "Private 1:1 Guidance", desc: "Direct access to structured mentorship tailored to your current level and goals." },
    { icon: "⊞", title: "Structured Weekly Progression", desc: "A clear, week-by-week framework that builds on itself without skipping fundamentals." },
    { icon: "◎", title: "Trade Review Feedback", desc: "Detailed feedback on your actual trades — what worked, what didn't, and why." },
    { icon: "✦", title: "Process Correction", desc: "Identification and correction of behavioral and technical errors before they compound." },
    { icon: "⬡", title: "Risk Framework Refinement", desc: "A personalised approach to position sizing, stop placement, and capital protection." },
    { icon: "◈", title: "Weekly Tracking & Accountability", desc: "Consistent check-ins and progress tracking to maintain momentum and direction." },
    { icon: "⊞", title: "Onboarding System & Structure", desc: "A complete onboarding pack, mentorship agreement, and clear next-step instructions from day one." },
    { icon: "◎", title: "Clear Next-Step Guidance", desc: "You always know what to work on next — no confusion, no guesswork." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'Space Grotesk', sans-serif", overflowX: "hidden" }}>
      <style>{css}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.bord}`, position: "sticky", top: 0, background: `${C.bg}ee`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CCLogo size={36} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Capital Creator</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onGoToPortal} className="btn-outline" style={{ background: "transparent", border: `1px solid ${C.bord}`, color: C.dim, padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, transition: "all .2s" }}>
            Student Login
          </button>
          <button className="btn-primary" style={{ background: C.blue, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, boxShadow: `0 0 20px ${C.blue}44` }}>
            Apply Now
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "72px 20px 64px", maxWidth: 600, margin: "0 auto", textAlign: "center", position: "relative" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: `radial-gradient(circle, ${C.blue}18 0%, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />

        <div className="pulse" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.blue}18`, border: `1px solid ${C.blue}40`, borderRadius: 20, padding: "5px 16px", fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 28 }}>
          PRIVATE ADVISORY · CAPITAL CREATOR
        </div>

        <h1 style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20, position: "relative" }}>
          BUILD DISCIPLINED,{" "}
          <span style={{ background: `linear-gradient(135deg, ${C.blue} 0%, #5fa3ff 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            SELF-SUFFICIENT
          </span>{" "}
          TRADERS.
        </h1>

        <p style={{ fontSize: 16, color: C.dim, lineHeight: 1.75, maxWidth: 480, margin: "0 auto 40px" }}>
          Private 1:1 advisory for ambitious professionals who want structure, clarity, and repeatable execution — not noise, not signals, not guesswork.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ background: C.blue, color: "#fff", border: "none", padding: "16px 32px", borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", boxShadow: `0 0 28px ${C.blue}55` }}>
            APPLY FOR PRIVATE ADVISORY →
          </button>
          <button className="btn-outline" style={{ background: "transparent", border: `1px solid ${C.bord}`, color: C.white, padding: "16px 28px", borderRadius: 10, fontSize: 14, fontWeight: 600, transition: "all .2s" }}>
            BOOK A CLARITY CALL
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginTop: 52, borderTop: `1px solid ${C.bord}`, paddingTop: 36 }}>
          {[
            { num: "12", unit: "WEEKS", label: "Guided Framework" },
            { num: "8", unit: "PILLARS", label: "Core Curriculum" },
            { num: "1:1", unit: "PRIVATE", label: "Advisory Access" },
          ].map((s, i) => (
            <div key={s.unit} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? `1px solid ${C.bord}` : "none", padding: "0 16px" }}>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: C.white }}>{s.num} <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: "0.1em" }}>{s.unit}</span></div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4, letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRINCIPLES BAR */}
      <div style={{ borderTop: `1px solid ${C.bord}`, borderBottom: `1px solid ${C.bord}`, padding: "14px 20px", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {["EDUCATION FIRST", "PROCESS OVER HYPE", "RISK BEFORE REWARD", "DISCIPLINE OVER EMOTION"].map(p => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 4, background: C.blue, borderRadius: "50%" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em" }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WHAT CAPITAL CREATOR IS */}
      <section style={{ padding: "72px 20px", maxWidth: 600, margin: "0 auto" }}>
        <Label>What Capital Creator Is</Label>
        <h2 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 16 }}>
          THIS IS NOT SIGNAL SELLING.<br />
          <span style={{ color: C.blue }}>THIS IS SKILL BUILDING.</span>
        </h2>
        <p style={{ fontSize: 15, color: C.dim, lineHeight: 1.8, marginBottom: 48, maxWidth: 500 }}>
          Capital Creator is designed to help serious individuals develop structure, decision-making, and execution in financial markets — so progress is built through skill, not impulse.
        </p>

        {[
          { n: "01", title: "THINK", body: "Understand structure, context, and market behavior. Develop the ability to read what is actually happening — not what you hope is happening." },
          { n: "02", title: "EXECUTE", body: "Build a repeatable framework for entries, exits, and risk. Execution is a skill, not an impulse — and it can be trained." },
          { n: "03", title: "REFINE", body: "Review, correct, and improve until consistency becomes normal. Progress is built through iteration, not inspiration." },
        ].map(step => (
          <div key={step.n} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderLeft: `3px solid ${C.blue}`, borderRadius: "0 12px 12px 0", padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>{step.n}</div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 8 }}>{step.title}</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{step.body}</div>
          </div>
        ))}
      </section>

      {/* SELECTIVITY */}
      <section style={{ padding: "72px 20px", maxWidth: 600, margin: "0 auto" }}>
        <Label>Selectivity</Label>
        <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 40 }}>KNOW WHERE YOU STAND.</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: C.surf, border: `1px solid ${C.blue}30`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 24, height: 24, background: `${C.blue}22`, border: `1px solid ${C.blue}50`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.04em" }}>WHO IT'S FOR</span>
            </div>
            {["Ambitious professionals who want a second high-value skill", "Founders, students, and serious learners", "People willing to study, execute, and improve", "People who value structure over hype", "Traders who want independence, not dependence"].map(item => (
              <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12" /></svg>
                <span style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ background: C.surf, border: `1px solid #ff4d4d22`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 24, height: 24, background: "#ff4d4d18", border: "1px solid #ff4d4d40", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.04em" }}>WHO IT'S NOT FOR</span>
            </div>
            {["Signal chasers", "Shortcut seekers", "Dopamine traders", "People unwilling to review their mistakes", "Anyone looking for hype, gambling, or fast unrealistic results"].map(item => (
              <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                <span style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <button className="btn-primary" style={{ background: C.blue, color: "#fff", border: "none", padding: "15px 32px", borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", boxShadow: `0 0 24px ${C.blue}44` }}>
            APPLY FOR PRIVATE ADVISORY →
          </button>
        </div>
      </section>

      {/* ACCELERATOR FRAMEWORK */}
      <section style={{ padding: "72px 20px", maxWidth: 600, margin: "0 auto" }}>
        <Label>The Accelerator</Label>
        <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 6 }}>THE CAPITAL CREATOR</h2>
        <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.025em", color: C.blue, marginBottom: 16 }}>ACCELERATOR FRAMEWORK</h2>
        <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.75, marginBottom: 10 }}>A guided 12-week private advisory framework built around 8 core pillars.</p>
        <div style={{ background: `${C.blue}10`, border: `1px solid ${C.blue}30`, borderRadius: 8, padding: "12px 16px", marginBottom: 36, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 3, height: "100%", background: C.blue, borderRadius: 2, flexShrink: 0, alignSelf: "stretch" }} />
          <span style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>Pace is adapted to the client's current level, work ethic, and execution quality.</span>
        </div>

        {PILLARS.map(p => (
          <div key={p.n} className="pillar-card" style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 18, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.blue, minWidth: 22 }}>0{p.n}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{p.title.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* DELIVERABLES */}
      <section style={{ padding: "72px 20px", maxWidth: 600, margin: "0 auto" }}>
        <Label>Deliverables</Label>
        <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 10 }}>WHAT YOU ACTUALLY GET</h2>
        <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.75, marginBottom: 40 }}>This is built to improve decision quality — not just increase activity.</p>

        {DELIVERS.map(d => (
          <div key={d.title} className="deliver-card" style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 18, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, background: `${C.blue}18`, border: `1px solid ${C.blue}30`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{d.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{d.title.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{d.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* FOUNDER */}
      <section style={{ padding: "72px 20px", maxWidth: 600, margin: "0 auto" }}>
        <Label>Founder Philosophy</Label>
        <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 6 }}>WHY I BUILT</h2>
        <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.025em", color: C.blue, marginBottom: 32 }}>CAPITAL CREATOR</h2>

        <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderLeft: `3px solid ${C.blue}`, borderRadius: "0 12px 12px 0", padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 18, fontStyle: "italic", color: C.white, lineHeight: 1.6 }}>"Too many people are taught entries, but not how to think."</p>
        </div>

        <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.85, marginBottom: 24 }}>
          I built Capital Creator to solve one of the biggest problems in trading education: too many people are taught entries, but not how to think. My focus is helping serious individuals build structure, discipline, and independence — so they can stop relying on noise and start making decisions like professionals.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, background: `${C.blue}22`, border: `1px solid ${C.blue}44`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: C.blue }}>A</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Adrian Ladosz</div>
            <div style={{ fontSize: 12, color: C.muted, letterSpacing: "0.06em" }}>FOUNDER · CAPITAL CREATOR</div>
          </div>
        </div>
      </section>

      {/* CREDIBILITY */}
      <section style={{ padding: "72px 20px", maxWidth: 600, margin: "0 auto" }}>
        <Label>Credibility</Label>
        <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 6 }}>PROOF. PROCESS.</h2>
        <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.025em", color: C.blue, marginBottom: 16 }}>DOCUMENTED EXECUTION.</h2>
        <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.75, marginBottom: 36 }}>Capital Creator is built around real structure, real refinement, and real decision-making — not empty motivation.</p>

        {[
          { n: "PROOF 01", label: "Process. Progress. Documented execution." },
          { n: "PROOF 02", label: "Refined framework. Measured improvement." },
          { n: "PROOF 03", label: "Structure built for longevity." },
        ].map(p => (
          <div key={p.n} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: 140, background: `linear-gradient(135deg, #0d1830, #111826)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.08 }}>
                <CCLogo size={80} />
              </div>
              <div style={{ position: "absolute", bottom: 0, right: 0, padding: "8px 12px" }}>
                <button style={{ background: "#080c1499", border: `1px solid ${C.bord}`, color: C.dim, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
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
      <section style={{ padding: "72px 20px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ background: `linear-gradient(135deg, #0d1830, #111826)`, border: `1px solid ${C.blue}30`, borderRadius: 20, padding: "48px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: `radial-gradient(circle, ${C.blue}18 0%, transparent 70%)`, borderRadius: "50%" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: "0.14em", marginBottom: 16 }}>BY APPLICATION ONLY</div>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 8 }}>1:1 MENTORSHIP</h2>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.025em", color: C.gold, marginBottom: 8 }}>(LIMITED SPOTS)</h2>
          <div style={{ fontSize: 13, fontStyle: "italic", color: C.muted, marginBottom: 24 }}>"Application Only"</div>
          <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.75, maxWidth: 420, margin: "0 auto 32px" }}>
            The Capital Creator Accelerator is a private, application-only program. Spots are limited to ensure quality of guidance and individual attention. If you are serious about building real trading skill, apply to be considered.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ background: C.blue, color: "#fff", border: "none", padding: "16px 36px", borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", boxShadow: `0 0 28px ${C.blue}55` }}>
              APPLY NOW →
            </button>
            <button className="btn-outline" style={{ background: "transparent", border: `1px solid ${C.bord}`, color: C.white, padding: "16px 28px", borderRadius: 10, fontSize: 14, fontWeight: 600, transition: "all .2s" }}>
              BOOK A CLARITY CALL
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "72px 20px", maxWidth: 600, margin: "0 auto" }}>
        <Label>FAQ</Label>
        <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 40 }}>FREQUENTLY ASKED<br />QUESTIONS</h2>

        {FAQS.map((faq, i) => (
          <div key={i} className="faq-row" onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ borderBottom: `1px solid ${C.bord}`, padding: "18px 0", cursor: "pointer", background: "transparent", transition: "background .15s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.02em" }}>{faq.q.toUpperCase()}</span>
              <div style={{ width: 28, height: 28, background: `${C.blue}18`, border: `1px solid ${C.blue}40`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, color: C.blue, transition: "transform .2s", transform: faqOpen === i ? "rotate(45deg)" : "none" }}>+</div>
            </div>
            {faqOpen === i && (
              <div style={{ marginTop: 14, fontSize: 14, color: C.dim, lineHeight: 1.75, animation: "slideDown 0.25s ease" }}>{faq.a}</div>
            )}
          </div>
        ))}
      </section>

      {/* STUDENT PORTAL CTA */}
      <section style={{ padding: "48px 20px 72px", maxWidth: 600, margin: "0 auto" }}>
        <div onClick={onGoToPortal} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "border-color .2s" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Already a student?</div>
            <div style={{ fontSize: 13, color: C.muted }}>Access your portal, curriculum, and resources.</div>
          </div>
          <button style={{ background: C.blue, color: "#fff", border: "none", padding: "11px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>Student Login →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.bord}`, padding: "24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: C.muted, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CCLogo size={24} />
          <span>© 2025 Capital Creator</span>
        </div>
        <span>capitalcreator.cc</span>
      </footer>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<"landing" | "auth" | "portal" | "mentor">("landing");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cc_session");
    if (stored) {
      try {
        const u = JSON.parse(stored) as User;
        setUser(u);
        setView(u.role === "mentor" ? "mentor" : "portal");
      } catch { /* ignore */ }
    }
  }, []);

  function handleAuth(u: User) {
    setUser(u);
    setView(u.role === "mentor" ? "mentor" : "portal");
  }

  function handleSignOut() {
    localStorage.removeItem("cc_session");
    setUser(null);
    setView("landing");
  }

  if (view === "landing") return <LandingPage onGoToPortal={() => setView("auth")} />;
  if (view === "auth") return <AuthPage onAuth={handleAuth} />;
  if (view === "portal" && user) return <StudentPortal user={user} onSignOut={handleSignOut} />;
  if (view === "mentor" && user) return <MentorDashboard user={user} onSignOut={handleSignOut} />;
  return <LandingPage onGoToPortal={() => setView("auth")} />;
}
