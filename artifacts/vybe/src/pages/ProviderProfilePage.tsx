import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Instagram, Star, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDuration } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  photoUrl: string | null;
}

interface ProviderProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  category: string;
  avatarUrl: string | null;
  instagramHandle: string | null;
  isVerified: boolean;
  plan: string;
  services: Service[];
  reviewCount: number;
  avgRating: number | null;
}

export default function ProviderProfilePage({ username }: { username: string }) {
  const { data: provider, isLoading, isError } = useQuery<ProviderProfile>({
    queryKey: ["provider", username],
    queryFn: async () => {
      const res = await fetch(`/api/providers/${username}`);
      if (!res.ok) throw new Error("Provider not found");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 pt-8 space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div>
          <p className="text-xl font-bold mb-2">Provider not found</p>
          <p className="text-muted-foreground mb-6">@{username} doesn't exist on VYBE yet.</p>
          <Link href="/explore"><Button>Browse Providers</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center">
        <Link href="/explore">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </Link>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Profile header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-muted overflow-hidden shrink-0">
            {provider.avatarUrl ? (
              <img src={provider.avatarUrl} alt={provider.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                {provider.displayName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{provider.displayName}</h1>
              {provider.isVerified && (
                <Badge variant="secondary" className="text-xs">Verified</Badge>
              )}
              {provider.plan !== "free" && (
                <Badge className="text-xs capitalize">{provider.plan}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground capitalize mt-0.5">{provider.category}</p>
            <div className="flex items-center gap-3 mt-1.5">
              {provider.avgRating !== null && (
                <span className="flex items-center gap-1 text-sm">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  {provider.avgRating.toFixed(1)} ({provider.reviewCount})
                </span>
              )}
              {provider.instagramHandle && (
                <a
                  href={`https://instagram.com/${provider.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @{provider.instagramHandle}
                </a>
              )}
            </div>
          </div>
        </div>

        {provider.bio && (
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{provider.bio}</p>
        )}

        <Separator className="mb-6" />

        {/* Services */}
        <h2 className="font-semibold mb-4">Services</h2>
        {provider.services.length === 0 ? (
          <p className="text-sm text-muted-foreground">No services listed yet.</p>
        ) : (
          <div className="space-y-3 mb-8">
            {provider.services.map((service) => (
              <div key={service.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{service.name}</p>
                  {service.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-sm font-semibold text-primary">{formatPrice(service.price)}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDuration(service.durationMinutes)}
                    </span>
                  </div>
                </div>
                {service.photoUrl && (
                  <img src={service.photoUrl} alt={service.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Book Now CTA */}
      {provider.services.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-background/90 backdrop-blur-md border-t border-border/50 pb-safe">
          <div className="max-w-lg mx-auto">
            <Link href={`/book/${provider.username}`}>
              <Button className="w-full h-12 text-base font-semibold">Book Now</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
