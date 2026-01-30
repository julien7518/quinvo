"use client";

import Link from "next/link";

export default function CGUPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">
        Conditions Générales d’Utilisation
      </h1>

      <div className="prose prose-sm max-w-none">
        <p className="mb-6">
          Les présentes Conditions Générales d’Utilisation (dites « CGU ») ont
          pour objet de définir les modalités d’accès et d’utilisation du
          service Quinvo (ci-après le « Service »), accessible via le site
          internet Quinvo.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          1. Éditeur du service
        </h2>
        <p className="mb-4">
          Le Service est édité par Julien Fernandes, entrepreneur individuel
          exerçant sous le statut de micro-entrepreneur (SIRET :
          931&nbsp;016&nbsp;588&nbsp;00010).
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          2. Description du service
        </h2>
        <p className="mb-4">
          Quinvo est une application en ligne permettant aux utilisateurs de
          créer, gérer et organiser des factures et des clients, ainsi que de
          visualiser des données liées à leur activité.
        </p>
        <p className="mb-4">
          Le Service est actuellement proposé gratuitement. L’éditeur se réserve
          le droit de faire évoluer tout ou partie du Service vers des
          fonctionnalités payantes, sans obligation pour l’utilisateur d’y
          souscrire.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. Accès au service</h2>
        <p className="mb-4">
          L’accès au Service nécessite la création d’un compte utilisateur. Lors
          de l’inscription, l’utilisateur s’engage à fournir des informations
          exactes, complètes et à jour.
        </p>
        <p className="mb-4">
          L’utilisateur est responsable de la confidentialité de ses
          identifiants et de toute activité réalisée depuis son compte.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          4. Obligations de l’utilisateur
        </h2>
        <p className="mb-4">
          L’utilisateur s’engage à utiliser le Service de manière conforme aux
          lois et réglementations en vigueur.
        </p>
        <p className="mb-4">
          Il est strictement interdit d’utiliser le Service à des fins
          frauduleuses, illégales ou portant atteinte aux droits de tiers.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Responsabilité</h2>
        <p className="mb-4">
          Quinvo fournit des outils de gestion et de génération de documents à
          titre informatif. Le Service ne constitue pas un logiciel comptable,
          juridique ou fiscal.
        </p>
        <p className="mb-4">
          L’utilisateur demeure seul responsable de l’exactitude des données
          saisies, de l’utilisation des documents générés et du respect de ses
          obligations légales, fiscales et comptables.
        </p>
        <p className="mb-4">
          L’éditeur ne saurait être tenu responsable des dommages directs ou
          indirects résultant de l’utilisation du Service, d’une indisponibilité
          temporaire ou d’une perte de données.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          6. Données personnelles
        </h2>
        <p className="mb-4">
          Les données personnelles collectées dans le cadre de l’utilisation du
          Service sont traitées conformément à la réglementation applicable en
          matière de protection des données personnelles.
        </p>
        <p className="mb-4">
          Pour plus d’informations, l’utilisateur est invité à consulter la{" "}
          <Link href="/privacy" className="underline">
            politique de confidentialité
          </Link>
          .
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          7. Suspension et résiliation
        </h2>
        <p className="mb-4">
          L’éditeur se réserve le droit de suspendre ou de résilier l’accès au
          Service, sans préavis, en cas de violation des présentes CGU ou
          d’utilisation abusive du Service.
        </p>
        <p className="mb-4">
          L’utilisateur peut à tout moment cesser d’utiliser le Service et
          supprimer son compte.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          8. Évolution du service
        </h2>
        <p className="mb-4">
          L’éditeur se réserve le droit de faire évoluer, modifier ou
          interrompre tout ou partie du Service, notamment pour des raisons
          techniques, économiques ou légales.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          9. Propriété intellectuelle
        </h2>
        <p className="mb-4">
          Le Service, ainsi que l’ensemble de ses composants (logiciels,
          interfaces, contenus), est protégé par les lois relatives à la
          propriété intellectuelle. Toute reproduction ou exploitation non
          autorisée est interdite.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">
          10. Droit applicable
        </h2>
        <p className="mb-4">
          Les présentes CGU sont régies par le droit français. En cas de litige,
          les tribunaux français seront seuls compétents.
        </p>
      </div>
    </div>
  );
}
