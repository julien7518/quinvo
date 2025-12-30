// APPLIQUER UN HOOK AU LIEU DE COPIER LE CODE POUR LES FONCTIONS

import { useState } from "react";
import { Invoice, InvoiceItem } from "../invoice-layout";

export function useInvoiceEditor(initialInvoice: Invoice) {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);

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

  return {
    invoice,
    setInvoice,
    handleInvoiceNumberChange,
    handleIssueDateChange,
    handleDueDateChange,
    handleClientChange,
    handleItemsChange,
    handleAddItem,
    handleRemoveItem,
  };
}
