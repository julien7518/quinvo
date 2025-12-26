"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import {
  InvoiceCard,
  InvoiceCardData,
} from "@/components/invoices/invoice-card";
import { SearchBar } from "../search-bar";
import { Button } from "@/components/ui/button";

export function InvoiceLayout() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<InvoiceCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
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
        .order("issue_date", { ascending: false });

      if (error || !data) {
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

    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((invoice) => {
    const term = searchTerm.toLowerCase();

    // Match texte (numéro ou client)
    const matchesText =
      invoice.invoice_number.toLowerCase().includes(term) ||
      (invoice.client_name?.toLowerCase().includes(term) ?? false);

    // Match total si le terme est un nombre
    const termNumber = parseFloat(searchTerm);
    const matchesTotal = !isNaN(termNumber)
      ? invoice.total_amount === termNumber
      : false;

    // Match dates
    const matchesDate = (() => {
      if (!term) return false;

      const issue = new Date(invoice.issue_date).toISOString().slice(0, 10);
      const due = new Date(invoice.due_date).toISOString().slice(0, 10);

      return issue.includes(term) || due.includes(term);
    })();

    return matchesText || matchesTotal || matchesDate;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-row space-x-4 justify-between mb-8">
        <Button>+ New invoice</Button>
        <SearchBar
          placeholder="Search for an invoice or client"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          resultCount={filteredInvoices.length}
          className="max-w-2xl"
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div>
          {/* Empty states */}
          {invoices.length === 0 && (
            <div className="text-muted-foreground">No invoices yet.</div>
          )}

          {invoices.length > 0 && filteredInvoices.length === 0 && (
            <div className="text-muted-foreground">
              No invoices match your search.
            </div>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
