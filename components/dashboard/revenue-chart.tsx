"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Loader2 } from "lucide-react";

interface InvoiceRow {
  issue_date: string;
  invoice_items: Array<{
    quantity: number;
    unit_price: number;
  }>;
}

const chartConfig = {
  total: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
};

export function RevenueChart() {
  const supabase = createClient();
  const [view, setView] = useState<"monthly" | "quarterly">("monthly");
  const [data, setData] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaidInvoices = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("invoices")
        .select("issue_date, invoice_items ( quantity, unit_price )")
        .eq("user_id", userId)
        .eq("status", "paid")
        .not("issue_date", "is", null);

      if (!error && data) setData(data as InvoiceRow[]);
      setLoading(false);
    };

    fetchPaidInvoices();
  }, [supabase]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((inv) => {
      const total_amount = inv.invoice_items.reduce(
        (acc, item) => acc + item.quantity * item.unit_price,
        0
      );

      const date = new Date(inv.issue_date);
      let key = "";
      if (view === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      } else {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
      }
      map.set(key, (map.get(key) ?? 0) + total_amount);
    });

    return Array.from(map.entries())
      .map(([period, total]) => ({ period, total }))
      .sort((a, b) => (a.period > b.period ? 1 : -1));
  }, [data, view]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue</CardTitle>
        <Select value={view} onValueChange={(v) => setView(v as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center text-sm text-muted-foreground">
            No revenue for the moment
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full">
            <AreaChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="total"
                type="monotone"
                fill="var(--color-total)"
                fillOpacity={0.4}
                stroke="var(--color-total)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
