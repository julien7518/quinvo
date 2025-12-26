import { ViewInvoice } from "@/components/invoices/view-invoice";
import { AppShell } from "@/components/layout/app-shell";
import { Suspense } from "react";

interface PageProps {
  params: { invoice_number: string };
}

export default async function ViewInvoicePage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppShell pageName={`Invoice n°`}>
        <ViewInvoice />
      </AppShell>
    </Suspense>
  );
}
