import {
  useGetEquityCurve, useGetStatsBySymbol, useGetStatsByDay, useGetStatsSummary,
} from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

const GREEN = "#22c55e";
const RED = "#f87171";

export default function StatsPage() {
  const { data: equity, isLoading: equityLoading } = useGetEquityCurve();
  const { data: bySymbol, isLoading: symbolLoading } = useGetStatsBySymbol();
  const { data: byDay, isLoading: dayLoading } = useGetStatsByDay();
  const { data: summary, isLoading: summaryLoading } = useGetStatsSummary();

  const pnlColor = (v: number) => v >= 0 ? GREEN : RED;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold">Stats</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Deep dive into your trading performance</p>
        </div>

        {/* Summary row */}
        {!summaryLoading && summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Win Rate", value: summary.winRate.toFixed(1) + "%", good: summary.winRate >= 50 },
              { label: "Profit Factor", value: summary.profitFactor.toFixed(2), good: summary.profitFactor >= 1 },
              { label: "Avg Win", value: fmt(summary.avgWin), good: true },
              { label: "Avg Loss", value: fmt(summary.avgLoss), good: summary.avgLoss >= 0 },
            ].map((s) => (
              <Card key={s.label} className="border-border/60">
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{s.label}</p>
                  <p className={cn("text-xl font-bold tabular-nums", s.good ? "text-green-400" : "text-red-400")}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Equity curve */}
        <Card className="border-border/60 mb-4">
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cumulative P&L</CardTitle>
          </CardHeader>
          <CardContent>
            {equityLoading ? <Skeleton className="h-48 w-full" /> : !equity?.length ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No trade data</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={equity} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GREEN} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                    formatter={(v: number) => [fmt(v), "Cumulative P&L"]}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="cumulativePnl" stroke={GREEN} strokeWidth={2} fill="url(#equityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily P&L bars */}
          <Card className="border-border/60">
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Daily P&L</CardTitle>
            </CardHeader>
            <CardContent>
              {equityLoading ? <Skeleton className="h-48 w-full" /> : !equity?.length ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={equity} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                      formatter={(v: number) => [fmt(v), "P&L"]}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" />
                    <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                      {equity.map((entry, i) => (
                        <Cell key={i} fill={pnlColor(entry.pnl)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* P&L by symbol */}
          <Card className="border-border/60">
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">P&L by Symbol</CardTitle>
            </CardHeader>
            <CardContent>
              {symbolLoading ? <Skeleton className="h-48 w-full" /> : !bySymbol?.length ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={bySymbol.slice(0, 10)} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="symbol" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                      formatter={(v: number) => [fmt(v), "Total P&L"]}
                    />
                    <ReferenceLine x={0} stroke="hsl(var(--border))" />
                    <Bar dataKey="totalPnl" radius={[0, 3, 3, 0]}>
                      {bySymbol.slice(0, 10).map((entry, i) => (
                        <Cell key={i} fill={pnlColor(entry.totalPnl)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* P&L by day of week */}
          <Card className="border-border/60">
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">P&L by Day of Week</CardTitle>
            </CardHeader>
            <CardContent>
              {dayLoading ? <Skeleton className="h-48 w-full" /> : !byDay?.length ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={byDay} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(d) => d.slice(0, 3)} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                      formatter={(v: number) => [fmt(v), "Total P&L"]}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" />
                    <Bar dataKey="totalPnl" radius={[3, 3, 0, 0]}>
                      {byDay.map((entry, i) => (
                        <Cell key={i} fill={pnlColor(entry.totalPnl)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Win rate by day */}
          <Card className="border-border/60">
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Win Rate by Day of Week</CardTitle>
            </CardHeader>
            <CardContent>
              {dayLoading ? <Skeleton className="h-48 w-full" /> : !byDay?.length ? (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={byDay} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(d) => d.slice(0, 3)} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                      formatter={(v: number) => [v.toFixed(1) + "%", "Win Rate"]}
                    />
                    <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="winRate" stroke={GREEN} strokeWidth={2} dot={{ fill: GREEN, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
