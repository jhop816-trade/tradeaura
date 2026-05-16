import { useState } from "react";
import { useListTrades, useDeleteTrade, getListTradesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Trash2, Eye, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export default function JournalPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [symbolFilter, setSymbolFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");

  const params = {
    symbol: symbolFilter || undefined,
    direction: directionFilter !== "all" ? (directionFilter as "long" | "short") : undefined,
    outcome: outcomeFilter !== "all" ? (outcomeFilter as "win" | "loss" | "breakeven") : undefined,
    limit: 100,
    offset: 0,
  };

  const { data: trades, isLoading } = useListTrades(params, {
    query: { queryKey: getListTradesQueryKey(params) },
  });

  const deleteMutation = useDeleteTrade({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListTradesQueryKey() });
        toast({ title: "Trade deleted" });
      },
    },
  });

  const totalPnl = trades?.reduce((sum, t) => sum + t.pnl, 0) ?? 0;
  const wins = trades?.filter((t) => t.outcome === "win").length ?? 0;
  const total = trades?.length ?? 0;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(0) : "—";

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">Journal</h1>
            <p className="text-sm text-muted-foreground mt-0.5">All recorded trades</p>
          </div>
        </div>

        {/* Quick stats strip */}
        {!isLoading && trades && trades.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <Card className="border-border/60">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide">Filtered P&L</p>
                <p className={cn("text-lg font-bold tabular-nums", totalPnl >= 0 ? "text-green-400" : "text-red-400")}>
                  {totalPnl >= 0 ? "+" : ""}{fmt(totalPnl)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide">Win Rate</p>
                <p className="text-lg font-bold">{winRate}{typeof winRate === "string" ? "" : "%"}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide">Trades</p>
                <p className="text-lg font-bold">{total}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Symbol..."
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
              className="pl-8 w-36 h-8 text-sm"
            />
          </div>
          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All directions</SelectItem>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All outcomes</SelectItem>
              <SelectItem value="win">Win</SelectItem>
              <SelectItem value="loss">Loss</SelectItem>
              <SelectItem value="breakeven">Breakeven</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="border-border/60">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6"><Skeleton className="h-64 w-full" /></div>
            ) : !trades?.length ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground text-sm mb-3">No trades found</p>
                <Link href="/trades/new">
                  <a className="text-primary text-sm hover:underline">Log your first trade →</a>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/10">
                      {["Symbol", "Dir", "Entry", "Exit", "Qty", "P&L", "P&L %", "R/R", "Outcome", "Date", "Strategy", ""].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t) => (
                      <tr key={t.id} className="border-b border-border/40 last:border-0 hover:bg-muted/15 transition-colors">
                        <td className="px-3 py-2.5 font-semibold">{t.symbol}</td>
                        <td className="px-3 py-2.5">
                          <span className={cn("text-xs font-medium capitalize px-1.5 py-0.5 rounded",
                            t.direction === "long"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-purple-500/10 text-purple-400"
                          )}>
                            {t.direction}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs">${t.entryPrice.toFixed(2)}</td>
                        <td className="px-3 py-2.5 font-mono text-xs">${t.exitPrice.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{t.quantity}</td>
                        <td className={cn("px-3 py-2.5 font-mono font-semibold", t.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                          {t.pnl >= 0 ? "+" : ""}{fmt(t.pnl)}
                        </td>
                        <td className={cn("px-3 py-2.5 font-mono text-xs", (t.pnlPercent ?? 0) >= 0 ? "text-green-400" : "text-red-400")}>
                          {t.pnlPercent != null ? `${t.pnlPercent >= 0 ? "+" : ""}${t.pnlPercent.toFixed(2)}%` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                          {t.riskRewardRatio != null ? t.riskRewardRatio.toFixed(2) + "R" : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={cn("text-xs font-medium capitalize",
                            t.outcome === "win" ? "text-green-400" :
                            t.outcome === "loss" ? "text-red-400" : "text-muted-foreground"
                          )}>
                            {t.outcome}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(t.exitDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{t.strategy ?? "—"}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-0.5">
                            <Link href={`/trades/${t.id}`}>
                              <a>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </a>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-red-400"
                              onClick={() => deleteMutation.mutate({ id: t.id })}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
