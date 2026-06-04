import { SignUpButton, Show } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/layout/TopBar";
import { ArrowRight, Star } from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Create your profile",
    desc: "Set up your booking page at vybe.app/@you in minutes. Add your services, hours, and portfolio.",
  },
  {
    step: "2",
    title: "Share your link",
    desc: "Drop it in your Instagram bio and start getting bookings — no back-and-forth DMs required.",
  },
  {
    step: "3",
    title: "Manage everything",
    desc: "Accept bookings, track revenue, grow your clientele. All from one clean dashboard.",
  },
];

const CATEGORIES = [
  { emoji: "✂️", label: "Barbers", value: "barber" },
  { emoji: "💇", label: "Stylists", value: "stylist" },
  { emoji: "🎨", label: "Tattoo", value: "tattoo" },
  { emoji: "💅", label: "Nails", value: "nails" },
  { emoji: "👁", label: "Lash", value: "lash" },
  { emoji: "💆", label: "Massage", value: "massage" },
  { emoji: "✨", label: "Estheticians", value: "esthetician" },
  { emoji: "🌀", label: "Braiders", value: "braider" },
];

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="w-[600px] h-[400px] rounded-full bg-primary/10 blur-[100px] -translate-y-1/4" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary text-sm text-muted-foreground mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Booking, clients, and growth in one place
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight mb-6 max-w-3xl mx-auto">
            Your chair.<br />Your empire.
          </h1>
          <p className="text-muted-foreground text-xl max-w-xl mx-auto mb-10">
            A focused workspace for creative professionals to manage bookings, build their brand, and grow revenue — without the noise.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12">
                  Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </SignUpButton>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12">
                  Browse Providers
                </Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard/provider">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12">
                  Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12">
                  Explore Providers
                </Button>
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-24 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="rounded-2xl border border-border bg-card p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <span className="font-bold text-primary text-sm">{step}</span>
              </div>
              <h3 className="font-semibold text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 pb-24 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Find your pro</h2>
        <p className="text-muted-foreground text-center mb-8">Browse by category</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map(({ emoji, label, value }) => (
            <button
              key={value}
              onClick={() => navigate(`/explore?category=${value}`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm font-medium"
            >
              <span>{emoji}</span> {label}
            </button>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="px-4 pb-24 text-center">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-2xl font-bold mb-2">Join 500+ creative professionals on VYBE</p>
          <p className="text-muted-foreground text-sm">Barbers, stylists, tattoo artists, nail techs, and more — all growing their business with VYBE.</p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-24 text-center">
        <div className="max-w-lg mx-auto rounded-2xl border border-border bg-card p-8">
          <h2 className="text-2xl font-bold mb-3">Ready to fill your calendar?</h2>
          <p className="text-muted-foreground mb-6">Join hundreds of creatives already on VYBE.</p>
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <Button size="lg" className="w-full">Get Started Free</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard/provider">
              <Button size="lg" className="w-full">Open Dashboard</Button>
            </Link>
          </Show>
        </div>
      </section>
    </div>
  );
}
