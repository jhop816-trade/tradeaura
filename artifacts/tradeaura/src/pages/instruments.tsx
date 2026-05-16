import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstruments, useAddInstrument, useRemoveInstrument } from "@/hooks/use-instruments";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

export default function InstrumentsPage() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const { data: instruments, isLoading } = useInstruments();
  const addMutation = useAddInstrument();
  const removeMutation = useRemoveInstrument();

  const handleAdd = () => {
    const symbol = input.trim().toUpperCase();
    if (!symbol) return;

    const exists = instruments?.some((i) => i.symbol === symbol);
    if (exists) {
      toast({ title: `${symbol} is already in your list`, variant: "destructive" });
      return;
    }

    addMutation.mutate(symbol, {
      onSuccess: () => {
        setInput("");
        toast({ title: `${symbol} added to your instruments` });
      },
      onError: (err) => {
        toast({ title: err.message, variant: "destructive" });
      },
    });
  };

  const handleRemove = (symbol: string) => {
    removeMutation.mutate(symbol, {
      onError: (err) => toast({ title: err.message, variant: "destructive" }),
    });
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold">My Instruments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your trading instruments and see performance at a glance
          </p>
        </div>

        {/* Add instrument */}
        <Card className="border-border/60 mb-5">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-semibold">Add Instrument</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. AAPL, BTCUSD, EUR/USD"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="max-w-xs font-mono"
                maxLength={20}
              />
              <Button
                onClick={handleAdd}
                disabled={!input.trim() || addMutation.isPending}
                size="sm"
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter or click Add. Symbols are automatically uppercased.
            </p>
          </CardContent>
        </Card>

        {/* Instrument list */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !instruments?.length ? (
          <Card className="border-border/60">
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No instruments yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add symbols above to track your trading performance
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {instruments.map((inst) => {
              const Icon = inst.totalPnl > 0 ? TrendingUp : inst.totalPnl < 0 ? TrendingDown : Minus;
              const pnlColor = inst.totalPnl > 0 ? "text-green-400" : inst.totalPnl < 0 ? "text-red-400" : "text-muted-foreground";
              const bgColor = inst.totalPnl > 0 ? "bg-green-500/10" : inst.totalPnl < 0 ? "bg-red-500/10" : "bg-muted/10";

              return (
                <Card key={inst.symbol} className="border-border/60 hover:border-border transition-colors">
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgColor)}>
                          <Icon className={cn("w-4 h-4", pnlColor)} />
                        </div>
                        <div>
                          <span className="text-sm font-bold font-mono">{inst.symbol}</span>
                          {inst.totalTrades > 0 && (
                            <p className="text-xs text-muted-foreground">{inst.totalTrades} trade{inst.totalTrades !== 1 ? "s" : ""}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(inst.symbol)}
                        disabled={removeMutation.isPending}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors"
                        title={`Remove ${inst.symbol}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {inst.totalTrades > 0 ? (
                      <>
                        <div className={cn("text-xl font-bold tabular-nums", pnlColor)}>
                          {inst.totalPnl >= 0 ? "+" : ""}{fmt(inst.totalPnl)}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-muted-foreground">
                            {inst.winRate.toFixed(0)}% win rate
                          </span>
                        </div>
                        {/* Win rate bar */}
                        <div className="h-1 bg-muted/30 rounded-full overflow-hidden mt-2">
                          <div
                            className={cn("h-full rounded-full", inst.totalPnl >= 0 ? "bg-green-500" : "bg-red-500")}
                            style={{ width: `${inst.winRate}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1 italic">No trades logged</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
