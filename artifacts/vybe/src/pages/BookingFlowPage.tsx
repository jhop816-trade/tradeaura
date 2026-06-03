import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format, addDays } from "date-fns";
import { ArrowLeft, ArrowRight, Upload, X, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiClient } from "@/lib/api";
import { formatPrice, formatDuration, cn } from "@/lib/utils";
import { toast } from "sonner";

interface Service { id: string; name: string; price: number; durationMinutes: number; description: string | null; }
interface ProviderProfile { id: string; username: string; displayName: string; avatarUrl: string | null; services: Service[]; }

const TIME_SLOTS = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"];

function parseTimeSlot(dateStr: string, timeSlot: string): Date {
  const [time, period] = timeSlot.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(dateStr);
  let h = hours;
  if (period === "PM" && hours !== 12) h += 12;
  if (period === "AM" && hours === 12) h = 0;
  date.setHours(h, minutes, 0, 0);
  return date;
}

export default function BookingFlowPage({ username }: { username: string }) {
  const [, navigate] = useLocation();
  const { apiFetch, uploadFile } = useApiClient();
  const [step, setStep] = useState(0);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [inspoFile, setInspoFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const { data: provider, isLoading } = useQuery<ProviderProfile>({
    queryKey: ["provider", username],
    queryFn: async () => {
      const res = await fetch(`/api/providers/${username}`);
      if (!res.ok) throw new Error("Provider not found");
      return res.json();
    },
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!provider || !selectedServiceId || !selectedTime) throw new Error("Missing fields");
      let inspoPhotoUrl: string | undefined;
      if (inspoFile) {
        const { url } = await uploadFile("/api/upload/inspo", inspoFile);
        inspoPhotoUrl = url;
      }
      const appointmentAt = parseTimeSlot(selectedDate, selectedTime).toISOString();
      return apiFetch<{ id: string }>("POST", "/api/bookings", {
        providerId: provider.id,
        serviceId: selectedServiceId,
        appointmentAt,
        inspoPhotoUrl,
        notes: notes || undefined,
      });
    },
    onSuccess: (booking) => navigate(`/booking/${booking.id}`),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Booking failed"),
  });

  const selectedService = provider?.services.find((s) => s.id === selectedServiceId);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i + 1);
    return { value: format(d, "yyyy-MM-dd"), label: format(d, "EEE"), day: format(d, "d") };
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background p-4 pt-8 space-y-4 max-w-lg mx-auto">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  );

  const steps = ["Service", "Date & Time", "Details", "Confirm"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : history.back()} className="flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-sm font-medium">{steps[step]} ({step + 1}/{steps.length})</span>
        <div className="w-16" />
      </div>

      {/* Progress */}
      <div className="flex gap-1 px-4 pt-4">
        {steps.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-border")} />
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Step 0: Select Service */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold mb-1">Choose a service</h2>
            <p className="text-sm text-muted-foreground mb-4">with {provider?.displayName}</p>
            <div className="space-y-3">
              {provider?.services.map((s) => (
                <button key={s.id} onClick={() => setSelectedServiceId(s.id)}
                  className={cn("w-full text-left rounded-xl border p-4 transition-colors",
                    selectedServiceId === s.id ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-sm font-semibold text-primary">{formatPrice(s.price)}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />{formatDuration(s.durationMinutes)}
                        </span>
                      </div>
                    </div>
                    {selectedServiceId === s.id && <Check className="w-5 h-5 text-primary shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Pick a date & time</h2>
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 mb-6">
              {dates.map((d) => (
                <button key={d.value} onClick={() => { setSelectedDate(d.value); setSelectedTime(null); }}
                  className={cn("shrink-0 flex flex-col items-center rounded-xl border px-4 py-3 min-w-[60px] transition-colors",
                    selectedDate === d.value ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}>
                  <span className="text-xs text-muted-foreground">{d.label}</span>
                  <span className="font-bold text-lg">{d.day}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((t) => (
                <button key={t} onClick={() => setSelectedTime(t)}
                  className={cn("rounded-xl border px-3 py-2.5 text-sm transition-colors",
                    selectedTime === t ? "border-primary bg-primary/5 font-medium" : "border-border bg-card"
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold mb-1">Add details</h2>
            <p className="text-sm text-muted-foreground mb-6">Optional inspo photo and notes</p>
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Inspo photo</label>
              {inspoFile ? (
                <div className="relative w-40 h-40 rounded-xl overflow-hidden">
                  <img src={URL.createObjectURL(inspoFile)} alt="inspo" className="w-full h-full object-cover" />
                  <button onClick={() => setInspoFile(null)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors bg-card">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Tap to upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setInspoFile(e.target.files?.[0] ?? null)} />
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notes for your provider</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Any requests or details..."
                className="w-full h-28 rounded-xl border border-border bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedService && (
          <div>
            <h2 className="text-lg font-bold mb-6">Confirm booking</h2>
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">{provider?.displayName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(new Date(selectedDate), "EEEE, MMM d")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{formatDuration(selectedService.durationMinutes)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(selectedService.price)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-background/90 backdrop-blur-md border-t border-border/50 pb-safe">
        <div className="max-w-lg mx-auto">
          {step < 3 ? (
            <Button className="w-full h-12 text-base"
              disabled={(step === 0 && !selectedServiceId) || (step === 1 && (!selectedDate || !selectedTime))}
              onClick={() => setStep(s => s + 1)}>
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button className="w-full h-12 text-base"
              disabled={bookMutation.isPending}
              onClick={() => bookMutation.mutate()}>
              {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
