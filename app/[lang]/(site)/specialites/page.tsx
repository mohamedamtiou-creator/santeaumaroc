import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { SpecialtyIcon } from "@/components/SpecialtyIcon";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { specialtyFamily } from "@/lib/specialty-family";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Spécialités médicales au Maroc — Avis & RDV en ligne | SantéauMaroc",
    description:
      "Retrouvez toutes les spécialités médicales disponibles au Maroc — cardiologue, pédiatre, dermatologue, gynécologue et plus. Avis patients vérifiés et prise de rendez-vous en ligne gratuite.",
    alternates: localizedAlternates("/specialites", locale),
    openGraph: {
      title: "Spécialités médicales au Maroc — SantéauMaroc",
      description: "Cardiologue, pédiatre, dermatologue… Trouvez votre spécialiste au Maroc. Avis vérifiés & RDV en ligne gratuit.",
      url: "/specialites",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Spécialités médicales au Maroc — SantéauMaroc",
      description: "Cardiologue, pédiatre, dermatologue… Trouvez votre spécialiste au Maroc. Avis vérifiés & RDV en ligne gratuit.",
    },
  };
}

/* ── Palette sémantique par famille de spécialité ─────────── */

const ACCENTS = {
  primary: { gradient: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)", ring: "hover:ring-1 hover:ring-primary-200" },
  secondary: { gradient: "linear-gradient(90deg, #059669 0%, #10b981 100%)", ring: "hover:ring-1 hover:ring-secondary-200" },
  amber: { gradient: "linear-gradient(90deg, #d97706 0%, #fbbf24 100%)", ring: "hover:ring-1 hover:ring-amber-200" },
};

function getSpecialtyAccent(name: string) {
  const family = specialtyFamily(name);
  if (family === "technique") return ACCENTS.amber;
  if (family === "femme-enfant-mental") return ACCENTS.secondary;
  return ACCENTS.primary;
}

/* ── Page ────────────────────────────────────────────────── */

export default async function SpecialitesPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const specialties = await prisma.specialty.findMany({
    include: { _count: { select: { doctors: true } } },
    orderBy: { doctors: { _count: "desc" } },
  });

  const total = specialties.reduce((s, sp) => s + sp._count.doctors, 0);
  const t = getDictionary(locale).directory;
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${BASE}/specialites#page`,
        "name": "Spécialités médicales au Maroc — Annuaire des praticiens SantéauMaroc",
        "url": `${BASE}/specialites`,
        "description": `${specialties.length} spécialités médicales disponibles sur SantéauMaroc. ${total.toLocaleString("fr")} praticiens référencés au Maroc.`,
        "inLanguage": "fr",
        "about": { "@type": "MedicalSpecialty", "name": "Médecine spécialisée" },
        "isPartOf": { "@type": "WebSite", "url": BASE, "name": "SantéauMaroc" },
      },
      {
        "@type": "ItemList",
        "name": "Spécialités médicales au Maroc",
        "url": `${BASE}/specialites`,
        "numberOfItems": specialties.length,
        "itemListElement": specialties.map((s, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": s.name,
          "url": `${BASE}/specialites/${s.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil",      "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Spécialités",  "item": `${BASE}/specialites` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="page-outer">

      {/* ── En-tête ──────────────────────────────── */}
      <header className="mb-8">
        <p className="section-eyebrow mb-1.5">{t.specEyebrow}</p>
        <h1 className="section-title">{t.specTitle}</h1>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          <span className="font-semibold text-slate-700">{specialties.length}</span> {t.specMany} —{" "}
          <span className="font-semibold text-slate-700">{total.toLocaleString("fr")}</span> {t.referencedSuffix}
        </p>
        <div className="mt-4 h-0.5 rounded-full"
          style={{ background: "linear-gradient(90deg, #93c5fd 0%, #6ee7b7 60%, transparent 100%)" }} />
      </header>

      {/* ── Grille ───────────────────────────────── */}
      {specialties.length === 0 ? (
        <div className="empty-state">
          <SpecialtyIcon name="médecine" size="lg" />
          <p className="font-semibold text-slate-700">{t.noSpecialties}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {specialties.map((s) => {
            const acc = getSpecialtyAccent(s.name);
            return (
              <Link
                key={s.id}
                href={`/specialites/${s.slug}`}
                className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${acc.ring}`}
                style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
              >
                {/* Gradient strip */}
                <div className="h-1" style={{ background: acc.gradient }} />

                <div className="p-4">
                  {/* Icône */}
                  <div className="mb-3 group-hover:scale-105 transition-transform duration-200 self-start">
                    <SpecialtyIcon name={s.name} size="md" />
                  </div>

                  {/* Nom */}
                  <p className="font-semibold text-sm text-slate-800 group-hover:text-primary-700 transition-colors leading-snug line-clamp-2 mb-2">
                    {tSpecialty(s.name, locale)}
                  </p>

                  {/* Compteur + chevron */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 tabular-nums">
                      {s._count.doctors > 0
                        ? `${s._count.doctors.toLocaleString("fr")} ${s._count.doctors !== 1 ? t.pracMany : t.pracOne}`
                        : t.noPractitioner}
                    </p>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                      className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all shrink-0"
                      aria-hidden="true">
                      <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {/* ── Bloc éditorial ───────────────────────── */}
      <div className="mt-10 card p-5 sm:p-6">
        <h2 className="font-semibold text-slate-900 text-base mb-3 flex items-center gap-2">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
            className="w-4 h-4 text-primary-500 shrink-0" aria-hidden="true">
            <circle cx="8" cy="8" r="7"/>
            <path d="M8 7v5M8 5v.5" strokeLinecap="round"/>
          </svg>
          {t.chooseTitle}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {t.chooseIntro}
        </p>
        <ul className="space-y-1.5">
          {t.tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-slate-600">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-3 h-3 text-secondary-500 mt-0.5 shrink-0" aria-hidden="true"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6l3 3 5-5"/>
              </svg>
              {tip}
            </li>
          ))}
        </ul>
      </div>

    </div>
    </>
  );
}
