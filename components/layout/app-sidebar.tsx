"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileSidebar } from "./user-profile";
import { Separator } from "@/components/ui/separator";

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Clients", href: "/client", icon: Users },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background p-4 flex flex-col">
      <div className="mb-8 text-xl font-semibold">Quinvo</div>
      <div className="flex-1">
        <nav className="space-y-1 mb-2">
          {nav.map((item) => {
            const isSelected = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isSelected ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="mb-2">
          <Separator />
        </div>
        <div>
          <Button className="w-full">+ New invoice</Button>
        </div>
      </div>

      <UserProfileSidebar />
    </aside>
  );
}
