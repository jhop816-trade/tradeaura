import React, { useState, useEffect } from "react";

const C = {
  bg:"#0f1117", surf:"#161b27", surf2:"#1c2333", bord:"#232d40",
  blue:"#4f8ef7", green:"#34d399", red:"#f87171", gold:"#fbbf24",
  purp:"#a78bfa", txt:"#e2e8f0", muted:"#64748b", dim:"#94a3b8"
};

function Callout({ type, text }) {
  const map = {
    example:      { border: C.blue, label: "REAL WORLD",    icon: "→" },
    did_you_know: { border: C.gold, label: "DID YOU KNOW?", icon: "◈" },
    diagram:      { border: C.purp, label: "DIAGRAM",       icon: "□" },
  };
  const { border, label, icon } = map[type] || map.example;
  return (
    <div style={{ borderLeft:`3px solid ${border}`, background:`${border}12`, borderRadius:"0 10px 10px 0", padding:"12px 14px", marginBottom:14, marginTop:4 }}>
      <div style={{ fontSize:9, color:border, letterSpacing:"0.15em", marginBottom:6, fontWeight:700 }}>{icon}  {label}</div>
      <div style={{ fontSize:12, color:C.dim, lineHeight:1.7, fontFamily: type==="diagram" ? "monospace" : "inherit", whiteSpace: type==="diagram" ? "pre" : "normal" }}>{text}</div>
    </div>
  );
}

function renderBody(body, color) {
  return body.split("\n\n").map((block, i) => {
    const lines = block.split("\n");
    return (
      <div key={i} style={{ marginBottom:12 }}>
        {lines.map((line, j) => {
          if (line.startsWith("• ")) {
            return (
              <div key={j} style={{ display:"flex", gap:8, marginBottom:4 }}>
                <span style={{ color, flexShrink:0, marginTop:2 }}>•</span>
                <span style={{ fontSize:13, color:C.dim, lineHeight:1.65 }}>{parseBold(line.slice(2), color)}</span>
              </div>
            );
          }
          return <p key={j} style={{ fontSize:13, color:C.dim, lineHeight:1.7, margin:0, marginBottom:4 }}>{parseBold(line, color)}</p>;
        })}
      </div>
    );
  });
}

function parseBold(text, color) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) => i % 2 === 1 ? <strong key={i} style={{ color, fontWeight:700 }}>{p}</strong> : p);
}

const TOPICS = [
  {
    id:1, icon:"⚙️", color:C.blue,
    title:"What Is Software Engineering?",
    summary:"The systematic, disciplined approach to designing, developing, and maintaining software.",
    sections:[
      {
        heading:"Definition & Origin",
        body:`**Software engineering** is the application of engineering principles to the design, development, testing, deployment, and maintenance of software. Unlike hacking together a quick script, software engineering demands **rigor, repeatability, and scalability**.

The term was famously coined by **Margaret Hamilton** in 1968 during her work on the Apollo guidance computer at NASA. She used it to argue that writing software deserved the same professional discipline as traditional engineering fields.

The IEEE (Institute of Electrical and Electronics Engineers) defines it as: "The application of a systematic, disciplined, quantifiable approach to the development, operation, and maintenance of software."`
      },
      {
        heading:"Why It Matters",
        body:`Without software engineering discipline, software projects routinely fail. The **Standish Group CHAOS Report** consistently shows that over 60% of software projects run over budget, are delivered late, or fail entirely.

• **Cost of quality**: A bug caught in requirements costs $1 to fix. The same bug in production can cost $100–$1,000.
• **Scale**: A solo developer can write anything. A team of 500 engineers needs **contracts, interfaces, and processes**.
• **Maintenance**: 60–80% of total software cost occurs **after** initial release — maintenance, updates, and extensions.

Software engineering answers the question: how do you build the right thing, the right way, reliably?`
      },
      {
        heading:"Core Principles",
        body:`**Abstraction** — Hide complexity behind clean interfaces. A car driver doesn't need to understand the engine.

**Modularity** — Break systems into independent, interchangeable parts. Unix is built on this: small tools that do one thing well.

**Separation of concerns** — Keep different responsibilities in different places. Don't mix database logic with UI code.

**DRY (Don't Repeat Yourself)** — Every piece of knowledge should exist in exactly one place.

**YAGNI (You Aren't Gonna Need It)** — Don't build features until they're actually needed.`
      }
    ],
    callouts:[
      { type:"did_you_know", text:"Margaret Hamilton coined the term 'software engineering' in 1968 to give the discipline the same legitimacy as other engineering fields. NASA initially laughed at the term — until the Apollo software worked perfectly." },
      { type:"example", text:"When NASA built the Apollo 11 guidance computer software, Margaret Hamilton's team wrote 145,000 lines of assembly code by hand. It had to be so reliable that there was no room for improvisation — this forced the birth of software engineering as a formal discipline." },
      { type:"diagram", text:"Software Engineering = Engineering Principles + Computer Science\n\n  ┌─────────────────────────────────────┐\n  │  Requirements → Design → Code      │\n  │       → Test → Deploy → Maintain   │\n  └─────────────────────────────────────┘" }
    ],
    keyTerms:["Software Engineering","IEEE","Margaret Hamilton","Abstraction","Modularity","DRY","YAGNI","CHAOS Report"],
    quiz:[
      { q:"Who coined the term 'software engineering'?", options:["Alan Turing","Margaret Hamilton","Linus Torvalds","Dennis Ritchie"], answer:1 },
      { q:"According to the IEEE, software engineering is best described as:", options:["Writing code as fast as possible","A systematic, disciplined, quantifiable approach to software","Using the latest frameworks and tools","Designing user interfaces"], answer:1 },
      { q:"The CHAOS Report finds that the majority of software projects:", options:["Are delivered on time and on budget","Run over budget, are late, or fail entirely","Use Agile methodologies","Are open source"], answer:1 },
      { q:"Which principle says 'don't build features until they're actually needed'?", options:["DRY","Modularity","YAGNI","Abstraction"], answer:2 }
    ]
  },
  {
    id:2, icon:"👥", color:C.purp,
    title:"Insiders' Viewpoint: What Is SE?",
    summary:"How practicing engineers at top companies describe software engineering in the real world.",
    sections:[
      {
        heading:"Beyond the Textbook",
        body:`Ask a senior engineer at Google or Amazon what software engineering really is, and you'll get answers that go far beyond "writing code."

**Communication is the job.** Studies show senior engineers spend only 30–40% of their time coding. The rest is reading code, reviewing others' work, writing design documents, attending planning meetings, and unblocking colleagues.

**Systems thinking.** Real engineers constantly ask: what happens when this fails? What's the load at 10× traffic? Who depends on this API? Software is not written in isolation — it's part of a **living, breathing system**.`
      },
      {
        heading:"What Top Companies Say",
        body:`• **Google** defines software engineering as "programming integrated over time." A feature that works today but is unmaintainable is not good engineering.

• **Amazon's** Leadership Principles emphasize "Think Big" and "Dive Deep" — engineers are expected to own their systems end-to-end, from design to operation.

• **Microsoft** introduced the concept of **Site Reliability Engineering (SRE)** culture, where the team that builds a service is also responsible for running it in production.

• **Netflix** runs hundreds of microservices. Engineers there say SE means designing for **failure as the default state** — chaos engineering is literally part of their process.`
      },
      {
        heading:"Skills Beyond Coding",
        body:`Real-world software engineering demands:

**Technical writing** — Design docs, RFCs (Requests for Comments), postmortems. The ability to clearly write your thinking is as valued as the thinking itself.

**Estimation** — How long will this take? Being consistently wrong here damages team trust.

**Code review** — Reading others' code critically and constructively is a primary engineering skill. At Google, all code must be reviewed by at least one other engineer before it ships.

**On-call discipline** — Knowing how to debug production incidents quickly, write postmortems, and prevent recurrence.`
      }
    ],
    callouts:[
      { type:"example", text:"Google's internal engineering guide, 'Software Engineering at Google' (freely available), describes SE as 'programming integrated over time.' A key point: a codebase that 1,000 engineers touch over 20 years is fundamentally different from a weekend project." },
      { type:"did_you_know", text:"Software engineering is consistently ranked the highest-paid engineering discipline in the United States. The U.S. Bureau of Labor Statistics projects 25% job growth through 2032 — much faster than average for all occupations." },
      { type:"example", text:"Netflix's 'Chaos Monkey' tool randomly kills production servers to ensure engineers build systems resilient to failure. This practice, called Chaos Engineering, was born from the reality that distributed systems fail in unpredictable ways — you have to design for it." }
    ],
    keyTerms:["Systems Thinking","SRE","Design Document","RFC","Code Review","Postmortem","Chaos Engineering","On-Call"],
    quiz:[
      { q:"Approximately how much of a senior engineer's time is spent writing new code?", options:["80–90%","60–70%","30–40%","10–15%"], answer:2 },
      { q:"Google's definition of software engineering emphasizes:", options:["Speed of delivery","Programming integrated over time","Using the latest languages","Open source contributions"], answer:1 },
      { q:"Netflix's 'Chaos Monkey' is an example of:", options:["A code review tool","Chaos Engineering to test resilience","A CI/CD pipeline","An agile ceremony"], answer:1 },
      { q:"At Google, before code ships it must:", options:["Pass all unit tests","Be reviewed by at least one other engineer","Be approved by a manager","Be documented in a wiki"], answer:1 }
    ]
  },
  {
    id:3, icon:"🔄", color:C.green,
    title:"Introduction to the SDLC",
    summary:"The Software Development Life Cycle — the structured process every software project follows.",
    sections:[
      {
        heading:"What Is the SDLC?",
        body:`The **Software Development Life Cycle (SDLC)** is a structured process that guides the creation of software from initial idea to retirement. It provides a repeatable framework that helps teams produce high-quality software **on time and within budget**.

Without a defined SDLC, software projects become chaotic — different people doing different things at different times, with no clear checkpoints or quality gates.

The SDLC was first formalized in the **1960s by the U.S. Department of Defense** for large-scale military and government software systems, where failure was not an option.`
      },
      {
        heading:"Why the SDLC Exists",
        body:`The SDLC solves real problems that plague unstructured development:

• **Scope creep** — without clear requirements phases, features keep getting added and the project never ships.
• **Poor quality** — without a dedicated testing phase, bugs reach users.
• **Cost overruns** — without planning phases, estimates are guesses.
• **Communication gaps** — without documentation phases, knowledge lives only in people's heads.

Each phase of the SDLC produces **deliverables** — tangible outputs that can be reviewed and approved before moving forward. This creates accountability and reduces risk.`
      },
      {
        heading:"SDLC Models",
        body:`The SDLC is a concept, not a single method. Different **models** implement it differently:

**Waterfall** — phases are sequential and non-overlapping. Plan everything, then build it. Works well when requirements are stable (e.g., building a bridge control system).

**Iterative** — build a small version, get feedback, improve. Each cycle adds more capability. Reduces risk of building the wrong thing.

**Agile** — short cycles (sprints) with continuous delivery and feedback. Most common in modern software companies.

**DevOps** — extends the SDLC to include continuous operations and monitoring. The pipeline never "ends."`
      }
    ],
    callouts:[
      { type:"did_you_know", text:"The SDLC concept was formalized by the U.S. Department of Defense in the 1960s through standards like MIL-STD-1521. The government needed a way to manage massive, complex software projects with many contractors — the SDLC gave them a common language and set of checkpoints." },
      { type:"example", text:"Facebook (Meta) runs a continuous SDLC where engineers deploy code to production multiple times per day. Their SDLC never truly 'ends' — the Maintenance phase feeds directly back into Planning for the next feature, creating a perpetual loop." },
      { type:"diagram", text:"Classic SDLC Flow:\n\n  Planning → Requirements → Design\n      ↓                          ↓\n  Maintenance              Implementation\n      ↑                          ↓\n  Deployment  ←  Testing  ←──────┘" }
    ],
    keyTerms:["SDLC","Waterfall","Iterative","Agile","DevOps","Deliverables","Scope Creep","Quality Gate"],
    quiz:[
      { q:"The SDLC was first formalized in the 1960s by:", options:["IBM","MIT","The U.S. Department of Defense","Bell Labs"], answer:2 },
      { q:"Which problem does the SDLC primarily solve?", options:["Making code run faster","Providing a structured, repeatable process for software creation","Reducing the number of engineers needed","Choosing the right programming language"], answer:1 },
      { q:"In Waterfall SDLC, the phases are:", options:["Overlapping and flexible","Sequential and non-overlapping","Done in random order","Always 3 weeks each"], answer:1 },
      { q:"What are the tangible outputs of each SDLC phase called?", options:["Releases","Deliverables","Artifacts","Commits"], answer:1 }
    ]
  },
  {
    id:4, icon:"📐", color:C.gold,
    title:"Phases of the SDLC",
    summary:"A deep dive into each phase: Planning, Requirements, Design, Implementation, Testing, Deployment, and Maintenance.",
    sections:[
      {
        heading:"Phase 1–2: Planning & Requirements",
        body:`**Planning** is where the project is justified and scoped. Key outputs:
• Feasibility study (is this technically and financially viable?)
• Project schedule and resource plan
• Risk assessment

**Amazon's "Working Backwards"** process starts here: teams write a mock press release for the finished product before writing a line of code. If you can't describe what you're building and why, you shouldn't build it.

**Requirements** is where stakeholder needs are captured and formalized:
• **Functional requirements** — what the system must do ("Users can reset their password")
• **Non-functional requirements** — how the system must behave ("The page must load in under 2 seconds")
• **User stories** — short, user-centric descriptions ("As a user, I want to save my preferences so I don't have to re-enter them")

Each requirement must be **testable** — if you can't write a test for it, it's too vague.`
      },
      {
        heading:"Phase 3–4: Design & Implementation",
        body:`**Design** translates requirements into a technical blueprint:
• **High-level design (HLD)** — overall system architecture, major components, data flows
• **Low-level design (LLD)** — class diagrams, database schemas, API contracts
• **UI/UX design** — wireframes and prototypes

At this phase, big decisions are made: monolith vs. microservices, SQL vs. NoSQL, REST vs. GraphQL. Changing these later is extremely expensive.

**Implementation** is where code is written. Modern implementation practices include:
• **Version control** (Git) — every change is tracked
• **Code review** — no code ships unreviewed
• **Continuous Integration (CI)** — code is automatically tested on every commit
• **Feature flags** — new features can be turned on/off without redeployment`
      },
      {
        heading:"Phase 5–7: Testing, Deployment & Maintenance",
        body:`**Testing** verifies the software works correctly. Levels of testing:
• Unit → Integration → System → Acceptance
• Automated tests run in CI pipelines (GitHub Actions, Jenkins)

**Deployment** ships the software to users. Modern deployment includes:
• **Staging environments** — test in a production-like environment first
• **Blue/green deployment** — run old and new versions simultaneously, switch traffic
• **Canary releases** — roll out to 1% of users first, watch for issues

**Maintenance** is the longest phase (often 60–80% of total project cost):
• Bug fixes and security patches
• Performance optimization
• New feature development (which restarts the SDLC)

The cycle then **repeats** — maintenance needs feed into new planning.`
      }
    ],
    callouts:[
      { type:"example", text:"Amazon's 'Working Backwards' method requires teams to write a press release and FAQ for a product before starting development. This forces clarity on the Planning phase — if the team can't describe the customer benefit in one paragraph, they shouldn't build it. Products like Amazon Echo and Amazon Prime came from this process." },
      { type:"did_you_know", text:"The cost to fix a bug grows exponentially per phase. A bug found in Requirements costs ~$1 to fix. The same bug found in Testing costs ~$15. The same bug found in Production costs $100–$1,000. This is the fundamental economic argument for front-loading quality in the SDLC." },
      { type:"diagram", text:"Testing Pyramid:\n\n         /\\ End-to-End (slow, few)\n        /  \\\n       / UI  \\\n      /────────\\\n     / Integration\\\n    /──────────────\\\n   /   Unit Tests    \\  (fast, many)\n  /────────────────────\\" }
    ],
    keyTerms:["Functional Requirements","Non-Functional Requirements","User Story","HLD","LLD","CI","Feature Flag","Blue/Green Deployment","Canary Release"],
    quiz:[
      { q:"A requirement that the page must load in under 2 seconds is an example of a:", options:["Functional requirement","Non-functional requirement","User story","Design constraint"], answer:1 },
      { q:"Amazon's 'Working Backwards' process begins with:", options:["Writing code","A press release for the finished product","A database schema","A UI wireframe"], answer:1 },
      { q:"Which deployment strategy routes a small percentage of traffic to the new version first?", options:["Blue/green deployment","Rolling deployment","Canary release","Dark launch"], answer:2 },
      { q:"What percentage of total software project cost typically occurs after initial release?", options:["10–20%","30–40%","60–80%","Over 90%"], answer:2 }
    ]
  },
  {
    id:5, icon:"🏗️", color:C.green,
    title:"Building Quality Software",
    summary:"Quality is not an afterthought — it's designed in from the start through reviews, standards, and testing.",
    sections:[
      {
        heading:"What Is Software Quality?",
        body:`**Software quality** has two dimensions:

**Functional quality** — does it do what it's supposed to do? This is verified through testing.

**Structural quality** — is the code well-organized, readable, maintainable, and secure? This is harder to measure but critically important for long-term health.

The ISO/IEC 25010 standard defines quality across six characteristics:
• **Functionality** — correct features
• **Reliability** — works consistently without failure
• **Usability** — easy to use correctly
• **Efficiency** — uses resources appropriately
• **Maintainability** — easy to change and fix
• **Portability** — works across environments`
      },
      {
        heading:"Code Reviews",
        body:`**Code review** is the single highest-leverage quality practice. Research by SmartBear found that code review catches **60% of defects** — more than any other quality technique.

Best practices for effective code review:
• Review no more than **400 lines at a time** (reviewer focus degrades sharply beyond this)
• Review within **24 hours** of the pull request being opened
• Focus on correctness, clarity, and security — not style (use linters for that)
• Be specific: "this could throw a NullPointerException if user is null" not "this is bad"

**At Google**, every code change requires at least one approval from a code owner before merging. The reviewer is considered a **co-author** — they share responsibility for what ships.`
      },
      {
        heading:"Technical Debt",
        body:`**Technical debt** is the accumulation of shortcuts, quick fixes, and poor design decisions that make future work harder. Like financial debt, it compounds over time.

Common causes:
• Pressure to ship fast ("we'll clean it up later")
• Lack of tests (each change becomes scarier)
• Poor documentation (knowledge is trapped in people)
• Outdated dependencies (security vulnerabilities pile up)

**Ward Cunningham**, who coined the term, said: "Shipping first-time code is like going into debt. A little debt speeds development so long as it is paid back promptly with refactoring."

Managing technical debt is a core engineering responsibility — not just a nice-to-have. Teams that ignore it eventually reach a point where adding any new feature takes months.`
      }
    ],
    callouts:[
      { type:"example", text:"Google requires that all production code has a code owner who must approve any changes. Their internal tool 'Critique' tracks every code review. When a production incident happens, the code reviewer is listed alongside the author in the postmortem — creating shared accountability for quality." },
      { type:"did_you_know", text:"Studies show that code review at a rate slower than 500 lines per hour is significantly less effective at catching bugs. IBM found that for every hour spent on code review, 33 hours were saved in maintenance. The ROI on review is enormous." },
      { type:"example", text:"Twitter's early technical debt was so severe that the platform went down routinely (the 'fail whale' era). Engineers spent more time fighting fires than building features. A massive multi-year rewrite was required — one of the most famous and expensive examples of unmanaged technical debt in tech history." }
    ],
    keyTerms:["Functional Quality","Structural Quality","ISO/IEC 25010","Code Review","Technical Debt","Refactoring","Linter","Co-author"],
    quiz:[
      { q:"According to SmartBear research, code review catches approximately what percentage of defects?", options:["20%","40%","60%","80%"], answer:2 },
      { q:"ISO/IEC 25010 defines software quality across how many main characteristics?", options:["3","4","6","8"], answer:2 },
      { q:"Who coined the term 'technical debt'?", options:["Martin Fowler","Ward Cunningham","Kent Beck","Grady Booch"], answer:1 },
      { q:"What is the ideal maximum number of lines to review at one time for optimal effectiveness?", options:["100","400","1,000","2,500"], answer:1 }
    ]
  },
  {
    id:6, icon:"📋", color:C.blue,
    title:"Requirements",
    summary:"Capturing what a system must do — the foundation everything else is built on.",
    sections:[
      {
        heading:"Types of Requirements",
        body:`Requirements define **what** a system must do, without specifying **how**. Getting them right is arguably the most important phase of the SDLC.

**Functional requirements** describe specific behaviors or functions:
• "The system shall allow users to create an account using email and password"
• "The system shall generate a monthly sales report in PDF format"

**Non-functional requirements (NFRs)** describe quality attributes:
• **Performance**: "The system shall return search results in under 500ms for 95% of queries"
• **Security**: "All data at rest shall be encrypted using AES-256"
• **Availability**: "The system shall maintain 99.9% uptime (less than 8.76 hours of downtime per year)"
• **Scalability**: "The system shall support 1 million concurrent users"

**Business requirements** describe high-level organizational goals:
• "The system shall reduce customer support ticket volume by 30%"`
      },
      {
        heading:"Requirements Elicitation",
        body:`Requirements don't appear from nowhere — they must be actively **elicited** from stakeholders. Common techniques:

**Interviews** — one-on-one conversations with users, product owners, and domain experts. Best for detailed, nuanced needs.

**Workshops** — bring multiple stakeholders together. Good for resolving conflicting requirements.

**Observation** — watch users do their actual work. Often reveals unstated needs ("I always copy this to Excel after downloading").

**Prototyping** — build a rough UI mockup and show stakeholders. "I'll know it when I see it" is real — prototypes surface requirements that people can't articulate verbally.

**User stories** in Agile format: "As a [role], I want [feature] so that [benefit]." This keeps requirements user-centric.`
      },
      {
        heading:"Requirements Quality Criteria",
        body:`Good requirements are **SMART**:
• **Specific** — unambiguous, only one interpretation
• **Measurable** — you can write a test for it
• **Achievable** — technically and financially feasible
• **Relevant** — traces back to a business need
• **Testable** — you know when it's done

**Common requirement pitfalls:**
• **Ambiguity**: "The system shall be fast" (fast relative to what?)
• **Inconsistency**: two requirements that contradict each other
• **Incompleteness**: missing edge cases ("what happens when the user is not logged in?")
• **Gold plating**: engineers adding unrequested features

Studies show ambiguous requirements cause approximately **50% of software project failures**. Investing time upfront in clear requirements is the highest-ROI activity in software development.`
      }
    ],
    callouts:[
      { type:"did_you_know", text:"Ambiguous or missing requirements are cited as the cause of approximately 50% of software project failures. The classic study by Jones (1994) found that errors introduced during the requirements phase cost 100–200× more to fix in production than if caught upfront." },
      { type:"example", text:"Apple kept iPhone requirements secret from most of its own engineers to maintain security and enforce focus. Teams building the touchscreen had no idea they were building a phone. This extreme compartmentalization meant requirements had to be exceptionally precise in writing — there was no room for 'we'll figure it out.'" },
      { type:"diagram", text:"Requirements Traceability Matrix:\n\n  Business Need → Requirement → Test Case\n  ─────────────────────────────────────────\n  Reduce support  → Users can   → Test: user\n  tickets 30%       self-serve    resets password\n                    password      without support" }
    ],
    keyTerms:["Functional Requirement","Non-Functional Requirement","NFR","Elicitation","User Story","SMART","Traceability","Gold Plating","Ambiguity"],
    quiz:[
      { q:"'The system shall return search results in under 500ms' is an example of a:", options:["Functional requirement","Non-functional requirement","Business requirement","User story"], answer:1 },
      { q:"Which requirements elicitation technique involves building a rough UI to show stakeholders?", options:["Interviews","Workshops","Observation","Prototyping"], answer:3 },
      { q:"The 'M' in SMART requirements stands for:", options:["Manageable","Modular","Measurable","Minimal"], answer:2 },
      { q:"Ambiguous or missing requirements cause approximately what percentage of software project failures?", options:["10%","25%","50%","75%"], answer:2 }
    ]
  },
  {
    id:7, icon:"🏃", color:C.purp,
    title:"Software Development Methodologies",
    summary:"The frameworks teams use to organize their work — from Waterfall to Agile to DevOps.",
    sections:[
      {
        heading:"Waterfall",
        body:`**Waterfall** is the oldest formal SDLC methodology. Phases are sequential:

Plan → Requirements → Design → Code → Test → Deploy → Maintain

Each phase is completed before the next begins. There is no going back (without significant cost).

**When Waterfall works:**
• Requirements are completely known and stable upfront
• External compliance mandates a defined process (government contracts, safety-critical systems)
• The technology is well-understood

**When Waterfall fails:**
• Requirements change (they almost always do)
• The team discovers problems late (testing is the last phase)
• Feedback from users doesn't come until after the entire system is built

The infamous 2013 Healthcare.gov launch is a textbook Waterfall failure — requirements kept changing, teams couldn't adapt, and a $630M system launched broken.`
      },
      {
        heading:"Agile",
        body:`**Agile** is a philosophy, not a single method. The **Agile Manifesto** (2001) declares four values:
• **Individuals and interactions** over processes and tools
• **Working software** over comprehensive documentation
• **Customer collaboration** over contract negotiation
• **Responding to change** over following a plan

**Scrum** (the most popular Agile framework) organizes work into **sprints** — fixed 2-week development cycles. Each sprint produces a potentially shippable increment.

Scrum ceremonies:
• **Sprint Planning** — what will we build this sprint?
• **Daily Standup** — what did I do yesterday? What am I doing today? Any blockers?
• **Sprint Review** — demo what was built to stakeholders
• **Retrospective** — what can we improve?

**Kanban** (used by many ops and support teams) uses a visual board with columns (To Do, In Progress, Done) and limits work-in-progress.`
      },
      {
        heading:"Scaled Agile & DevOps",
        body:`**SAFe (Scaled Agile Framework)** adapts Agile for large enterprises with hundreds of teams. Used by companies like Boeing and John Deere.

**Spotify's model** (squads, tribes, chapters, guilds) became famous as an example of scaling Agile culture — though Spotify themselves say they don't strictly follow it.

**DevOps** extends Agile by eliminating the wall between development and operations:
• **Continuous Integration (CI)**: code is merged and tested continuously
• **Continuous Delivery (CD)**: every passing build is deployable
• **Continuous Deployment**: every passing build is automatically deployed to production

**DORA Metrics** (from Google's DevOps Research and Assessment team) are the industry benchmark for DevOps performance:
• Deployment frequency
• Lead time for changes
• Change failure rate
• Mean time to recover (MTTR)`
      }
    ],
    callouts:[
      { type:"did_you_know", text:"The Agile Manifesto was written and signed by 17 software practitioners at a ski lodge in Snowbird, Utah in February 2001. The meeting was called the 'Organizational Anarchist Retreat.' They expected the document to fade into obscurity — instead it transformed the entire industry." },
      { type:"example", text:"Spotify organized its engineering into 'squads' (small Agile teams), 'tribes' (groups of squads working on related areas), 'chapters' (people with similar skills across squads), and 'guilds' (company-wide interest groups). This model is so widely studied that 'the Spotify model' became a standard reference for scaling Agile — even though Spotify themselves say they evolved beyond it." },
      { type:"diagram", text:"Scrum Sprint Cycle:\n\n  Product Backlog\n       ↓ (Sprint Planning)\n  Sprint Backlog (2 weeks)\n       ↓ (Daily Standup)\n  Working Software\n       ↓ (Review + Retro)\n  ← Back to Product Backlog" }
    ],
    keyTerms:["Waterfall","Agile Manifesto","Scrum","Sprint","Kanban","DevOps","CI/CD","SAFe","DORA Metrics","Retrospective"],
    quiz:[
      { q:"The Agile Manifesto was signed in what year?", options:["1995","2001","2005","2010"], answer:1 },
      { q:"In Scrum, what is the purpose of the Daily Standup?", options:["Sprint planning for the week","Status update: done/doing/blockers","Reviewing completed work with stakeholders","Discussing process improvements"], answer:1 },
      { q:"Which DORA metric measures how quickly a team can recover from a production failure?", options:["Deployment frequency","Lead time for changes","Change failure rate","Mean time to recover (MTTR)"], answer:3 },
      { q:"Continuous Deployment means:", options:["Deploying code once per quarter","Every passing build is automatically deployed to production","Deploying only after manual approval","Running tests continuously"], answer:1 }
    ]
  },
  {
    id:8, icon:"🏷️", color:C.gold,
    title:"Software Versions",
    summary:"How software tracks changes, manages releases, and enables collaboration through version control.",
    sections:[
      {
        heading:"Version Control Systems",
        body:`**Version control** (also called source control or revision control) is the practice of tracking every change made to source code over time.

Without version control:
• Collaboration means emailing files back and forth
• "It worked yesterday" becomes a crisis
• There's no way to roll back a breaking change

**Git** is the dominant version control system today. Created by **Linus Torvalds in just two weeks in April 2005** after a licensing dispute with the previous tool (BitKeeper). Git is used by more than 90% of professional developers.

Key concepts:
• **Repository (repo)** — the database of all changes
• **Commit** — a snapshot of changes with a message
• **Branch** — an independent line of development
• **Merge** — combining branches back together
• **Pull Request (PR)** — a request to merge a branch, with review`
      },
      {
        heading:"Semantic Versioning",
        body:`**Semantic Versioning (SemVer)** is the standard format: **MAJOR.MINOR.PATCH**

• **MAJOR** version (1.0.0 → 2.0.0): breaking change — old code may not work
• **MINOR** version (1.0.0 → 1.1.0): new features, backwards-compatible
• **PATCH** version (1.0.0 → 1.0.1): bug fixes, backwards-compatible

Examples:
• React going from 17 to 18 is a **major** version — some APIs changed
• A new optional feature added = **minor** version
• A security patch = **patch** version

Pre-release labels: **1.0.0-alpha**, **1.0.0-beta**, **1.0.0-rc.1** (release candidate)

**npm** (the Node.js package manager) uses SemVer to manage over 2 million packages — it's the backbone of the JavaScript ecosystem.`
      },
      {
        heading:"Branching Strategies",
        body:`Teams adopt **branching strategies** to coordinate parallel development:

**Git Flow** — main, develop, feature/, release/, and hotfix/ branches. Good for software with defined release cycles.

**GitHub Flow** — simpler: main is always deployable. Feature branches are short-lived and merged via Pull Requests. Used by GitHub itself.

**Trunk-Based Development** — everyone commits to main (trunk) at least once a day. Requires strong CI and feature flags. Used by Google, Facebook, and Netflix.

**Release branches** — a copy of main is created for a release, allowing hotfixes without including unreleased features. Linux kernel uses this model with numbered branches like `linux-5.15.y`.`
      }
    ],
    callouts:[
      { type:"did_you_know", text:"Linus Torvalds created Git in April 2005, writing the initial version in just 10 days. He famously named it 'git' — British slang for an unpleasant person — saying 'I'm an egotistical bastard, and I name all my projects after myself.' (Linux was named after him too.)" },
      { type:"example", text:"The Linux kernel receives over 8,000 contributions per release cycle from thousands of contributors worldwide — all coordinated through Git. Each change is reviewed, discussed in mailing lists, and merged by maintainers. This is the largest collaborative software project in history, all run on Git." },
      { type:"diagram", text:"Semantic Versioning:\n\n  2  .  4  .  1\n  ↑     ↑     ↑\nMAJOR MINOR PATCH\n(break) (feat) (fix)\n\nExample: 2.4.1 → 2.4.2 (bug fix)\n         2.4.1 → 2.5.0 (new feature)\n         2.4.1 → 3.0.0 (breaking change)" }
    ],
    keyTerms:["Version Control","Git","Repository","Commit","Branch","Pull Request","Semantic Versioning","SemVer","Git Flow","Trunk-Based Development"],
    quiz:[
      { q:"Who created Git, and in approximately how long?", options:["Bill Gates in 6 months","Linus Torvalds in about 10 days","GitHub team in 1 year","Google engineers in 3 months"], answer:1 },
      { q:"In Semantic Versioning, changing from 1.5.2 to 2.0.0 indicates:", options:["A bug fix","New backwards-compatible features","A breaking change","A security patch"], answer:2 },
      { q:"Which branching strategy requires committing to main at least once per day?", options:["Git Flow","GitHub Flow","Trunk-Based Development","Release branching"], answer:2 },
      { q:"A Pull Request (PR) is primarily used for:", options:["Deploying code to production","Requesting code review before merging a branch","Creating a new repository","Tracking bugs"], answer:1 }
    ]
  },
  {
    id:9, icon:"🧪", color:C.red,
    title:"Software Testing",
    summary:"Verifying software works correctly — from unit tests to end-to-end testing to production monitoring.",
    sections:[
      {
        heading:"Why Testing Matters",
        body:`**Software testing** is the process of executing a program to find bugs before users do. It is not optional — it's the primary mechanism for quality assurance.

**The cost argument**: A bug found in testing costs 15× less to fix than the same bug found in production (IBM research). A bug that causes a data breach can cost millions in fines, remediation, and reputational damage.

**The confidence argument**: Without tests, every change is a gamble. With a comprehensive test suite, engineers can refactor, upgrade dependencies, and add features with confidence that existing behavior is preserved.

The **first computer bug** was discovered on September 9, 1947, when Grace Hopper's team found an actual moth trapped in the relay of the Harvard Mark II computer. They taped it into the logbook and wrote "First actual case of bug being found."

Today, the world runs on untested assumptions — the 2012 Knight Capital incident resulted in a $440M loss in 45 minutes due to a software bug with no test coverage.`
      },
      {
        heading:"The Testing Pyramid",
        body:`The **Testing Pyramid** is the industry-standard model for test strategy:

**Unit Tests** (base — many, fast, cheap)
• Test individual functions or classes in isolation
• Should run in milliseconds
• Developers write these alongside code (TDD)
• Target: 70–80% of your test suite

**Integration Tests** (middle — fewer, medium speed)
• Test how components work together
• May involve databases, APIs, file systems
• Target: 15–20% of your test suite

**End-to-End Tests** (top — few, slow, expensive)
• Test entire user flows through a real browser
• Tools: Selenium, Cypress, Playwright
• Target: 5–10% of your test suite — too many e2e tests create a flaky, slow pipeline

**Why not just write e2e tests?** They're slow, brittle (break on UI changes), and don't pinpoint which component failed.`
      },
      {
        heading:"Testing Types & Practices",
        body:`**Test-Driven Development (TDD)**: write the test first, then write code to make it pass. Forces clear requirements and produces inherently testable code.

**Regression testing**: re-run existing tests after changes to ensure nothing broke. Automated regression suites are the backbone of CI pipelines.

**Performance testing**: does it handle expected load? Tools: JMeter, k6, Locust.

**Security testing**: penetration testing, OWASP vulnerability scanning, static analysis (SAST).

**Acceptance testing (UAT)**: real users validate the software meets their needs before release.

**Shift-left testing**: test earlier in the SDLC, not just at the end. The further left you shift, the cheaper bugs are to fix.

Modern teams run automated tests on every commit via **GitHub Actions**, **Jenkins**, or **GitLab CI** — tests must pass before code can merge.`
      }
    ],
    callouts:[
      { type:"did_you_know", text:"The first computer bug was an actual moth. On September 9, 1947, Grace Hopper's team at Harvard found a moth trapped in relay #70 of the Mark II computer. They taped it into the logbook with the note 'First actual case of bug being found.' The logbook is on display at the Smithsonian Institution." },
      { type:"example", text:"Microsoft historically employed more software testers than developers on critical products like Windows. The Windows XP team had roughly 1 tester for every developer. As the industry shifted to Agile, the model changed — now developers write automated tests as part of their daily work, and dedicated QA engineers focus on exploratory and acceptance testing." },
      { type:"diagram", text:"Testing Pyramid:\n\n       /\\\n      /E2E\\    ← few, slow, brittle\n     /──────\\\n    /Integrat\\ ← medium speed\n   /──────────\\\n  /  Unit Tests\\ ← many, fast, cheap\n /──────────────\\" }
    ],
    keyTerms:["Unit Test","Integration Test","End-to-End Test","TDD","Regression Testing","Testing Pyramid","Shift-Left","CI Pipeline","SAST","UAT"],
    quiz:[
      { q:"According to IBM research, a bug costs approximately how much more to fix in production vs. testing?", options:["2×","5×","15×","100×"], answer:2 },
      { q:"In the Testing Pyramid, what percentage of your test suite should be unit tests?", options:["5–10%","20–30%","50–60%","70–80%"], answer:3 },
      { q:"Test-Driven Development (TDD) means:", options:["QA writes tests after developers finish coding","Writing the test before writing the code","Only testing in production","Hiring dedicated testers for each team"], answer:1 },
      { q:"The first computer bug was:", options:["A typo in machine code","An actual moth found in a computer relay","A logic error in a sorting algorithm","A power surge"], answer:1 }
    ]
  },
  {
    id:10, icon:"📄", color:C.dim,
    title:"Software Documentation",
    summary:"The written knowledge that makes software understandable, maintainable, and trustworthy.",
    sections:[
      {
        heading:"Types of Documentation",
        body:`**Software documentation** is any written material that explains software — its purpose, design, usage, or maintenance. It's the difference between software that lasts and software that's abandoned when its author leaves.

**Product documentation** (for users):
• User manuals and guides
• FAQs and help centers
• Release notes ("what's new in version 2.0")

**Technical documentation** (for developers):
• **API documentation** — how to use a public interface (Stripe, Twilio, Google Maps)
• **Architecture decision records (ADRs)** — why key design decisions were made
• **Runbooks** — step-by-step operational procedures ("how to restart the database")
• **Postmortems** — after an incident: what happened, why, and what changed

**Process documentation**:
• Onboarding guides for new engineers
• Contribution guidelines (CONTRIBUTING.md)
• Style guides and coding standards`
      },
      {
        heading:"API Documentation as a Standard",
        body:`**API documentation** has become a competitive product differentiator. The quality of a platform's docs directly determines adoption.

**Stripe's API documentation** is widely considered the industry gold standard:
• Interactive examples in every major language
• Live API explorer (test API calls from the browser)
• Comprehensive error messages with suggested fixes
• Changelog with clear migration guides

The result: Stripe charges 2.9% + $0.30 per transaction while competitors charge less — and still wins, because developers trust and love their docs.

**Documentation as code**: modern teams write docs in Markdown, store them in Git alongside code, and generate sites using tools like Docusaurus, MkDocs, or Notion. Docs are reviewed in Pull Requests just like code.`
      },
      {
        heading:"Documentation Best Practices",
        body:`Good documentation is **accurate, current, and minimal**.

**The biggest documentation sin**: documentation that is wrong. Outdated docs mislead users and destroy trust.

**The docs-as-code movement** treats documentation like source code:
• Stored in version control (Git)
• Reviewed via pull requests
• Automatically deployed with CI/CD

**ADRs (Architecture Decision Records)** capture the **why** behind technical decisions:
• "Why did we choose PostgreSQL over MongoDB?"
• "Why did we move from a monolith to microservices in 2022?"
• Without ADRs, this knowledge walks out the door when engineers leave

**The rule of thumb**: if you explained it in Slack, it belongs in documentation. If it took more than 5 minutes to figure out, document it for the next person.

The NASA Challenger disaster (1986) was partly attributed to **communication failures and inadequate documentation** of known O-ring failures in cold temperatures.`
      }
    ],
    callouts:[
      { type:"example", text:"Stripe's API documentation is so highly regarded that it's taught in developer experience (DevEx) courses as the benchmark for what API docs should be. It features runnable code examples in 8 languages, an interactive API explorer, comprehensive error reference, and clear versioning. Stripe attributes a significant portion of its adoption to documentation quality." },
      { type:"did_you_know", text:"The NASA Space Shuttle Challenger disaster in 1986 was partly attributed to documentation and communication failures. Engineers at Morton Thiokol documented concerns about O-ring performance in cold temperatures but this information did not effectively reach decision-makers. The Presidential Commission cited 'flawed decision-making process' — rooted in poor communication documentation." },
      { type:"diagram", text:"Documentation Types by Audience:\n\n  Users          → User guides, FAQs, release notes\n  Developers     → API docs, ADRs, code comments\n  Ops teams      → Runbooks, architecture diagrams\n  New engineers  → Onboarding guides, CONTRIBUTING.md\n  Post-incident  → Postmortems, incident reports" }
    ],
    keyTerms:["API Documentation","Architecture Decision Record","ADR","Runbook","Postmortem","Docs-as-Code","Stripe","Release Notes","CONTRIBUTING.md"],
    quiz:[
      { q:"Stripe's API documentation is famous for being:", options:["The cheapest to produce","The industry gold standard for developer experience","The longest and most comprehensive","The first to use AI generation"], answer:1 },
      { q:"An Architecture Decision Record (ADR) captures:", options:["The API contract for a service","The why behind major technical decisions","A list of open bugs","The deployment runbook"], answer:1 },
      { q:"'Docs-as-code' means:", options:["Using AI to write documentation automatically","Storing and reviewing docs in Git like source code","Embedding docs directly in compiled binaries","Writing docs only after code is complete"], answer:1 },
      { q:"What historical event is cited as a partial example of documentation and communication failure in engineering?", options:["The Y2K bug","The Therac-25 radiation machine","The Challenger disaster","The Knight Capital incident"], answer:2 }
    ]
  },
  {
    id:11, icon:"👤", color:C.green,
    title:"Roles in Software Engineering Projects",
    summary:"The people who make software happen — and how they work together.",
    sections:[
      {
        heading:"Core Engineering Roles",
        body:`Modern software projects involve a team of specialists, each with a distinct responsibility:

**Software Engineer / Developer** — writes, tests, and maintains code. May specialize in frontend (UI), backend (server/database), mobile, or be "full stack" (both).

**Senior Engineer** — mentors juniors, leads technical design, makes architectural decisions, owns key systems.

**Staff / Principal Engineer** — drives technical direction across multiple teams or the entire organization. Influences how the company builds software.

**Engineering Manager (EM)** — manages a team of engineers. Handles hiring, performance, team health, and roadmap alignment. Does not typically code day-to-day.

**Tech Lead** — senior engineer who provides technical direction for a team, often while still coding.`
      },
      {
        heading:"Product & Design Roles",
        body:`Building the right thing requires more than engineers:

**Product Manager (PM)** — defines what gets built and why. Owns the roadmap, prioritizes features, writes requirements, and represents the customer's voice. At Amazon, PMs write the press release in the "Working Backwards" process.

**UX Designer** — designs the user experience: information architecture, user flows, wireframes, prototypes. Advocates for usability.

**UI Designer** — focuses on visual design: color, typography, spacing, component libraries, design systems (e.g., Material Design, Figma components).

**UX Researcher** — runs user studies, interviews, and usability tests to generate evidence for design decisions. Prevents building based on assumptions.

A typical FAANG team structure: **1 PM + 1 Designer + 5-8 Engineers + 1 Technical Program Manager (TPM)**`
      },
      {
        heading:"Operations & Quality Roles",
        body:`Shipping and running software reliably requires additional specialists:

**QA Engineer** — designs and executes test plans, writes automated tests, tracks bugs. In modern Agile teams, QA is embedded on the development team (not a separate department at the end).

**DevOps / Platform Engineer** — builds and maintains CI/CD pipelines, infrastructure, monitoring, and deployment tooling. Goal: make shipping code fast and safe.

**Site Reliability Engineer (SRE)** — Google's role focused on reliability. Uses software engineering approaches to solve operations problems. Owns SLAs (Service Level Agreements) and SLOs (Service Level Objectives).

**Security Engineer** — ensures software is secure by design. Performs code reviews, threat modeling, penetration testing.

**Technical Program Manager (TPM)** — coordinates cross-team dependencies, tracks milestones, drives delivery. "Project manager with deep technical knowledge." The TPM role did not exist as a title before the mid-2000s; "DevOps Engineer" did not exist before 2009.`
      }
    ],
    callouts:[
      { type:"example", text:"A typical FAANG (Facebook/Meta, Amazon, Apple, Netflix, Google) product team consists of: 1 Product Manager, 1 UX Designer, 5-8 Software Engineers, and 1 Technical Program Manager. The PM owns the 'what and why,' the designers own the 'how it feels,' and the engineers own the 'how it works.' The TPM owns the 'when and coordination.'" },
      { type:"did_you_know", text:"The title 'DevOps Engineer' didn't exist before 2009. The term 'DevOps' was coined by Patrick Debois, who organized the first 'DevOpsDays' conference in Ghent, Belgium in 2009. Similarly, 'Site Reliability Engineer' was a role Google created and named — other companies adopted the title afterwards." },
      { type:"diagram", text:"Typical Product Team:\n\n  Product Manager (what & why)\n       ↓\n  UX Designer (how it feels)\n       ↓\n  Engineers × 5-8 (how it works)\n       ↕\n  TPM (when & coordination)\n       ↕\n  QA / SRE / Security (quality & ops)" }
    ],
    keyTerms:["Software Engineer","Product Manager","UX Designer","QA Engineer","DevOps","SRE","TPM","Tech Lead","Staff Engineer","SLA","SLO"],
    quiz:[
      { q:"A Product Manager's primary responsibility is:", options:["Writing code for new features","Defining what gets built and why","Managing infrastructure and deployments","Designing the visual interface"], answer:1 },
      { q:"Google created which role to apply software engineering to operations problems?", options:["DevOps Engineer","Platform Engineer","Site Reliability Engineer (SRE)","Cloud Architect"], answer:2 },
      { q:"The title 'DevOps Engineer' was first used around:", options:["1999","2005","2009","2015"], answer:2 },
      { q:"A Technical Program Manager (TPM) primarily focuses on:", options:["Writing technical specifications","Cross-team coordination, dependencies, and delivery milestones","Managing individual engineer performance","Building CI/CD pipelines"], answer:1 }
    ]
  }
];

const PROG_KEY = "se_guide_progress";

export default function SoftwareEngineeringGuide() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [view, setView] = useState("read");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROG_KEY);
      if (saved) setProgress(JSON.parse(saved));
    } catch {}
  }, []);

  function saveProgress(next) {
    setProgress(next);
    try { localStorage.setItem(PROG_KEY, JSON.stringify(next)); } catch {}
  }

  function markRead(topicId) {
    const key = `read_${topicId}`;
    if (!progress[key]) saveProgress({ ...progress, [key]: true });
  }

  function saveBestQuiz(topicId, score) {
    const key = `quiz_${topicId}`;
    const prev = progress[key] ?? -1;
    if (score > prev) saveProgress({ ...progress, [key]: score });
  }

  function getQuizScore(topicId) { return progress[`quiz_${topicId}`] ?? -1; }
  function isRead(topicId) { return !!progress[`read_${topicId}`]; }

  const readCount = TOPICS.filter(t => isRead(t.id)).length;
  const passCount = TOPICS.filter(t => getQuizScore(t.id) >= 3).length;
  const overallPct = Math.round(((readCount + passCount) / (TOPICS.length * 2)) * 100);

  const filtered = TOPICS.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.summary.toLowerCase().includes(search.toLowerCase())
  );

  function openTopic(t) { setActiveTopic(t); setView("read"); setQuizAnswers({}); setQuizSubmitted(false); }
  function startQuiz() { setView("quiz"); setQuizAnswers({}); setQuizSubmitted(false); }
  function retakeQuiz() { setView("quiz"); setQuizAnswers({}); setQuizSubmitted(false); }

  // ── TOPIC LIST ───────────────────────────────────────────────────────────────
  if (!activeTopic) {
    return (
      <div style={{ padding:"16px 16px 80px" }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:9, color:C.blue, letterSpacing:"0.15em", fontWeight:700, marginBottom:4 }}>COLLEGE STUDY GUIDE</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:4 }}>Software Engineering</div>
          <div style={{ fontSize:12, color:C.muted }}>11 topics · interactive quizzes · real-world examples</div>
        </div>

        {/* Overall progress */}
        <div style={{ background:C.surf, border:`1px solid ${C.bord}`, borderRadius:12, padding:14, marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span style={{ fontSize:11, color:C.dim, fontWeight:600 }}>Overall Progress</span>
            <span style={{ fontSize:13, color:C.green, fontWeight:800 }}>{overallPct}%</span>
          </div>
          <div style={{ height:6, background:C.bg, borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${overallPct}%`, background:`linear-gradient(90deg,${C.green},${C.blue})`, borderRadius:3, transition:"width 0.5s" }}/>
          </div>
          <div style={{ display:"flex", gap:16, marginTop:10 }}>
            <span style={{ fontSize:11, color:C.muted }}><span style={{ color:C.green, fontWeight:700 }}>{readCount}</span>/{TOPICS.length} studied</span>
            <span style={{ fontSize:11, color:C.muted }}><span style={{ color:C.blue, fontWeight:700 }}>{passCount}</span>/{TOPICS.length} quizzes passed</span>
          </div>
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:14 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:C.muted }}>⌕</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search topics…"
            style={{ width:"100%", background:C.surf2, border:`1px solid ${C.bord}`, borderRadius:10, padding:"9px 12px 9px 34px", color:C.txt, fontSize:13, fontFamily:"inherit", boxSizing:"border-box", outline:"none" }}
          />
        </div>

        {/* Topic cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(t => {
            const read = isRead(t.id);
            const score = getQuizScore(t.id);
            const passed = score >= 3;
            const cardPct = (read ? 50 : 0) + (passed ? 50 : 0);
            return (
              <button key={t.id} onClick={() => openTopic(t)}
                style={{ background:C.surf, border:`1px solid ${activeTopic?.id===t.id ? t.color : C.bord}`, borderRadius:12, padding:14, cursor:"pointer", textAlign:"left", fontFamily:"inherit", width:"100%" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ width:40, height:40, background:`${t.color}18`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{t.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{t.title}</span>
                      <div style={{ display:"flex", gap:4, flexShrink:0, marginLeft:8 }}>
                        {read && <span style={{ fontSize:9, color:C.green, fontWeight:700 }}>READ</span>}
                        {passed && <span style={{ fontSize:9, background:`${C.blue}20`, color:C.blue, padding:"2px 6px", borderRadius:10, fontWeight:700 }}>✓ QUIZ</span>}
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:8, lineHeight:1.5 }}>{t.summary}</div>
                    <div style={{ height:3, background:C.bg, borderRadius:2 }}>
                      <div style={{ height:"100%", width:`${cardPct}%`, background:t.color, borderRadius:2, transition:"width 0.4s" }}/>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:40, color:C.muted, fontSize:13 }}>No topics match "{search}"</div>
          )}
        </div>
      </div>
    );
  }

  const t = activeTopic;
  const topicIndex = TOPICS.findIndex(x => x.id === t.id);
  const prevTopic = topicIndex > 0 ? TOPICS[topicIndex - 1] : null;
  const nextTopic = topicIndex < TOPICS.length - 1 ? TOPICS[topicIndex + 1] : null;
  const quizScore = getQuizScore(t.id);

  // ── QUIZ ─────────────────────────────────────────────────────────────────────
  if (view === "quiz") {
    const allAnswered = t.quiz.every((_, i) => quizAnswers[i] !== undefined);
    const score = t.quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.answer ? 1 : 0), 0);
    return (
      <div style={{ padding:"16px 16px 80px" }}>
        <button onClick={() => setView("read")} style={{ background:"transparent", border:"none", color:C.muted, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginBottom:14, padding:0 }}>← Back to Reading</button>
        <div style={{ fontSize:9, color:t.color, letterSpacing:"0.15em", fontWeight:700, marginBottom:4 }}>{t.icon} {t.title.toUpperCase()}</div>
        <div style={{ fontSize:17, fontWeight:800, color:"#fff", marginBottom:16 }}>Topic Quiz</div>

        {/* Progress dots */}
        <div style={{ display:"flex", gap:6, marginBottom:20 }}>
          {t.quiz.map((_, i) => (
            <div key={i} style={{ flex:1, height:4, borderRadius:2, background: quizAnswers[i] !== undefined ? t.color : C.bord, transition:"background 0.3s" }}/>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          {t.quiz.map((q, qi) => (
            <div key={qi} style={{ background:C.surf, border:`1px solid ${C.bord}`, borderRadius:12, padding:14 }}>
              <div style={{ fontSize:12, color:C.muted, fontWeight:700, marginBottom:8 }}>Q{qi + 1} of {t.quiz.length}</div>
              <div style={{ fontSize:14, color:"#fff", fontWeight:700, marginBottom:12, lineHeight:1.5 }}>{q.q}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {q.options.map((opt, oi) => {
                  const selected = quizAnswers[qi] === oi;
                  const correct = oi === q.answer;
                  let bg = C.surf2, border = C.bord, color = C.dim;
                  if (quizSubmitted) {
                    if (correct) { bg = `${C.green}18`; border = C.green; color = C.green; }
                    else if (selected && !correct) { bg = `${C.red}18`; border = C.red; color = C.red; }
                  } else if (selected) {
                    bg = `${t.color}18`; border = t.color; color = "#fff";
                  }
                  return (
                    <button key={oi} disabled={quizSubmitted}
                      onClick={() => setQuizAnswers(prev => ({ ...prev, [qi]: oi }))}
                      style={{ background:bg, border:`1px solid ${border}`, borderRadius:10, padding:"10px 12px", cursor: quizSubmitted ? "default" : "pointer", fontFamily:"inherit", textAlign:"left", display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ width:22, height:22, borderRadius:"50%", border:`1px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color, flexShrink:0 }}>
                        {quizSubmitted ? (correct ? "✓" : (selected ? "✗" : String.fromCharCode(65+oi))) : String.fromCharCode(65+oi)}
                      </span>
                      <span style={{ fontSize:12, color, lineHeight:1.5 }}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:20 }}>
          {!quizSubmitted ? (
            <button disabled={!allAnswered}
              onClick={() => { setQuizSubmitted(true); saveBestQuiz(t.id, score); }}
              style={{ width:"100%", background: allAnswered ? t.color : C.surf2, border:"none", borderRadius:12, padding:14, color: allAnswered ? "#fff" : C.muted, fontSize:14, fontWeight:700, cursor: allAnswered ? "pointer" : "not-allowed", fontFamily:"inherit", opacity: allAnswered ? 1 : 0.6 }}>
              Submit Quiz
            </button>
          ) : (
            <button onClick={() => setView("results")}
              style={{ width:"100%", background:t.color, border:"none", borderRadius:12, padding:14, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              See Results →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────────
  if (view === "results") {
    const score = t.quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.answer ? 1 : 0), 0);
    const pct = Math.round((score / t.quiz.length) * 100);
    const passed = score >= 3;
    return (
      <div style={{ padding:"16px 16px 80px" }}>
        <button onClick={() => { setActiveTopic(null); setView("read"); }} style={{ background:"transparent", border:"none", color:C.muted, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginBottom:20, padding:0 }}>← All Topics</button>
        <div style={{ background:C.surf, border:`1px solid ${C.bord}`, borderRadius:16, padding:24, textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>{passed ? "🏆" : "📚"}</div>
          <div style={{ fontSize:36, fontWeight:800, color: passed ? C.green : C.gold, marginBottom:4 }}>{score} / {t.quiz.length}</div>
          <div style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:6 }}>{pct}%</div>
          <div style={{ fontSize:13, color:C.muted }}>{passed ? "Module Complete! Great work." : "Keep studying — you've got this."}</div>
          {quizScore > score && <div style={{ fontSize:11, color:C.dim, marginTop:6 }}>Best score: {quizScore}/{t.quiz.length}</div>}
        </div>

        {/* Per-question breakdown */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {t.quiz.map((q, i) => {
            const correct = quizAnswers[i] === q.answer;
            return (
              <div key={i} style={{ background:C.surf2, border:`1px solid ${correct ? C.green+"40" : C.red+"40"}`, borderRadius:10, padding:"10px 14px", display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{correct ? "✅" : "❌"}</span>
                <div>
                  <div style={{ fontSize:12, color:C.dim, lineHeight:1.5, marginBottom:2 }}>{q.q}</div>
                  {!correct && <div style={{ fontSize:11, color:C.green }}>Correct: {q.options[q.answer]}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <button onClick={retakeQuiz} style={{ background:C.surf2, border:`1px solid ${C.bord}`, borderRadius:12, padding:12, color:C.txt, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Retake Quiz</button>
          {nextTopic && (
            <button onClick={() => openTopic(nextTopic)} style={{ background:t.color, border:"none", borderRadius:12, padding:12, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              Next: {nextTopic.title} →
            </button>
          )}
          <button onClick={() => { setActiveTopic(null); setView("read"); }} style={{ background:"transparent", border:"none", color:C.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit", padding:8 }}>← Back to All Topics</button>
        </div>
      </div>
    );
  }

  // ── READING VIEW ──────────────────────────────────────────────────────────────
  return (
    <div style={{ padding:"16px 16px 80px" }}>
      <button onClick={() => setActiveTopic(null)} style={{ background:"transparent", border:"none", color:C.muted, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginBottom:14, padding:0 }}>← All Topics</button>

      {/* Topic header */}
      <div style={{ background:`${t.color}12`, border:`1px solid ${t.color}30`, borderRadius:14, padding:16, marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <span style={{ fontSize:24 }}>{t.icon}</span>
          <div>
            <div style={{ fontSize:9, color:t.color, letterSpacing:"0.15em", fontWeight:700 }}>TOPIC {topicIndex + 1} OF {TOPICS.length}</div>
            <div style={{ fontSize:17, fontWeight:800, color:"#fff", lineHeight:1.3 }}>{t.title}</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{t.summary}</div>
        {isRead(t.id) && <div style={{ fontSize:11, color:C.green, marginTop:8, fontWeight:700 }}>✓ Marked as studied</div>}
      </div>

      {/* Sections + callouts */}
      {t.sections.map((sec, si) => (
        <div key={si} style={{ marginBottom:24 }}>
          <div style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:10, borderLeft:`3px solid ${t.color}`, paddingLeft:10 }}>{sec.heading}</div>
          {renderBody(sec.body, t.color)}
          {t.callouts.filter((_, ci) => ci === si).map((c, ci) => <Callout key={ci} type={c.type} text={c.text}/>)}
        </div>
      ))}

      {/* Remaining callouts (if more callouts than sections) */}
      {t.callouts.slice(t.sections.length).map((c, ci) => <Callout key={`extra_${ci}`} type={c.type} text={c.text}/>)}

      {/* Key terms */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:9, color:C.muted, letterSpacing:"0.15em", fontWeight:700, marginBottom:10 }}>KEY TERMS</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {t.keyTerms.map(term => (
            <span key={term} style={{ fontSize:11, color:t.color, background:`${t.color}14`, border:`1px solid ${t.color}30`, borderRadius:20, padding:"4px 10px", fontWeight:600 }}>{term}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <button
          onClick={() => { markRead(t.id); startQuiz(); }}
          style={{ background:t.color, border:"none", borderRadius:12, padding:14, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          {isRead(t.id) ? "Retake Quiz →" : "Mark as Studied & Take Quiz →"}
        </button>
        <div style={{ display:"flex", gap:8 }}>
          {prevTopic && (
            <button onClick={() => openTopic(prevTopic)} style={{ flex:1, background:C.surf2, border:`1px solid ${C.bord}`, borderRadius:10, padding:11, color:C.dim, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>← {prevTopic.title.split(":")[0]}</button>
          )}
          {nextTopic && (
            <button onClick={() => { markRead(t.id); openTopic(nextTopic); }} style={{ flex:1, background:C.surf2, border:`1px solid ${C.bord}`, borderRadius:10, padding:11, color:C.dim, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{nextTopic.title.split(":")[0]} →</button>
          )}
        </div>
      </div>
    </div>
  );
}
