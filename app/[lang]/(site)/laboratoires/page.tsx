import type { Metadata } from "next";
import { EstablishmentList } from "@/components/EstablishmentList";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const m = getDictionary(locale).estab.meta;
  const title = m.laboratoiresTitle;
  const description = m.laboratoiresDesc;
  return {
    title,
    description,
    alternates: localizedAlternates("/laboratoires", locale),
    openGraph: { title, description, url: "/laboratoires", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

type Params = Promise<{ lang: string }>;
type SearchParams = Promise<{ q?: string; ville?: string; page?: string }>;

export default async function LaboratoiresPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { q = "", ville = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).estab;

  return (
    <div className="page-outer">

      {/* ── En-tête ──────────────────────────────── */}
      <div className="mb-8">
        <p className="section-eyebrow mb-2">{t.laboratoiresEyebrow}</p>
        <h1 className="section-title">{t.laboratoiresTitle}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.laboratoiresSubtitle}
        </p>
        <div className="mt-4 h-px bg-slate-100" />
      </div>

      <EstablishmentList
        types={["laboratoire"]}
        baseHref="/laboratoires"
        q={q}
        ville={ville}
        type="laboratoire"
        page={page}
        locale={locale}
      />
    </div>
  );
}
