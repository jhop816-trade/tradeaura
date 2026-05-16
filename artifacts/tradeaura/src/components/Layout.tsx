import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, BookOpen, CalendarDays, BarChart2,
  ClipboardList, TrendingUp, LogOut, PlusCircle, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/stats", label: "Stats", icon: BarChart2 },
  { href: "/review", label: "Review", icon: ClipboardList },
  { href: "/instruments", label: "Instruments", icon: Layers },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top header */}
      <header className="flex-shrink-0 border-b border-border bg-sidebar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              TradeAura
            </span>
          </Link>

          {/* Tab nav */}
          <nav className="flex items-center gap-0.5 flex-1">
            {tabs.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                data-testid={`nav-${label.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  isActive(href)
                    ? "bg-primary/15 text-primary"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/trades/new"
              className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Log Trade
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>
              <button
                onClick={logout}
                className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                title="Sign out"
                data-testid="button-logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
