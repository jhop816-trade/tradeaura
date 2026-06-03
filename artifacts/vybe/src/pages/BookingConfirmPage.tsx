import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { CheckCircle, Clock, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiClient } from "@/lib/api";
import { formatPrice, formatDuration } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  declined: "Declined",
  completed: "Completed",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
  declined: "bg-red-500/10 text-red-400 border-red-500/20",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function BookingConfirmPage({ bookingId }: { bookingId: string }) {
  const { apiFetch } = useApiClient();

  const { data, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => apiFetch<any>("GET", `/api/bookings/${bookingId}`),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-full max-w-sm px-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );

  const booking = data?.booking;
  const service = data?.service;
  const provider = data?.provider;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Booking Requested!</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Your request has been sent. You'll hear back once it's confirmed.
        </p>

        {/* Status badge */}
        {booking && (
          <div className="flex justify-center mb-6">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${STATUS_COLORS[booking.status]}`}>
              {STATUS_LABELS[booking.status]}
            </span>
          </div>
        )}

        {/* Details card */}
        {booking && service && provider && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">{provider.displayName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium">{service.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date
              </span>
              <span className="font-medium">{format(new Date(booking.appointmentAt), "MMM d, yyyy")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Time
              </span>
              <span className="font-medium">{format(new Date(booking.appointmentAt), "h:mm a")}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(service.price)}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/dashboard/client">
            <Button className="w-full">View My Bookings <ArrowRight className="ml-2 w-4 h-4" /></Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" className="w-full">Explore More Providers</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
