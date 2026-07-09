import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n-server";
import { frenchOnlyAlternates } from "@/lib/hreflang";
import { getDictionary } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { QuestionCard } from "@/components/qa/QuestionCard";
import { QuestionsInfinite } from "@/components/qa/QuestionsInfinite";
import { QaHome } from "@/components/qa/QaHome";
import { QaSafetyNote } from "@/components/qa/QaSafetyNote";
import { searchQuestions } from "@/lib/qa-search";
import { Prisma } from "@prisma/client";

export const revalidate = 300;

const PAGE_SIZE = 12;
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

type SearchParams = Promise<{ q?: string; specialite?: string; tri?: string; page?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q = "", specialite = "", tri: triRaw } = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale).qa;
  const isFiltered = !!(q || specialite || triRaw);
  // Contenu Q/R français uniquement : on ne déclare pas d'alternative arabe
  // (cf. frenchOnlyAlternates) et on sert la vue arabe en noindex tant que le
  // contenu n'est pas traduit. Les vues filtrées restent noindex (infinite
  // scroll : pas d'URL paginées → canonical unique vers /questions).
  const noindex = isFiltered || locale === "ar";
  return {
    title: t.metaListTitle,
    description: t.metaListDesc,
    ...(!isFiltered && { alternates: frenchOnlyAlternates("/questions") }),
    ...(noindex && { robots: { index: false, follow: true } }),
    openGraph: { title: t.metaListTitle, description: t.metaListDesc, url: "/questions", type: "website" },
  };
}

export default async function QuestionsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", specialite = "", tri: triRaw } = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.qa;

  // Aucun paramètre → homepage Q&R éditoriale. Sinon → mode résultats (liste).
  if (!q && !specialite && !triRaw) {
    return <QaHome locale={locale} />;
  }
  const tri = triRaw ?? "recent";

  const CARD_SELECT = {
    id: true, slug: true, title: true, titleAr: true, arReviewedAt: true, answersCount: true, views: true, publishedAt: true,
    specialty: { select: { name: true, slug: true } },
    answers: {
      where: { status: "PUBLISHED" },
      orderBy: [{ isAccepted: "desc" }, { score: "desc" }],
      take: 1,
      select: { doctor: { select: { slug: true, prenom: true, nom: true, civilite: true, isVerified: true } } },
    },
  } satisfies Prisma.QuestionSelect;

  const specialtiesPromise = prisma.specialty.findMany({
    where: { questions: { some: { status: "PUBLISHED" } } },
    select: { slug: true, name: true },
    orderBy: { questions: { _count: "desc" } },
    take: 16,
  });

  // Recherche `q` → moteur full-text tolérant (accents + fautes, cf lib/qa-search) ;
  // sinon → filtres/tri Prisma classiques.
  const { questions, total } = await (async () => {
    if (q) {
      const res = await searchQuestions(q, {
        specialtySlug: specialite || undefined,
        unansweredOnly: tri === "sans-reponse",
        limit: PAGE_SIZE,
        offset: 0,
      });
      const rows = res.ids.length
        ? await prisma.question.findMany({ where: { id: { in: res.ids } }, select: CARD_SELECT })
        : [];
      const pos = new Map(res.ids.map((id, i) => [id, i]));
      rows.sort((a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0));
      return { questions: rows, total: res.total };
    }
    const where = {
      status: "PUBLISHED" as const,
      ...(specialite ? { specialty: { slug: specialite } } : {}),
      ...(tri === "sans-reponse" ? { answersCount: 0 } : {}),
    };
    const orderBy =
      tri === "populaires"
        ? [{ views: "desc" as const }, { answersCount: "desc" as const }]
        : [{ publishedAt: "desc" as const }];
    const [rows, count] = await Promise.all([
      prisma.question.findMany({ where, orderBy, take: PAGE_SIZE, select: CARD_SELECT }),
      prisma.question.count({ where }),
    ]);
    return { questions: rows, total: count };
  })();

  const specialties = await specialtiesPromise;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const isFiltered = !!(q || specialite || tri !== "recent");

  // H1 descriptif du contenu réellement affiché (≠ titre marketing générique) :
  // recherche → « Résultats pour … » ; filtre sans-réponse → intitulé dédié ;
  // sinon → « Toutes les questions » (recent/populaires = même ensemble, tri près).
  const listHeading = q
    ? t.resultsFor.replace("{q}", q)
    : tri === "sans-reponse"
      ? t.listUnanswered
      : t.allQuestions;

  const sortLink = (key: string, label: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (specialite) params.set("specialite", specialite);
    if (key !== "recent") params.set("tri", key);
    const active = tri === key || (key === "recent" && tri === "recent");
    return (
      <Link
        key={key}
        href={`/questions${params.toString() ? `?${params}` : ""}`}
        className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
          active ? "bg-primary-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
        }`}
      >
        {label}
      </Link>
    );
  };

  // JSON-LD : CollectionPage + ItemList + BreadcrumbList (vue non filtrée).
  const showSchema = !isFiltered;
  const jsonLd = showSchema
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            "@id": `${BASE}/questions#page`,
            "name": t.metaListTitle,
            "url": `${BASE}/questions`,
            "description": t.metaListDesc,
            "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
            "isPartOf": { "@type": "WebSite", "@id": `${BASE}/#website` },
          },
          {
            "@type": "ItemList",
            "numberOfItems": questions.length,
            "itemListElement": questions.map((qq, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "url": `${BASE}/questions/${qq.slug}`,
              "name": qq.title,
            })),
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": t.home, "item": BASE },
              { "@type": "ListItem", "position": 2, "name": t.breadcrumb, "item": `${BASE}/questions` },
            ],
          },
        ],
      }
    : null;

  return (
    <div className="page-outer">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      )}

      <header className="mb-6">
        <p className="section-eyebrow mb-1.5">{t.eyebrow}</p>
        <h1 className="section-title" dir="auto">{listHeading}</h1>
        <p className="section-subtitle mt-2">{t.listSubtitle}</p>
        <div className="mt-5">
          <Link href="/questions/poser" className="btn-primary inline-flex text-sm py-2.5 px-5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 me-1.5" aria-hidden="true" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
            {t.ask}
          </Link>
        </div>
      </header>

      <div className="mb-5">
        <QaSafetyNote t={t} />
      </div>

      {/* Recherche */}
      <form action="/questions" method="get" className="mb-4">
        {specialite && <input type="hidden" name="specialite" value={specialite} />}
        {tri !== "recent" && <input type="hidden" name="tri" value={tri} />}
        <div className="relative">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t.search}
            aria-label={t.searchAria}
            className="input-field ps-10"
          />
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="4.5" /><path d="m11 11 3 3" /></svg>
        </div>
      </form>

      {/* Tri */}
      <div className="flex flex-wrap gap-2 mb-5">
        {sortLink("recent", t.sortRecent)}
        {sortLink("populaires", t.sortPopular)}
        {sortLink("sans-reponse", t.sortUnanswered)}
      </div>

      <p className="text-sm text-slate-500 mb-3" role="status" aria-live="polite">
        <span className="font-semibold text-slate-700">{total.toLocaleString(locale === "ar" ? "ar-MA" : "fr")}</span>{" "}
        {total === 1 ? t.foundOne : t.foundMany}
        {isFiltered && (
          <>
            {" · "}
            <Link href="/questions" className="text-secondary-600 hover:text-secondary-700 underline underline-offset-2 font-medium">{t.showAll}</Link>
          </>
        )}
      </p>

      {questions.length === 0 ? (
        <div className="empty-state">
          <p className="font-semibold text-slate-700">{t.emptyTitle}</p>
          <p className="text-sm text-slate-500">{t.emptyText}</p>
          <Link href="/questions/poser" className="btn-primary mt-3 text-sm">{t.ask}</Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {questions.map((qq) => (
              <QuestionCard key={qq.slug} q={qq} t={t} locale={locale} />
            ))}
          </div>
          {/* Pages suivantes chargées au défilement (page 1 ci-dessus = SSR/SEO) */}
          <QuestionsInfinite
            q={q}
            specialite={specialite}
            tri={tri}
            totalPages={totalPages}
            noAnswerYet={t.noAnswerYet}
            loadingLabel={t.loading}
            moreLabel={t.loadMore}
            answeredByLabel={t.answeredBy}
            verifiedLabel={t.verifiedBadge}
          />
        </>
      )}

      {/* Maillage : spécialités */}
      {showSchema && specialties.length > 0 && (
        <section className="card p-5 sm:p-6 mt-10">
          <h2 className="font-semibold text-slate-900 text-base mb-4">{t.allSpecialties}</h2>
          <div className="flex flex-wrap gap-2">
            {specialties.map((s) => (
              <Link
                key={s.slug}
                href={`/questions/specialite/${s.slug}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
              >
                {tSpecialty(s.name, locale)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
