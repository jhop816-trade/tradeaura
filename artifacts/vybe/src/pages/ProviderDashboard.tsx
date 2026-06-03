import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Trash2, CheckCircle, XCircle, Clock, DollarSign, Edit, CalendarClock } from "lucide-react";
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
  const history = bookingsData?.filter((b) => ["completed", "declined"].includes(b.booking.status)) ?? [];
  const revenue = bookingsData
    ?.filter((b) => ["confirmed", "completed"].includes(b.booking.status))
    .reduce((sum, b) => sum + (b.service?.price ?? 0), 0) ?? 0;

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

        {/* Revenue card */}
        <div className="rounded-xl border border-border bg-card p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Confirmed Revenue</p>
            <p className="text-2xl font-bold">{formatPrice(revenue)}</p>
          </div>
        </div>

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
              Upcoming {upcoming.length > 0 && <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5">{upcoming.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
            <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
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
        </Tabs>
      </div>
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
