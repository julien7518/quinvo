"use client";

import Link from "next/link";
import localFont from "next/font/local";

const Avenir = localFont({
  src: "../../../public/avenir_medium.ttf",
});

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Mentions légales</h1>

      <div className="prose prose-sm max-w-none">
        <h2 className="text-xl font-semibold mt-8 mb-4">
          Éditeur et responsable de la publication
        </h2>
        <p className="mb-4">
          Le site Quinvo est édité et publié par Julien Fernandes, entrepreneur
          individuel exerçant sous le statut de micro-entrepreneur (SIRET :
          931&nbsp;016&nbsp;588&nbsp;00010). L’éditeur peut être contacté à
          l’adresse email{" "}
          <Link href="mailto:julien.f2004@icloud.com" className="underline">
            julien.f2004@icloud.com
          </Link>
          . Son adresse est communiquée sur demande.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Hébergement</h2>
        <p className="mb-4">
          Le site est hébergé par la société Vercel Inc., dont le siège social
          est situé au 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis. Plus
          d’informations sont disponibles sur le site{" "}
          <Link
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            https://vercel.com
          </Link>
          .
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Accès au service</h2>
        <p className="mb-4">
          Quinvo est un service en ligne permettant la création et la gestion de
          factures et de clients. Le service est actuellement accessible
          gratuitement et nécessite la création d’un compte utilisateur.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Responsabilité</h2>
        <p className="mb-4">
          Quinvo fournit des outils de gestion et de génération de documents à
          titre informatif. L’éditeur ne fournit aucun service comptable,
          juridique ou fiscal. L’utilisateur reste seul responsable de
          l’exactitude des informations saisies, de l’utilisation des documents
          générés et du respect de ses obligations légales et fiscales.
        </p>
        <p className="mb-4">
          L’éditeur ne saurait être tenu responsable des dommages directs ou
          indirects résultant de l’utilisation du site, d’une interruption du
          service ou d’une perte de données.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          Données personnelles
        </h2>
        <p className="mb-4">
          Le responsable du traitement des données personnelles est Julien
          Fernandes. Les données collectées sont nécessaires au fonctionnement
          du service Quinvo.
        </p>
        <p className="mb-4">
          Le site utilise les services de Supabase (hébergement des données et
          authentification), dont l’infrastructure est hébergée sur AWS dans
          l’Union européenne (région eu-west-3).
        </p>
        <p className="mb-4">
          Pour plus d’informations sur la collecte et le traitement des données
          personnelles, veuillez consulter la{" "}
          <Link href="/privacy" className="underline">
            politique de confidentialité
          </Link>
          .
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          Cookies et mesure d’audience
        </h2>
        <p className="mb-4">
          Le site utilise Vercel Analytics à des fins de mesure d’audience et
          d’amélioration du service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          Propriété intellectuelle
        </h2>
        <p className="mb-4">
          L’ensemble des éléments du site Quinvo (textes, interfaces, logos,
          graphismes, fonctionnalités) est protégé par les lois françaises et
          internationales relatives à la propriété intellectuelle. Toute
          reproduction ou exploitation non autorisée est interdite.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Droit applicable</h2>
        <p className="mb-4">
          Les présentes mentions légales sont régies par le droit français.
        </p>
      </div>
    </div>
  );
}
