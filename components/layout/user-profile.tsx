"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop, ChevronsUpDown, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export function UserProfileSidebar() {
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData.user;
      if (!authUser) return;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", authUser.id)
        .single();

      setUser({
        firstName: profileData?.first_name ?? "User",
        lastName: profileData?.last_name ?? "",
        email: authUser.email ?? "",
      });
    };

    fetchUser();
  }, [supabase]);

  const initials = user
    ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
    : "??";

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex md:w-full items-center justify-between gap-3 px-2 py-6 text-sm"
        >
          <span className="flex items-center gap-3">
            {/* Avatar carré toujours visible */}
            <span className="flex w-8 h-8 items-center justify-center rounded-md border bg-background text-xs font-medium">
              {initials}
            </span>

            {/* Nom complet : seulement visible md+ */}
            <span className="hidden md:flex flex-col text-left leading-tight">
              <span className="font-medium">
                {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
              </span>
            </span>
          </span>

          <ChevronsUpDown className="hidden md:flex size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>
          <span className="text-xs text-muted-foreground">{user?.email}</span>
        </DropdownMenuLabel>
        <Link href="mailto:julien.f2004@icloud.com">
          <DropdownMenuItem>Contact us</DropdownMenuItem>
        </Link>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">
                <Sun className="mr-2 size-4" />
                Light
              </DropdownMenuRadioItem>

              <DropdownMenuRadioItem value="dark">
                <Moon className="mr-2 size-4" />
                Dark
              </DropdownMenuRadioItem>

              <DropdownMenuRadioItem value="system">
                <Laptop className="mr-2 size-4" />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={signOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
