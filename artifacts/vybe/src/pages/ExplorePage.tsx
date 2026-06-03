import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "barber", label: "Barbers" },
  { value: "stylist", label: "Stylists" },
  { value: "tattoo", label: "Tattoo Artists" },
  { value: "nails", label: "Nail Techs" },
  { value: "lash", label: "Lash Techs" },
  { value: "massage", label: "Massage" },
  { value: "esthetician", label: "Estheticians" },
  { value: "braider", label: "Braiders" },
];

interface Provider {
  id: string;
  username: string;
  displayName: string;
  category: string;
  bio: string | null;
  avatarUrl: string | null;
  plan: string;
}

function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link href={`/@${provider.username}`}>
      <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
        <div className="aspect-square bg-muted relative">
          {provider.avatarUrl ? (
            <img src={provider.avatarUrl} alt={provider.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-bold text-muted-foreground">
                {provider.displayName[0]?.toUpperCase()}
              </span>
            </div>
          )}
          {provider.plan !== "free" && (
            <div className="absolute top-2 right-2">
              <Badge className="text-xs capitalize">{provider.plan}</Badge>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="font-semibold truncate">{provider.displayName}</p>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">{provider.category}</p>
          {provider.bio && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{provider.bio}</p>
          )}
          <Button size="sm" className="w-full mt-3 h-8 text-xs">Book</Button>
        </div>
      </div>
    </Link>
  );
}

function ProviderCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full mt-3" />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const { data: providers, isLoading } = useQuery<Provider[]>({
    queryKey: ["providers", category, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      const res = await fetch(`/api/providers?${params}`);
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-background pb-6">
      <TopBar />
      <div className="pt-20 max-w-2xl mx-auto px-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-9 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                category === cat.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ProviderCardSkeleton key={i} />)
            : providers?.map((p) => <ProviderCard key={p.id} provider={p} />)
          }
          {!isLoading && providers?.length === 0 && (
            <div className="col-span-2 text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium mb-1">No providers found</p>
              <p className="text-sm">Try a different category or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
