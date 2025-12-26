"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { formatEuro } from "@/lib/format";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Mock data
const mockClients = [
  {
    id: "1",
    company_name: "Client Example",
    address: "123 rue Example",
    postal: "75001 Paris",
    siret: "12345678900012",
  },
  {
    id: "2",
    company_name: "Autre exemple",
    address: "123 rue Example",
    postal: "75999 Ville",
    siret: "77777777777777",
  },
];

export interface InvoiceItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export function ViewInvoice() {
  const [clients] = useState(mockClients);
  const [clientId, setClientId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("25-12-001");

  const [issueDate, setIssueDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();

  useEffect(() => {
    const today = new Date();
    setIssueDate(today);
    setDueDate(
      new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
    );
  }, []);

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      title: "Exemple de titre",
      description: "Exemple de description",
      quantity: 4,
      unit_price: 13.7,
    },
  ]);

  const selectedClient = clients.find((c) => c.id === clientId);

  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unit_price,
    0
  );

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        quantity: 1,
        unit_price: 0,
      },
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

  return (
    <div className="">
      <div className="max-w-5xl mx-auto p-10">
        {/* Header */}
        <div className="flex flex-col mb-8">
          {/* Facture */}
          <div className="flex justify-end mb-4">
            <div className="flex items-end gap-2">
              <h1 className="text-2xl font-bold">Facture N°</h1>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-25 h-8 text-xl font-bold"
              />
            </div>
          </div>

          {/* Infos perso */}
          <div className="flex justify-start text-sm">
            <div className="space-y-1">
              <p className="font-semibold">Test User</p>
              <p>12 rue de Paris</p>
              <p>75000 Paris</p>
              <p>
                <strong>Siret :</strong> 1234567890987654321
              </p>
              <p>Tél : +33 6 12 34 56 78</p>
              <p>Email : my@email.com</p>
            </div>
          </div>
          <div className="flex justify-end text-sm">
            {/* Infos client */}
            <div className="flex flex-col items-end space-y-1">
              <Select onValueChange={setClientId} value={clientId || undefined}>
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
                  <p>{selectedClient.address}</p>
                  <p>{selectedClient.postal}</p>
                  <p>
                    <strong>Siret :</strong> {selectedClient.siret}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 grid-rows-2 gap-1 text-sm w-1/2 mb-4">
          <p className="font-semibold">Date de facture</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-fit justify-start text-left font-normal px-2",
                  !issueDate && "text-muted-foreground"
                )}
              >
                {issueDate
                  ? format(issueDate, "dd/MM/yyyy", { locale: fr })
                  : "Sélectionner"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={issueDate}
                onSelect={setIssueDate}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
          <p className="font-semibold">Échéance de paiement</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-fit justify-start text-left font-normal px-2",
                  !dueDate && "text-muted-foreground"
                )}
              >
                {dueDate
                  ? format(dueDate, "dd/MM/yyyy", { locale: fr })
                  : "Sélectionner"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                locale={fr}
              />
            </PopoverContent>
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
              {items.map((item) => (
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
                    />
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      placeholder="Description"
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
                      onClick={() => removeItem(item.id)}
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
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter une ligne
          </Button>
        </div>

        {/* Total */}
        <div className="flex justify-between mb-4">
          <div>
            <p className="font-semibold mb-2">
              À payer aux coordonnées suivantes :
            </p>
            <p>Bénéficiaire : Test User</p>
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

            <p className="text-xs font-semibold">
              TVA non applicable, art. 293B du CGI
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button>Télécharger</Button>
      </div>
    </div>
  );
}
