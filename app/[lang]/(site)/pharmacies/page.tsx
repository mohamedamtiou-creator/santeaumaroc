import type { Metadata } from "next";
import { EstablishmentList } from "@/components/EstablishmentList";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const m = getDictionary(locale).estab.meta;
  const title = m.pharmaciesTitle;
  const description = m.pharmaciesDesc;
  return {
    title,
    description,
    alternates: localizedAlternates("/pharmacies", locale),
    openGraph: { title, description, url: "/pharmacies", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

type Params = Promise<{ lang: string }>;
type SearchParams = Promise<{ q?: string; ville?: string; type?: string; page?: string }>;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

export default async function PharmaciesPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { q = "", ville = "", type = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).estab;
  const s = t.schema;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${BASE}/pharmacies#page`,
        "name": s.pharmaciesName,
        "url": `${BASE}/pharmacies`,
        "description": s.pharmaciesDesc,
        "inLanguage": locale,
        "about": { "@type": "Pharmacy", "name": s.pharmaciesName },
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}/#website`, "url": BASE, "name": "SantéauMaroc" },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": s.home, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.pharmaciesTitle, "item": `${BASE}/pharmacies` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="page-outer">

      {/* ── En-tête ──────────────────────────────── */}
      <div className="mb-8">
        <p className="section-eyebrow mb-2">{t.pharmaciesEyebrow}</p>
        <h1 className="section-title">{t.pharmaciesTitle}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.pharmaciesSubtitle}
        </p>
        <div className="mt-4 h-px bg-slate-100" />
      </div>

      <EstablishmentList
        types={["pharmacie"]}
        baseHref="/pharmacies"
        q={q}
        ville={ville}
        type={type}
        page={page}
        locale={locale}
      />
    </div>
    </>
  );
}
