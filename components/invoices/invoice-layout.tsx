"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "../ui/skeleton";
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
import { Plus, Trash2, ChevronLeft } from "lucide-react";
import { formatEuro, formatPhone, formatSiret } from "@/lib/format";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface InvoiceItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Client {
  id: string;
  company_name: string;
  address: string;
  siret: string;
}

export interface Invoice {
  invoice_number: string;
  issue_date?: Date;
  due_date?: Date;
  items: InvoiceItem[];
  client_id: string | null;
}

export interface Issuer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  siret: string;
}

export interface InvoiceLayoutProps {
  invoice: Invoice;
  issuer: Issuer | null;
  clients: Client[];
  mode: "create" | "view" | "edit";
  onInvoiceNumberChange: (value: string) => void;
  onIssueDateChange: (date?: Date) => void;
  onDueDateChange: (date?: Date) => void;
  onClientChange: (clientId: string | null) => void;
  onItemsChange: (items: InvoiceItem[]) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
}

export function InvoiceLayout({
  invoice,
  issuer,
  clients,
  mode,
  onInvoiceNumberChange,
  onIssueDateChange,
  onDueDateChange,
  onClientChange,
  onItemsChange,
  onAddItem,
  onRemoveItem,
}: InvoiceLayoutProps) {
  const selectedClient = clients.find((c) => c.id === invoice.client_id);

  const subtotal = invoice.items.reduce(
    (acc, item) => acc + item.quantity * item.unit_price,
    0
  );

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = invoice.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onItemsChange(newItems);
  };

  return (
    <div>
      <Link href={"/invoices"}>
        <Button>
          <ChevronLeft />
          Invoices
        </Button>
      </Link>
      <div className="max-w-5xl mx-auto p-10">
        {/* Header */}
        <div className="flex flex-col mb-8">
          {/* Facture */}
          <div className="flex justify-end mb-4">
            <div className="flex items-end gap-2">
              <h1 className="text-2xl font-bold">Facture N°</h1>
              <Input
                value={invoice.invoice_number}
                onChange={(e) => onInvoiceNumberChange(e.target.value)}
                className="w-25 h-8 text-xl font-bold"
                readOnly={mode === "view"}
              />
            </div>
          </div>

          {/* Infos perso */}
          <div className="flex justify-start text-sm">
            <div className="space-y-1">
              {issuer ? (
                <>
                  <p className="font-semibold">
                    {issuer.first_name} {issuer.last_name}
                  </p>
                  <p>{issuer.address.split(",")[0]}</p>
                  <p>{issuer.address.split(",").slice(1).join(",")}</p>
                </>
              ) : (
                <>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-52" />
                  <Skeleton className="h-5 w-48" />
                </>
              )}
              <p>
                <strong>Siret :</strong> {formatSiret(issuer?.siret ?? "")}
              </p>
              <p>Tél : +33 {formatPhone(issuer?.phone ?? "")}</p>
              <p>Email : {issuer?.email}</p>
            </div>
          </div>
          <div className="flex justify-end text-sm">
            {/* Infos client */}
            <div className="flex flex-col items-end space-y-1">
              <Select
                onValueChange={(value) => onClientChange(value || null)}
                value={invoice.client_id ?? ""}
                disabled={mode === "view"}
              >
                <SelectTrigger className="font-semibold mb-2">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent className="font-semibold">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedClient && (
                <div className="text-right space-y-1">
                  <p>{selectedClient.address.split(",")[0]}</p>
                  <p>{selectedClient.address.split(",").slice(1).join(",")}</p>
                  <p>
                    <strong>Siret :</strong> {formatSiret(selectedClient.siret)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 grid-rows-2 items-center gap-1 text-sm w-1/2 mb-4">
          <p className="font-semibold">Date de facture</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-fit justify-start text-left font-normal px-2",
                  !invoice.issue_date && "text-muted-foreground"
                )}
                disabled={mode === "view"}
              >
                {invoice.issue_date
                  ? format(invoice.issue_date, "dd/MM/yyyy", { locale: fr })
                  : "Sélectionner"}
              </Button>
            </PopoverTrigger>
            {mode !== "view" && (
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={invoice.issue_date}
                  onSelect={onIssueDateChange}
                  locale={fr}
                />
              </PopoverContent>
            )}
          </Popover>
          <p className="font-semibold">Échéance de paiement</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-fit justify-start text-left font-normal px-2",
                  !invoice.due_date && "text-muted-foreground"
                )}
                disabled={mode === "view"}
              >
                {invoice.due_date
                  ? format(invoice.due_date, "dd/MM/yyyy", { locale: fr })
                  : "Sélectionner"}
              </Button>
            </PopoverTrigger>
            {mode !== "view" && (
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={invoice.due_date}
                  onSelect={onDueDateChange}
                  locale={fr}
                />
              </PopoverContent>
            )}
          </Popover>
        </div>

        {/* Items table */}
        <div className="mb-8 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-center w-24">Quantité</TableHead>
                <TableHead className="text-center w-32">
                  Prix unitaire HT
                </TableHead>
                <TableHead className="text-right w-32">Prix total HT</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  {/* Description: titre + textarea */}
                  <TableCell className="space-y-2">
                    <Input
                      value={item.title.split("\n")[0]}
                      onChange={(e) =>
                        updateItem(item.id, "title", e.target.value)
                      }
                      placeholder="Title"
                      className="font-bold"
                      readOnly={mode === "view"}
                    />
                    <Textarea
                      value={item.description ?? undefined}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      placeholder="Description"
                      readOnly={mode === "view"}
                    />
                  </TableCell>

                  {/* Quantité */}
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", e.target.value)
                      }
                      className="text-center w-20 mx-auto"
                      readOnly={mode === "view"}
                    />
                  </TableCell>

                  {/* Prix unitaire */}
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(item.id, "unit_price", e.target.value)
                      }
                      className="text-center w-20 mx-auto"
                      readOnly={mode === "view"}
                    />
                  </TableCell>

                  {/* Total */}
                  <TableCell className="text-right font-medium">
                    {formatEuro(item.quantity * item.unit_price)}
                  </TableCell>

                  {/* Supprimer */}
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onRemoveItem(item.id)}
                      disabled={mode === "view"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddItem}
            disabled={mode === "view"}
          >
            <Plus className="h-4 w-4 mr-2" /> Ajouter une ligne
          </Button>
        </div>

        {/* Total */}
        <div className="flex justify-between mb-4">
          <div>
            <p className="font-semibold mb-2">
              À payer aux coordonnées suivantes :
            </p>
            <p>
              Bénéficiaire : {issuer?.first_name} {issuer?.last_name}
            </p>
            <p>IBAN : FR7699999999999999999999999</p>
            <p>BIC : BANKFRPX</p>
          </div>
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-2">
                <span>Total HT</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment info */}
        <div className="border-t border-gray-300 pt-6 space-y-4 text-sm">
          <div className="flex-col text-center space-y-1">
            <p className="text-xs text-muted-foreground justify-around">
              En cas de retard, une pénalité au taux annuel de 5 % sera
              appliquée, à laquelle s'ajoutera une indemnité forfaitaire pour
              frais de recouvrement de 40 €
            </p>

            <p className="text-xs font-semibold text-muted-foreground">
              TVA non applicable, art. 293B du CGI
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button>Download</Button>
      </div>
    </div>
  );
}
