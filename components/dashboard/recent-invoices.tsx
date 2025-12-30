"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { InvoiceStatus } from "@/components/invoices/invoice-layout";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { formatDate, formatEuro } from "@/lib/format";
import { Skeleton } from "../ui/skeleton";
import { statusConfig } from "../invoices/invoice-card";
import { ScrollArea } from "../ui/scroll-area";

export interface InvoiceData {
  id: string;
  invoice_number: string;
  client_name: string;
  due_date: string;
  total_amount: number;
  status: InvoiceStatus;
  updated_at: string;
}

export function RecentInvoices() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentInvoices = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          id,
          invoice_number,
          due_date,
          status,
          clients ( company_name ),
          invoice_items ( quantity, unit_price ),
          updated_at
        `
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error || !data) {
        setInvoices([]);
        setLoading(false);
        return;
      }

      const formatted: InvoiceData[] = data.map((invoice: any) => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        client_name: invoice.clients?.company_name ?? "Unknown client",
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        status: invoice.status,
        updated_at: invoice.updated_at,
        total_amount: invoice.invoice_items.reduce(
          (acc: number, item: any) => acc + item.quantity * item.unit_price,
          0
        ),
      }));

      setInvoices(formatted);
      setLoading(false);
    };

    fetchRecentInvoices();
  }, []);

  function RecentInvoiceSkeleton() {
    return (
      <div className="px-4 py-2 border-b last:border-b-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>

          <Skeleton className="h-3 w-24" />

          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Recent invoices
        </h2>
      </div>
      <Separator />
      {loading ? (
        <div className="pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <RecentInvoiceSkeleton key={i} />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
          <p className="text-sm">No invoices found</p>
        </div>
      ) : (
        <ScrollArea className="pb-2 h-82">
          {invoices.map((invoice, index) => (
            <div
              key={invoice.id}
              className={`px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer ${
                index !== invoices.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex-col">
                <div className="flex items-center justify-between">
                  <strong>{invoice.client_name}</strong>
                  <p>{formatEuro(invoice.total_amount)}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  {invoice.invoice_number}
                </div>
                <div className="flex items-center justify-between">
                  {formatDate(invoice.due_date)}

                  <Badge
                    variant={statusConfig[invoice.status].variant}
                    className="text-xs"
                  >
                    {statusConfig[invoice.status].label}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
}
