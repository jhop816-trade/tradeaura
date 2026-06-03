import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { useApiClient } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Scissors, Palette, Sparkles, Hand, Eye, Smile, Waves, Leaf } from "lucide-react";

const CATEGORIES = [
  { value: "barber", label: "Barber", icon: Scissors },
  { value: "stylist", label: "Hair Stylist", icon: Waves },
  { value: "tattoo", label: "Tattoo Artist", icon: Palette },
  { value: "nails", label: "Nail Tech", icon: Hand },
  { value: "lash", label: "Lash Tech", icon: Eye },
  { value: "massage", label: "Massage Therapist", icon: Sparkles },
  { value: "esthetician", label: "Esthetician", icon: Smile },
  { value: "braider", label: "Braider", icon: Leaf },
];

export default function ProviderOnboarding() {
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { apiFetch } = useApiClient();

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(user?.fullName ?? "");
  const [bio, setBio] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const createMutation = useMutation({
    mutationFn: () => apiFetch("POST", "/api/providers", {
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
      displayName,
      category,
      bio: bio || undefined,
      instagramHandle: instagramHandle.replace("@", "") || undefined,
      email: user?.primaryEmailAddress?.emailAddress ?? "",
    }),
    onSuccess: () => navigate("/dashboard/provider"),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create profile"),
  });

  const validateUsername = (val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleaned.length < 3) { setUsernameError("At least 3 characters"); return false; }
    if (cleaned.length > 30) { setUsernameError("Max 30 characters"); return false; }
    setUsernameError("");
    return true;
  };

  const steps = ["Category", "Profile", "Done"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">V</span>
          </div>
          <span className="font-bold text-lg">VYBE</span>
        </div>
        <span className="text-sm text-muted-foreground">{step + 1} / {steps.length}</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1 px-4 pt-4">
        {steps.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-border")} />
        ))}
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        {/* Step 0: Pick category */}
        {step === 0 && (
          <div>
            <h1 className="text-2xl font-bold mb-1">What do you do?</h1>
            <p className="text-muted-foreground text-sm mb-6">Pick your primary category</p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(({ value, label, icon: Icon }) => (
                <button key={value} onClick={() => setCategory(value)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                    category === value ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                  )}>
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    category === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Profile details */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold mb-1">Set up your profile</h1>
              <p className="text-muted-foreground text-sm mb-6">This is what clients will see</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Display name *</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Marcus Davis"
                className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Username * <span className="text-muted-foreground font-normal">— vybe.app/@{username || "yourname"}</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <input value={username} onChange={(e) => { setUsername(e.target.value); validateUsername(e.target.value); }}
                  placeholder="yourname"
                  className={cn(
                    "w-full h-11 rounded-xl border bg-card pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground",
                    usernameError ? "border-destructive focus:ring-destructive" : "border-border"
                  )} />
              </div>
              {usernameError && <p className="text-destructive text-xs mt-1">{usernameError}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Bio <span className="text-muted-foreground font-normal">optional</span></label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                placeholder="Tell clients a bit about your style and experience..."
                rows={3}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Instagram <span className="text-muted-foreground font-normal">optional</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <input value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value.replace("@", ""))}
                  placeholder="yourhandle"
                  className="w-full h-11 rounded-xl border border-border bg-card pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: All done */}
        {step === 2 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">You're all set!</h1>
            <p className="text-muted-foreground mb-2">Your booking link is ready:</p>
            <div className="inline-block bg-card border border-border rounded-xl px-4 py-2 mb-8">
              <span className="text-primary font-mono text-sm">vybe.app/@{username}</span>
            </div>
            <p className="text-sm text-muted-foreground">Add it to your Instagram bio and start getting bookings.</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-border/50 pb-safe">
        <div className="max-w-lg mx-auto">
          {step === 0 && (
            <Button className="w-full h-12 text-base" disabled={!category} onClick={() => setStep(1)}>
              Continue
            </Button>
          )}
          {step === 1 && (
            <Button className="w-full h-12 text-base"
              disabled={!displayName || !username || !!usernameError}
              onClick={() => setStep(2)}>
              Preview
            </Button>
          )}
          {step === 2 && (
            <Button className="w-full h-12 text-base"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}>
              {createMutation.isPending ? "Creating profile..." : "Go to Dashboard"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
