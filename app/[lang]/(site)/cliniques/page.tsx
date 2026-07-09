import type { Metadata } from "next";
import { EstablishmentList } from "@/components/EstablishmentList";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const m = getDictionary(locale).estab.meta;
  const title = m.cliniquesTitle;
  const description = m.cliniquesDesc;
  return {
    title,
    description,
    alternates: localizedAlternates("/cliniques", locale),
    openGraph: { title, description, url: "/cliniques", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

type Params = Promise<{ lang: string }>;
type SearchParams = Promise<{ q?: string; ville?: string; type?: string; page?: string }>;

const TYPES = ["clinique"];

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

export default async function CliniquesPage({
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
        "@id": `${BASE}/cliniques#page`,
        "name": s.cliniquesName,
        "url": `${BASE}/cliniques`,
        "description": s.cliniquesDesc,
        "inLanguage": locale,
        "about": { "@type": "MedicalOrganization", "name": s.cliniquesName },
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}/#website`, "url": BASE, "name": "SantéauMaroc" },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": s.home, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.cliniquesTitle, "item": `${BASE}/cliniques` },
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
        <p className="section-eyebrow mb-1.5">{t.cliniquesEyebrow}</p>
        <h1 className="section-title">{t.cliniquesTitle}</h1>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          {t.cliniquesSubtitle}
        </p>
        <div className="mt-4 h-px"
          style={{ background: "linear-gradient(90deg, #bfdbfe 0%, #a7f3d0 60%, transparent 100%)" }} />
      </header>

      <EstablishmentList
        types={TYPES}
        baseHref="/cliniques"
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
