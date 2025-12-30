"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Plus, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import { formatEuro, formatPhone, formatSiret } from "@/lib/format";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export interface InvoiceItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Errors {
  invoice_number?: string;
  client?: string;
  date?: string;
}

export interface Client {
  id: string;
  company_name: string;
  address: string;
  siret: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Invoice {
  invoice_number: string;
  issue_date?: Date;
  due_date?: Date;
  items: InvoiceItem[];
  client_id: string | null;
  status: InvoiceStatus;
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
  mode: "create" | "edit" | "view";
  errors: Errors;
  onInvoiceNumberChange: (value: string) => void;
  onIssueDateChange: (date?: Date) => void;
  onDueDateChange: (date?: Date) => void;
  onClientChange: (clientId: string | null) => void;
  onItemsChange: (items: InvoiceItem[]) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onSave: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onStatusChange: (status: InvoiceStatus) => void;
  isSaving?: boolean;
  iban?: string;
  bic?: string;
}

export function InvoiceLayout({
  invoice,
  issuer,
  clients,
  mode,
  errors,
  onInvoiceNumberChange,
  onIssueDateChange,
  onDueDateChange,
  onClientChange,
  onItemsChange,
  onAddItem,
  onRemoveItem,
  onSave,
  onEdit,
  onDelete,
  onStatusChange,
  isSaving,
  iban,
  bic,
}: InvoiceLayoutProps) {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

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

  // Styles pour le PDF
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      fontFamily: "Helvetica",
    },
    header: {
      marginBottom: 0,
    },
    invoiceTitle: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "flex-end",
      marginBottom: 16,
      gap: 8,
    },
    invoiceTitleText: {
      fontSize: 20,
      fontWeight: "bold",
    },
    invoiceNumber: {
      fontSize: 20,
      fontWeight: "bold",
    },
    section: {
      marginBottom: 10,
    },
    issuerInfo: {
      fontSize: 10,
      lineHeight: 1.5,
    },
    clientSection: {
      justifyContent: "flex-end",
      lineHeight: 1.5,
      fontSize: 10,
    },
    clientInfo: {
      fontSize: 10,
      textAlign: "right",
      lineHeight: 1.5,
    },
    bold: {
      fontWeight: "bold",
    },
    datesGrid: {
      flexDirection: "row",
      gap: 40,
      marginBottom: 32,
      fontSize: 10,
    },
    dateRow: {
      flexDirection: "column",
      gap: 4,
    },
    table: {
      marginBottom: 32,
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
      paddingBottom: 8,
      marginBottom: 8,
      fontWeight: "bold",
      fontSize: 10,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: "#ccc",
    },
    colDescription: {
      flex: 4,
    },
    colQuantity: {
      flex: 1,
      textAlign: "center",
    },
    colUnitPrice: {
      flex: 1,
      textAlign: "center",
    },
    colTotal: {
      flex: 1,
      textAlign: "right",
    },
    itemTitle: {
      fontWeight: "bold",
      marginBottom: 2,
    },
    itemDescription: {
      fontSize: 9,
      color: "#666",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    paymentInfo: {
      fontSize: 10,
      lineHeight: 1.5,
    },
    totalSection: {
      width: 200,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 8,
      borderTopWidth: 2,
      borderTopColor: "#000",
      fontSize: 14,
    },
    legalInfo: {
      borderTopWidth: 1,
      borderTopColor: "#ccc",
      paddingTop: 24,
      fontSize: 8,
      textAlign: "center",
      color: "#666",
      lineHeight: 1.5,
    },
  });

  // Composant PDF
  const InvoicePDF = ({ iban, bic }: { iban?: string; bic?: string }) => {
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            {/* Titre facture */}
            <View style={styles.invoiceTitle}>
              <Text style={styles.invoiceTitleText}>Facture N°</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            </View>

            {/* Infos émetteur */}
            <View style={styles.section}>
              <View style={styles.issuerInfo}>
                <Text style={styles.bold}>
                  {issuer?.first_name} {issuer?.last_name}
                </Text>
                <Text>{issuer?.address.split(",")[0]}</Text>
                <Text>{issuer?.address.split(",").slice(1).join(",")}</Text>
                <Text>Siret : {issuer ? formatSiret(issuer?.siret) : ""}</Text>
                <Text>
                  Tél : +33 {issuer ? formatPhone(issuer?.phone) : ""}
                </Text>
                <Text>Email : {issuer?.email}</Text>
              </View>
            </View>

            {/* Infos client */}
            <View style={styles.section}>
              <View style={styles.clientInfo}>
                <Text style={styles.bold}>{selectedClient?.company_name}</Text>
                <Text>{selectedClient?.address.split(",")[0]}</Text>
                <Text>
                  {selectedClient?.address.split(",").slice(1).join(",")}
                </Text>
                <Text>
                  Siret :{" "}
                  {selectedClient ? formatSiret(selectedClient?.siret) : ""}
                </Text>
              </View>
            </View>
          </View>

          {/* Dates */}
          <View style={styles.datesGrid}>
            <View style={styles.dateRow}>
              <Text style={styles.bold}>Date de facture</Text>
              <Text style={styles.bold}>Échéance de paiement</Text>
            </View>
            <View style={styles.dateRow}>
              <Text>
                {invoice.issue_date
                  ? format(invoice.issue_date, "dd/MM/yyyy", { locale: fr })
                  : "Erreur"}
              </Text>
              <Text>
                {invoice.due_date
                  ? format(invoice.due_date, "dd/MM/yyyy", { locale: fr })
                  : "Erreur"}
              </Text>
            </View>
          </View>

          {/* Tableau des items */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colDescription}>Description</Text>
              <Text style={styles.colQuantity}>Quantité</Text>
              <Text style={styles.colUnitPrice}>Prix unitaire HT</Text>
              <Text style={styles.colTotal}>Prix total HT</Text>
            </View>

            {invoice.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.colDescription}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.itemDescription}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <Text style={styles.colQuantity}>{item.quantity}</Text>
                <Text style={styles.colUnitPrice}>{item.unit_price}</Text>
                <Text style={styles.colTotal}>
                  {formatEuro(item.quantity * item.unit_price)}
                </Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.paymentInfo}>
              <Text>À payer aux coordonnées suivantes :</Text>
              <Text> </Text>
              <Text>
                Bénéficiaire : {issuer?.first_name} {issuer?.last_name}
              </Text>
              <Text>IBAN : {iban}</Text>
              <Text>BIC : {bic}</Text>
            </View>

            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text>Total HT</Text>
                <Text>{formatEuro(subtotal)}</Text>
              </View>
            </View>
          </View>

          {/* Mentions légales */}
          <View style={styles.legalInfo}>
            <Text>
              En cas de retard, une pénalité au taux annuel de 5 % sera
              appliquée, à laquelle s'ajoutera une indemnité forfaitaire pour
              frais de recouvrement de 40 €
            </Text>
            <Text style={{ marginTop: 8, fontWeight: "bold" }}>
              TVA non applicable, art. 293B du CGI
            </Text>
          </View>
        </Page>
      </Document>
    );
  };

  // Fonction de téléchargement
  const downloadInvoicePDF = async ({
    iban,
    bic,
  }: {
    iban?: string;
    bic?: string;
  }) => {
    onSave();
    const { pdf } = await import("@react-pdf/renderer");

    const blob = await pdf(<InvoicePDF iban={iban} bic={bic} />).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `facture_${invoice.invoice_number}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768); // 48rem = 768px
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const Selector = () => {
    return (
      <div className="inline-flex justify-around gap-1 border rounded-md p-1">
        {(["draft", "sent", "paid", "overdue"] as const).map((status) => (
          <Button
            key={status}
            variant={
              invoice.status === status
                ? status === "overdue"
                  ? "destructive"
                  : "default"
                : "ghost"
            }
            size="sm"
            onClick={() => onStatusChange(status)}
          >
            {status}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Link href="/invoices">
          <Button>
            <ChevronLeft />
            {isDesktop ? "Invoices" : ""}
          </Button>
        </Link>
        {isDesktop ? <Selector /> : <></>}
        <Button
          onClick={mode === "view" ? onEdit : onSave}
          disabled={mode !== "view" && isSaving}
          className="flex items-center gap-2"
        >
          {isSaving && <Loader2 className="animate-spin" />}
          {mode === "view" ? "Edit" : "Save"}
        </Button>
      </div>
      <div className="flex justify-around md:hidden">
        <Selector />
      </div>
      <div className="max-w-5xl mx-auto p-10">
        {/* Header */}
        <div className="flex flex-col mb-8">
          {/* Facture */}
          <div className="flex justify-end mb-4">
            <div className="flex-col">
              <div className="flex items-end gap-2">
                <h1 className="text-2xl font-bold">Facture N°</h1>
                {mode === "view" || mode === "edit" ? (
                  <span className="text-2xl font-bold">
                    {invoice.invoice_number}
                  </span>
                ) : (
                  <Input
                    value={invoice.invoice_number}
                    onChange={(e) => onInvoiceNumberChange(e.target.value)}
                    className={cn(
                      "w-25 h-8 text-xl font-bold",
                      errors.invoice_number ? "border-red-500" : ""
                    )}
                  />
                )}
              </div>
              {errors.invoice_number && (
                <p className="text-sm text-red-500 text-end mt-1">
                  {errors.invoice_number}
                </p>
              )}
            </div>
          </div>

          {/* Infos perso */}
          <div className="flex justify-start text-sm mb-4">
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
              {mode === "view" || mode === "edit" ? (
                <span className="font-semibold">
                  {selectedClient?.company_name}
                </span>
              ) : (
                <div>
                  <Select
                    onValueChange={(value) => onClientChange(value || null)}
                    value={invoice.client_id ?? ""}
                    required={true}
                  >
                    <SelectTrigger
                      className={cn(
                        "font-semibold mb-2",
                        errors.client ? "border-red-500" : ""
                      )}
                    >
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
                  {errors.client && (
                    <p className="text-sm text-red-500 text-end mt-1">
                      {errors.client}
                    </p>
                  )}
                </div>
              )}

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
        <div
          className={cn(
            "grid grid-cols-2 grid-rows-2 items-center gap-1 text-sm w-1/2",
            errors.date ? "" : "mb-4"
          )}
        >
          <p className="font-semibold">Date de facture</p>
          {mode === "view" || mode === "edit" ? (
            <span className="text-left justify-start font-normal">
              {invoice.issue_date
                ? format(invoice.issue_date, "dd/MM/yyyy", { locale: fr })
                : ""}
            </span>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-fit justify-start text-left font-normal px-2",
                    !invoice.issue_date && "text-muted-foreground",
                    errors.date ? "border-red-500" : ""
                  )}
                >
                  {invoice.issue_date
                    ? format(invoice.issue_date, "dd/MM/yyyy", { locale: fr })
                    : "Sélectionner"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={invoice.issue_date}
                  onSelect={onIssueDateChange}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          )}
          <p className="font-semibold">Échéance de paiement</p>
          {mode === "view" ? (
            <span className="text-left justify-start font-normal">
              {invoice.due_date
                ? format(invoice.due_date, "dd/MM/yyyy", { locale: fr })
                : ""}
            </span>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-fit justify-start text-left font-normal px-2",
                    !invoice.due_date && "text-muted-foreground",
                    errors.date ? "border-red-500" : ""
                  )}
                >
                  {invoice.due_date
                    ? format(invoice.due_date, "dd/MM/yyyy", { locale: fr })
                    : "Sélectionner"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={invoice.due_date}
                  onSelect={onDueDateChange}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
        <p>
          {errors.date && (
            <p className="text-sm text-red-500 mt-1 mb-4">{errors.date}</p>
          )}
        </p>

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
                {mode === "view" ? <></> : <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  {/* Description: titre + textarea */}
                  <TableCell className="space-y-2">
                    {mode === "view" ? (
                      <span className="font-bold h-5 flex">{item.title}</span>
                    ) : (
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          updateItem(item.id, "title", e.target.value)
                        }
                        placeholder="Title"
                        className="font-bold"
                      />
                    )}
                    {mode === "view" ? (
                      <span className="">{item.description}</span>
                    ) : (
                      <Textarea
                        value={item.description ?? undefined}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        placeholder="Description"
                      />
                    )}
                  </TableCell>

                  {/* Quantité */}
                  <TableCell className="text-center">
                    {mode === "view" ? (
                      <span className="text-center w-20 mx-auto">
                        {item.quantity}
                      </span>
                    ) : (
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", e.target.value)
                        }
                        className="text-center w-20 mx-auto"
                      />
                    )}
                  </TableCell>

                  {/* Prix unitaire */}
                  <TableCell className="text-center">
                    {mode === "view" ? (
                      <span className="text-center w-20 mx-auto">
                        {item.unit_price}
                      </span>
                    ) : (
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(item.id, "unit_price", e.target.value)
                        }
                        className="text-center w-20 mx-auto"
                      />
                    )}
                  </TableCell>

                  {/* Total */}
                  <TableCell className="text-right font-medium">
                    {formatEuro(item.quantity * item.unit_price)}
                  </TableCell>

                  {/* Supprimer */}
                  {mode === "view" ? (
                    <></>
                  ) : (
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div
          className={cn(
            "flex justify-end mb-8",
            mode === "view" ? "hidden" : ""
          )}
        >
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
        <div className="space-y-8 flex-col-reverse flex-col flex md:flex-row justify-between mb-4">
          <div>
            <p className="font-semibold mb-2">
              À payer aux coordonnées suivantes :
            </p>
            <p>
              Bénéficiaire : {issuer?.first_name} {issuer?.last_name}
            </p>
            <p>IBAN : FR** **** **** **** **** **** ***</p>
            <p>BIC : BANKFR00</p>
          </div>
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-2">
                <span>Total HT</span>
                <span>{formatEuro(subtotal)}</span>
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

      <div className="flex w-full justify-between gap-4 mt-6">
        <Button onClick={() => downloadInvoicePDF({ iban, bic })}>
          Download
        </Button>
        {mode !== "create" && onDelete ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure ?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction
                  onClick={() => onDelete()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
