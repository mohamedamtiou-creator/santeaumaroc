import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEstablishmentDetail } from "@/lib/establishments-query";
import { EstablishmentProfile } from "@/components/EstablishmentProfile";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";

type Params = Promise<{ lang: string; slug: string }>;

// Page STATIQUE / ISR : plus aucune lecture de session dans le rendu (l'avis de
// l'utilisateur connecté est chargé côté client, cf. EstablishmentReviewDialog).
export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await prisma.establishment.findMany({
    where: { isActive: true, type: "laboratoire" },
    select: { slug: true },
  });
  return rows.filter((r) => r.slug).map((r) => ({ slug: r.slug! }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const e = await getEstablishmentDetail(slug);
  const locale = toLocale(lang);
  const m = getDictionary(locale).estab.meta;
  if (!e) return { title: m.laboratoireNotFound, robots: { index: false } };
  const title = m.laboratoireTitle.replace("{nom}", e.nom).replace("{city}", e.city.name);
  const description = e.description
    ? e.description.slice(0, 155)
    : m.laboratoireDesc.replace("{nom}", e.nom).replace("{city}", e.city.name);
  return {
    title,
    description,
    alternates: localizedAlternates(`/laboratoires/${slug}`, locale),
    openGraph: { title, description, url: `/laboratoires/${slug}`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LaboratoirePage({ params }: { params: Params }) {
  const { lang, slug } = await params;

  const establishment = await getEstablishmentDetail(slug);

  if (!establishment || !establishment.isActive) notFound();

  const locale = toLocale(lang);
  const t = getDictionary(locale).estab;
  const listLabel = t.laboratoiresTitle;

  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
  const avgRating =
    establishment.reviews.length > 0
      ? establishment.reviews.reduce((s, r) => s + r.note, 0) / establishment.reviews.length
      : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalLaboratory",
        "@id": `${BASE}/laboratoires/${slug}#lab`,
        "name": establishment.nom,
        "url": `${BASE}/laboratoires/${slug}`,
        "inLanguage": locale,
        "hasMap": `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${establishment.adresse}, ${establishment.city.name}, Maroc`)}`,
        ...(!establishment.geoApprox && establishment.latitude != null && establishment.longitude != null && {
          "geo": { "@type": "GeoCoordinates", "latitude": establishment.latitude, "longitude": establishment.longitude },
        }),
        ...(establishment.description && { "description": establishment.description }),
        "address": {
          "@type": "PostalAddress",
          "streetAddress": establishment.adresse,
          "addressLocality": establishment.city.name,
          "addressCountry": "MA",
        },
        ...(establishment.phone && { "telephone": establishment.phone }),
        ...(establishment.website && { "sameAs": establishment.website }),
        ...(avgRating > 0 && establishment._count.reviews > 0 && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": avgRating.toFixed(1),
            "reviewCount": establishment._count.reviews,
            "bestRating": "5",
            "worstRating": "1",
          },
        }),
        ...(establishment.reviews.length > 0 && {
          "review": establishment.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": r.note, "bestRating": 5, "worstRating": 1 },
            "author": { "@type": "Person", "name": r.auteur || "Anonyme" },
            "datePublished": r.createdAt.toISOString().slice(0, 10),
            ...(r.commentaire && { "reviewBody": r.commentaire }),
          })),
        }),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.schema.home, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": listLabel, "item": `${BASE}/laboratoires` },
          { "@type": "ListItem", "position": 3, "name": establishment.nom, "item": `${BASE}/laboratoires/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EstablishmentProfile
        establishment={establishment}
        listHref="/laboratoires"
        listLabel={listLabel}
        locale={locale}
      />
    </>
  );
}
