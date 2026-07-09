import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { getDictionary, type Locale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { getDoctorInitials, formatDoctorName, hasReliableRating } from "@/lib/utils";
import { isProPlan } from "@/lib/plan";
import { answersLabel } from "@/lib/qa";
import { QuestionCard, type QuestionCardData } from "@/components/qa/QuestionCard";
import { QaSafetyNote } from "@/components/qa/QaSafetyNote";
import { SpecialtyIcon } from "@/components/qa/SpecialtyIcon";
import { FaqAccordion } from "@/components/ui/FaqAccordion";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 shrink-0 text-secondary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7.5" /></svg>
  );
}

/**
 * Homepage de l'espace Questions / Réponses — rendue sur /questions en l'absence
 * de filtre. Sections : hero + recherche, stats réelles, questions tendances,
 * catégories, médecins actifs, « comment ça marche », SEO/FAQ + maillage.
 * Composant serveur (données réelles, JS client nul).
 */
export async function QaHome({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).qa;
  const nf = locale === "ar" ? "ar-MA" : "fr";

  const [qCount, docCount, specCount, ansCount, trending, categories, topDoctors] = await Promise.all([
    prisma.question.count({ where: { status: "PUBLISHED" } }),
    prisma.doctor.count({ where: { isActive: true, answers: { some: { status: "PUBLISHED" } } } }),
    prisma.specialty.count({ where: { questions: { some: { status: "PUBLISHED" } } } }),
    prisma.answer.count({ where: { status: "PUBLISHED" } }),
    prisma.question.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ views: "desc" }, { answersCount: "desc" }, { publishedAt: "desc" }],
      take: 6,
      select: {
        slug: true, title: true, titleAr: true, arReviewedAt: true, answersCount: true, views: true, publishedAt: true,
        specialty: { select: { name: true, slug: true } },
        answers: {
          where: { status: "PUBLISHED" },
          orderBy: [{ isAccepted: "desc" }, { score: "desc" }],
          take: 1,
          select: { doctor: { select: { slug: true, prenom: true, nom: true, civilite: true, isVerified: true } } },
        },
      },
    }),
    prisma.specialty.findMany({
      where: { questions: { some: { status: "PUBLISHED" } } },
      select: { name: true, slug: true, _count: { select: { questions: true } } },
      orderBy: { questions: { _count: "desc" } },
      take: 8,
    }),
    prisma.doctor.findMany({
      where: { isActive: true, isBlacklisted: false, slug: { not: null }, answers: { some: { status: "PUBLISHED" } } },
      orderBy: { answers: { _count: "desc" } },
      take: 4,
      select: {
        slug: true, nom: true, prenom: true, civilite: true, avatar: true, isVerified: true,
        plan: true, planExpiresAt: true, averageRating: true,
        specialty: { select: { name: true } }, city: { select: { name: true } },
        _count: { select: { answers: true, reviews: { where: { isPublic: true } } } },
      },
    }),
  ]);

  const faqs = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 },
  ];

  const jsonLd = {
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
        "itemListOrder": "https://schema.org/ItemListOrderDescending",
        "numberOfItems": trending.length,
        "itemListElement": trending.map((q, i) => ({ "@type": "ListItem", "position": i + 1, "url": `${BASE}/questions/${q.slug}`, "name": q.title })),
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map((f) => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.home, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.breadcrumb, "item": `${BASE}/questions` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(58% 60% at 10% 0%, rgba(37,99,235,.09), transparent 70%), radial-gradient(52% 55% at 96% 8%, rgba(5,150,105,.09), transparent 70%), linear-gradient(180deg, #ffffff 0%, #f6f8fb 100%)",
          }}
        />
        <div className="page-outer py-12 sm:py-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-200 px-3.5 py-1.5 text-sm font-semibold">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5 2.5 4v3.5c0 3 2.3 5.3 5.5 6.5 3.2-1.2 5.5-3.5 5.5-6.5V4L8 1.5z" /><path d="m5.8 8 1.6 1.6L10.5 6.5" /></svg>
              {t.heroTrust}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.07] text-slate-900">
              {t.heroTitleA}<br /><span className="text-gradient-brand">{t.heroTitleB}</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-xl">{t.heroSub}</p>

            <form action="/questions" method="get" className="mt-7 bg-white rounded-2xl border border-slate-200 shadow-md p-2 flex flex-col sm:flex-row gap-2 max-w-xl" role="search">
              <label className="flex items-center gap-2.5 px-2 flex-1 min-w-0 rounded-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-500">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="4.5" /><path d="m11 11 3 3" /></svg>
                <span className="sr-only">{t.searchAria}</span>
                <input type="search" name="q" placeholder={t.search} className="w-full border-0 outline-none bg-transparent py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400" />
              </label>
              {/* Action primaire unique de la barre = la recherche (découverte
                  d'une réponse existante = entrée principale du hub Q/R). */}
              <button type="submit" className="btn-primary text-sm px-6 justify-center whitespace-nowrap">{t.searchButton}</button>
            </form>

            {/* « Poser une question » = chemin secondaire (fallback si aucune
                réponse trouvée), pour ne pas concurrencer la recherche. */}
            <p className="mt-3.5 text-sm text-slate-600">
              {t.askPrompt}{" "}
              <Link href="/questions/poser" className="font-semibold text-primary-700 hover:text-primary-800 underline underline-offset-2 whitespace-nowrap">
                {t.ask} <span aria-hidden="true">→</span>
              </Link>
            </p>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <li className="inline-flex items-center gap-1.5"><Check />{t.reGratuit}</li>
              <li className="inline-flex items-center gap-1.5"><Check />{t.reVerifie}</li>
              <li className="inline-flex items-center gap-1.5"><Check />{t.reDelai}</li>
              <li className="inline-flex items-center gap-1.5"><Check />{t.reConfidentiel}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Note sécurité YMYL ── */}
      <div className="page-outer pb-8 sm:pb-10">
        <QaSafetyNote t={t} />
      </div>

      {/* ── Trending — contenu réel remonté AU-DESSUS des stats : on montre des
          questions dès le pli, pas seulement du marketing (cf. audit densité). ── */}
      {trending.length > 0 && (
        <section className="page-outer pt-8 sm:pt-10 pb-0">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <p className="section-eyebrow mb-1.5">{t.nowEyebrow}</p>
              <h2 className="section-title">{t.trendingTitle}</h2>
              <p className="section-subtitle mt-1">{t.trendingSub}</p>
            </div>
            <Link href="/questions?tri=recent" className="text-sm font-semibold text-secondary-600 hover:text-secondary-700 whitespace-nowrap">{t.browseAll} →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
            {trending.map((q) => (
              <QuestionCard key={q.slug} q={q as QuestionCardData} t={t} locale={locale} as="h3" />
            ))}
          </div>
        </section>
      )}

      {/* ── Stats ── */}
      <section className="bg-slate-900 text-white mt-12 sm:mt-16">
        <div className="page-outer py-8 sm:py-10">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-7">
            {[
              { n: qCount, l: t.statQuestions },
              { n: docCount, l: t.statDoctors },
              { n: specCount, l: t.statSpecialties },
              { n: ansCount, l: t.statAnswers },
            ].map((s) => (
              <div key={s.l}>
                <dd className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums" dir="ltr">{s.n.toLocaleString(nf)}</dd>
                <dt className="text-sm text-slate-400 mt-0.5">{s.l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Categories (bande teintée : rupture de rythme) ── */}
      {categories.length > 0 && (
        <section className="mt-12 sm:mt-16 bg-slate-50/70 border-y border-slate-100">
          <div className="page-outer py-12 sm:py-16">
            <p className="section-eyebrow mb-1.5">{t.exploreEyebrow}</p>
            <h2 className="section-title">{t.categoriesTitle}</h2>
            <p className="section-subtitle mt-1 mb-6">{t.categoriesSub}</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {categories.map((c) => (
                <Link key={c.slug} href={`/questions/specialite/${c.slug}`} className="card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
                  <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                    <SpecialtyIcon name={c.name} className="w-5 h-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-slate-900 text-[15px] leading-tight truncate">{tSpecialty(c.name, locale)}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{t.qCount.replace("{n}", c._count.questions.toLocaleString(nf))}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Top doctors ── */}
      {topDoctors.length > 0 && (
        <section className="page-outer pt-12 sm:pt-16 pb-0">
          <p className="section-eyebrow mb-1.5">{t.communityEyebrow}</p>
          <h2 className="section-title">{t.topDoctorsTitle}</h2>
          <p className="section-subtitle mt-1 mb-6">{t.topDoctorsSub}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topDoctors.map((d) => {
              const name = formatDoctorName(d);
              const pro = isProPlan(d.plan, d.planExpiresAt);
              return (
                <div key={d.slug} className="card p-4 flex items-center gap-3.5">
                  <div className="avatar-ring w-12 h-12 shrink-0">
                    <div className="avatar-ring-inner grid place-items-center bg-primary-50 text-primary-700 font-bold text-sm">{getDoctorInitials(d.prenom, d.nom)}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 flex items-center gap-2 flex-wrap leading-tight">
                      <Link href={`/praticiens/${d.slug}`} className="hover:text-primary-700">{name}</Link>
                      {d.isVerified && <span className="badge-verified text-[11px]"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true"><path d="m4 8 3 3 5-6" /></svg>{t.verifiedBadge}</span>}
                      {pro && <span className="inline-flex items-center rounded-md bg-accent-50 text-accent-700 border border-accent-200 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide">PRO</span>}
                    </p>
                    <p className="text-[13px] text-slate-500 mt-0.5">{tSpecialty(d.specialty.name, locale)}{d.city?.name ? ` · ${d.city.name}` : ""}</p>
                    <p className="text-xs text-slate-400 mt-1.5 flex gap-3">
                      <span className="text-secondary-600 font-semibold">{answersLabel(d._count.answers, t.oneAnswer, t.manyAnswers)}</span>
                      {hasReliableRating(d.averageRating, d._count.reviews) && <span className="text-accent-600 font-semibold">★ {d.averageRating.toFixed(1)}</span>}
                    </p>
                  </div>
                  <Link href={`/praticiens/${d.slug}`} className="btn-outline text-sm py-2 px-4 shrink-0">{t.rdvShort}</Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── How it works ── */}
      <section className="mt-12 sm:mt-16 bg-white border-y border-slate-100">
        <div className="page-outer py-12 sm:py-16">
          <p className="section-eyebrow mb-1.5">{t.howEyebrow}</p>
          <h2 className="section-title mb-8">{t.howTitle}</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 list-none p-0 m-0">
            {[
              { n: "1", T: t.step1T, D: t.step1D },
              { n: "2", T: t.step2T, D: t.step2D },
              { n: "3", T: t.step3T, D: t.step3D },
            ].map((s) => (
              <li key={s.n} className="card p-5">
                <span className="w-9 h-9 rounded-xl bg-primary-600 text-white grid place-items-center font-extrabold text-[15px] mb-3.5">{s.n}</span>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">{s.T}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.D}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── SEO / FAQ + maillage ── */}
      <section className="page-outer py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8">
          <div>
            <p className="section-eyebrow mb-1.5">{t.essentialTitle}</p>
            <h2 className="section-title mb-3">{t.listTitle}</h2>
            <p className="text-slate-600 leading-relaxed mb-6 max-w-prose">{t.listSubtitle}</p>
            <h3 className="font-bold text-slate-900 text-base mb-3">{t.faqTitle}</h3>
            <FaqAccordion faqs={faqs} />
          </div>
          <aside>
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-3">{t.allSpecialties}</h3>
              <div className="flex flex-wrap gap-2 mb-5">
                {categories.slice(0, 8).map((c) => (
                  <Link key={c.slug} href={`/questions/specialite/${c.slug}`} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors">{tSpecialty(c.name, locale)}</Link>
                ))}
              </div>
              <Link href="/questions/poser" className="btn-primary w-full justify-center text-sm py-2.5">{t.ask}</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
