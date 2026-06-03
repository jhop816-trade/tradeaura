import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiClient } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIMES = [
  "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM",
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
];

function timeToStr(t: string): string {
  const [time, period] = t.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hour = h;
  if (period === "PM" && h !== 12) hour += 12;
  if (period === "AM" && h === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function strToTime(s: string): string {
  const [h, m] = s.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

interface DayConfig {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

const DEFAULT_HOURS: DayConfig[] = DAYS.map((_, i) => ({
  dayOfWeek: i,
  openTime: "09:00",
  closeTime: "17:00",
  isClosed: i === 0, // Sunday closed by default
}));

export default function WorkingHoursPage() {
  const { apiFetch } = useApiClient();
  const qc = useQueryClient();
  const [hours, setHours] = useState<DayConfig[]>(DEFAULT_HOURS);

  const { data: profile } = useQuery({
    queryKey: ["provider", "me"],
    queryFn: () => apiFetch<any>("GET", "/api/providers/me"),
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ["working-hours", profile?.id],
    queryFn: () => fetch(`/api/working-hours/${profile!.id}`).then((r) => r.json()) as Promise<DayConfig[]>,
    enabled: !!profile?.id,
  });

  useEffect(() => {
    if (existing && existing.length > 0) {
      setHours(DEFAULT_HOURS.map((def) => {
        const found = existing.find((e) => e.dayOfWeek === def.dayOfWeek);
        return found ?? def;
      }));
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: () => apiFetch("PUT", "/api/working-hours", { hours }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["working-hours"] });
      toast.success("Working hours saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save"),
  });

  const update = (dayOfWeek: number, patch: Partial<DayConfig>) => {
    setHours((prev) => prev.map((d) => d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard/provider">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
        </Link>
        <span className="font-semibold">Working Hours</span>
        <div className="w-20" />
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <p className="text-sm text-muted-foreground mb-6">Set the hours when clients can book appointments with you.</p>

        {isLoading ? (
          <div className="space-y-4">{DAYS.map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
        ) : (
          <div className="space-y-3">
            {hours.map((day) => (
              <div key={day.dayOfWeek} className={cn(
                "rounded-xl border p-4 transition-colors",
                day.isClosed ? "border-border bg-card opacity-60" : "border-border bg-card"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{DAYS[day.dayOfWeek]}</span>
                  <button
                    onClick={() => update(day.dayOfWeek, { isClosed: !day.isClosed })}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      !day.isClosed ? "bg-primary" : "bg-muted"
                    )}>
                    <span className={cn(
                      "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                      !day.isClosed ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>
                {!day.isClosed && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Open</label>
                      <select
                        value={day.openTime ? strToTime(day.openTime) : "9:00 AM"}
                        onChange={(e) => update(day.dayOfWeek, { openTime: timeToStr(e.target.value) })}
                        className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {TIMES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <span className="text-muted-foreground text-sm mt-4">—</span>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Close</label>
                      <select
                        value={day.closeTime ? strToTime(day.closeTime) : "5:00 PM"}
                        onChange={(e) => update(day.dayOfWeek, { closeTime: timeToStr(e.target.value) })}
                        className="w-full h-9 rounded-lg border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {TIMES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                {day.isClosed && (
                  <p className="text-sm text-muted-foreground">Closed</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 p-4 bg-background/90 backdrop-blur-md border-t border-border/50 pb-safe">
        <div className="max-w-lg mx-auto">
          <Button className="w-full h-12" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {saveMutation.isPending ? "Saving..." : <><Check className="w-4 h-4 mr-2" /> Save Hours</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
