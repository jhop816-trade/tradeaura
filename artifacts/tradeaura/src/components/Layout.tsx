import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, BookOpen, PlusCircle, BarChart2, LogOut, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trades", label: "Trade Log", icon: BookOpen },
  { href: "/trades/new", label: "Log Trade", icon: PlusCircle },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 flex-shrink-0 border-r border-border flex flex-col bg-sidebar">
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">TradeAura</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href) && href !== "/";
            return (
              <Link key={href} href={href}>
                <a
                  data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {user?.email?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
