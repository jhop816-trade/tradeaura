import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { Calendar, ArrowRight, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiClient } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { ReviewPrompt } from "@/components/ReviewPrompt";
import TopBar from "@/components/layout/TopBar";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400",
  confirmed: "text-green-400",
  declined: "text-red-400",
  completed: "text-blue-400",
  cancelled: "text-muted-foreground",
};

export default function ClientDashboard() {
  const { apiFetch } = useApiClient();
  const qc = useQueryClient();
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ["bookings", "client"],
    queryFn: () => apiFetch<any[]>("GET", "/api/bookings/client"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiFetch("PATCH", `/api/bookings/${id}/cancel`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings", "client"] });
      setCancellingId(null);
      toast.success("Booking cancelled");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to cancel"),
  });

  const upcoming = bookingsData?.filter((b) => ["pending", "confirmed"].includes(b.booking.status)) ?? [];
  const past = bookingsData?.filter((b) => ["completed", "declined", "cancelled"].includes(b.booking.status)) ?? [];

  return (
    <div className="min-h-screen bg-background pb-6">
      <TopBar />
      <div className="max-w-lg mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

        <Tabs defaultValue="upcoming">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="upcoming" className="flex-1">
              Upcoming {upcoming.length > 0 && <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5">{upcoming.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium mb-1">No upcoming bookings</p>
                <p className="text-sm mb-6">Find a provider and book your first appointment</p>
                <Link href="/explore">
                  <Button>Explore Providers <ArrowRight className="ml-2 w-4 h-4" /></Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(({ booking, service, provider }) => (
                  <div key={booking.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{provider?.displayName}</p>
                        <p className="text-sm text-muted-foreground">{service?.name}</p>
                      </div>
                      <span className={`text-xs font-medium capitalize ${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{format(new Date(booking.appointmentAt), "MMM d, h:mm a")}</span>
                      <span className="font-semibold">{formatPrice(service?.price ?? 0)}</span>
                    </div>
                    {booking.inspoPhotoUrl && (
                      <div className="mt-3">
                        <img src={booking.inspoPhotoUrl} alt="inspo" className="h-16 w-16 object-cover rounded-lg" />
                      </div>
                    )}
                    {cancellingId === booking.id ? (
                      <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                        <p className="text-sm text-red-400 mb-2">Cancel this booking?</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs"
                            onClick={() => setCancellingId(null)}>
                            Keep it
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                            disabled={cancelMutation.isPending}
                            onClick={() => cancelMutation.mutate(booking.id)}>
                            {cancelMutation.isPending ? "Cancelling..." : "Yes, cancel"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="w-full mt-2 h-8 text-xs text-muted-foreground hover:text-red-400"
                        onClick={() => setCancellingId(booking.id)}>
                        <X className="w-3 h-3 mr-1" /> Cancel booking
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
            ) : past.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No past bookings yet.</div>
            ) : (
              <div className="space-y-3">
                {past.map(({ booking, service, provider }) => (
                  <div key={booking.id}>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{provider?.displayName}</p>
                          <p className="text-sm text-muted-foreground">{service?.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(booking.appointmentAt), "MMM d, yyyy")}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-medium capitalize block ${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
                          <span className="text-sm font-semibold">{formatPrice(service?.price ?? 0)}</span>
                        </div>
                      </div>
                      {booking.status !== "cancelled" && (
                        <div className="flex gap-2 mt-2">
                          {provider && (
                            <Link href={`/book/${provider.username}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full h-8 text-xs">
                                <RotateCcw className="w-3 h-3 mr-1" /> Rebook
                              </Button>
                            </Link>
                          )}
                          {booking.status === "completed" && (
                            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                              onClick={() => setReviewingBookingId(booking.id)}>
                              ⭐ Review
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    {reviewingBookingId === booking.id && provider && (
                      <div className="mt-2">
                        <ReviewPrompt
                          bookingId={booking.id}
                          providerName={provider.displayName}
                          onDone={() => setReviewingBookingId(null)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
