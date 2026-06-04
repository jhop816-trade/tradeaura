import { SignInButton, SignUpButton, Show, UserButton, useAuth } from "@clerk/react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function DashboardLink() {
  const { getToken, isSignedIn } = useAuth();

  const { data: pendingCount } = useQuery({
    queryKey: ["bookings", "pending-count"],
    queryFn: async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/bookings/provider", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return 0;
        const data = await res.json();
        return (data as any[]).filter((b: any) => b.booking.status === "pending").length;
      } catch {
        return 0;
      }
    },
    enabled: !!isSignedIn,
    refetchInterval: 30000,
  });

  return (
    <Link href="/dashboard/provider">
      <Button variant="ghost" size="sm" className="relative">
        Dashboard
        {pendingCount != null && pendingCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-yellow-500 text-black border-0 hover:bg-yellow-500">
            {pendingCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}

export default function TopBar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">V</span>
          </div>
          <span className="font-bold text-lg tracking-tight">VYBE</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Get Started</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/explore">
              <Button variant="ghost" size="sm">Explore</Button>
            </Link>
            <DashboardLink />
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
