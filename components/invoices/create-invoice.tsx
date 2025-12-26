"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

const supabase = createClient();

// ---- Types ----
export interface Client {
  id: string;
  company_name: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

// ---- Component ----
export default function CreateInvoice() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [issueDate, setIssueDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 },
  ]);

  // ---- Fetch clients ----
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, company_name")
        .order("company_name");

      if (!error && data) setClients(data);
    };

    fetchClients();
  }, []);

  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unit_price,
    0
  );

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ---- Save invoice ----
  const handleCreateInvoice = async () => {
    if (!clientId || items.length === 0) return;

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    // 1. Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        client_id: clientId,
        issue_date: issueDate || null,
        due_date: dueDate || null,
        status: "draft",
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      setLoading(false);
      return;
    }

    // 2. Insert invoice items
    const formattedItems = items.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    await supabase.from("invoice_items").insert(formattedItems);

    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client */}
            <div className="space-y-2">
              <Label>Client</Label>
              <Select onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue date</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Invoice items</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" /> Add item
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-32">Unit price</TableHead>
                  <TableHead className="w-32">Total</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "unit_price",
                            Number(e.target.value)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {(item.quantity * item.unit_price).toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>

          <Button
            className="w-full"
            onClick={handleCreateInvoice}
            disabled={loading || !clientId}
          >
            Create invoice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
