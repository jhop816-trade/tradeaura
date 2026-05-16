import { useState } from "react";
import { useListTrades, useDeleteTrade, getListTradesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Trash2, Eye, PlusCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export default function TradesPage() {
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

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Trade Log</h1>
            <p className="text-sm text-muted-foreground mt-0.5">All your recorded trades</p>
          </div>
          <Link href="/trades/new">
            <a className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity" data-testid="link-new-trade">
              <PlusCircle className="w-4 h-4" /> Log Trade
            </a>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter by symbol..."
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
              className="pl-8 w-44"
              data-testid="input-filter-symbol"
            />
          </div>
          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="w-36" data-testid="select-filter-direction">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All directions</SelectItem>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="w-36" data-testid="select-filter-outcome">
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

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6"><Skeleton className="h-64 w-full" /></div>
            ) : !trades?.length ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground text-sm mb-3">No trades found</p>
                <Link href="/trades/new">
                  <a className="text-primary text-sm hover:underline">Log your first trade</a>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      {["Symbol", "Dir", "Entry", "Exit", "Qty", "P&L", "P&L %", "R/R", "Outcome", "Date", "Strategy", ""].map((h) => (
                        <th key={h} className="px-3 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t) => (
                      <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors" data-testid={`row-trade-${t.id}`}>
                        <td className="px-3 py-3 font-semibold">{t.symbol}</td>
                        <td className="px-3 py-3">
                          <Badge variant={t.direction === "long" ? "default" : "secondary"} className="text-xs capitalize">
                            {t.direction}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs">${t.entryPrice.toFixed(2)}</td>
                        <td className="px-3 py-3 font-mono text-xs">${t.exitPrice.toFixed(2)}</td>
                        <td className="px-3 py-3 text-xs">{t.quantity}</td>
                        <td className={cn("px-3 py-3 font-mono font-medium", t.pnl >= 0 ? "text-green-500" : "text-red-500")}>
                          {t.pnl >= 0 ? "+" : ""}{fmt(t.pnl)}
                        </td>
                        <td className={cn("px-3 py-3 font-mono text-xs", (t.pnlPercent ?? 0) >= 0 ? "text-green-500" : "text-red-500")}>
                          {t.pnlPercent != null ? `${t.pnlPercent >= 0 ? "+" : ""}${t.pnlPercent.toFixed(2)}%` : "—"}
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">
                          {t.riskRewardRatio != null ? t.riskRewardRatio.toFixed(2) + "R" : "—"}
                        </td>
                        <td className="px-3 py-3">
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
                        <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(t.exitDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">{t.strategy ?? "—"}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/trades/${t.id}`}>
                              <a data-testid={`link-view-trade-${t.id}`}>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </a>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteMutation.mutate({ id: t.id })}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-trade-${t.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
