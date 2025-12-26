import { AppShell } from "@/components/layout/app-shell";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";

export default function DashboardPage() {
  return (
    <AppShell pageName="Overview">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <KpiCard title="Chiffre d'affaires" value="4 250 €" />
        <KpiCard title="À déclarer (URSSAF)" value="3 980 €" />
        <KpiCard title="Factures en attente" value="1" />
        <KpiCard title="Argent à venir" value="157,50 €" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-background flex items-center justify-center">
          Graphique revenus
        </div>
        <RecentInvoices />
      </div>
    </AppShell>
  );
}
