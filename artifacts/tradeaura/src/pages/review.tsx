import { useListTrades } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function getWeekKey(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}

function getWeekLabel(weekKey: string) {
  const start = new Date(weekKey + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 4);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

interface WeekStats {
  key: string;
  label: string;
  trades: number;
  wins: number;
  losses: number;
  pnl: number;
  strategies: string[];
  symbols: string[];
}

export default function ReviewPage() {
  const { data: trades, isLoading } = useListTrades({ limit: 500, offset: 0 });

  const weekMap = new Map<string, WeekStats>();

  if (trades) {
    for (const t of trades) {
      const weekKey = getWeekKey(new Date(t.exitDate));
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          key: weekKey,
          label: getWeekLabel(weekKey),
          trades: 0,
          wins: 0,
          losses: 0,
          pnl: 0,
          strategies: [],
          symbols: [],
        });
      }
      const w = weekMap.get(weekKey)!;
      w.trades += 1;
      w.pnl += t.pnl;
      if (t.outcome === "win") w.wins += 1;
      if (t.outcome === "loss") w.losses += 1;
      if (t.strategy && !w.strategies.includes(t.strategy)) w.strategies.push(t.strategy);
      if (!w.symbols.includes(t.symbol)) w.symbols.push(t.symbol);
    }
  }

  const weeks = Array.from(weekMap.values()).sort((a, b) => b.key.localeCompare(a.key));

  const totalPnl = weeks.reduce((s, w) => s + w.pnl, 0);
  const bestWeek = weeks.reduce<WeekStats | null>((best, w) => (!best || w.pnl > best.pnl ? w : best), null);
  const worstWeek = weeks.reduce<WeekStats | null>((worst, w) => (!worst || w.pnl < worst.pnl ? w : worst), null);

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold">Review</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Weekly performance breakdown</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : weeks.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-sm">No trades to review yet</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <Card className="border-border/60">
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide">All-time P&L</p>
                  <p className={cn("text-lg font-bold tabular-nums", totalPnl >= 0 ? "text-green-400" : "text-red-400")}>
                    {totalPnl >= 0 ? "+" : ""}{fmt(totalPnl)}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide">Best Week</p>
                  <p className="text-lg font-bold text-green-400">
                    {bestWeek ? "+" + fmt(bestWeek.pnl) : "—"}
                  </p>
                  {bestWeek && <p className="text-xs text-muted-foreground mt-0.5">{bestWeek.label}</p>}
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide">Worst Week</p>
                  <p className="text-lg font-bold text-red-400">
                    {worstWeek && worstWeek.pnl < 0 ? fmt(worstWeek.pnl) : "—"}
                  </p>
                  {worstWeek && worstWeek.pnl < 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">{worstWeek.label}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Weekly rows */}
            <div className="space-y-2">
              {weeks.map((w) => {
                const winRate = w.trades > 0 ? (w.wins / w.trades) * 100 : 0;
                const Icon = w.pnl > 0 ? TrendingUp : w.pnl < 0 ? TrendingDown : Minus;
                const iconClass = w.pnl > 0 ? "text-green-400" : w.pnl < 0 ? "text-red-400" : "text-muted-foreground";

                return (
                  <Card key={w.key} className="border-border/60 hover:border-border transition-colors">
                    <CardContent className="py-4 px-5">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          w.pnl > 0 ? "bg-green-500/10" : w.pnl < 0 ? "bg-red-500/10" : "bg-muted/20"
                        )}>
                          <Icon className={cn("w-4 h-4", iconClass)} />
                        </div>

                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold">{w.label}</span>
                            <span className={cn("text-base font-bold tabular-nums", w.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                              {w.pnl >= 0 ? "+" : ""}{fmt(w.pnl)}
                            </span>
                          </div>

                          {/* Stats row */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                            <span>{w.trades} trade{w.trades !== 1 ? "s" : ""}</span>
                            <span className="text-green-400">{w.wins}W</span>
                            <span className="text-red-400">{w.losses}L</span>
                            <span>{winRate.toFixed(0)}% win rate</span>
                          </div>

                          {/* Win rate bar */}
                          <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", w.pnl >= 0 ? "bg-green-500" : "bg-red-500")}
                              style={{ width: `${winRate}%` }}
                            />
                          </div>

                          {/* Symbols & strategies */}
                          {(w.symbols.length > 0 || w.strategies.length > 0) && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {w.symbols.slice(0, 5).map((s) => (
                                <span key={s} className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded font-medium">
                                  {s}
                                </span>
                              ))}
                              {w.strategies.slice(0, 3).map((s) => (
                                <span key={s} className="text-[10px] px-1.5 py-0.5 bg-muted/30 text-muted-foreground rounded">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
