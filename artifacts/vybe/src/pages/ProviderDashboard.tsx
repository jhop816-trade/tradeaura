import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Trash2, CheckCircle, XCircle, Clock, Edit, CalendarClock, Link2, Share2, Upload, ImageIcon } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiClient } from "@/lib/api";
import { formatPrice, formatDuration } from "@/lib/utils";
import { toast } from "sonner";
import TopBar from "@/components/layout/TopBar";

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400",
  confirmed: "text-green-400",
  declined: "text-red-400",
  completed: "text-blue-400",
};

export default function ProviderDashboard() {
  const { apiFetch } = useApiClient();
  const qc = useQueryClient();

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings", "provider"],
    queryFn: () => apiFetch<any[]>("GET", "/api/bookings/provider"),
  });

  const { data: profile } = useQuery({
    queryKey: ["provider", "me"],
    queryFn: () => apiFetch<any>("GET", "/api/providers/me"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch("PATCH", `/api/bookings/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings", "provider"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update"),
  });

  const upcoming = bookingsData?.filter((b) => ["pending", "confirmed"].includes(b.booking.status)) ?? [];
  const history = bookingsData?.filter((b) => ["completed", "declined", "cancelled"].includes(b.booking.status)) ?? [];
  const pendingCount = upcoming.filter((b) => b.booking.status === "pending").length;
  const revenue = bookingsData
    ?.filter((b) => ["confirmed", "completed"].includes(b.booking.status))
    .reduce((sum, b) => sum + (b.service?.price ?? 0), 0) ?? 0;

  const completedCount = bookingsData?.filter((b) => b.booking.status === "completed").length ?? 0;
  const reviews = bookingsData?.flatMap((b) => b.booking.reviewCount ?? []) ?? [];

  function copyBookingLink() {
    const link = `${window.location.origin}/@${profile?.username}`;
    const nav = navigator as any;
    if (nav.share) {
      nav.share({ title: "Book with me on VYBE", url: link }).catch(() => {});
    } else {
      nav.clipboard.writeText(link).then(() => toast.success("Booking link copied!"));
    }
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 pt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {profile && (
            <p className="text-muted-foreground text-sm mt-0.5">@{profile.username}</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Revenue</p>
            <p className="text-xl font-bold">{formatPrice(revenue)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Completed</p>
            <p className="text-xl font-bold">{completedCount}</p>
          </div>
          <div className={`rounded-xl border bg-card p-4 ${pendingCount > 0 ? "border-yellow-500/40" : "border-border"}`}>
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className={`text-xl font-bold ${pendingCount > 0 ? "text-yellow-400" : ""}`}>{pendingCount}</p>
          </div>
        </div>

        {/* Share booking link */}
        {profile && (
          <button onClick={copyBookingLink}
            className="w-full mb-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex items-center justify-between hover:bg-primary/10 transition-colors">
            <div className="text-left">
              <p className="text-sm font-medium">Your booking link</p>
              <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {"share" in navigator ? (
                <Share2 className="w-4 h-4 text-primary" />
              ) : (
                <Link2 className="w-4 h-4 text-primary" />
              )}
            </div>
          </button>
        )}

        {/* Quick links */}
        <div className="flex gap-2 mb-6">
          <Link href="/dashboard/provider/edit" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
            </Button>
          </Link>
          <Link href="/dashboard/provider/hours" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <CalendarClock className="w-3.5 h-3.5 mr-1.5" /> Hours
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="upcoming" className="flex-1">
              Upcoming {pendingCount > 0 && <span className="ml-1.5 text-xs bg-yellow-500 text-black rounded-full px-1.5">{pendingCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
            <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
            <TabsTrigger value="portfolio" className="flex-1">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {bookingsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No upcoming bookings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(({ booking, service, client }) => (
                  <div key={booking.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{client?.displayName ?? "Client"}</p>
                        <p className="text-sm text-muted-foreground">{service?.name}</p>
                      </div>
                      <span className={`text-xs font-medium capitalize ${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{format(new Date(booking.appointmentAt), "MMM d, h:mm a")}</span>
                      <span className="font-medium text-foreground">{formatPrice(service?.price ?? 0)}</span>
                    </div>
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => statusMutation.mutate({ id: booking.id, status: "declined" })}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                        </Button>
                        <Button size="sm" className="flex-1"
                          onClick={() => statusMutation.mutate({ id: booking.id, status: "confirmed" })}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Accept
                        </Button>
                      </div>
                    )}
                    {booking.status === "confirmed" && (
                      <Button size="sm" variant="outline" className="w-full"
                        onClick={() => statusMutation.mutate({ id: booking.id, status: "completed" })}>
                        Mark Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No history yet.</div>
            ) : (
              <div className="space-y-3">
                {history.map(({ booking, service, client }) => (
                  <div key={booking.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{client?.displayName ?? "Client"}</p>
                        <p className="text-sm text-muted-foreground">{service?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(booking.appointmentAt), "MMM d, h:mm a")}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium capitalize block ${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
                        <span className="text-sm font-semibold">{formatPrice(service?.price ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="services">
            <ServicesManager />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioManager providerId={profile?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface PortfolioPhoto {
  id: string;
  providerId: string;
  photoUrl: string;
  caption: string | null;
  createdAt: string;
}

function PortfolioManager({ providerId }: { providerId?: string }) {
  const { apiFetch, uploadFile } = useApiClient();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: photos, isLoading } = useQuery<PortfolioPhoto[]>({
    queryKey: ["portfolio", providerId],
    queryFn: () => fetch(`/api/portfolio/${providerId}`).then((r) => r.json()),
    enabled: !!providerId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch("DELETE", `/api/portfolio/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio", providerId] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile("/api/upload/inspo", file);
      await apiFetch("POST", "/api/portfolio", { photoUrl: url });
      qc.invalidateQueries({ queryKey: ["portfolio", providerId] });
      toast.success("Photo added to portfolio");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{photos?.length ?? 0} photos</span>
        <Button size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-1" /> {uploading ? "Uploading..." : "Add Photo"}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      ) : photos?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No portfolio photos yet</p>
          <p className="text-sm mt-1">Add photos to showcase your work</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos?.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-muted">
              <img src={photo.photoUrl} alt={photo.caption ?? "Portfolio photo"} className="w-full h-full object-cover" />
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{photo.caption}</p>
                </div>
              )}
              <button
                onClick={() => deleteMutation.mutate(photo.id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesManager() {
  const { apiFetch } = useApiClient();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", durationMinutes: "60" });

  const { data: services, isLoading } = useQuery({
    queryKey: ["services", "mine"],
    queryFn: async () => {
      const profile = await apiFetch<any>("GET", "/api/providers/me");
      const res = await fetch(`/api/services?providerId=${profile.id}`);
      return res.json() as Promise<any[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => apiFetch("POST", "/api/services", {
      ...form,
      price: Math.round(parseFloat(form.price) * 100),
      durationMinutes: parseInt(form.durationMinutes),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      setForm({ name: "", description: "", price: "", durationMinutes: "60" });
      setShowForm(false);
      toast.success("Service added");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add service"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch("DELETE", `/api/services/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{services?.length ?? 0} services</span>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> Add Service
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 mb-4 space-y-3">
          <input placeholder="Service name *" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
          <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
          <div className="flex gap-2">
            <input placeholder="Price ($) *" type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
              className="flex-1 h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
            <input placeholder="Duration (min) *" type="number" value={form.durationMinutes} onChange={(e) => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
              className="flex-1 h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
          </div>
          <Button className="w-full" disabled={!form.name || !form.price || createMutation.isPending}
            onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? "Saving..." : "Save Service"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {services?.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(s.price)} · {formatDuration(s.durationMinutes)}</p>
              </div>
              <button onClick={() => deleteMutation.mutate(s.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
