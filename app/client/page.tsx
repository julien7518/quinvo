"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ClientTable } from "@/components/clients/client-table";
import { useState } from "react";
import { NewClient } from "@/components/clients/new-client";

export default function ClientPage() {
  return (
    <AppShell pageName="Clients">
      <ClientTable />
    </AppShell>
  );
}
