import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { CityIcon } from "@/components/CityIcon";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { tCity } from "@/lib/specialty-i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Médecins par ville au Maroc — Casablanca, Rabat, Marrakech…",
    description:
      "Trouvez des médecins et spécialistes dans toutes les grandes villes du Maroc : Casablanca, Rabat, Marrakech, Fès, Tanger et plus.",
    alternates: localizedAlternates("/villes", locale),
    openGraph: {
      title: "Médecins par ville au Maroc — SantéauMaroc",
      description: "Trouvez un médecin dans votre ville au Maroc.",
      url: "/villes",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Médecins par ville au Maroc — SantéauMaroc",
      description: "Trouvez un médecin dans votre ville au Maroc.",
    },
  };
}

/* ── Icônes ─────────────────────────────────────────────── */

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={className ?? "w-5 h-5"} aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default async function VillesPage({ params }: { params: Promise<{ lang: string }> }) {
  const cities = await prisma.city.findMany({
    include: {
      _count: { select: { doctors: true, establishments: true } },
    },
    orderBy: [
      { doctors: { _count: "desc" } },
      { name: "asc" },
    ],
  });

  const totalDoctors = cities.reduce((s, c) => s + c._count.doctors, 0);
  const totalEstabs  = cities.reduce((s, c) => s + c._count.establishments, 0);
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).directory;
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "name": "Médecins par ville au Maroc",
        "description": `${cities.length} villes couvertes au Maroc. ${totalDoctors.toLocaleString("fr")} praticiens référencés.`,
        "url": `${BASE}/villes`,
        "numberOfItems": cities.filter((c) => c._count.doctors > 0).length,
        "itemListElement": cities
          .filter((c) => c._count.doctors > 0)
          .map((c, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": c.name,
            "url": `${BASE}/villes/${c.slug}`,
          })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Villes", "item": `${BASE}/villes` },
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
        <p className="section-eyebrow mb-1.5">{t.villesEyebrow}</p>
        <h1 className="section-title">{t.villesTitle}</h1>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          <span className="font-semibold text-slate-700">{cities.length}</span> {t.cityMany} ·{" "}
          <span className="font-semibold text-slate-700">{totalDoctors.toLocaleString("fr")}</span> {t.pracMany} ·{" "}
          <span className="font-semibold text-slate-700">{totalEstabs.toLocaleString("fr")}</span> {t.estabMany}
        </p>
        <div className="mt-4 h-px"
          style={{ background: "linear-gradient(90deg, #bfdbfe 0%, #a7f3d0 60%, transparent 100%)" }} />
      </header>

      {/* ── Grille des villes ─────────────────────── */}
      {cities.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
            <MapPinIcon className="w-8 h-8 text-primary-300" />
          </div>
          <p className="font-semibold text-slate-700">{t.noCities}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {cities.map((c) => {
            const hasDoctors = c._count.doctors > 0;
            return (
              <Link
                key={c.id}
                href={`/villes/${c.slug}`}
                className={`group card flex items-center gap-3.5 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-200 ${!hasDoctors ? "opacity-55" : ""}`}
              >
                {/* Icône */}
                <CityIcon name={c.name} size="md" />

                {/* Texte */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 group-hover:text-primary-700 transition-colors truncate leading-snug">
                    {tCity(c.name, locale)}
                  </p>
                  {c.region && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">{c.region}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {hasDoctors ? (
                      <>
                        <span className="text-xs font-medium text-slate-500 tabular-nums">
                          {c._count.doctors.toLocaleString("fr")} {c._count.doctors !== 1 ? t.pracMany : t.pracOne}
                        </span>
                        {c._count.establishments > 0 && (
                          <>
                            <span className="text-slate-200">·</span>
                            <span className="text-xs text-slate-500 tabular-nums">
                              {c._count.establishments} {t.estabShort}
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-slate-500 italic">{t.comingSoon}</span>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                  className="w-4 h-4 text-slate-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all shrink-0"
                  aria-hidden="true">
                  <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
