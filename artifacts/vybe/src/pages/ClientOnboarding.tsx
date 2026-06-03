import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { useApiClient } from "@/lib/api";
import { toast } from "sonner";

export default function ClientOnboarding() {
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { apiFetch } = useApiClient();
  const [displayName, setDisplayName] = useState(user?.fullName ?? "");

  const createMutation = useMutation({
    mutationFn: () => apiFetch("POST", "/api/clients", {
      displayName,
      email: user?.primaryEmailAddress?.emailAddress ?? "",
    }),
    onSuccess: () => navigate("/explore"),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create profile"),
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center px-4 h-14 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">V</span>
          </div>
          <span className="font-bold text-lg">VYBE</span>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✂️</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">What's your name?</h1>
          <p className="text-muted-foreground text-sm">So your provider knows who's booking</p>
        </div>

        <div className="space-y-4">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your full name"
            autoFocus
            className="w-full h-12 rounded-xl border border-border bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="p-4 border-t border-border/50 pb-safe">
        <div className="max-w-lg mx-auto">
          <Button className="w-full h-12 text-base"
            disabled={!displayName.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? "Setting up..." : "Start Exploring"}
          </Button>
        </div>
      </div>
    </div>
  );
}
