"use client";

import { Button } from "@/components/ui/button";
import { Libre_Baskerville } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FeatureCard } from "@/components/feature-card";

const LibreBaker = Libre_Baskerville({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export default function Home() {
  const { theme, resolvedTheme } = useTheme();
  const [dashboardImage, setDashboardImage] = useState<string | null>(null);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const currentTheme = resolvedTheme || theme;

  useEffect(() => {
    if (currentTheme) {
      setDashboardImage(
        currentTheme === "dark"
          ? "/screenshots/dashboard-dark.webp"
          : "/screenshots/dashboard.webp",
      );
      setIsThemeLoaded(true);
    }
  }, [theme, resolvedTheme]);

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="mx-auto max-w-6xl md:px-6 pt-12 md:pt-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-6xl">
          La facturation{" "}
          <span className="text-primary decoration-foreground underline underline-offset-3 md:underline-offset-8 decoration-2">
            simplifiée
          </span>
          <br />
          pour
          <span className={LibreBaker.className}> micro-entrepreneur </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
          Quinvo vous aide à créer, suivre et analyser vos factures et vos
          revenus depuis un tableau de bord clair, rapide et sans complexité
          comptable.
        </p>

        {/* Hero image with glow */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          {/* Ambient background lights */}
          <div className="pointer-events-none absolute inset-0 overflow-visible">
            <div
              className={cn(
                "absolute left-1/2 top-[25%] h-30 w-5/6 -translate-x-1/2 rounded-full blur-[210px]",
                currentTheme === "dark" ? "bg-primary/70" : "bg-primary",
              )}
            />
          </div>

          {isThemeLoaded && dashboardImage ? (
            <div className="relative rounded-2xl p-[1.5px] bg-[length:300%_300%] bg-gradient-to-t from-primary/60 via-transparent to-primary/30">
              <div className="relative overflow-hidden rounded-2xl bg-background">
                {/* Inner fade */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                <Image
                  src={dashboardImage}
                  alt="Quinvo dashboard"
                  width={2858}
                  height={1686}
                  priority
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-auto aspect-3/2 bg-transparent" />
          )}
        </div>

        <div className="mt-10">
          <Button
            variant="default"
            className="md:text-lg md:p-6 md:rounded-xl"
            asChild
          >
            <Link href="/auth/sign-up">Créer une facture</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-5xl">
            Un cockpit financier, pensé pour aller droit à l’essentiel
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Pas un outil comptable. Quinvo vous offre une vue claire, rapide et
            actionnable sur votre activité.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2">
          {/* Large – Invoices (top left) */}
          <FeatureCard
            title="Facturation simplifiée"
            description="Créez des factures professionnelles en quelques secondes, avec clients et suivi de statut."
            large
          >
            {/* <div className="relative h-full w-full overflow-hidden [perspective:1200px]">
              <Image
                src="/screenshots/invoice-example.png"
                alt="Exemple d'une facture"
                fill
                className="rounded-sm object-cover object-top scale-[0.95] rotate-[-20deg] [transform:rotateX(25deg)_rotateY(35deg)]"
              />
            </div> */}
          </FeatureCard>

          {/* Small – Dashboard (top right) */}
          <FeatureCard
            title="Vue d’ensemble instantanée"
            description="Accédez en un coup d’œil à vos indicateurs clés : factures en attente, revenus générés et montants à déclarer."
          />

          {/* Large – Security (bottom left) */}
          <FeatureCard
            title="Données sécurisées"
            description="Authentification sécurisée et isolation stricte des données entre utilisateurs."
          />

          {/* Small – Clients (bottom right) */}
          <FeatureCard
            title="Gestion des clients"
            description="Centralisez vos clients et retrouvez toutes leurs informations sans friction."
            large
          >
            {/* <div className="relative h-full w-full overflow-hidden [perspective:1200px]">
              <Image
                src="/screenshots/clients-page.png"
                alt="Suivie des clients"
                fill
                className="rounded-sm object-cover object-top scale-[0.95] rotate-[-20deg] [transform:rotateX(25deg)_rotateY(35deg)]"
              />
            </div> */}
          </FeatureCard>
        </div>
      </section>
    </div>
  );
}
