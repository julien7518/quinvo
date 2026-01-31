"use client";

import { Button } from "@/components/ui/button";
import localFont from "next/font/local";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Logo from "@/components/logo";

const Avenir = localFont({
  src: "../../public/avenir_medium.ttf",
});

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();
  }, [supabase]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-3 z-50 w-9/10 md:w-4/5 rounded-4xl border bg-background/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Link href="/home">
              <Logo />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {isAuthenticated ? (
              <Button className="cursor-pointer" asChild>
                <Link href="/">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" className="cursor-pointer" asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button className="cursor-pointer" asChild>
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Footer */}
      <footer className="border-t w-full">
        <div className="mx-auto flex max-w-6xl flex flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col">
            <span>
              &copy; {new Date().getFullYear()} Quinvo. Tous droits réservés.
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/legal" className="hover:text-foreground transition">
              Mentions légales
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition">
              Confidentialité
            </Link>
            <Link href="/cgu" className="hover:text-foreground transition">
              CGU
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
