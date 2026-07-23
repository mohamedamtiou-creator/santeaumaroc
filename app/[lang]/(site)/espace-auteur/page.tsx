import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { getContributorUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { toLocale } from "@/lib/i18n";
import { espaceContent } from "@/lib/espace-content";
import { EDITORIAL_STATUS, EDITORIAL_LABELS, isVerifiedAuthor, AUTHOR_STATUS, type EditorialStatus } from "@/lib/contributor";

async function getAnalytics(userId: string) {
  const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  since.setUTCHours(0, 0, 0, 0);
  const rows = await prisma.articleAnalytics.findMany({ where: { post: { authorId: userId }, day: { gte: since } }, select: { day: true, views: true, reads: true } });
  const days = Array.from({ length: 30 }, () => ({ views: 0, reads: 0 }));
  let totalViews = 0, totalReads = 0;
  for (const r of rows) {
    const offset = Math.floor((r.day.getTime() - since.getTime()) / 86_400_000);
    if (offset >= 0 && offset < 30) { days[offset].views += r.views; days[offset].reads += r.reads; }
    totalViews += r.views; totalReads += r.reads;
  }
  return { days, totalViews, totalReads };
}

export default async function AuthorDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const t = espaceContent(locale);
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA");
  const user = await getContributorUser();

  const [grouped, viewsAgg, actionItems, analytics, badges] = await Promise.all([
    prisma.post.groupBy({ by: ["editorialStatus"], where: { authorId: user.id }, _count: { _all: true } }),
    prisma.post.aggregate({ where: { authorId: user.id, status: "PUBLISHED" }, _sum: { views: true } }),
    prisma.post.findMany({
      where: { authorId: user.id, editorialStatus: { in: [EDITORIAL_STATUS.CHANGES_REQUESTED, EDITORIAL_STATUS.DRAFT] } },
      orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, editorialStatus: true },
    }),
    getAnalytics(user.id),
    prisma.authorBadge.findMany({ where: { userId: user.id }, select: { badge: { select: { code: true, label: true, labelAr: true } } } }),
  ]);

  const countOf = (s: string) => grouped.find((g) => g.editorialStatus === s)?._count._all ?? 0;
  const published = countOf(EDITORIAL_STATUS.PUBLISHED);
  const inReview = countOf(EDITORIAL_STATUS.SUBMITTED) + countOf(EDITORIAL_STATUS.IN_REVIEW) + countOf(EDITORIAL_STATUS.APPROVED);
  const changes = countOf(EDITORIAL_STATUS.CHANGES_REQUESTED);
  const draftsOnly = countOf(EDITORIAL_STATUS.DRAFT);
  const drafts = draftsOnly + changes;
  const totalPosts = grouped.reduce((s, g) => s + g._count._all, 0);
  const views = viewsAgg._sum.views ?? 0;
  const maxDay = Math.max(1, ...analytics.days.map((d) => d.views));

  const verified = isVerifiedAuthor(user.authorStatus);
  const pendingVerif = user.authorStatus === AUTHOR_STATUS.PENDING;
  const firstName = (user.name || "").split(" ").slice(-1)[0] || user.name || "";
  const firstChange = actionItems.find((a) => a.editorialStatus === EDITORIAL_STATUS.CHANGES_REQUESTED);
  const firstDraft = actionItems.find((a) => a.editorialStatus === EDITORIAL_STATUS.DRAFT);

  // ── Prochaine action adaptée à l'état ──
  let variant: keyof typeof t.next = "keep";
  let href = "/espace-auteur/articles/nouveau";
  let titleArg = "";
  if (!verified && !pendingVerif) { variant = "verify"; href = "/espace-auteur/verification"; }
  else if (firstChange) { variant = "changes"; href = `/espace-auteur/articles/${firstChange.id}`; titleArg = firstChange.title || t.untitled; }
  else if (pendingVerif && published === 0) { variant = "pending"; }
  else if (published === 0 && totalPosts === 0) { variant = "first"; }
  else if (firstDraft) { variant = "draft"; href = `/espace-auteur/articles/${firstDraft.id}`; titleArg = firstDraft.title || t.untitled; }
  const [nTitle, nDescRaw, nCta] = t.next[variant];
  const nDesc = nDescRaw.replace("{title}", titleArg);
  const tone: "primary" | "amber" | "blue" = variant === "verify" || variant === "changes" ? "amber" : variant === "pending" ? "blue" : "primary";

  const kpis = [
    { label: t.kpi.published, value: published, accent: "text-secondary-700" },
    { label: t.kpi.inReview, value: inReview, accent: "text-blue-700" },
    { label: t.kpi.drafts, value: drafts, accent: "text-amber-700" },
    { label: t.kpi.views, value: views, accent: "text-primary-700" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-slate-500" dir="auto">{t.hello.replace("{name}", firstName)}</p>
        <h2 className="text-xl font-bold text-slate-900" dir="auto">{t.spaceTitle}</h2>
      </div>

      {/* Prochaine action */}
      {tone === "primary" ? (
        <section className="hero-bg rounded-2xl overflow-hidden relative p-6 sm:p-7" aria-labelledby="next-title">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} aria-hidden="true" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div>
              <h3 id="next-title" className="text-xl font-bold text-white mb-1" dir="auto">{nTitle}</h3>
              <p className="text-white/80 text-sm max-w-xl" dir="auto">{nDesc}</p>
            </div>
            <Link href={href} className="btn-primary bg-white text-primary-800 hover:bg-white/90 px-5 py-3 text-sm font-semibold shrink-0 justify-center">{nCta}</Link>
          </div>
        </section>
      ) : (
        <section className={`rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between ${tone === "amber" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`} aria-labelledby="next-title">
          <div>
            <h3 id="next-title" className={`text-lg font-bold mb-1 ${tone === "amber" ? "text-amber-900" : "text-blue-900"}`} dir="auto">{nTitle}</h3>
            <p className={`text-sm max-w-xl ${tone === "amber" ? "text-amber-800/90" : "text-blue-800/90"}`} dir="auto">{nDesc}</p>
          </div>
          <Link href={href} className="btn-primary px-5 py-3 text-sm font-semibold shrink-0 justify-center">{nCta}</Link>
        </section>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-500" dir="auto">{t.badgesLabel}</span>
          {badges.map((b) => (
            <span key={b.badge.code} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-50 text-secondary-700">
              <span aria-hidden="true">🏅</span>{locale === "ar" ? b.badge.labelAr ?? b.badge.label : b.badge.label}
            </span>
          ))}
        </div>
      )}

      {/* KPIs */}
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <dd className={`text-3xl font-bold tabular-nums ${k.accent}`}>{nf.format(k.value)}</dd>
            <dt className="text-sm text-slate-500 mt-1" dir="auto">{k.label}</dt>
          </div>
        ))}
      </dl>

      {/* Audience */}
      <section aria-labelledby="audience-title">
        <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
          <h2 id="audience-title" className="text-lg font-bold text-slate-900" dir="auto">{t.audienceTitle}</h2>
          <p className="text-sm text-slate-500 tabular-nums" dir="auto">
            <span className="font-semibold text-slate-700">{nf.format(analytics.totalViews)}</span> {t.views} ·{" "}
            <span className="font-semibold text-slate-700">{nf.format(analytics.totalReads)}</span> {t.reads}
          </p>
        </div>
        <div className="card p-5">
          {analytics.totalViews === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4" dir="auto">{t.audienceEmpty}</p>
          ) : (
            <div className="flex items-end gap-0.5 h-24" role="img" aria-label={`${analytics.totalViews} ${t.views}`}>
              {analytics.days.map((d, i) => (
                <div key={i} className="flex-1 rounded-t bg-primary-200 hover:bg-primary-400 transition-colors" style={{ height: `${Math.max(2, (d.views / maxDay) * 100)}%` }} title={`${d.views} ${t.views}`} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* À traiter */}
      {actionItems.length > 0 && (
        <section aria-labelledby="todo-title">
          <h2 id="todo-title" className="text-lg font-bold text-slate-900 mb-3" dir="auto">{t.todoTitle}</h2>
          <ul className="space-y-2 list-none m-0 p-0">
            {actionItems.map((a) => {
              const meta = EDITORIAL_LABELS[a.editorialStatus as EditorialStatus] ?? EDITORIAL_LABELS.DRAFT;
              const amber = a.editorialStatus === EDITORIAL_STATUS.CHANGES_REQUESTED;
              return (
                <li key={a.id}>
                  <Link href={`/espace-auteur/articles/${a.id}`} className="card p-4 flex items-center justify-between gap-3 hover:border-primary-300 transition-colors">
                    <span className="font-medium text-slate-800 truncate" dir="auto">{a.title || t.untitled}</span>
                    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${amber ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{locale === "ar" ? meta.labelAr ?? meta.label : meta.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/espace-auteur/articles/nouveau" className="btn-primary px-5 py-2.5 text-sm">{t.btnNew}</Link>
        <Link href="/espace-auteur/articles" className="btn-outline px-5 py-2.5 text-sm">{t.btnAll}</Link>
      </div>
    </div>
  );
}
