import { useState } from "react";
import { useGetEquityCurve } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { data: equity, isLoading } = useGetEquityCurve();

  const pnlByDate = new Map<string, number>();
  if (equity) {
    for (const entry of equity) {
      pnlByDate.set(entry.date, (pnlByDate.get(entry.date) ?? 0) + entry.pnl);
    }
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function dateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const monthTradingDays = cells
    .filter((d): d is number => d !== null)
    .filter((d) => pnlByDate.has(dateKey(d)));
  const monthPnl = monthTradingDays.reduce((sum, d) => sum + (pnlByDate.get(dateKey(d)) ?? 0), 0);
  const monthWins = monthTradingDays.filter((d) => (pnlByDate.get(dateKey(d)) ?? 0) > 0).length;
  const monthWinRate = monthTradingDays.length > 0
    ? ((monthWins / monthTradingDays.length) * 100).toFixed(0) + "%"
    : "—";

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Daily P&L heatmap</p>
        </div>

        {/* Month summary */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Card className="border-border/60">
            <CardContent className="py-3 px-4">
              <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide">Month P&L</p>
              <p className={cn("text-lg font-bold tabular-nums", monthPnl >= 0 ? "text-green-400" : "text-red-400")}>
                {monthTradingDays.length > 0 ? (monthPnl >= 0 ? "+" : "") + fmt(monthPnl) : "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="py-3 px-4">
              <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide">Trading Days</p>
              <p className="text-lg font-bold">{monthTradingDays.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="py-3 px-4">
              <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide">Win Rate</p>
              <p className="text-lg font-bold">{monthWinRate}</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="border-border/60">
          <CardHeader className="pb-0 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                {MONTHS[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
                  className="text-xs px-2.5 py-1 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <>
                {/* Day labels */}
                <div className="grid grid-cols-7 mb-1">
                  {DAYS.map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((day, i) => {
                    if (day === null) {
                      return <div key={i} className="aspect-square" />;
                    }

                    const key = dateKey(day);
                    const pnl = pnlByDate.get(key);
                    const isToday = key === todayKey;
                    const hasData = pnl !== undefined;

                    return (
                      <div
                        key={i}
                        className={cn(
                          "aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-colors",
                          hasData
                            ? pnl! >= 0
                              ? "bg-green-500/15 border border-green-500/25"
                              : "bg-red-500/15 border border-red-500/25"
                            : "bg-muted/10 border border-border/30",
                          isToday && !hasData && "border-primary/50 bg-primary/5"
                        )}
                      >
                        <span className={cn(
                          "text-xs font-medium leading-none",
                          isToday ? "text-primary" : "text-muted-foreground"
                        )}>
                          {day}
                        </span>
                        {hasData && (
                          <span className={cn(
                            "text-[9px] font-bold leading-none mt-0.5 tabular-nums",
                            pnl! >= 0 ? "text-green-400" : "text-red-400"
                          )}>
                            {pnl! >= 0 ? "+" : ""}{fmt(pnl!)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-green-500/15 border border-green-500/25" />
                    <span className="text-xs text-muted-foreground">Profitable day</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-red-500/15 border border-red-500/25" />
                    <span className="text-xs text-muted-foreground">Loss day</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-muted/10 border border-border/30" />
                    <span className="text-xs text-muted-foreground">No trades</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
