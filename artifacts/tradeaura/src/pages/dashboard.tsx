import { useGetStatsSummary, useListTrades, useGetEquityCurve, useGetStatsBySymbol } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Target, BarChart2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function pct(n: number) { return n.toFixed(1) + "%"; }

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useGetStatsSummary();
  const { data: trades, isLoading: tradesLoading } = useListTrades({ limit: 7, offset: 0 });
  const { data: equityCurve, isLoading: curveLoading } = useGetEquityCurve();
  const { data: bySymbol, isLoading: symbolLoading } = useGetStatsBySymbol();

  const statCards = summary
    ? [
        {
          label: "Total P&L",
          value: fmt(summary.totalPnl),
          icon: summary.totalPnl >= 0 ? TrendingUp : TrendingDown,
          positive: summary.totalPnl >= 0,
          sub: `${summary.totalTrades} trades`,
        },
        {
          label: "Win Rate",
          value: pct(summary.winRate),
          icon: Target,
          positive: summary.winRate >= 50,
          sub: `${summary.winCount}W / ${summary.lossCount}L`,
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Performance overview</p>
          </div>
          <Link href="/trades/new">
            <a className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity" data-testid="link-log-trade">
              Log Trade
            </a>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="pt-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))
            : statCards.map((s) => (
                <Card key={s.label} data-testid={`card-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                      <s.icon className={cn("w-4 h-4", s.positive ? "text-green-500" : "text-red-500")} />
                    </div>
                    <div className={cn("text-2xl font-bold tabular-nums", s.positive ? "text-green-500" : "text-red-500")}>
                      {s.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Equity curve */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              {curveLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : !equityCurve?.length ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No trade data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={equityCurve} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                      formatter={(v: number) => [fmt(v), "Cumulative P&L"]}
                    />
                    <Area type="monotone" dataKey="cumulativePnl" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#pnlGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top symbols */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Symbols</CardTitle>
            </CardHeader>
            <CardContent>
              {symbolLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : !bySymbol?.length ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
              ) : (
                <div className="space-y-3">
                  {bySymbol.slice(0, 6).map((s) => (
                    <div key={s.symbol} className="flex items-center justify-between" data-testid={`row-symbol-${s.symbol}`}>
                      <div>
                        <span className="text-sm font-semibold">{s.symbol}</span>
                        <span className="text-xs text-muted-foreground ml-2">{s.totalTrades} trades</span>
                      </div>
                      <span className={cn("text-sm font-mono font-medium", s.totalPnl >= 0 ? "text-green-500" : "text-red-500")}>
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
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Trades</CardTitle>
            <Link href="/trades">
              <a className="flex items-center gap-1 text-xs text-primary hover:underline" data-testid="link-view-all-trades">
                View all <ArrowUpRight className="w-3 h-3" />
              </a>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {tradesLoading ? (
              <div className="p-4"><Skeleton className="h-40 w-full" /></div>
            ) : !trades?.length ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No trades yet. <Link href="/trades/new"><a className="text-primary hover:underline">Log your first trade</a></Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Symbol", "Direction", "P&L", "Outcome", "Date"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors" data-testid={`row-trade-${t.id}`}>
                      <td className="px-4 py-3 font-semibold">{t.symbol}</td>
                      <td className="px-4 py-3">
                        <Badge variant={t.direction === "long" ? "default" : "secondary"} className="capitalize text-xs">
                          {t.direction}
                        </Badge>
                      </td>
                      <td className={cn("px-4 py-3 font-mono font-medium", t.pnl >= 0 ? "text-green-500" : "text-red-500")}>
                        {t.pnl >= 0 ? "+" : ""}{fmt(t.pnl)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-xs capitalize",
                            t.outcome === "win" ? "text-green-500 border-green-500/30 bg-green-500/10" :
                            t.outcome === "loss" ? "text-red-500 border-red-500/30 bg-red-500/10" :
                            "text-muted-foreground"
                          )}
                        >
                          {t.outcome}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(t.exitDate).toLocaleDateString()}</td>
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
