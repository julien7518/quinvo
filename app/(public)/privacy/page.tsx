"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Politique de confidentialité</h1>

      <div className="prose prose-sm max-w-none">
        <p className="mb-6">
          La présente politique de confidentialité a pour objet d’informer les
          utilisateurs du service Quinvo (ci-après le « Service ») des modalités
          de collecte, d’utilisation et de protection de leurs données
          personnelles, conformément au Règlement Général sur la Protection des
          Données (RGPD).
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          1. Responsable du traitement
        </h2>
        <p className="mb-4">
          Le responsable du traitement des données personnelles est Julien
          Fernandes, entrepreneur individuel exerçant sous le statut de
          micro-entrepreneur (SIRET : 931&nbsp;016&nbsp;588&nbsp;00010).
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          2. Données personnelles collectées
        </h2>
        <p className="mb-4">
          Dans le cadre de l’utilisation du Service, les données personnelles
          suivantes peuvent être collectées :
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            Informations d’inscription et d’authentification (adresse email)
          </li>
          <li>Données relatives au compte utilisateur</li>
          <li>
            Données professionnelles saisies par l’utilisateur (clients,
            factures, contenus associés)
          </li>
          <li>Données techniques et de connexion</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          3. Finalités du traitement
        </h2>
        <p className="mb-4">
          Les données personnelles sont collectées et traitées pour les
          finalités suivantes :
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Fourniture et fonctionnement du Service</li>
          <li>Gestion des comptes utilisateurs</li>
          <li>Amélioration continue du Service</li>
          <li>Sécurité et prévention des usages frauduleux</li>
          <li>Respect des obligations légales et réglementaires</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          4. Base légale du traitement
        </h2>
        <p className="mb-4">
          Les traitements de données personnelles reposent sur l’exécution du
          contrat liant l’utilisateur au Service, ainsi que sur l’intérêt
          légitime de l’éditeur à assurer le bon fonctionnement, la sécurité et
          l’amélioration du Service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          5. Hébergement et sous-traitants
        </h2>
        <p className="mb-4">
          Les données sont hébergées et traitées via les services de Supabase,
          utilisé pour l’authentification et le stockage des données. Les
          infrastructures de Supabase sont hébergées sur Amazon Web Services
          (AWS) dans l’Union européenne, région eu-west-3.
        </p>
        <p className="mb-4">
          Le Service est hébergé sur l’infrastructure de Vercel. Des données
          techniques et anonymisées peuvent être collectées via Vercel Analytics
          et Vercel Speed Insights à des fins de mesure d’audience et
          d’amélioration du Service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          6. Transferts de données hors Union européenne
        </h2>
        <p className="mb-4">
          Certains prestataires techniques du Service peuvent être situés hors
          de l’Union européenne. Dans ce cas, des garanties appropriées sont
          mises en place afin d’assurer un niveau de protection adéquat des
          données personnelles, conformément à la réglementation applicable.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          7. Durée de conservation
        </h2>
        <p className="mb-4">
          Les données personnelles sont conservées pendant la durée strictement
          nécessaire à la fourniture du Service, puis supprimées ou anonymisées,
          sauf obligation légale contraire.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          8. Sécurité des données
        </h2>
        <p className="mb-4">
          Des mesures techniques et organisationnelles appropriées sont mises en
          œuvre afin de garantir la sécurité, l’intégrité et la confidentialité
          des données personnelles.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          9. Droits des utilisateurs
        </h2>
        <p className="mb-4">
          Conformément au RGPD, l’utilisateur dispose des droits suivants :
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Droit d’accès à ses données personnelles</li>
          <li>Droit de rectification</li>
          <li>Droit à l’effacement</li>
          <li>Droit à la limitation du traitement</li>
          <li>Droit à la portabilité des données</li>
          <li>Droit d’opposition</li>
        </ul>
        <p className="mb-4">
          L’utilisateur peut exercer ses droits à tout moment en contactant
          l’éditeur à l’adresse suivante :{" "}
          <a href="mailto:julien.f2004@icloud.com" className="underline">
            julien.f2004@icloud.com
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          10. Modification de la politique
        </h2>
        <p className="mb-4">
          La présente politique de confidentialité peut être modifiée à tout
          moment afin de refléter les évolutions du Service ou de la
          réglementation. La version en vigueur est celle publiée sur le site.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">11. Contact</h2>
        <p className="mb-4">
          Pour toute question relative à la présente politique de
          confidentialité, l’utilisateur peut contacter l’éditeur par email à
          l’adresse{" "}
          <a href="mailto:julien.f2004@icloud.com" className="underline">
            julien.f2004@icloud.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
