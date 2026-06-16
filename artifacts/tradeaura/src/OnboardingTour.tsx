import React from "react";

const STEPS = [
  {
    icon: "📈",
    title: "Welcome to TradeAura",
    body: "Your edge is hidden in your data. TradeAura helps you find it — trade by trade. Let's take a quick look around.",
    view: null,
  },
  {
    icon: "📓",
    title: "Log Every Trade",
    body: "Tap the + button to add a trade. Capture your entry, exit, setup, mood, and notes. Every trade logged is data working for you.",
    view: "journal",
  },
  {
    icon: "🤖",
    title: "AI Reviews Every Trade",
    body: "After you log a trade, our AI grades it A–F based on your own rules. No opinions — just your discipline reflected back at you.",
    view: "ai",
  },
  {
    icon: "📊",
    title: "See Your Patterns",
    body: "Win rate, profit factor, your best setups, worst sessions — it's all here. The more trades you log, the clearer your edge becomes.",
    view: "stats",
  },
  {
    icon: "📖",
    title: "Build Your Playbook",
    body: "Track which setups actually make you money. Over time, TradeAura surfaces what's working and what's costing you.",
    view: "playbook",
  },
  {
    icon: "🚀",
    title: "You're All Set",
    body: "Start by logging your first trade. The more consistent you are, the more powerful your data becomes. Let's get to work.",
    view: "journal",
  },
];

interface OnboardingTourProps {
  step: number;
  onNext: (nextView: string | null) => void;
  onSkip: () => void;
}

export default function OnboardingTour({ step, onNext, onSkip }: OnboardingTourProps) {
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const total = STEPS.length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          background: "#1a1f2e",
          borderRadius: 16,
          padding: "40px 32px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Step indicator */}
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 20, fontWeight: 600, letterSpacing: "0.04em" }}>
          {step + 1} of {total}
        </div>

        {/* Icon */}
        <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 0 }}>{current.icon}</div>

        {/* Title */}
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 16 }}>
          {current.title}
        </div>

        {/* Body */}
        <div style={{ fontSize: 15, color: "#9ca3af", lineHeight: 1.6, marginTop: 12 }}>
          {current.body}
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 28 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 18 : 7,
                height: 7,
                borderRadius: 4,
                background: i === step ? "#3b82f6" : "#2d3748",
                transition: "width 0.2s ease, background 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
          <button
            onClick={onSkip}
            style={{
              background: "transparent",
              border: "none",
              color: "#6b7280",
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "8px 4px",
            }}
          >
            Skip
          </button>
          <button
            onClick={() => onNext(current.view)}
            style={{
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {isLast ? "Get Started" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
