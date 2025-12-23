import { AppShell } from "@/components/layout/app-shell";
import { ClientTable } from "@/components/clients/client-table";
import { Button } from "@/components/ui/button";

export default function ClientPage() {
  return (
    <AppShell pageName="Clients">
      <Button>+ Nouveau client</Button>
      <ClientTable />
    </AppShell>
  );
}
