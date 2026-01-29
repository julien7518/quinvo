"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import localFont from "next/font/local";
import { Libre_Baskerville } from "next/font/google";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const Avenir = localFont({
  src: "../../public/avenir_medium.ttf",
});

const LibreBaker = Libre_Baskerville({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export default function Home() {
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
      <header className="sticky top-3 z-50 w-4/5 rounded-4xl border bg-background/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className={cn("text-4xl font-black", Avenir.className)}>
              Quinvo
            </span>
          </div>

          <div className="flex items-center gap-4">
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

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            La facturation pour <br />
            <span className={LibreBaker.className}> micro-entrepreneur </span>
            <span className="underline underline-offset-8 decoration-2">
              simplifiée
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Quinvo vous aide à créer, suivre et analyser vos factures et vos
            revenus depuis un tableau de bord clair, rapide et sans complexité
            comptable.
          </p>

          {/* Video placeholder */}
          <div className="mx-auto mt-16 aspect-video max-w-4xl rounded-xl border bg-muted flex items-center justify-center text-muted-foreground">
            Vidéo de présentation
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tout ce dont vous avez besoin pour gérer votre activité
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Quinvo se concentre sur l’essentiel : facturer, suivre et
              comprendre vos finances, sans jargon ni outils inutiles.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border bg-background p-6 transition hover:shadow-md">
              <h3 className="mb-2 text-lg font-semibold">
                Facturation professionnelle
              </h3>
              <p className="text-sm text-muted-foreground">
                Créez des factures claires et conformes, calculez
                automatiquement les montants et suivez leur statut en un coup
                d’œil.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-6 transition hover:shadow-md">
              <h3 className="mb-2 text-lg font-semibold">
                Gestion des clients
              </h3>
              <p className="text-sm text-muted-foreground">
                Centralisez vos clients, accédez rapidement à leurs informations
                et associez facilement chaque facture au bon contact.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-6 transition hover:shadow-md">
              <h3 className="mb-2 text-lg font-semibold">
                Suivi et visibilité financière
              </h3>
              <p className="text-sm text-muted-foreground">
                Visualisez vos revenus, factures en attente et montants à
                déclarer grâce à des indicateurs simples et lisibles.
              </p>
            </div>
          </div>
        </section>
      </main>

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
          </div>
        </div>
      </footer>
    </div>
  );
}
