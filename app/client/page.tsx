import { AppShell } from "@/components/layout/app-shell";
import { ClientTable } from "@/components/clients/client-table";
import { Button } from "@/components/ui/button";

export default function ClientPage() {
  return (
    <AppShell>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Clients</h2>
        <Button>+ Nouveau client</Button>
      </div>
      <ClientTable />
    </AppShell>
  );
}
