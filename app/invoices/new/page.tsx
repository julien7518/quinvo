import { ViewInvoice } from "@/components/invoices/view-invoice";
import { AppShell } from "@/components/layout/app-shell";

export default function NewInvoice() {
  return (
    <AppShell pageName="New invoice">
      <ViewInvoice />
    </AppShell>
  );
}
