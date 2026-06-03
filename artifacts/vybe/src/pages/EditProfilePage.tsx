import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Camera } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiClient } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "barber", label: "Barber" },
  { value: "stylist", label: "Hair Stylist" },
  { value: "tattoo", label: "Tattoo Artist" },
  { value: "nails", label: "Nail Tech" },
  { value: "lash", label: "Lash Tech" },
  { value: "massage", label: "Massage Therapist" },
  { value: "esthetician", label: "Esthetician" },
  { value: "braider", label: "Braider" },
];

export default function EditProfilePage() {
  const { apiFetch, uploadFile } = useApiClient();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["provider", "me"],
    queryFn: () => apiFetch<any>("GET", "/api/providers/me"),
  });

  const [form, setForm] = useState({
    displayName: "",
    username: "",
    bio: "",
    category: "",
    instagramHandle: "",
    avatarUrl: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName ?? "",
        username: profile.username ?? "",
        bio: profile.bio ?? "",
        category: profile.category ?? "",
        instagramHandle: profile.instagramHandle ?? "",
        avatarUrl: profile.avatarUrl ?? "",
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let avatarUrl = form.avatarUrl;
      if (avatarFile) {
        const { url } = await uploadFile("/api/upload/avatar", avatarFile);
        avatarUrl = url;
      }
      // Authorization header is always inside the headers object (see src/lib/api.ts)
      return apiFetch("PATCH", "/api/providers/me", { ...form, avatarUrl });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider", "me"] });
      toast.success("Profile saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save profile"),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background p-4 pt-8 max-w-lg mx-auto space-y-4">
      <Skeleton className="h-24 w-24 rounded-full mx-auto" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  const avatarSrc = avatarPreview ?? form.avatarUrl;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard/provider">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
        </Link>
        <span className="font-semibold">Edit Profile</span>
        <div className="w-20" />
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8 space-y-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <button onClick={() => fileRef.current?.click()} className="relative group">
            <div className="w-24 h-24 rounded-full bg-muted overflow-hidden ring-2 ring-border">
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                  {form.displayName[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Display name *</label>
          <input value={form.displayName} onChange={(e) => setForm(f => ({ ...f, displayName: e.target.value }))}
            className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Username *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
            <input value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }))}
              className="w-full h-11 rounded-xl border border-border bg-card pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Category *</label>
          <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={3} placeholder="Tell clients about your style..."
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Instagram</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
            <input value={form.instagramHandle} onChange={(e) => setForm(f => ({ ...f, instagramHandle: e.target.value.replace("@", "") }))}
              placeholder="yourhandle"
              className="w-full h-11 rounded-xl border border-border bg-card pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 p-4 bg-background/90 backdrop-blur-md border-t border-border/50 pb-safe">
        <div className="max-w-lg mx-auto">
          <Button className="w-full h-12 text-base"
            disabled={!form.displayName || !form.username || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}>
            {saveMutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
