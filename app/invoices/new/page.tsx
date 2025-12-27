"use client";

import {
  InvoiceLayout,
  Invoice,
  InvoiceItem,
  Issuer,
  Client,
} from "@/components/invoices/invoice-layout";
import { AppShell } from "@/components/layout/app-shell";
import { useState, useEffect } from "react";

export default function NewInvoice() {
  const [invoice, setInvoice] = useState<Invoice>({
    invoice_number: "",
    issue_date: undefined,
    due_date: undefined,
    items: [],
    client_id: null,
  });

  useEffect(() => {
    setInvoice((prev) => ({
      ...prev,
      issue_date: new Date(),
      due_date: new Date(),
    }));
  }, []);

  const [issuer, setIssuer] = useState<Issuer | null>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    siret: "",
  });

  const [clients, setClients] = useState<Client[]>([]);

  const handleInvoiceNumberChange = (value: string) => {
    setInvoice((prev) => ({ ...prev, invoiceNumber: value }));
  };

  const handleIssueDateChange = (date?: Date) => {
    setInvoice((prev) => ({ ...prev, issueDate: date }));
  };

  const handleDueDateChange = (date?: Date) => {
    setInvoice((prev) => ({ ...prev, dueDate: date }));
  };

  const handleClientChange = (clientId: string | null) => {
    setInvoice((prev) => ({ ...prev, clientId }));
  };

  const handleItemsChange = (items: InvoiceItem[]) => {
    setInvoice((prev) => ({ ...prev, items }));
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      title: "",
      description: "",
      quantity: 1,
      unit_price: 0,
    };
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  return (
    <AppShell pageName="New invoice">
      <InvoiceLayout
        invoice={invoice}
        issuer={issuer}
        clients={clients}
        mode="create"
        onInvoiceNumberChange={handleInvoiceNumberChange}
        onIssueDateChange={handleIssueDateChange}
        onDueDateChange={handleDueDateChange}
        onClientChange={handleClientChange}
        onItemsChange={handleItemsChange}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
      />
    </AppShell>
  );
}
