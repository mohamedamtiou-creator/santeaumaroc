import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Conditions Générales d'Utilisation — SantéauMaroc",
    description:
      "Lisez les Conditions Générales d'Utilisation de SantéauMaroc régissant l'accès et l'utilisation de notre plateforme de santé en ligne.",
    alternates: localizedAlternates("/conditions-utilisation", locale),
    openGraph: {
      title: "Conditions Générales d'Utilisation — SantéauMaroc",
      description: "Les CGU régissant l'accès et l'utilisation de la plateforme SantéauMaroc.",
      url: "/conditions-utilisation",
      type: "website",
    },
  };
}

const LAST_UPDATED = "1er juin 2026";

const SECTIONS = [
  { id: "presentation",      label: "1. Présentation" },
  { id: "acceptation",       label: "2. Acceptation des CGU" },
  { id: "inscription",       label: "3. Inscription" },
  { id: "services",          label: "4. Services proposés" },
  { id: "rendez-vous",       label: "5. Prise de rendez-vous" },
  { id: "obligations",       label: "6. Obligations des utilisateurs" },
  { id: "responsabilite",    label: "7. Responsabilité" },
  { id: "propriete",         label: "8. Propriété intellectuelle" },
  { id: "donnees",           label: "9. Données personnelles" },
  { id: "modification",      label: "10. Modification des CGU" },
  { id: "resiliation",       label: "11. Résiliation" },
  { id: "droit",             label: "12. Droit applicable" },
];

export default function ConditionsUtilisationPage() {
  return (
    <>
      {/* ── Hero compact ─────────────────────────────── */}
      <div className="hero-bg relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          aria-hidden="true"
        />
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <p className="section-eyebrow text-secondary-300 mb-3">Légal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-white/70 text-sm">
            Dernière mise à jour : <span className="text-white font-medium">{LAST_UPDATED}</span>
          </p>
        </div>
      </div>

      {/* ── Contenu ──────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[240px_1fr] gap-10 items-start">

          {/* ── Sommaire sticky ─────────────────────── */}
          <nav className="hidden lg:block sticky top-24" aria-label="Sommaire">
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Sommaire</p>
              <ul className="flex flex-col gap-1">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block text-xs text-slate-500 hover:text-primary-600 py-1 px-2 rounded-lg hover:bg-primary-50 transition-colors leading-snug"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* ── Corps du texte ───────────────────────── */}
          <article className="prose-legal">

            {/* Chapeau */}
            <div className="card p-5 mb-8 bg-primary-50 border-primary-100 text-sm text-primary-800 leading-relaxed">
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10" cy="10" r="8"/><path d="M10 7v4M10 13h.01"/>
                </svg>
                <p>
                  Les présentes Conditions Générales d&apos;Utilisation régissent l&apos;accès et l&apos;utilisation
                  de la plateforme <strong>SantéauMaroc</strong>. En utilisant nos services, vous acceptez
                  l&apos;intégralité de ces conditions.
                </p>
              </div>
            </div>

            <LegalSection id="presentation" title="1. Présentation de la plateforme">
              <p>
                SantéauMaroc est une plateforme digitale de mise en relation entre patients et professionnels
                de santé au Maroc. Elle permet aux utilisateurs de rechercher des praticiens par spécialité
                ou localisation, de consulter leurs profils et disponibilités, et de prendre rendez-vous en ligne.
              </p>
              <p>
                La plateforme est éditée par la société SantéauMaroc SARL, dont le siège social est situé
                à Casablanca, Maroc. Pour toute question, vous pouvez nous contacter à{" "}
                <a href="mailto:contact@santeaumaroc.com" className="text-primary-600 hover:underline font-medium">
                  contact@santeaumaroc.com
                </a>.
              </p>
            </LegalSection>

            <LegalSection id="acceptation" title="2. Acceptation des CGU">
              <p>
                L&apos;accès aux services de SantéauMaroc implique l&apos;acceptation pleine et entière
                des présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous devez cesser
                d&apos;utiliser la plateforme.
              </p>
              <p>
                SantéauMaroc se réserve le droit de modifier à tout moment les présentes CGU.
                Les modifications entrent en vigueur dès leur publication. Il vous appartient de
                consulter régulièrement cette page.
              </p>
            </LegalSection>

            <LegalSection id="inscription" title="3. Inscription et compte utilisateur">
              <p>
                L&apos;utilisation de certains services nécessite la création d&apos;un compte.
                Lors de votre inscription, vous vous engagez à fournir des informations exactes,
                complètes et à jour.
              </p>
              <ul>
                <li><strong>Compte patient :</strong> accessible à toute personne physique majeure résidant au Maroc.</li>
                <li><strong>Compte praticien :</strong> réservé aux professionnels de santé légalement autorisés à exercer au Maroc.</li>
              </ul>
              <p>
                Vous êtes seul responsable de la confidentialité de vos identifiants et de toute
                activité réalisée sous votre compte. En cas de suspicion d&apos;utilisation non autorisée,
                contactez-nous immédiatement.
              </p>
            </LegalSection>

            <LegalSection id="services" title="4. Services proposés">
              <p>SantéauMaroc propose notamment les services suivants :</p>
              <ul>
                <li>Annuaire de professionnels de santé vérifiés ;</li>
                <li>Recherche par spécialité, ville ou critères spécifiques ;</li>
                <li>Prise de rendez-vous en ligne avec confirmation automatique ;</li>
                <li>Rappels par e-mail avant les consultations ;</li>
                <li>Espace personnel pour gérer ses rendez-vous ;</li>
                <li>Système d&apos;évaluation des praticiens par les patients.</li>
              </ul>
              <p>
                Ces services sont fournis à titre gratuit pour les patients. Des offres premium
                peuvent être proposées aux praticiens pour des fonctionnalités avancées.
              </p>
            </LegalSection>

            <LegalSection id="rendez-vous" title="5. Prise de rendez-vous en ligne">
              <p>
                La prise de rendez-vous en ligne constitue une mise en relation entre le patient
                et le praticien. SantéauMaroc agit en qualité d&apos;intermédiaire technique et
                n&apos;est pas partie à la relation médicale.
              </p>
              <p>
                En confirmant un rendez-vous, vous vous engagez à vous y présenter ou à l&apos;annuler
                suffisamment à l&apos;avance. Un taux d&apos;absence répété peut entraîner la suspension
                de votre accès au service de réservation.
              </p>
              <p>
                SantéauMaroc n&apos;est en aucun cas responsable des actes médicaux réalisés lors
                des consultations. La relation médicale est exclusivement établie entre le patient
                et le praticien.
              </p>
            </LegalSection>

            <LegalSection id="obligations" title="6. Obligations des utilisateurs">
              <p>En utilisant SantéauMaroc, vous vous engagez à :</p>
              <ul>
                <li>Ne pas usurper l&apos;identité d&apos;un tiers ;</li>
                <li>Ne pas publier de contenus faux, trompeurs ou diffamatoires ;</li>
                <li>Ne pas utiliser la plateforme à des fins commerciales non autorisées ;</li>
                <li>Ne pas tenter de porter atteinte au fonctionnement de la plateforme ;</li>
                <li>Respecter les droits des autres utilisateurs et des praticiens.</li>
              </ul>
              <p>
                Tout manquement peut entraîner la suppression immédiate de votre compte,
                sans préjudice de poursuites judiciaires éventuelles.
              </p>
            </LegalSection>

            <LegalSection id="responsabilite" title="7. Responsabilité">
              <p>
                SantéauMaroc met tout en œuvre pour assurer la disponibilité et la qualité de ses services,
                mais ne peut garantir l&apos;absence d&apos;interruptions ou d&apos;erreurs. La plateforme
                est fournie en l&apos;état (&laquo; as is &raquo;).
              </p>
              <p>
                SantéauMaroc n&apos;est pas responsable : des informations communiquées par les praticiens
                sur leur profil, des décisions médicales prises lors des consultations, des dommages
                indirects résultant de l&apos;utilisation de la plateforme.
              </p>
            </LegalSection>

            <LegalSection id="propriete" title="8. Propriété intellectuelle">
              <p>
                L&apos;ensemble des éléments constituant la plateforme SantéauMaroc — marque, logo,
                interface, textes, images, code source — est protégé par le droit marocain et
                international de la propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation ou exploitation non autorisée est strictement
                interdite et constitue une contrefaçon susceptible d&apos;engager votre responsabilité civile
                et pénale.
              </p>
            </LegalSection>

            <LegalSection id="donnees" title="9. Données personnelles">
              <p>
                La collecte et le traitement de vos données personnelles sont régis par notre{" "}
                <Link href="/politique-confidentialite" className="text-primary-600 hover:underline font-medium">
                  Politique de confidentialité
                </Link>
                , qui fait partie intégrante des présentes CGU.
              </p>
            </LegalSection>

            <LegalSection id="modification" title="10. Modification des CGU">
              <p>
                SantéauMaroc se réserve le droit de modifier les présentes CGU à tout moment.
                Les utilisateurs seront informés des modifications substantielles par e-mail
                ou via une notification sur la plateforme.
              </p>
              <p>
                La poursuite de l&apos;utilisation des services après modification vaut acceptation
                des nouvelles conditions.
              </p>
            </LegalSection>

            <LegalSection id="resiliation" title="11. Résiliation">
              <p>
                Vous pouvez clôturer votre compte à tout moment depuis votre espace personnel
                ou en contactant notre support. SantéauMaroc peut suspendre ou clôturer tout
                compte en cas de violation des présentes CGU.
              </p>
            </LegalSection>

            <LegalSection id="droit" title="12. Droit applicable et juridiction">
              <p>
                Les présentes CGU sont soumises au droit marocain. En cas de litige, une solution
                amiable sera recherchée en priorité. À défaut, les tribunaux compétents de
                Casablanca seront saisis.
              </p>
            </LegalSection>

            {/* Contact */}
            <div className="mt-10 card p-6 border-primary-100 bg-primary-50/50">
              <h3 className="font-semibold text-slate-900 mb-2">Une question sur nos CGU ?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Notre équipe juridique est disponible pour répondre à vos questions.
              </p>
              <Link href="/contact" className="btn-primary text-sm px-5 py-2.5 inline-flex">
                Nous contacter
              </Link>
            </div>

          </article>
        </div>
      </div>
    </>
  );
}

/* ── Composant section légale ────────────────────────────────── */

function LegalSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-primary-500 to-secondary-500 shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-sm text-slate-600 leading-relaxed [&_ul]:ps-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_li]:list-disc [&_strong]:text-slate-800 [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}
