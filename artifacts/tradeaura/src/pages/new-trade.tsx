import { useCreateTrade, getListTradesQueryKey, getGetStatsSummaryQueryKey, getGetEquityCurveQueryKey, getGetStatsBySymbolQueryKey, getGetStatsByDayQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  symbol: z.string().min(1, "Symbol required").max(10).toUpperCase(),
  direction: z.enum(["long", "short"]),
  entryPrice: z.coerce.number().positive("Must be positive"),
  exitPrice: z.coerce.number().positive("Must be positive"),
  quantity: z.coerce.number().positive("Must be positive"),
  entryDate: z.string().min(1, "Required"),
  exitDate: z.string().min(1, "Required"),
  stopLoss: z.coerce.number().optional().or(z.literal("")),
  takeProfit: z.coerce.number().optional().or(z.literal("")),
  strategy: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function toIso(val: string) {
  return new Date(val).toISOString();
}

export default function NewTradePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const createTrade = useCreateTrade({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListTradesQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
        qc.invalidateQueries({ queryKey: getGetEquityCurveQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsBySymbolQueryKey() });
        qc.invalidateQueries({ queryKey: getGetStatsByDayQueryKey() });
        toast({ title: "Trade logged successfully" });
        setLocation("/journal");
      },
      onError: () => {
        toast({ title: "Failed to log trade", variant: "destructive" });
      },
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      symbol: "",
      direction: "long",
      entryPrice: "" as unknown as number,
      exitPrice: "" as unknown as number,
      quantity: "" as unknown as number,
      entryDate: "",
      exitDate: "",
      stopLoss: "",
      takeProfit: "",
      strategy: "",
      notes: "",
      tags: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createTrade.mutate({
      data: {
        symbol: values.symbol,
        direction: values.direction,
        entryPrice: values.entryPrice as number,
        exitPrice: values.exitPrice as number,
        quantity: values.quantity as number,
        entryDate: toIso(values.entryDate),
        exitDate: toIso(values.exitDate),
        stopLoss: values.stopLoss !== "" ? (values.stopLoss as number) : null,
        takeProfit: values.takeProfit !== "" ? (values.takeProfit as number) : null,
        strategy: values.strategy || null,
        notes: values.notes || null,
        tags: values.tags || null,
      },
    });
  };

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/journal" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-to-trades">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Log Trade</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Record a new trade entry</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Trade Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="symbol" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="AAPL" data-testid="input-symbol" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="direction" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direction</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-direction">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="long">Long</SelectItem>
                          <SelectItem value="short">Short</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="entryPrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" data-testid="input-entry-price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="exitPrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" data-testid="input-exit-price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="100" data-testid="input-quantity" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="entryDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" data-testid="input-entry-date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="exitDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" data-testid="input-exit-date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="stopLoss" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stop Loss <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" data-testid="input-stop-loss" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="takeProfit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Take Profit <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" data-testid="input-take-profit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="strategy" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Breakout, Mean Reversion" data-testid="input-strategy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="What went right? What went wrong?" rows={3} data-testid="textarea-notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="tags" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. earnings, momentum, reversal" data-testid="input-tags" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={createTrade.isPending} data-testid="button-submit-trade" className="flex-1">
                    {createTrade.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Logging...
                      </span>
                    ) : "Log Trade"}
                  </Button>
                  <Link href="/journal" className="contents">
                    <Button type="button" variant="outline" data-testid="button-cancel">Cancel</Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
