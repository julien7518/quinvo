import { InvoiceLayout } from "@/components/invoices/invoice-layout";
import { AppShell } from "@/components/layout/app-shell";

export default function InvoicesPage() {
  return (
    <AppShell pageName="Invoices">
      <InvoiceLayout />
    </AppShell>
  );
}
