"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import {
  InvoiceCardData,
  InvoiceStatus,
} from "@/components/invoices/invoice-card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

export function RecentInvoices() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<InvoiceCardData[]>([]);
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
          issue_date,
          due_date,
          status,
          clients ( company_name ),
          invoice_items ( quantity, unit_price )
        `
        )
        .eq("user_id", userId)
        .order("issue_date", { ascending: false })
        .limit(3);

      if (error || !data) {
        setInvoices([]);
        setLoading(false);
        return;
      }

      const formatted: InvoiceCardData[] = data.map((invoice: any) => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        client_name: invoice.clients?.company_name ?? "Unknown client",
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        status: invoice.status,
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

  const statusConfig: Record<
    InvoiceStatus,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    draft: { label: "Draft", variant: "outline" },
    sent: { label: "Sent", variant: "default" },
    paid: { label: "Paid", variant: "secondary" },
    overdue: { label: "Overdue", variant: "destructive" },
  };

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatAmount(amount: number) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
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
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
          <p className="text-sm">No invoices found</p>
        </div>
      ) : (
        <div className="pb-2">
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
                  <p>{formatAmount(invoice.total_amount)}</p>
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
        </div>
      )}
    </div>
  );
}
