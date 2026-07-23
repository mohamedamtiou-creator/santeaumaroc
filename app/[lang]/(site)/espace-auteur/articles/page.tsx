import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { toLocale } from "@/lib/i18n";
import { espaceContent } from "@/lib/espace-content";
import { EDITORIAL_STATUS, EDITORIAL_LABELS, type EditorialStatus } from "@/lib/contributor";
import type { Prisma } from "@prisma/client";

const toneCls: Record<string, string> = {
  grey: "bg-slate-100 text-slate-600", blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700",
  green: "bg-secondary-50 text-secondary-700", rose: "bg-red-50 text-red-700",
};
const REVIEW: string[] = [EDITORIAL_STATUS.SUBMITTED, EDITORIAL_STATUS.IN_REVIEW, EDITORIAL_STATUS.APPROVED];
const FILTERS: { key: string; tkey: "all" | "drafts" | "changes" | "review" | "published"; match: (s: string) => boolean }[] = [
  { key: "ALL", tkey: "all", match: () => true },
  { key: "DRAFT", tkey: "drafts", match: (s) => s === EDITORIAL_STATUS.DRAFT },
  { key: "CHANGES", tkey: "changes", match: (s) => s === EDITORIAL_STATUS.CHANGES_REQUESTED },
  { key: "REVIEW", tkey: "review", match: (s) => REVIEW.includes(s) },
  { key: "PUBLISHED", tkey: "published", match: (s) => s === EDITORIAL_STATUS.PUBLISHED },
];

export default async function MyArticlesPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ statut?: string }> }) {
  const locale = toLocale((await params).lang);
  const t = espaceContent(locale);
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA");
  const session = await verifySession();
  const sp = await searchParams;
  const statut = FILTERS.some((f) => f.key === sp.statut) ? sp.statut! : "ALL";

  const whereFor = (key: string): Prisma.PostWhereInput => {
    const base = { authorId: session.userId };
    switch (key) {
      case "DRAFT": return { ...base, editorialStatus: EDITORIAL_STATUS.DRAFT };
      case "CHANGES": return { ...base, editorialStatus: EDITORIAL_STATUS.CHANGES_REQUESTED };
      case "REVIEW": return { ...base, editorialStatus: { in: REVIEW } };
      case "PUBLISHED": return { ...base, editorialStatus: EDITORIAL_STATUS.PUBLISHED };
      default: return base;
    }
  };

  const [posts, grouped] = await Promise.all([
    prisma.post.findMany({ where: whereFor(statut), orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, title: true, slug: true, editorialStatus: true, updatedAt: true, views: true, qualityScore: true } }),
    prisma.post.groupBy({ by: ["editorialStatus"], where: { authorId: session.userId }, _count: { _all: true } }),
  ]);
  const countFor = (key: string) => grouped.filter((g) => FILTERS.find((f) => f.key === key)!.match(g.editorialStatus)).reduce((s, g) => s + g._count._all, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900" dir="auto">{t.articlesTitle}</h2>
        <Link href="/espace-auteur/articles/nouveau" className="btn-primary px-4 py-2 text-sm">{t.btnNew}</Link>
      </div>

      <nav className="flex flex-wrap gap-1.5 overflow-x-auto -mx-1 px-1" aria-label={t.articlesTitle}>
        {FILTERS.map((f) => {
          const active = statut === f.key;
          return (
            <Link key={f.key} href={f.key === "ALL" ? "/espace-auteur/articles" : `/espace-auteur/articles?statut=${f.key}`} aria-current={active ? "page" : undefined}
              className={`shrink-0 text-sm px-3 py-1.5 rounded-lg border ${active ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {t.filters[f.tkey]} <span className="tabular-nums text-slate-400">{nf.format(countFor(f.key))}</span>
            </Link>
          );
        })}
      </nav>

      {posts.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 mb-3" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 3 15 7 7 15H3v-4z" /><path d="M9.5 4.5 13.5 8.5" /></svg>
          </span>
          <p className="text-slate-600 mb-4" dir="auto">{statut === "ALL" ? t.emptyAll : t.emptyFiltered}</p>
          <Link href="/espace-auteur/articles/nouveau" className="btn-primary px-5 py-2.5 text-sm">{t.emptyCta}</Link>
        </div>
      ) : (
        <ul className="space-y-2 list-none m-0 p-0">
          {posts.map((p) => {
            const meta = EDITORIAL_LABELS[p.editorialStatus as EditorialStatus] ?? EDITORIAL_LABELS.DRAFT;
            const published = p.editorialStatus === EDITORIAL_STATUS.PUBLISHED;
            const needsWork = p.editorialStatus === EDITORIAL_STATUS.CHANGES_REQUESTED;
            return (
              <li key={p.id}>
                <div className={`card p-4 flex flex-wrap items-center justify-between gap-3 ${needsWork ? "border-amber-200" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate" dir="auto">{p.title || t.untitled}</p>
                    <p className="text-xs text-slate-400 mt-0.5 tabular-nums" dir="auto">
                      {t.modifiedOn} {p.updatedAt.toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR")}
                      {published && <> · {nf.format(p.views)} {t.viewsSuffix}</>}
                      {p.qualityScore != null && <> · {t.qualitySuffix} {p.qualityScore}/100</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${toneCls[meta.tone]}`}>{locale === "ar" ? meta.labelAr ?? meta.label : meta.label}</span>
                    {published ? (
                      <Link href={`/blog/${p.slug}`} className="text-sm text-primary-700 font-medium hover:underline">{t.actionView}</Link>
                    ) : (
                      <Link href={`/espace-auteur/articles/${p.id}`} className="text-sm text-primary-700 font-medium hover:underline">{needsWork ? t.actionFix : t.actionEdit}</Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
