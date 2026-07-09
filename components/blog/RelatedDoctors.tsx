import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { processCache } from "@/lib/process-cache";
import { isProPlan, isFeaturedActive, hasProAccess } from "@/lib/plan";
import { PraticienCard } from "@/components/PraticienCard";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Widget de maillage blog → annuaire : affiche 3 praticiens réservables d'une
 * spécialité (et, si fourni, d'une ville) directement dans un article.
 * C'est le lien manquant entre « lire un article » et « prendre rendez-vous ».
 *
 * Server component : la requête Prisma est mise en cache (Data Cache + cache
 * de process pour survivre au HMR), comme la liste /praticiens.
 */

type DoctorCard = Parameters<typeof PraticienCard>[0]["praticien"] & {
  isPro: boolean;
  isFeatured: boolean;
  canBookOnline: boolean;
};

// Agrégat de preuve sociale, à l'échelle de la spécialité (pas seulement le top-3).
type SpecialtyProof = {
  totalDoctors: number; // praticiens actifs référencés
  totalReviews: number; // avis patients publics
  avgRating: number;    // note moyenne des praticiens notés (0 si aucun)
};

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

// Strip control chars (newlines, tabs) from DB strings — cohérent avec /praticiens.
function sanitize(s: string | null | undefined): string | null {
  if (s === null || s === undefined) return null;
  return s.replace(/[\r\n\t\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, " ").trim();
}
function normalisePrix(prix: unknown): number | null {
  if (prix === null || prix === undefined) return null;
  if (typeof prix === "number") return prix;
  if (typeof prix === "object" && typeof (prix as { toNumber(): number }).toNumber === "function")
    return (prix as { toNumber(): number }).toNumber();
  if (typeof prix === "string") return parseFloat(prix);
  return null;
}

const getDoctors = unstable_cache(
  (specialtySlug: string, citySlug: string) =>
    processCache(`blog:related-doctors:${specialtySlug}|${citySlug}`, 300, async () => {
      const baseWhere = { isActive: true, specialty: { slug: specialtySlug } };
      const select = {
        include: {
          specialty:    { select: { name: true, slug: true } },
          city:         { select: { name: true, slug: true } },
          _count:       { select: { reviews: true } },
          workingHours: { select: { dayOfWeek: true }, where: { isActive: true } },
        },
        orderBy: [
          { featuredUntil:    { sort: "desc" as const, nulls: "last" as const } },
          { planActivatedAt:  { sort: "desc" as const, nulls: "last" as const } },
          { isVerified: "desc" as const },
          { averageRating: "desc" as const },
        ],
        take: 3,
      };

      // Agrégat de preuve sociale à l'échelle de la spécialité (avis + nb).
      const [totalDoctors, ratedAgg, totalReviews] = await Promise.all([
        prisma.doctor.count({ where: baseWhere }),
        prisma.doctor.aggregate({
          where: { ...baseWhere, averageRating: { gt: 0 } },
          _avg: { averageRating: true },
        }),
        prisma.review.count({ where: { isPublic: true, doctor: baseWhere } }),
      ]);

      // Priorité aux praticiens de la ville demandée ; repli national si vide.
      let raw = citySlug
        ? await prisma.doctor.findMany({ where: { ...baseWhere, city: { slug: citySlug } }, ...select })
        : [];
      if (raw.length === 0) {
        raw = await prisma.doctor.findMany({ where: baseWhere, ...select });
      }

      const doctors = raw.map((d): DoctorCard => ({
        id:            d.id,
        slug:          d.slug,
        nom:           sanitize(d.nom),
        prenom:        sanitize(d.prenom),
        civilite:      sanitize(d.civilite),
        adresse:       sanitize(d.adresse) ?? "",
        avatar:        d.avatar,
        averageRating: d.averageRating,
        prix:          normalisePrix(d.prix),
        isVerified:    d.isVerified,
        isPro:         isProPlan(d.plan, d.planExpiresAt),
        isFeatured:    isFeaturedActive(d.featuredUntil),
        canBookOnline: hasProAccess(d.plan, d.planExpiresAt, d.trialEndsAt),
        langues:       d.langues,
        conventions:   d.conventions,
        specialty:     { name: sanitize(d.specialty.name) ?? d.specialty.name, slug: d.specialty.slug },
        city:          { name: sanitize(d.city.name) ?? d.city.name, slug: d.city.slug },
        _count:        { reviews: d._count.reviews },
        workingHours:  d.workingHours.map((wh) => ({ dayOfWeek: wh.dayOfWeek })),
      }));

      const proof: SpecialtyProof = {
        totalDoctors,
        totalReviews,
        avgRating: ratedAgg._avg.averageRating ?? 0,
      };

      return { doctors, proof };
    }),
  ["blog-related-doctors"],
  { revalidate: 300, tags: ["doctors"] },
);

export async function RelatedDoctors({
  specialtySlug,
  specialtyLabel,
  citySlug = "",
  t,
  tb,
  locale,
}: {
  specialtySlug: string;
  specialtyLabel: string;          // libellé pluriel (« cardiologues »)
  citySlug?: string;
  t: Dictionary["card"];           // traductions de PraticienCard
  tb: Dictionary["blog"];          // traductions blog (titres)
  locale: Locale;
}) {
  const { doctors, proof } = await getDoctors(specialtySlug, citySlug);
  if (doctors.length === 0) return null;

  const seeAllHref = `/specialites/${specialtySlug}`;
  const seeAllLabel = tb.seeSpecialists.replace("{specialty}", specialtyLabel);

  const locFr = locale === "ar" ? "ar-MA" : "fr-MA";
  const showRating = proof.totalReviews > 0 && proof.avgRating > 0;

  // ── JSON-LD : ItemList de Physician avec aggregateRating réel (≥3 avis) ──────
  // Preuve sociale structurée attachée à de vraies entités praticien (pas à
  // l'article) — conforme aux règles Google et cohérent avec /specialites/[slug].
  const physicianItems = doctors
    .filter((d) => d.slug)
    .map((d, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Physician",
        "@id": `${BASE}/praticiens/${d.slug}#physician`,
        "name": [d.civilite, d.prenom, d.nom].filter(Boolean).join(" ") || specialtyLabel,
        "url": `${BASE}/praticiens/${d.slug}`,
        "medicalSpecialty": d.specialty.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": d.adresse,
          "addressLocality": d.city.name,
          "addressCountry": "MA",
        },
        ...(d._count.reviews >= 3 && d.averageRating > 0
          ? {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": Number(d.averageRating.toFixed(1)),
                "reviewCount": d._count.reviews,
                "bestRating": 5,
                "worstRating": 1,
              },
            }
          : {}),
      },
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": physicianItems,
  };

  return (
    <section
      className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6"
      aria-labelledby="related-doctors-title"
    >
      {physicianItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}

      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <h2 id="related-doctors-title" className="font-bold text-slate-900 text-lg">
            {tb.doctorsWidgetTitle}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{tb.doctorsWidgetSubtitle}</p>
        </div>
        <Link
          href={seeAllHref}
          className="shrink-0 text-sm font-semibold text-secondary-600 hover:text-secondary-700 whitespace-nowrap"
        >
          {seeAllLabel} →
        </Link>
      </div>

      {/* Preuve sociale agrégée (avis patients + nb de praticiens) */}
      {proof.totalDoctors > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 text-sm">
          {showRating && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true">
                <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
              </svg>
              {tb.proofRating
                .replace("{rating}", proof.avgRating.toFixed(1))
                .replace("{n}", proof.totalReviews.toLocaleString(locFr))}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-secondary-500 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM1 14c0-2.5 2-4 4.5-4S10 11.5 10 14M11 6.5a2 2 0 1 0 0-4M12.5 14c0-2-1-3.4-2.6-3.9" />
            </svg>
            {tb.proofDoctors.replace("{n}", proof.totalDoctors.toLocaleString(locFr))}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {doctors.map((d) => (
          <PraticienCard
            key={d.id}
            praticien={d}
            isPro={d.isPro}
            isFeatured={d.isFeatured}
            canBookOnline={d.canBookOnline}
            t={t}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}
