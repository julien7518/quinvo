"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileSidebar } from "./user-profile";
import { Separator } from "@/components/ui/separator";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

const Avenir = localFont({
  src: "./avenir_medium.ttf",
});

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Clients", href: "/client", icon: Users },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 border-r p-4 flex-col">
      <div className={cn("mb-4 ml-2 text-4xl font-black", Avenir.className)}>
        Quinvo
      </div>
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
          <Link href={"/invoices/new"}>
            <Button className="w-full">+ New invoice</Button>
          </Link>
        </div>
      </div>

      <UserProfileSidebar />
    </aside>
  );
}
