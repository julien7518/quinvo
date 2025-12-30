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
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";
import { formatDateForSupabase } from "@/lib/format";
import { useRouter } from "next/navigation";

export default function NewInvoice() {
  const supabase = createClient();
  const router = useRouter();

  const cachedUserRef = useRef<any>(null);

  const [mode, setMode] = useState<"create" | "edit" | "view">("create");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const [issuer, setIssuer] = useState<Issuer | null>(null);
  const [invoice, setInvoice] = useState<Invoice>({
    invoice_number: "",
    issue_date: undefined,
    due_date: undefined,
    status: "draft",
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

  const handleStatusChange = (status: InvoiceStatus) => {
    setInvoice((prev) => ({ ...prev, status: status }));
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

    setErrors({});
    fetchData();
  }, []);

  const validateInvoice = async () => {
    const newErrors: {
      invoice_number?: string;
      client?: string;
      date?: string;
    } = {};

    // Invoice number format: YY-MM-XXX
    const invoiceNumberRegex = /^\d{2}-\d{2}-\d{3}$/;
    if (
      !invoice.invoice_number ||
      !invoiceNumberRegex.test(invoice.invoice_number)
    ) {
      newErrors.invoice_number = "Invalid invoice number format";
    }

    // Invoice number uniqueness
    const { data: existingInvoice, error: invoiceCheckError } = await supabase
      .from("invoices")
      .select("id")
      .eq("invoice_number", invoice.invoice_number)
      .limit(1)
      .maybeSingle();

    if (invoiceCheckError) {
      console.log(invoiceCheckError);
    }

    if (existingInvoice) {
      newErrors.invoice_number = "Invoice number already exists";
    }

    // Client required
    if (!invoice.client_id) {
      newErrors.client = "Client is required";
    }

    // Dates validation
    if (!invoice.issue_date || !invoice.due_date) {
      newErrors.date = "Issue date and due date are required";
    } else if (invoice.due_date < invoice.issue_date) {
      newErrors.date = "Due date cannot be before issue date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOnEdit = () => {
    setMode("edit");
  };

  const handleSave = async () => {
    setErrors({});
    if (!(await validateInvoice())) return;

    setIsSaving(true);
    const user = cachedUserRef.current;

    if (!user) {
      console.log("User not authenticated");
      setIsSaving(false);
      return;
    }

    // 1. Insert invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        issue_date: formatDateForSupabase(invoice.issue_date),
        due_date: formatDateForSupabase(invoice.due_date),
        client_id: invoice.client_id,
      })
      .select()
      .single();

    if (invoiceError || !invoiceData) {
      console.log(invoiceError);
      setIsSaving(false);
      return;
    }

    // 2. Insert items
    const validItems = invoice.items.filter(
      (item) =>
        item.title ||
        item.description ||
        item.quantity !== 0 ||
        item.unit_price !== 0
    );

    if (validItems.length > 0) {
      const itemsToInsert = validItems.map((item) => ({
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

    // 3. Reset states
    setInvoice({
      invoice_number: "",
      issue_date: undefined,
      due_date: undefined,
      status: "draft",
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

    setIssuer(null);
    setClients([]);
    setMode("create");

    setIsSaving(false);

    // 4. Redirect to view page
    router.push(`/invoices/view/${invoiceData.id}`);
  };

  return (
    <AppShell pageName="New invoice">
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
        onStatusChange={handleStatusChange}
        isSaving={isSaving}
      />
    </AppShell>
  );
}
