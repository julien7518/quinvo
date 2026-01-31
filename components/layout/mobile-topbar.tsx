"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { UserProfileSidebar } from "./user-profile";
import Logo from "../logo";

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Clients", href: "/client", icon: Users },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileTopbar() {
  const pathname = usePathname();

  return (
    <div className="md:hidden sticky top-0 z-50 border-b bg-background">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left */}
        <Logo />

        {/* Right */}
        <div className="flex items-center gap-3">
          <UserProfileSidebar />

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>

            <DrawerContent className="">
              <DrawerTitle />
              <DrawerDescription />
              <nav className="space-y-4 mb-2">
                {nav.map((item) => {
                  const isSelected = pathname === item.href;

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isSelected ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2 mt-4 mx-2"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
              <div className="mb-4 mx-2">
                <Separator />
              </div>
              <div className="mb-4 px-2">
                <Link href={"/invoices/new"}>
                  <Button className="w-full">+ New invoice</Button>
                </Link>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}
