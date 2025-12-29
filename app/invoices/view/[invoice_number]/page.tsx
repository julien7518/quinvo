"use client";

import {
  InvoiceLayout,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  Issuer,
  Client,
  Errors,
} from "@/components/invoices/invoice-layout";
import { AppShell } from "@/components/layout/app-shell";
import { useState, useEffect, Suspense, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { formatDateForSupabase } from "@/lib/format";

export default function ViewInvoicePage() {
  return (
    <Suspense fallback="Suspense">
      <InvoicePageContent />
    </Suspense>
  );
}

function InvoicePageContent() {
  const supabase = createClient();
  const cachedUserRef = useRef<any>(null);
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [issuer, setIssuer] = useState<Issuer | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  const params = useParams();
  const invoiceId =
    typeof params.invoice_number === "string"
      ? params.invoice_number
      : params.invoice_number?.[0];

  useEffect(() => {
    if (!invoiceId) return;

    async function fetchData() {
      // Get authenticated user once
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (user) cachedUserRef.current = user;
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
        issue_date: invoiceData.issue_date
          ? new Date(invoiceData.issue_date)
          : undefined,
        due_date: invoiceData.due_date
          ? new Date(invoiceData.due_date)
          : undefined,
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

  const handleInvoiceNumberChange = (value: string) => {
    setInvoice((prev) => (prev ? { ...prev, invoice_number: value } : null));
  };

  const handleIssueDateChange = (date?: Date) => {
    setInvoice((prev) => (prev ? { ...prev, issue_date: date } : null));
  };

  const handleDueDateChange = (date?: Date) => {
    setInvoice((prev) => (prev ? { ...prev, due_date: date } : null));
  };

  const handleClientChange = (client_id: string | null) => {
    setInvoice((prev) => (prev ? { ...prev, client_id } : null));
  };

  const handleItemsChange = (items: InvoiceItem[]) => {
    setInvoice((prev) => (prev ? { ...prev, items } : null));
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      title: "",
      description: "",
      quantity: 0,
      unit_price: 0,
    };
    setInvoice((prev) =>
      prev ? { ...prev, items: [...prev.items, newItem] } : null
    );
  };

  const handleRemoveItem = (id: string) => {
    setInvoice((prev) =>
      prev
        ? { ...prev, items: prev.items.filter((item) => item.id !== id) }
        : null
    );
  };

  const handleStatusChange = (status: InvoiceStatus) => {
    setInvoice((prev) => (prev ? { ...prev, status: status } : null));
  };

  const handleOnEdit = () => {
    setMode("edit");
  };

  const validateInvoice = () => {
    const newErrors: {
      invoice_number?: string;
      client?: string;
      date?: string;
    } = {};

    // Dates validation
    if (!invoice?.issue_date || !invoice?.due_date) {
      newErrors.date = "Issue date and due date are required";
    } else if (invoice?.due_date < invoice?.issue_date) {
      newErrors.date = "Due date cannot be before issue date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setErrors({});
    if (!validateInvoice()) return;

    setIsSaving(true);
    const user = cachedUserRef.current;

    if (!user) {
      console.log("User not authenticated");
      setIsSaving(false);
      return;
    }

    const { error: invoiceError, data } = await supabase
      .from("invoices")
      .update({
        due_date: formatDateForSupabase(invoice?.due_date),
      })
      .eq("id", invoiceId)
      .select()
      .single();

    if (invoiceError || !data) {
      console.log(invoiceError);
      setIsSaving(false);
      return;
    }
    const invoiceData = data;

    // Delete existing items
    await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);

    if (invoice && invoice.items && invoice.items.length > 0) {
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
    console.log(invoice?.issue_date, invoice?.due_date);
  };

  const handleDelete = async () => {
    const user = cachedUserRef.current;
    if (!user || !invoiceId) return;

    const { error: invoiceError } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId)
      .eq("user_id", user.id);

    if (invoiceError) {
      console.log(invoiceError);
      return;
    }

    router.push(`/invoices/`);
  };

  return (
    <AppShell pageName="View invoice">
      {invoice ? (
        <InvoiceLayout
          invoice={invoice}
          issuer={issuer}
          clients={clients}
          mode={mode}
          errors={errors}
          onInvoiceNumberChange={handleInvoiceNumberChange}
          onIssueDateChange={handleIssueDateChange}
          onDueDateChange={handleDueDateChange}
          onClientChange={handleClientChange}
          onItemsChange={handleItemsChange}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onSave={handleSave}
          onEdit={handleOnEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          isSaving={isSaving}
        />
      ) : (
        <div className="flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </AppShell>
  );
}
