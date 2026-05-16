import { useGetStatsSummary, useListTrades, useGetEquityCurve, useGetStatsBySymbol } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { TrendingUp, TrendingDown, Target, BarChart2, Activity, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function pct(n: number) { return n.toFixed(1) + "%"; }

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useGetStatsSummary();
  const { data: trades, isLoading: tradesLoading } = useListTrades({ limit: 8, offset: 0 });
  const { data: equityCurve, isLoading: curveLoading } = useGetEquityCurve();
  const { data: bySymbol, isLoading: symbolLoading } = useGetStatsBySymbol();

  const statCards = summary
    ? [
        {
          label: "Total P&L",
          value: fmt(summary.totalPnl),
          icon: summary.totalPnl >= 0 ? TrendingUp : TrendingDown,
          positive: summary.totalPnl >= 0,
          sub: `${summary.totalTrades} trades total`,
        },
        {
          label: "Win Rate",
          value: pct(summary.winRate),
          icon: Target,
          positive: summary.winRate >= 50,
          sub: `${summary.winCount}W · ${summary.lossCount}L`,
        },
        {
          label: "Profit Factor",
          value: summary.profitFactor.toFixed(2),
          icon: BarChart2,
          positive: summary.profitFactor >= 1,
          sub: `Avg win ${fmt(summary.avgWin)}`,
        },
        {
          label: "Avg Risk/Reward",
          value: summary.avgRiskReward.toFixed(2) + "R",
          icon: Activity,
          positive: summary.avgRiskReward >= 1,
          sub: `Avg loss ${fmt(summary.avgLoss)}`,
        },
      ]
    : [];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your trading performance at a glance</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {summaryLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="pt-5 pb-4"><Skeleton className="h-14 w-full" /></CardContent></Card>
              ))
            : statCards.map((s) => (
                <Card key={s.label} className="border-border/60">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</span>
                      <s.icon className={cn("w-3.5 h-3.5", s.positive ? "text-green-500" : "text-red-400")} />
                    </div>
                    <div className={cn("text-2xl font-bold tabular-nums", s.positive ? "text-green-400" : "text-red-400")}>
                      {s.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Equity curve */}
          <Card className="lg:col-span-2 border-border/60">
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              {curveLoading ? (
                <Skeleton className="h-44 w-full" />
              ) : !equityCurve?.length ? (
                <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">No trade data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={170}>
                  <AreaChart data={equityCurve} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                      formatter={(v: number) => [fmt(v), "Cumulative P&L"]}
                    />
                    <Area type="monotone" dataKey="cumulativePnl" stroke="#22c55e" strokeWidth={2} fill="url(#pnlGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top symbols */}
          <Card className="border-border/60">
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top Symbols</CardTitle>
            </CardHeader>
            <CardContent>
              {symbolLoading ? (
                <Skeleton className="h-44 w-full" />
              ) : !bySymbol?.length ? (
                <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">No data</div>
              ) : (
                <div className="space-y-2.5 mt-1">
                  {bySymbol.slice(0, 7).map((s) => (
                    <div key={s.symbol} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                          <span className="text-[10px] font-bold text-muted-foreground">{s.symbol[0]}</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold">{s.symbol}</span>
                          <span className="text-xs text-muted-foreground ml-1.5">{s.totalTrades}t</span>
                        </div>
                      </div>
                      <span className={cn("text-sm font-mono font-medium", s.totalPnl >= 0 ? "text-green-400" : "text-red-400")}>
                        {s.totalPnl >= 0 ? "+" : ""}{fmt(s.totalPnl)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent trades */}
        <Card className="border-border/60">
          <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent Trades</CardTitle>
            <Link href="/journal">
              <a className="flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowUpRight className="w-3 h-3" />
              </a>
            </Link>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            {tradesLoading ? (
              <div className="p-4"><Skeleton className="h-36 w-full" /></div>
            ) : !trades?.length ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No trades yet. <Link href="/trades/new"><a className="text-primary hover:underline">Log your first trade →</a></Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Symbol", "Direction", "P&L", "Outcome", "Date"].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-semibold">{t.symbol}</td>
                      <td className="px-4 py-2.5">
                        <Badge
                          variant="outline"
                          className={cn("text-xs capitalize border-0 font-medium",
                            t.direction === "long"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-purple-500/10 text-purple-400"
                          )}
                        >
                          {t.direction}
                        </Badge>
                      </td>
                      <td className={cn("px-4 py-2.5 font-mono font-medium text-sm", t.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                        {t.pnl >= 0 ? "+" : ""}{fmt(t.pnl)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn("text-xs font-medium capitalize",
                          t.outcome === "win" ? "text-green-400" :
                          t.outcome === "loss" ? "text-red-400" : "text-muted-foreground"
                        )}>
                          {t.outcome}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{new Date(t.exitDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
