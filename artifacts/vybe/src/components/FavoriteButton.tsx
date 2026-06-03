import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useApiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FavoriteButtonProps {
  providerId: string;
  className?: string;
}

export function FavoriteButton({ providerId, className }: FavoriteButtonProps) {
  const { isSignedIn } = useAuth();
  const { apiFetch } = useApiClient();
  const qc = useQueryClient();

  const { data: favorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => apiFetch<any[]>("GET", "/api/favorites"),
    enabled: !!isSignedIn,
  });

  const isFavorited = favorites?.some((f) => f.provider?.id === providerId) ?? false;

  const toggleMutation = useMutation({
    mutationFn: () => isFavorited
      ? apiFetch("DELETE", `/api/favorites/${providerId}`)
      : apiFetch("POST", `/api/favorites/${providerId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update favorite"),
  });

  if (!isSignedIn) return null;

  return (
    <button
      onClick={(e) => { e.preventDefault(); toggleMutation.mutate(); }}
      disabled={toggleMutation.isPending}
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
        isFavorited ? "bg-red-500/10 text-red-400" : "bg-card border border-border text-muted-foreground hover:text-red-400",
        className
      )}>
      <Heart className={cn("w-4 h-4 transition-all", isFavorited && "fill-current")} />
    </button>
  );
}
