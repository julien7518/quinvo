"use client";

import Link from "next/link";
import { LayoutDashboard, Users, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Clients", href: "/client", icon: Users },
  { label: "Factures", href: "/invoices", icon: FileText },
  { label: "Paramètres", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <aside className="w-64 border-r bg-background p-4 flex flex-col">
      <div className="mb-8 text-xl font-semibold">Quinvo</div>

      <nav className="space-y-1 flex-1">
        {nav.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <Button className="w-full mt-auto">+ New invoice</Button>
    </aside>
  );
}
