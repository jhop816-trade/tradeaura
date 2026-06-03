import { SignUpButton, SignedIn, SignedOut } from "@clerk/react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/layout/TopBar";
import { Zap, User, TrendingUp, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Book Faster",
    desc: "Clients tap your link, pick a service, and you're booked. No back-and-forth, no DMs.",
  },
  {
    icon: User,
    title: "Personal Profiles",
    desc: "Your own booking page at vybe.app/@you. Put it in your bio and start filling your calendar.",
  },
  {
    icon: TrendingUp,
    title: "Grow Revenue",
    desc: "Track earnings, manage services, and unlock tools to grow your clientele.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary text-sm text-muted-foreground mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Booking, clients, and growth in one place
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight mb-6 max-w-3xl mx-auto">
          Elite command center<br />for your chair.
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
          A focused workspace for barbers and clients to manage bookings, profiles, and growth without the clutter.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12">
                I'm a Barber
              </Button>
            </SignUpButton>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12">
                I'm Looking for a Barber
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
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
          </SignedIn>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-24 max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-24 text-center">
        <div className="max-w-lg mx-auto rounded-2xl border border-border bg-card p-8">
          <h2 className="text-2xl font-bold mb-3">Ready to fill your calendar?</h2>
          <p className="text-muted-foreground mb-6">Join hundreds of creatives already on VYBE.</p>
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg" className="w-full">Get Started Free</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard/provider">
              <Button size="lg" className="w-full">Open Dashboard</Button>
            </Link>
          </SignedIn>
        </div>
      </section>
    </div>
  );
}
