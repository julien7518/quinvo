"use client";

import {
  InvoiceLayout,
  Invoice,
  Issuer,
  Client,
} from "@/components/invoices/invoice-layout";
import { AppShell } from "@/components/layout/app-shell";
import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function ViewInvoicePage() {
  return (
    <Suspense fallback="Suspense">
      <InvoicePageContent />
    </Suspense>
  );
}

function InvoicePageContent() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [issuer, setIssuer] = useState<Issuer | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const params = useParams();
  const invoiceId =
    typeof params.invoice_number === "string"
      ? params.invoice_number
      : params.invoice_number?.[0];

  useEffect(() => {
    if (!invoiceId) return;

    const supabase = createClient();

    async function fetchData() {
      // Get authenticated user once
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      const userId = user?.id;
      if (!userId) return;

      // Fetch invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("user_id", userId)
        .single();

      if (invoiceError || !invoiceData) {
        setInvoice(null);
        return;
      }

      // Fetch invoice items related to this invoice
      const { data: itemsData, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceData.id);

      if (itemsError) {
        setInvoice(null);
        return;
      }

      // Attach items to invoice object
      const invoiceWithItems: Invoice = {
        ...invoiceData,
        items: itemsData || [],
      };

      setInvoice(invoiceWithItems);

      // Fetch issuer data from profiles and inject email from auth user
      const { data: issuerData, error: issuerError } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, address, siret")
        .eq("id", userId)
        .single();

      if (!issuerError && issuerData) {
        const issuerObj: Issuer = {
          first_name: issuerData.first_name,
          last_name: issuerData.last_name,
          phone: issuerData.phone,
          address: issuerData.address,
          siret: issuerData.siret,
          email: user.email || "",
        };
        setIssuer(issuerObj);
      } else {
        setIssuer(null);
      }

      // Fetch clients list
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*");

      if (!clientsError && clientsData) {
        setClients(clientsData);
      } else {
        setClients([]);
      }
    }

    fetchData();
  }, [invoiceId]);

  // No-op functions for callbacks
  const noop = () => {};

  return (
    <AppShell pageName="View invoice">
      {invoice ? (
        <InvoiceLayout
          invoice={invoice}
          issuer={issuer}
          clients={clients}
          mode="view"
          onInvoiceNumberChange={noop}
          onIssueDateChange={noop}
          onDueDateChange={noop}
          onClientChange={noop}
          onItemsChange={noop}
          onAddItem={noop}
          onRemoveItem={noop}
        />
      ) : (
        <div className="flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </AppShell>
  );
}
