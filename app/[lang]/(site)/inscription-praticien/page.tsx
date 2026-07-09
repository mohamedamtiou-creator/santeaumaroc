import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { DoctorRegisterForm } from "./_components/DoctorRegisterForm";
import { getLocale } from "@/lib/i18n-server";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Inscription praticien — Référencez-vous gratuitement",
    description:
      "Rejoignez la plateforme médicale de référence au Maroc. Créez votre profil praticien gratuitement, gérez vos rendez-vous et développez votre patientèle.",
    alternates: localizedAlternates("/inscription-praticien", locale),
    openGraph: {
      title: "Inscription praticien — SantéauMaroc",
      description: "Créez votre profil praticien gratuitement sur SantéauMaroc.",
      url: "/inscription-praticien",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Inscription praticien — SantéauMaroc",
      description: "Créez votre profil praticien gratuitement sur SantéauMaroc.",
    },
  };
}

/* ── Icônes ────────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"
      className="w-4 h-4 shrink-0 text-secondary-400" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l3.5 3.5 6.5-7"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-5 h-5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L4 4.5v5C4 13.2 6.8 16.8 10 18c3.2-1.2 6-4.8 6-8.5v-5L10 2z"/>
      <path d="m7.5 10 2 2 3-3.5"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-5 h-5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="13" rx="2"/>
      <path d="M3 9h14M7 3v2M13 3v2"/>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-5 h-5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 13c0-2.209-1.343-4-3-4s-3 1.791-3 4"/>
      <circle cx="10" cy="6" r="2.5"/>
      <path d="M16 13c0-1.657-.895-3-2-3M4 13c0-1.657.895-3 2-3"/>
      <circle cx="16" cy="6.5" r="2"/>
      <circle cx="4" cy="6.5" r="2"/>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-5 h-5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3-4.8-2.5-4.8 2.5.9-5.3L2.2 7.7l5.4-.8L10 2z"/>
    </svg>
  );
}

/* ── Métadonnées visuelles (icônes/couleurs) — le texte vient du dict ── */

const BENEFIT_META = [
  { icon: <UsersIcon />,       color: "bg-primary-100 text-primary-600" },
  { icon: <CalendarIcon />,    color: "bg-secondary-100 text-secondary-700" },
  { icon: <ShieldIcon />,      color: "bg-accent-100 text-accent-700" },
  { icon: <StarIcon />,        color: "bg-terra-100 text-terra-600" },
];

const TESTIMONIAL_META = [
  { initials: "KA", name: "Dr. Karim Alaoui",        gradient: "linear-gradient(135deg, #1d4ed8, #059669)" },
  { initials: "NB", name: "Dr. Nadia Benkirane",     gradient: "linear-gradient(135deg, #059669, #0891b2)" },
  { initials: "YM", name: "Dr. Youssef El Mansouri", gradient: "linear-gradient(135deg, #d97706, #c2614f)" },
];

const STAT_VALUES = ["20 000+", "50+", "100 %"];

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      "name": "Comment inscrire votre cabinet sur SantéauMaroc",
      "description": "Référencez votre cabinet gratuitement sur SantéauMaroc en 4 étapes simples et commencez à recevoir des patients en ligne.",
      "totalTime": "PT10M",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Créez votre compte",
          "text": "Remplissez le formulaire d'inscription avec vos informations professionnelles : nom, spécialité, ville d'exercice et coordonnées.",
          "url": `${BASE}/inscription-praticien`,
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Complétez votre profil",
          "text": "Ajoutez une photo professionnelle, vos horaires de consultation, vos tarifs et une description de votre pratique.",
          "url": `${BASE}/inscription-praticien`,
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Vérification par notre équipe",
          "text": "Notre équipe vérifie votre profil et vos informations professionnelles sous 24 à 48h ouvrées. Vous recevez un e-mail de confirmation.",
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Votre fiche est en ligne",
          "text": "Votre profil apparaît dans l'annuaire et vous commencez à recevoir des demandes de rendez-vous de la part des patients.",
          "url": `${BASE}/praticiens`,
        },
      ],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "MAD",
        "description": "Inscription gratuite pour les praticiens",
      },
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
        { "@type": "ListItem", "position": 2, "name": "Inscription praticien", "item": `${BASE}/inscription-praticien` },
      ],
    },
  ],
};

/* ── Page ──────────────────────────────────────────────────── */

type SearchParams = Promise<{ callbackUrl?: string }>;

export default async function InscriptionPraticienPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { callbackUrl } = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale).inscription.praticien;
  const statLabels = [t.stats.practitioners, t.stats.cities, t.stats.free];

  const [specialties, cities] = await Promise.all([
    prisma.specialty.findMany({
      select:  { id: true, name: true, order: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    prisma.city.findMany({
      select:  { id: true, name: true, order: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="min-h-screen bg-slate-50">

      {/* ── Mobile hero banner ─────────────────────────────── */}
      <div className="lg:hidden hero-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          aria-hidden="true"
        />
        <div className="relative px-4 py-8 flex flex-col items-center text-center gap-4">
          <div>
            <p className="section-eyebrow text-secondary-300 mb-1">{t.eyebrow}</p>
            <h1 className="text-xl font-bold text-white leading-tight">
              {t.titleMobile}
            </h1>
          </div>
          <div className="flex items-center gap-5">
            {STAT_VALUES.map((value, i) => (
              <div key={statLabels[i]} className="text-center">
                <div dir="ltr" className="text-lg font-bold text-white leading-none">{value}</div>
                <div className="text-xs text-primary-300 mt-0.5">{statLabels[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop layout ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12 lg:py-16 grid lg:grid-cols-[1fr_500px] gap-10 lg:gap-16 items-start">

        {/* ── Left panel — Benefits ─────────────────────── */}
        <div className="hidden lg:block sticky top-24">
          <div className="mb-8">
            <p className="section-eyebrow mb-2">{t.eyebrow}</p>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-3">
              {t.titleDesktopPre}<br />
              <span className="text-gradient-brand">{t.titleDesktopHighlight}</span>
            </h1>
            <p className="text-slate-500 text-base leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Benefits list */}
          <div className="space-y-4 mb-8">
            {t.benefits.map((b, i) => (
              <div key={b.title} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${BENEFIT_META[i].color} flex items-center justify-center shrink-0`}>
                  {BENEFIT_META[i].icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{b.title}</p>
                  <p className="text-slate-500 text-sm leading-relaxed mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {STAT_VALUES.map((value, i) => (
              <div key={statLabels[i]} className="card-flat p-4 text-center rounded-2xl">
                <div dir="ltr" className="text-2xl font-bold text-gradient-brand leading-none mb-1">{value}</div>
                <div className="text-xs text-slate-500 font-medium">{statLabels[i]}</div>
              </div>
            ))}
          </div>

          {/* Témoignages praticiens */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
              {t.testimonialsHeading}
            </p>
            <div className="space-y-3">
              {t.testimonials.map((tm, i) => (
                <div key={TESTIMONIAL_META[i].initials} className="card-flat rounded-xl p-4">
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: TESTIMONIAL_META[i].gradient }}
                    >
                      {TESTIMONIAL_META[i].initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 leading-none">{TESTIMONIAL_META[i].name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{tm.role}</p>
                    </div>
                    <div className="shrink-0 flex gap-px" aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <svg key={s} viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-amber-400">
                          <path d="M5 .5l1.2 2.7 2.8.4-2 2 .5 2.8L5 7l-2.5 1.4.5-2.8-2-2 2.8-.4z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    &ldquo;{tm.quote}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel — Form ────────────────────────── */}
        <div>
          <div className="card overflow-hidden p-0">
            {/* Bande dégradée */}
            <div className="h-1.5"
              style={{ background: "linear-gradient(90deg, #1d4ed8 0%, #2563eb 50%, #047857 100%)" }} />

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{t.cardTitle}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{t.cardSubtitle}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-50 border border-secondary-200 text-secondary-700 text-xs font-semibold shrink-0">
                    <CheckIcon />
                    {t.freeBadge}
                  </div>
                </div>
                <div className="mt-4 h-px"
                  style={{ background: "linear-gradient(90deg, #bfdbfe 0%, #a7f3d0 60%, transparent 100%)" }} />
              </div>

              <DoctorRegisterForm specialties={specialties} cities={cities} callbackUrl={callbackUrl} t={t.form} />
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-5 text-center space-y-2">
            <p className="text-sm text-slate-600">
              {t.already}{" "}
              <Link href="/connexion" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
                {t.login}
              </Link>
            </p>
            <p className="text-sm text-slate-600">
              {t.areYouPatient}{" "}
              <Link href="/inscription" className="text-secondary-600 hover:text-secondary-700 font-semibold hover:underline">
                {t.patientSignup}
              </Link>
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M7 1L2 3.5v4.5C2 11 4.2 13.4 7 14.5c2.8-1.1 5-3.5 5-6.5V3.5L7 1z"/>
                <path d="m5 7 1.5 1.5L9 6" strokeLinecap="round"/>
              </svg>
              {t.trustSecure}
            </span>
            <span className="text-slate-200">·</span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" aria-hidden="true">
                <circle cx="7" cy="7" r="5.5"/>
                <path d="M7 4.5v3l2 1.5" strokeLinecap="round"/>
              </svg>
              {t.trustValidation}
            </span>
            <span className="text-slate-200">·</span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M7 1.5l1.5 3 3.3.5-2.4 2.3.6 3.3L7 9 4 10.6l.6-3.3L2.2 5l3.3-.5L7 1.5z" strokeLinejoin="round"/>
              </svg>
              {t.trustFree}
            </span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
