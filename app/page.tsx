import { AppShell } from "@/components/layout/app-shell";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { KpiLayout } from "@/components/dashboard/kpi-layout";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export default function DashboardPage() {
  return (
    <AppShell pageName="Overview">
      <KpiLayout />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueChart />
        <RecentInvoices />
      </div>
    </AppShell>
  );
}
