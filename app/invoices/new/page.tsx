"use client";

import {
  InvoiceLayout,
  Invoice,
  InvoiceItem,
  Issuer,
  Client,
} from "@/components/invoices/invoice-layout";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";
import { formatDateForSupabase } from "@/lib/format";

export default function NewInvoice() {
  const supabase = createClient();

  const cachedUserRef = useRef<any>(null);
  const invoiceIdRef = useRef<string | null>(null);

  const [mode, setMode] = useState<"create" | "edit" | "view">("create");
  const [isSaving, setIsSaving] = useState(false);

  const [issuer, setIssuer] = useState<Issuer | null>(null);
  const [invoice, setInvoice] = useState<Invoice>({
    invoice_number: "",
    issue_date: undefined,
    due_date: undefined,
    items: [
      {
        id: "",
        title: "",
        description: "",
        quantity: 0,
        unit_price: 0,
      },
    ],
    client_id: null,
  });

  const handleInvoiceNumberChange = (value: string) => {
    setInvoice((prev) => ({ ...prev, invoice_number: value }));
  };

  const handleIssueDateChange = (date?: Date) => {
    setInvoice((prev) => ({ ...prev, issue_date: date }));
  };

  const handleDueDateChange = (date?: Date) => {
    setInvoice((prev) => ({ ...prev, due_date: date }));
  };

  const handleClientChange = (client_id: string | null) => {
    setInvoice((prev) => ({ ...prev, client_id }));
  };

  const handleItemsChange = (items: InvoiceItem[]) => {
    setInvoice((prev) => ({ ...prev, items }));
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      title: "",
      description: "",
      quantity: 0,
      unit_price: 0,
    };
    setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    async function fetchData() {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + 1);

      setInvoice((prev) => ({
        ...prev,
        issue_date: now,
        due_date: dueDate,
        items: prev.items.map((item, index) =>
          index === 0 && !item.id
            ? { ...item, id: Date.now().toString() }
            : item
        ),
      }));

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (user) cachedUserRef.current = user;
      const userId = user?.id;

      if (!userId) return;

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { count, error: invoicesCountError } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("issue_date", startOfMonth.toISOString())
        .lte("issue_date", endOfMonth.toISOString());

      if (!invoicesCountError && typeof count === "number") {
        const sequence = String(count + 1).padStart(3, "0");
        const invoiceNumber = `${year}-${month}-${sequence}`;

        setInvoice((prev) => ({
          ...prev,
          invoice_number: invoiceNumber,
        }));
      } else if (invoicesCountError) {
        console.log(invoicesCountError);
      }

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
      } else if (issuerError) {
        console.log(issuerError);
      }

      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, company_name, address, siret")
        .eq("user_id", userId);

      if (!clientsError && clientsData) {
        setClients(clientsData);
      } else if (clientsError) {
        console.log(clientsError);
      }
    }

    fetchData();
  }, []);

  const handleOnEdit = () => {
    setMode("edit");
  };

  const handleSave = async () => {
    setIsSaving(true);
    const user = cachedUserRef.current;

    if (!user) {
      console.log("User not authenticated");
      setIsSaving(false);
      return;
    }

    const invoiceId = invoiceIdRef.current;
    let invoiceData;

    if (invoiceId) {
      // Update existing invoice
      const { error: invoiceError, data } = await supabase
        .from("invoices")
        .update({
          due_date: formatDateForSupabase(invoice.due_date),
        })
        .eq("id", invoiceId)
        .select()
        .single();

      if (invoiceError || !data) {
        console.log(invoiceError);
        setIsSaving(false);
        return;
      }
      invoiceData = data;

      // Delete existing items
      await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
    } else {
      // Insert new invoice
      const { error: invoiceError, data } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          invoice_number: invoice.invoice_number,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          client_id: invoice.client_id,
        })
        .select()
        .single();

      if (invoiceError || !data) {
        console.log(invoiceError);
        setIsSaving(false);
        return;
      }
      invoiceData = data;
      invoiceIdRef.current = data.id; // Sauvegarder l'ID
    }

    if (invoice.items.length > 0) {
      const itemsToInsert = invoice.items.map((item) => ({
        invoice_id: invoiceData.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.log(itemsError);
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    setMode("view");
  };

  return (
    <AppShell pageName="New invoice">
      <InvoiceLayout
        invoice={invoice}
        issuer={issuer}
        clients={clients}
        mode={mode}
        onInvoiceNumberChange={handleInvoiceNumberChange}
        onIssueDateChange={handleIssueDateChange}
        onDueDateChange={handleDueDateChange}
        onClientChange={handleClientChange}
        onItemsChange={handleItemsChange}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onSave={handleSave}
        onEdit={handleOnEdit}
        isSaving={isSaving}
      />
    </AppShell>
  );
}
