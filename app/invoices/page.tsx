import { InvoiceLayout } from "@/components/invoices/invoice-card-layout";
import { AppShell } from "@/components/layout/app-shell";

export default function InvoicesPage() {
  return (
    <AppShell pageName="Invoices">
      <InvoiceLayout />
    </AppShell>
  );
}
