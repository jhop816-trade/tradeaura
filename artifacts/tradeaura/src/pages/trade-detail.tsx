import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import {
  useGetTrade, useUpdateTrade, useDeleteTrade,
  getGetTradeQueryKey, getListTradesQueryKey,
  getGetStatsSummaryQueryKey, getGetEquityCurveQueryKey,
  getGetStatsBySymbolQueryKey, getGetStatsByDayQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit2, Trash2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export default function TradeDetailPage() {
  const [, params] = useRoute("/trades/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const id = parseInt(params?.id ?? "0", 10);
  const [editing, setEditing] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editStrategy, setEditStrategy] = useState("");

  const { data: trade, isLoading } = useGetTrade(id, {
    query: { enabled: !!id, queryKey: getGetTradeQueryKey(id) },
  });

  const updateTrade = useUpdateTrade({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTradeQueryKey(id) });
        qc.invalidateQueries({ queryKey: getListTradesQueryKey() });
        toast({ title: "Trade updated" });
        setEditing(false);
      },
    },
  });

  const deleteTrade = useDeleteTrade({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListTradesQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
        qc.invalidateQueries({ queryKey: getGetEquityCurveQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsBySymbolQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsByDayQueryKey() });
        toast({ title: "Trade deleted" });
        setLocation("/journal");
      },
    },
  });

  const startEdit = () => {
    if (!trade) return;
    setEditNotes(trade.notes ?? "");
    setEditStrategy(trade.strategy ?? "");
    setEditing(true);
  };

  const saveEdit = () => {
    updateTrade.mutate({
      id,
      data: { notes: editNotes || null, strategy: editStrategy || null },
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 max-w-3xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!trade) {
    return (
      <Layout>
        <div className="p-6 text-center text-muted-foreground">Trade not found</div>
      </Layout>
    );
  }

  const fields = [
    { label: "Symbol", value: trade.symbol },
    { label: "Direction", value: <Badge variant={trade.direction === "long" ? "default" : "secondary"} className="capitalize">{trade.direction}</Badge> },
    { label: "Entry Price", value: `$${trade.entryPrice.toFixed(2)}` },
    { label: "Exit Price", value: `$${trade.exitPrice.toFixed(2)}` },
    { label: "Quantity", value: trade.quantity.toString() },
    { label: "P&L", value: <span className={cn("font-mono font-semibold", trade.pnl >= 0 ? "text-green-400" : "text-red-400")}>{trade.pnl >= 0 ? "+" : ""}{fmt(trade.pnl)}</span> },
    { label: "P&L %", value: trade.pnlPercent != null ? <span className={cn(trade.pnlPercent >= 0 ? "text-green-400" : "text-red-400")}>{trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%</span> : "—" },
    { label: "Risk/Reward", value: trade.riskRewardRatio != null ? `${trade.riskRewardRatio.toFixed(2)}R` : "—" },
    { label: "Stop Loss", value: trade.stopLoss != null ? `$${trade.stopLoss.toFixed(2)}` : "—" },
    { label: "Take Profit", value: trade.takeProfit != null ? `$${trade.takeProfit.toFixed(2)}` : "—" },
    { label: "Entry Date", value: new Date(trade.entryDate).toLocaleString() },
    { label: "Exit Date", value: new Date(trade.exitDate).toLocaleString() },
    { label: "Tags", value: trade.tags ?? "—" },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/journal" className="text-muted-foreground hover:text-foreground" data-testid="link-back">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{trade.symbol}</h1>
              <Badge
                variant="outline"
                className={cn("capitalize",
                  trade.outcome === "win" ? "text-green-400 border-green-400/30 bg-green-400/10" :
                  trade.outcome === "loss" ? "text-red-400 border-red-400/30 bg-red-400/10" :
                  "text-muted-foreground"
                )}
              >
                {trade.outcome}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{trade.strategy ?? "No strategy set"}</p>
          </div>
          <div className="flex gap-2">
            {!editing && (
              <Button variant="outline" size="sm" onClick={startEdit} data-testid="button-edit-trade">
                <Edit2 className="w-4 h-4 mr-1.5" /> Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => deleteTrade.mutate({ id })}
              disabled={deleteTrade.isPending}
              data-testid="button-delete-trade"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Trade Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                {fields.map(({ label, value }) => (
                  <div key={label} data-testid={`field-${label.toLowerCase().replace(/\s+/g, "-")}`}>
                    <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
                    <dd className="text-sm font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Notes & Strategy</CardTitle>
                {editing && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} disabled={updateTrade.isPending} data-testid="button-save-edit">
                      <Save className="w-3.5 h-3.5 mr-1.5" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)} data-testid="button-cancel-edit">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div>
                    <Label className="text-xs mb-1.5 block">Strategy</Label>
                    <Input
                      value={editStrategy}
                      onChange={(e) => setEditStrategy(e.target.value)}
                      placeholder="e.g. Breakout, Momentum"
                      data-testid="input-edit-strategy"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Notes</Label>
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={4}
                      placeholder="Trade notes..."
                      data-testid="textarea-edit-notes"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Strategy</p>
                    <p className="text-sm">{trade.strategy ?? <span className="text-muted-foreground italic">No strategy</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{trade.notes ?? <span className="text-muted-foreground italic">No notes</span>}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
