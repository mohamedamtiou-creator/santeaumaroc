import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Politique de confidentialité — SantéauMaroc",
    description:
      "Découvrez comment SantéauMaroc collecte, utilise et protège vos données personnelles conformément à la réglementation marocaine et aux standards internationaux.",
    alternates: localizedAlternates("/politique-confidentialite", locale),
    openGraph: {
      title: "Politique de confidentialité — SantéauMaroc",
      description: "Comment SantéauMaroc collecte, utilise et protège vos données personnelles.",
      url: "/politique-confidentialite",
      type: "website",
    },
  };
}

const LAST_UPDATED = "1er juin 2026";

const SECTIONS = [
  { id: "responsable",  label: "1. Responsable du traitement" },
  { id: "collecte",     label: "2. Données collectées" },
  { id: "finalites",    label: "3. Finalités du traitement" },
  { id: "base-legale",  label: "4. Base légale" },
  { id: "destinataires", label: "5. Destinataires" },
  { id: "conservation", label: "6. Durée de conservation" },
  { id: "droits",       label: "7. Vos droits" },
  { id: "transferts",   label: "8. Transferts internationaux" },
  { id: "cookies",      label: "9. Cookies" },
  { id: "securite",     label: "10. Sécurité" },
  { id: "mineurs",      label: "11. Mineurs" },
  { id: "contact",      label: "12. Contact & DPO" },
];

const USER_RIGHTS = [
  {
    icon: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    title: "Droit d'accès",
    desc: "Obtenez une copie complète de vos données personnelles détenues par SantéauMaroc.",
  },
  {
    icon: "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    title: "Droit de rectification",
    desc: "Corrigez ou mettez à jour vos informations personnelles à tout moment.",
  },
  {
    icon: "M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16",
    title: "Droit à l'effacement",
    desc: "Demandez la suppression de vos données (sous réserve d'obligations légales).",
  },
  {
    icon: "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636",
    title: "Droit d'opposition",
    desc: "Refusez le traitement de vos données à des fins de prospection ou de profilage.",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z",
    title: "Droit à la limitation",
    desc: "Suspendez temporairement le traitement de vos données dans certains cas.",
  },
  {
    icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    title: "Droit à la portabilité",
    desc: "Recevez vos données dans un format structuré et lisible par machine.",
  },
];

export default function PolitiqueConfidentialitePage() {
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
            Politique de confidentialité
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

            {/* Trust badge */}
            <div className="mt-4 card p-4 bg-secondary-50 border-secondary-100 text-center">
              <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center mx-auto mb-2">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-5 h-5 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2L4 4.5v5C4 13.2 6.8 16.8 10 18c3.2-1.2 6-4.8 6-8.5v-5L10 2z"/>
                  <path d="m7.5 10 2 2 3-3.5"/>
                </svg>
              </div>
              <p className="text-xs font-semibold text-secondary-800 leading-snug">
                Vos données sont protégées et ne sont jamais vendues à des tiers.
              </p>
            </div>
          </nav>

          {/* ── Corps du texte ───────────────────────── */}
          <article>

            {/* Chapeau */}
            <div className="card p-5 mb-8 bg-secondary-50 border-secondary-100 text-sm text-secondary-800 leading-relaxed">
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-5 h-5 text-secondary-500 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2L4 4.5v5C4 13.2 6.8 16.8 10 18c3.2-1.2 6-4.8 6-8.5v-5L10 2z"/>
                  <path d="m7.5 10 2 2 3-3.5"/>
                </svg>
                <p>
                  SantéauMaroc accorde une importance capitale à la protection de vos données personnelles.
                  Cette politique décrit de manière transparente comment nous collectons, utilisons et
                  sécurisons vos informations, conformément à la loi marocaine 09-08 relative à la
                  protection des personnes physiques.
                </p>
              </div>
            </div>

            <PrivacySection id="responsable" title="1. Responsable du traitement">
              <p>
                Le responsable du traitement des données personnelles collectées via la plateforme
                SantéauMaroc est la société <strong>SantéauMaroc SARL</strong>, dont le siège social
                est situé à Casablanca, Maroc.
              </p>
              <p>
                Pour toute question relative à vos données personnelles, vous pouvez nous contacter à :{" "}
                <a href="mailto:privacy@santeaumaroc.com" className="text-primary-600 hover:underline font-medium">
                  privacy@santeaumaroc.com
                </a>
              </p>
            </PrivacySection>

            <PrivacySection id="collecte" title="2. Données collectées">
              <p>Nous collectons différentes catégories de données selon votre profil :</p>

              <div className="grid sm:grid-cols-2 gap-3 my-3">
                {[
                  {
                    title: "Patients",
                    items: ["Nom, prénom, adresse e-mail", "Numéro de téléphone", "Historique des rendez-vous", "Avis et évaluations déposés"],
                    bg: "bg-primary-50 border-primary-100",
                    dot: "bg-primary-500",
                  },
                  {
                    title: "Praticiens",
                    items: ["Identité professionnelle", "Coordonnées du cabinet", "Documents de vérification", "Disponibilités et agenda"],
                    bg: "bg-secondary-50 border-secondary-100",
                    dot: "bg-secondary-500",
                  },
                ].map((cat) => (
                  <div key={cat.title} className={`rounded-xl border p-4 ${cat.bg}`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">{cat.title}</p>
                    <ul className="flex flex-col gap-1">
                      {cat.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.dot} mt-1.5 shrink-0`} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <p>
                Nous collectons également des <strong>données de navigation</strong> (adresse IP, type
                de navigateur, pages visitées) via des cookies et outils d&apos;analyse, dans le but
                d&apos;améliorer nos services.
              </p>
            </PrivacySection>

            <PrivacySection id="finalites" title="3. Finalités du traitement">
              <p>Vos données sont traitées pour les finalités suivantes :</p>
              <ul>
                <li>Création et gestion de votre compte utilisateur ;</li>
                <li>Facilitation de la prise de rendez-vous en ligne ;</li>
                <li>Envoi de confirmations et rappels de rendez-vous ;</li>
                <li>Vérification de l&apos;identité et des qualifications des praticiens ;</li>
                <li>Amélioration continue de nos services ;</li>
                <li>Lutte contre la fraude et sécurisation de la plateforme ;</li>
                <li>Respect de nos obligations légales et réglementaires.</li>
              </ul>
            </PrivacySection>

            <PrivacySection id="base-legale" title="4. Base légale du traitement">
              <p>Nos traitements reposent sur les bases légales suivantes :</p>
              <ul>
                <li><strong>Exécution du contrat :</strong> traitement nécessaire à la fourniture de nos services ;</li>
                <li><strong>Consentement :</strong> pour les communications marketing et les cookies non essentiels ;</li>
                <li><strong>Obligation légale :</strong> conservation de certaines données imposée par la loi ;</li>
                <li><strong>Intérêt légitime :</strong> amélioration des services, sécurité informatique, prévention de la fraude.</li>
              </ul>
            </PrivacySection>

            <PrivacySection id="destinataires" title="5. Destinataires des données">
              <p>
                Vos données personnelles ne sont <strong>jamais vendues</strong> à des tiers.
                Elles peuvent être partagées uniquement dans les cas suivants :
              </p>
              <ul>
                <li>
                  <strong>Le praticien concerné</strong> reçoit les informations nécessaires à la gestion
                  du rendez-vous (nom, coordonnées) ;
                </li>
                <li>
                  <strong>Nos sous-traitants techniques</strong> (hébergement, e-mailing) opèrent sous
                  contrats garantissant la confidentialité de vos données ;
                </li>
                <li>
                  <strong>Les autorités compétentes</strong> en cas d&apos;obligation légale ou judiciaire.
                </li>
              </ul>
            </PrivacySection>

            <PrivacySection id="conservation" title="6. Durée de conservation">
              <p>Nous conservons vos données le temps strictement nécessaire aux finalités poursuivies :</p>
              <ul>
                <li>Données de compte actif : pendant toute la durée de votre relation avec SantéauMaroc ;</li>
                <li>Données de rendez-vous : 5 ans à compter de la consultation ;</li>
                <li>Données de navigation et logs : 13 mois maximum ;</li>
                <li>Documents de vérification praticien : durée d&apos;activité sur la plateforme + 1 an.</li>
              </ul>
              <p>
                À l&apos;expiration de ces délais, vos données sont supprimées ou anonymisées de manière irréversible.
              </p>
            </PrivacySection>

            <PrivacySection id="droits" title="7. Vos droits">
              <p>
                Conformément à la loi marocaine 09-08 et aux standards du RGPD européen, vous disposez
                des droits suivants sur vos données personnelles :
              </p>
              <div className="grid sm:grid-cols-2 gap-3 my-4">
                {USER_RIGHTS.map((r) => (
                  <div key={r.title} className="card-flat rounded-xl p-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                        className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <path d={r.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 mb-0.5">{r.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p>
                Pour exercer vos droits, contactez notre délégué à la protection des données à{" "}
                <a href="mailto:privacy@santeaumaroc.com" className="text-primary-600 hover:underline font-medium">
                  privacy@santeaumaroc.com
                </a>
                . Nous nous engageons à répondre dans un délai de <strong>30 jours</strong>.
              </p>
            </PrivacySection>

            <PrivacySection id="transferts" title="8. Transferts internationaux de données">
              <p>
                Nos serveurs sont hébergés au Maroc et en Europe. En cas de transfert hors de ces
                zones, nous veillons à ce que des garanties appropriées soient en place (clauses
                contractuelles types, certification).
              </p>
            </PrivacySection>

            <PrivacySection id="cookies" title="9. Cookies et traceurs">
              <p>
                SantéauMaroc utilise des cookies pour assurer le bon fonctionnement de la plateforme
                et améliorer votre expérience.
              </p>
              <ul>
                <li>
                  <strong>Cookies essentiels :</strong> nécessaires au fonctionnement de la plateforme
                  (authentification, sécurité). Ils ne peuvent pas être désactivés.
                </li>
                <li>
                  <strong>Cookies analytiques :</strong> nous aident à comprendre l&apos;utilisation
                  de la plateforme pour l&apos;améliorer. Soumis à votre consentement.
                </li>
                <li>
                  <strong>Cookies de préférence :</strong> mémorisent vos réglages (langue, ville par défaut).
                </li>
              </ul>
              <p>
                Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
                Le refus de cookies analytiques n&apos;affecte pas votre accès aux services.
              </p>
            </PrivacySection>

            <PrivacySection id="securite" title="10. Sécurité des données">
              <p>
                SantéauMaroc met en œuvre des mesures techniques et organisationnelles rigoureuses
                pour protéger vos données contre tout accès non autorisé, perte ou divulgation :
              </p>
              <ul>
                <li>Chiffrement des données en transit (TLS/SSL) et au repos ;</li>
                <li>Authentification sécurisée et gestion stricte des accès ;</li>
                <li>Audits de sécurité réguliers et tests de pénétration ;</li>
                <li>Plan de réponse aux incidents de sécurité.</li>
              </ul>
              <p>
                En cas de violation de données susceptible d&apos;affecter vos droits, nous nous
                engageons à vous en informer dans les délais prescrits par la loi.
              </p>
            </PrivacySection>

            <PrivacySection id="mineurs" title="11. Mineurs">
              <p>
                Les services de SantéauMaroc sont destinés aux personnes majeures (18 ans et plus).
                Nous ne collectons pas sciemment de données personnelles concernant des mineurs.
                Si vous êtes parent et constatez que votre enfant a fourni des données, contactez-nous
                pour en demander la suppression.
              </p>
            </PrivacySection>

            <PrivacySection id="contact" title="12. Contact et délégué à la protection des données">
              <p>Pour toute question relative à cette politique ou à vos données personnelles :</p>
              <ul>
                <li>
                  <strong>E-mail DPO :</strong>{" "}
                  <a href="mailto:privacy@santeaumaroc.com" className="text-primary-600 hover:underline font-medium">
                    privacy@santeaumaroc.com
                  </a>
                </li>
                <li>
                  <strong>Formulaire de contact :</strong>{" "}
                  <Link href="/contact" className="text-primary-600 hover:underline font-medium">
                    santeaumaroc.com/contact
                  </Link>
                </li>
                <li>
                  <strong>Courrier :</strong> SantéauMaroc SARL — DPO, Casablanca, Maroc
                </li>
              </ul>
              <p>
                Vous avez également le droit d&apos;introduire une réclamation auprès de la Commission
                Nationale de contrôle de la protection des Données à caractère Personnel (CNDP) du Maroc.
              </p>
            </PrivacySection>

            {/* Liens connexes */}
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <div className="card p-5 hover:border-primary-200 transition-colors group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                      className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="2" width="14" height="12" rx="2"/><path d="M1 6h14"/>
                    </svg>
                  </div>
                  <Link href="/conditions-utilisation" className="font-semibold text-sm text-slate-900 hover:text-primary-700">
                    Conditions d&apos;utilisation
                  </Link>
                </div>
                <p className="text-xs text-slate-500">Règles d&apos;utilisation de la plateforme SantéauMaroc.</p>
              </div>
              <div className="card p-5 hover:border-secondary-200 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                      className="w-4 h-4 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3a1 1 0 0 1 1-1h2l1 4-2 1a11 11 0 0 0 4 4l1-2 4 1v2a1 1 0 0 1-1 1A12 12 0 0 1 2 3z"/>
                    </svg>
                  </div>
                  <Link href="/contact" className="font-semibold text-sm text-slate-900 hover:text-secondary-700">
                    Nous contacter
                  </Link>
                </div>
                <p className="text-xs text-slate-500">Une question sur vos données ? Notre équipe vous répond.</p>
              </div>
            </div>

          </article>
        </div>
      </div>
    </>
  );
}

/* ── Composant section légale ────────────────────────────────── */

function PrivacySection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-secondary-500 to-primary-500 shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-sm text-slate-600 leading-relaxed [&_ul]:ps-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_li]:list-disc [&_strong]:text-slate-800 [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}
