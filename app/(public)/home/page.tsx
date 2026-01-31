"use client";

import { Button } from "@/components/ui/button";
import { Libre_Baskerville } from "next/font/google";
import Link from "next/link";

const LibreBaker = Libre_Baskerville({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          La facturation{" "}
          <span className="text-primary decoration-foreground underline underline-offset-8 decoration-2">
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

        {/* Video placeholder */}
        <div className="mx-auto mt-16 aspect-video max-w-4xl rounded-xl border bg-muted flex items-center justify-center text-muted-foreground">
          Vidéo de présentation
        </div>

        <div className="mt-10">
          <Button variant="default" className="text-lg p-6 rounded-xl" asChild>
            <Link href="/auth/sign-up">Créer une facture</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tout ce dont vous avez besoin pour gérer votre activité
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Quinvo se concentre sur l’essentiel : facturer, suivre et comprendre
            vos finances, sans jargon ni outils inutiles.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border bg-background p-6 transition hover:shadow-md">
            <h3 className="mb-2 text-lg font-semibold">
              Facturation professionnelle
            </h3>
            <p className="text-sm text-muted-foreground">
              Créez des factures claires et conformes, calculez automatiquement
              les montants et suivez leur statut en un coup d’œil.
            </p>
          </div>

          <div className="rounded-xl border bg-background p-6 transition hover:shadow-md">
            <h3 className="mb-2 text-lg font-semibold">Gestion des clients</h3>
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
              Visualisez vos revenus, factures en attente et montants à déclarer
              grâce à des indicateurs simples et lisibles.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
