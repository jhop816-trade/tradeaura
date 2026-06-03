import { Link, useLocation } from "wouter";
import { Compass, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/dashboard/client", icon: Calendar, label: "Bookings" },
  { href: "/dashboard/provider", icon: User, label: "Dashboard" },
];

export default function BottomNav() {
  const [location] = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-md pb-safe">
      <div className="flex">
        {items.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={cn(
            "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
            location.startsWith(href) ? "text-primary" : "text-muted-foreground"
          )}>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
