import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/cache";
import { tryGetSession } from "@/lib/dal";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { qLocalized, aLocalized, isQuestionArReady } from "@/lib/qa-content";
import { getDictionary, toLocale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { isProPlan } from "@/lib/plan";
import { htmlToPlainText } from "@/lib/sanitize-html";
import { formatDoctorName } from "@/lib/utils";
import { incrementQuestionViews } from "@/features/qa/actions";
import { AnswerCard, type AnswerCardData } from "@/components/qa/AnswerCard";
import { AnswerComposer } from "@/components/qa/AnswerComposer";
import { FollowButton, ShareButton } from "@/components/qa/FollowShare";
import { ReportDialog } from "@/components/qa/ReportDialog";
import { UrgencyBanner } from "@/components/qa/UrgencyBanner";
import { QuestionCard, type QuestionCardData } from "@/components/qa/QuestionCard";
import { BookingCard, type BookingDoctor } from "@/components/qa/BookingCard";
import { RecommendedDoctors } from "@/components/qa/RecommendedDoctors";

export const revalidate = 300;
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

type Params = Promise<{ lang: string; slug: string }>;

// Lecture STABLE de la question (identité + réponses publiées + médecins + commentaires),
// cache DURABLE 300 s aligné sur l'ISR de la page. Partagée generateMetadata + rendu.
// L'incrément de vues (write) reste hors cache, fire-and-forget. JSON-safe : aucun
// Decimal sélectionné (Doctor.prix non inclus), Float/Date révivés par Next.
const getQuestion = (slug: string) =>
  cachedQuery(`question:${slug}`, 300, () =>
    prisma.question.findUnique({
      where: { slug },
      include: {
        askedBy: { select: { name: true } },
        specialty: { select: { name: true, slug: true } },
        city: { select: { name: true, slug: true } },
        answers: {
          where: { status: "PUBLISHED" },
          orderBy: { score: "desc" },
          include: {
            doctor: {
              select: {
                id: true, slug: true, nom: true, prenom: true, civilite: true, avatar: true,
                isVerified: true, plan: true, planExpiresAt: true, averageRating: true,
                specialty: { select: { name: true } }, city: { select: { name: true } },
                _count: { select: { reviews: { where: { isPublic: true } } } },
              },
            },
            comments: {
              where: { status: "PUBLISHED" },
              orderBy: { createdAt: "asc" },
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
    }),
  );

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const q = await getQuestion(slug);
  if (!q || q.status === "REJECTED") return { title: "Question introuvable", robots: { index: false } };
  if (q.status === "MERGED" && q.mergedIntoId) {
    const target = await prisma.question.findUnique({ where: { id: q.mergedIntoId }, select: { slug: true } });
    if (target) return { alternates: localizedAlternates(`/questions/${target.slug}`, locale) };
  }
  if (q.status !== "PUBLISHED") return { title: q.title, robots: { index: false } };

  const loc = qLocalized(q, locale);
  const arReady = isQuestionArReady(q);
  const baseTitle = loc.metaTitle || `${loc.title} — Questions/Réponses médicales`;
  // Le layout ajoute « | SantéauMaroc ». Si le metaTitle stocké contient déjà la
  // marque (données migrées), on impose le titre en absolu pour éviter le doublon.
  const title = baseTitle.includes("SantéauMaroc") ? { absolute: baseTitle } : baseTitle;
  const description = loc.metaDesc || (loc.aiSummary ? htmlToPlainText(loc.aiSummary).slice(0, 160) : loc.title);
  return {
    title,
    description,
    // hreflang : alternative arabe uniquement si le contenu AR est relu ; sinon FR seul.
    alternates: arReady ? localizedAlternates(`/questions/${slug}`, locale) : frenchOnlyAlternates(`/questions/${slug}`),
    // En arabe sans contenu AR relu → noindex (le corps retombe gracieusement sur le FR).
    ...(locale === "ar" && !arReady ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title: baseTitle, description, url: `/questions/${slug}`, type: "article" },
  };
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-300 shrink-0" aria-hidden="true"><path d="m6 3 5 5-5 5" strokeLinecap="round" /></svg>
  );
}

export default async function QuestionDetailPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const q = await getQuestion(slug);
  if (!q) notFound();

  // Question fusionnée → redirection 301 vers la cible canonique.
  if (q.status === "MERGED" && q.mergedIntoId) {
    const target = await prisma.question.findUnique({ where: { id: q.mergedIntoId }, select: { slug: true } });
    if (target) permanentRedirect(`/questions/${target.slug}`);
  }
  if (q.status !== "PUBLISHED") notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.qa;

  // Contenu localisé (repli FR gracieux si AR absent/non relu).
  const loc = qLocalized(q, locale);
  const qArReady = isQuestionArReady(q);

  // Garde-fou gouvernance « L'essentiel » (YMYL) : on n'affiche le résumé IA que
  // s'il dérive bien de la réponse ACCEPTÉE actuellement publiée. Interdit
  // l'orphelin (réponse retirée/dé-acceptée) et la divergence (réponse éditée
  // après génération). `sourceId` nul = donnée héritée/seed → toléré tant qu'une
  // réponse acceptée existe. cf lib/qa-summary.
  const acceptedAnswer = q.answers.find((a) => a.isAccepted) ?? null;
  // Résolution gouvernée du texte de « L'essentiel » :
  //  - page AR servie (loc.ar) : le résumé AR n'est servi que s'il a été relu par
  //    un humain APRÈS sa génération (arReviewedAt >= aiSummaryAt) ; sinon masqué
  //    (jamais de traduction AR auto non relue, ni de repli FR non signalé en AR) ;
  //  - sinon (FR, ou AR non prête → page FR de repli) : résumé FR.
  const arSummaryServable =
    !!q.aiSummaryAr && !!q.arReviewedAt && !!q.aiSummaryAt && q.arReviewedAt >= q.aiSummaryAt;
  const summaryText = loc.ar ? (arSummaryServable ? q.aiSummaryAr : null) : q.aiSummary;
  const showSummary =
    !!summaryText &&
    !!acceptedAnswer &&
    (q.aiSummarySourceAnswerId == null || q.aiSummarySourceAnswerId === acceptedAnswer.id);

  const session = await tryGetSession();
  const userId = session?.userId ?? null;
  const isAuthed = !!userId;

  // Votes / remerciements / suivi de l'utilisateur courant.
  const answerIds = q.answers.map((a) => a.id);
  const [votedRows, thankedRows, follow] = await Promise.all([
    userId && answerIds.length
      ? prisma.answerVote.findMany({ where: { userId, answerId: { in: answerIds } }, select: { answerId: true } })
      : Promise.resolve([]),
    userId && answerIds.length
      ? prisma.thank.findMany({ where: { userId, answerId: { in: answerIds } }, select: { answerId: true } })
      : Promise.resolve([]),
    userId
      ? prisma.questionFollow.findUnique({ where: { questionId_userId: { questionId: q.id, userId } }, select: { id: true } })
      : Promise.resolve(null),
  ]);
  const votedSet = new Set(votedRows.map((v) => v.answerId));
  const thankedSet = new Set(thankedRows.map((v) => v.answerId));

  const canAccept = !!userId && (q.askedById === userId || session?.role === "ADMIN");

  // Médecin vérifié sans réponse encore publiée → afficher le composer.
  let showComposer = false;
  if (userId && session?.role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true, isVerified: true, isActive: true, isBlacklisted: true },
    });
    if (doctor?.isVerified && doctor.isActive && !doctor.isBlacklisted) {
      const already = await prisma.answer.findFirst({
        where: { questionId: q.id, doctorId: doctor.id },
        select: { id: true },
      });
      showComposer = !already;
    }
  }

  void incrementQuestionViews(slug);

  const answers: AnswerCardData[] = q.answers.map((a) => ({
    id: a.id,
    body: aLocalized(a, locale, qArReady),
    isAccepted: a.isAccepted,
    upvotes: a.upvotes,
    thanksCount: a.thanksCount,
    createdAt: a.createdAt,
    editedAt: a.editedAt,
    voted: votedSet.has(a.id),
    thanked: thankedSet.has(a.id),
    doctor: {
      slug: a.doctor.slug,
      nom: a.doctor.nom,
      prenom: a.doctor.prenom,
      civilite: a.doctor.civilite,
      avatar: a.doctor.avatar,
      isVerified: a.doctor.isVerified,
      isPro: isProPlan(a.doctor.plan, a.doctor.planExpiresAt),
      specialtyName: a.doctor.specialty.name,
      cityName: a.doctor.city.name,
    },
    comments: a.comments.map((c) => ({ id: c.id, body: c.body, userName: c.user.name, createdAt: c.createdAt })),
  }));

  // Réponse vedette pour la conversion : acceptée sinon la mieux classée.
  const topRaw = q.answers.find((a) => a.isAccepted) ?? q.answers[0] ?? null;
  const bookingDoctor: BookingDoctor | null = topRaw?.doctor?.slug
    ? {
        slug: topRaw.doctor.slug,
        nom: topRaw.doctor.nom,
        prenom: topRaw.doctor.prenom,
        civilite: topRaw.doctor.civilite,
        avatar: topRaw.doctor.avatar,
        isVerified: topRaw.doctor.isVerified,
        isPro: isProPlan(topRaw.doctor.plan, topRaw.doctor.planExpiresAt),
        specialtyName: topRaw.doctor.specialty.name,
        cityName: topRaw.doctor.city.name,
        averageRating: topRaw.doctor.averageRating,
        reviewCount: topRaw.doctor._count.reviews,
      }
    : null;
  const topDoctorId = topRaw?.doctor?.id;

  // Questions similaires (même spécialité) + articles santé à lire.
  const [related, articles] = await Promise.all([
    q.specialtyId
      ? prisma.question.findMany({
          where: { status: "PUBLISHED", specialtyId: q.specialtyId, slug: { not: slug } },
          orderBy: { publishedAt: "desc" },
          take: 4,
          select: { slug: true, title: true, titleAr: true, arReviewedAt: true, answersCount: true, views: true, publishedAt: true, specialty: { select: { name: true, slug: true } } },
        })
      : Promise.resolve([] as QuestionCardData[]),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, readingTime: true, category: { select: { name: true } } },
    }),
  ]);

  const askerName = q.isAnonymous ? t.anonymous : (q.askedBy?.name ?? t.anonymous);

  // ── JSON-LD QAPage + MedicalWebPage + BreadcrumbList ──────────────────────
  const url = `${BASE}/questions/${slug}`;
  const answerNode = (a: AnswerCardData) => {
    const dn = formatDoctorName(a.doctor);
    return {
      "@type": "Answer",
      "text": htmlToPlainText(a.body),
      "url": `${url}#answer-${a.id}`,
      "upvoteCount": a.upvotes,
      "dateCreated": a.createdAt.toISOString(),
      "author": {
        "@type": "Physician",
        "name": dn,
        "medicalSpecialty": a.doctor.specialtyName,
        ...(a.doctor.slug ? { "url": `${BASE}/praticiens/${a.doctor.slug}` } : {}),
      },
    };
  };
  const accepted = answers.find((a) => a.isAccepted) ?? answers[0];
  const suggested = answers.filter((a) => a.id !== accepted?.id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "QAPage",
        "@id": `${url}#qapage`,
        "inLanguage": loc.ar ? "ar-MA" : "fr-MA",
        "mainEntity": {
          "@type": "Question",
          "name": loc.title,
          "text": loc.body || loc.title,
          "answerCount": answers.length,
          "dateCreated": (q.publishedAt ?? q.createdAt).toISOString(),
          "author": { "@type": "Person", "name": askerName },
          ...(q.specialty ? { "about": { "@type": "MedicalSpecialty", "name": q.specialty.name } } : {}),
          ...(accepted ? { "acceptedAnswer": answerNode(accepted) } : {}),
          ...(suggested.length ? { "suggestedAnswer": suggested.map(answerNode) } : {}),
        },
      },
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#medpage`,
        "url": url,
        "name": loc.title,
        "audience": { "@type": "Patient" },
        ...(q.specialty ? { "about": { "@type": "MedicalSpecialty", "name": q.specialty.name } } : {}),
        "lastReviewed": (q.lastAnswerAt ?? q.publishedAt ?? q.createdAt).toISOString(),
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.home, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.breadcrumb, "item": `${BASE}/questions` },
          ...(q.specialty ? [{ "@type": "ListItem", "position": 3, "name": q.specialty.name, "item": `${BASE}/questions/specialite/${q.specialty.slug}` }] : []),
          { "@type": "ListItem", "position": q.specialty ? 4 : 3, "name": loc.title, "item": url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 lg:pb-12">
        {/* Fil d'Ariane */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-secondary-600 transition-colors">{t.home}</Link>
          <Chevron />
          <Link href="/questions" className="hover:text-secondary-600 transition-colors">{t.breadcrumb}</Link>
          {q.specialty && (
            <>
              <Chevron />
              <Link href={`/questions/specialite/${q.specialty.slug}`} className="hover:text-secondary-600 transition-colors">
                {tSpecialty(q.specialty.name, locale)}
              </Link>
            </>
          )}
        </nav>

        {q.urgencyLevel === "URGENT" && (
          <div className="mb-6"><UrgencyBanner t={t} /></div>
        )}

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:items-start">
        {/* ── Colonne principale ── */}
        <div className="min-w-0">
        {/* Question */}
        <header className="mb-6">
          <h1 dir="auto" className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">{loc.title}</h1>
          {loc.body && <p dir="auto" className="mt-3 text-slate-600 leading-relaxed whitespace-pre-wrap break-words">{loc.body}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{t.askedOn.replace("{date}", new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", { day: "numeric", month: "long", year: "numeric" }).format(q.publishedAt ?? q.createdAt))}</span>
            <span>· {askerName}</span>
            {/* Sous 500 vues, on masque le compteur : un « 39 vues » public est un
                anti-signal (page sans trafic) plutôt qu'une preuve sociale. */}
            {q.views >= 500 && <span>· {t.views.replace("{n}", q.views.toLocaleString(locale === "ar" ? "ar-MA" : "fr"))}</span>}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FollowButton questionId={q.id} following={!!follow} isAuthed={isAuthed} t={t} />
            <ShareButton title={loc.title} t={t} />
            <ReportDialog targetType="QUESTION" targetId={q.id} t={t} />
          </div>
          {q.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {q.tags.map((tag) => (
                <Link key={tag} href={`/questions?q=${encodeURIComponent(tag)}`} className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-medium hover:bg-slate-200 transition-colors">#{tag}</Link>
              ))}
            </div>
          )}
        </header>

        {/* L'essentiel (AI Overviews) — transparence IA : signalé au point d'usage
            (cf. charte éditoriale §3 « Résumés signalés »). */}
        {showSummary && (
          <section className="mb-6 rounded-2xl border border-primary-200 bg-primary-50/60 p-5" aria-labelledby="essentiel-title">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 id="essentiel-title" className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5a4 4 0 0 0-2.5 7.1c.5.4.8 1 .8 1.6V11h3.4v-.8c0-.6.3-1.2.8-1.6A4 4 0 0 0 8 1.5z" /><path d="M6.5 13.5h3M7 15h2" /></svg>
                {t.essentialTitle}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 text-primary-700 px-2 py-0.5 text-[11px] font-semibold shrink-0">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v2m0 8v2M2 8h2m8 0h2M4.5 4.5l1.4 1.4m4.2 4.2 1.4 1.4m0-7-1.4 1.4m-4.2 4.2-1.4 1.4" /></svg>
                {t.aiAssistedLabel}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" dir="auto">{summaryText}</p>
            <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">{t.aiAssistedNote}</p>
          </section>
        )}

        {/* Réponses */}
        <section aria-labelledby="answers-title">
          <h2 id="answers-title" className="font-bold text-slate-900 text-lg mb-4">
            {q.answers.length > 0 ? t.answersTitle : t.noAnswerYet}
          </h2>
          {answers.length > 0 ? (
            <div className="flex flex-col gap-4">
              {answers.map((a) => (
                <AnswerCard key={a.id} answer={a} isAuthed={isAuthed} canAccept={canAccept} t={t} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="text-sm text-slate-500">{t.noAnswerYet}</p>
            </div>
          )}
        </section>

        {/* Composer médecin vérifié */}
        {showComposer && (
          <div className="mt-6"><AnswerComposer questionId={q.id} t={t} /></div>
        )}
        {!isAuthed && (
          <p className="mt-4 text-sm text-slate-500">{t.patientCannotAnswer}</p>
        )}

        {/* Disclaimer */}
        <aside role="note" className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-bold text-amber-800 mb-1">{t.disclaimerTitle}</p>
          <p className="text-xs text-amber-700 leading-relaxed">{t.disclaimerBody}</p>
        </aside>
        </div>{/* /colonne principale */}

        {/* ── Colonne latérale : conversion ── */}
        <aside className="mt-8 lg:mt-0 flex flex-col gap-4 lg:sticky lg:top-6">
          {bookingDoctor && <BookingCard doctor={bookingDoctor} t={t} locale={locale} />}
          {q.specialtyId && (
            <RecommendedDoctors specialtyId={q.specialtyId} excludeDoctorId={topDoctorId} t={t} locale={locale} />
          )}
          {q.specialty && (
            <Link
              href={`/specialites/${q.specialty.slug}`}
              className="card p-4 flex items-center justify-between gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800"
            >
              <span>{t.ctaFindSpecialistNamed.replace("{specialty}", tSpecialty(q.specialty.name, locale))}</span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100 shrink-0" aria-hidden="true" strokeLinecap="round"><path d="m6 3 5 5-5 5" /></svg>
            </Link>
          )}
        </aside>
      </div>{/* /grille 2 colonnes */}

      {/* Questions similaires */}
      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="related-title">
          <h2 id="related-title" className="font-bold text-slate-900 text-lg mb-4">{t.relatedTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((r) => (
              <QuestionCard key={r.slug} q={r as QuestionCardData} t={t} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Articles santé à lire */}
      {articles.length > 0 && (
        <section className="mt-12" aria-labelledby="articles-title">
          <h2 id="articles-title" className="font-bold text-slate-900 text-lg mb-4">{t.articlesTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {articles.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="card p-4 hover:-translate-y-0.5 transition-transform">
                <span className="text-xs font-semibold text-primary-600">{p.category.name}</span>
                <p className="font-semibold text-slate-900 text-sm leading-snug mt-1" dir="auto">{p.title}</p>
                {p.readingTime && <p className="text-xs text-slate-400 mt-2">{p.readingTime} min</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>

      {/* ── CTA sticky mobile ── */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 lg:hidden bg-white/92 backdrop-blur border-t border-slate-200 px-4 py-2.5"
        style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}
      >
        {bookingDoctor ? (
          <Link href={`/praticiens/${bookingDoctor.slug}`} className="btn-primary w-full justify-center py-3 text-[15px] font-semibold">{t.stickyRdv}</Link>
        ) : (
          <Link href="/questions/poser" className="btn-primary w-full justify-center py-3 text-[15px] font-semibold">{t.ask}</Link>
        )}
      </div>
    </>
  );
}
