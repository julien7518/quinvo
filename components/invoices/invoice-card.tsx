"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User } from "lucide-react";
import { formatEuro, formatDate } from "@/lib/format";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceCardData {
  id: string;
  invoice_number: string;
  client_name: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: InvoiceStatus;
}

const statusConfig: Record<
  InvoiceStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Draft", variant: "outline" },
  sent: { label: "Sent", variant: "default" },
  paid: { label: "Paid", variant: "secondary" },
  overdue: { label: "Overdue", variant: "destructive" },
};

export function InvoiceCard({
  invoice,
  onOpen,
}: {
  invoice: InvoiceCardData;
  onOpen?: (id: string) => void;
}) {
  const status = statusConfig[invoice.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {invoice.invoice_number}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {invoice.client_name}
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Issued
          </div>
          <span>{formatDate(invoice.issue_date)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Due
          </div>
          <span>
            <strong>{formatDate(invoice.due_date)}</strong>
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="font-medium">Total</div>
          <span className="text-lg font-semibold">
            {formatEuro(invoice.total_amount)}
          </span>
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => onOpen?.(invoice.id)}
        >
          View invoice
        </Button>
      </CardContent>
    </Card>
  );
}
