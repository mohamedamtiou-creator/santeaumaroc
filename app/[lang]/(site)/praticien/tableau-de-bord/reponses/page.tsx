import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentDoctor } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { htmlToPlainText } from "@/lib/sanitize-html";
import { answersLabel } from "@/lib/qa";
import { DashHeader } from "../_components/DashHeader";
import { Pagination } from "@/components/ui/Pagination";
import { parsePage, totalPages } from "@/lib/pagination";

const PER_PAGE = 20;

export const metadata: Metadata = { title: "Réponses — Espace praticien", robots: { index: false } };

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 text-xs text-slate-500">
      <span className="font-bold text-slate-700 tabular-nums">{value}</span> {label}
    </span>
  );
}

export default async function DoctorAnswersPage({
  searchParams,
}: {
  searchParams: Promise<{ qp?: string; ap?: string }>;
}) {
  const doctor = await getCurrentDoctor(); // garde DOCTOR (redirige sinon)
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.qa;
  const tp = dict.dashboard.praticien;

  if (!doctor) return null;

  const verified = doctor.isVerified;
  const sp = await searchParams;
  const qPage = parsePage(sp.qp, PER_PAGE); // questions à répondre
  const aPage = parsePage(sp.ap, PER_PAGE); // mes réponses

  const toAnswerWhere = {
    status: "PUBLISHED",
    specialtyId: doctor.specialtyId,
    answers: { none: { doctorId: doctor.id } },
  } as const;
  const myAnswersWhere = { doctorId: doctor.id, status: "PUBLISHED" } as const;

  const [toAnswer, toAnswerTotal, myAnswers, myAnswersTotal] = await Promise.all([
    verified
      ? prisma.question.findMany({
          where: toAnswerWhere,
          orderBy: [{ answersCount: "asc" }, { publishedAt: "desc" }],
          skip: qPage.skip,
          take: qPage.take,
          select: { slug: true, title: true, answersCount: true, views: true },
        })
      : Promise.resolve([]),
    verified ? prisma.question.count({ where: toAnswerWhere }) : Promise.resolve(0),
    prisma.answer.findMany({
      where: myAnswersWhere,
      orderBy: { createdAt: "desc" },
      skip: aPage.skip,
      take: aPage.take,
      select: {
        id: true, body: true, upvotes: true, thanksCount: true, isAccepted: true,
        question: { select: { slug: true, title: true, views: true } },
      },
    }),
    prisma.answer.count({ where: myAnswersWhere }),
  ]);

  // URLs de pagination : chaque liste a son paramètre (qp / ap) et préserve l'autre.
  const base = "/praticien/tableau-de-bord/reponses";
  const buildQUrl = (p: number) => {
    const params = new URLSearchParams();
    if (sp.ap) params.set("ap", sp.ap);
    if (p > 1) params.set("qp", String(p));
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };
  const buildAUrl = (p: number) => {
    const params = new URLSearchParams();
    if (sp.qp) params.set("qp", sp.qp);
    if (p > 1) params.set("ap", String(p));
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <DashHeader eyebrow={tp.overviewEyebrow} title={tp.navReponses} />

      {!verified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {t.mustBeVerified}{" "}
          <Link href="/praticien/tableau-de-bord/verification" className="font-semibold underline underline-offset-2">→</Link>
        </div>
      )}

      {/* Questions à répondre */}
      <section>
        <h2 className="text-base font-bold text-slate-900">{t.toAnswerTitle}</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">{t.toAnswerSubtitle}</p>
        {!verified ? null : toAnswer.length === 0 ? (
          <div className="empty-state"><p className="text-sm text-slate-500">{t.noToAnswer}</p></div>
        ) : (
          <ul className="flex flex-col gap-3">
            {toAnswer.map((q) => (
              <li key={q.slug} className="card p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/questions/${q.slug}`} className="font-semibold text-slate-900 leading-snug hover:text-primary-700" dir="auto">{q.title}</Link>
                  <div className="flex gap-4 mt-1">
                    <Stat value={q.answersCount} label={answersLabel(q.answersCount, t.oneAnswer, t.manyAnswers).replace(/^\d+\s*/, "")} />
                    <Stat value={q.views} label={t.statViews} />
                  </div>
                </div>
                <Link href={`/questions/${q.slug}`} className="btn-primary text-sm py-2 px-4 shrink-0">{t.answerCta}</Link>
              </li>
            ))}
          </ul>
        )}
        {verified && (
          <Pagination
            page={qPage.page}
            totalPages={totalPages(toAnswerTotal, PER_PAGE)}
            buildUrl={buildQUrl}
            t={dict.pagination}
          />
        )}
      </section>

      {/* Mes réponses */}
      <section>
        <h2 className="text-base font-bold text-slate-900 mb-4">{t.myAnswersTitle}</h2>
        {myAnswers.length === 0 ? (
          <div className="empty-state"><p className="text-sm text-slate-500">{t.noMyAnswers}</p></div>
        ) : (
          <ul className="flex flex-col gap-3">
            {myAnswers.map((a) => (
              <li key={a.id} className="card p-4">
                <Link href={`/questions/${a.question.slug}#answer-${a.id}`} className="font-semibold text-slate-900 leading-snug hover:text-primary-700" dir="auto">
                  {a.question.title}
                </Link>
                {a.isAccepted && (
                  <span className="ms-2 inline-flex items-center rounded-full bg-secondary-50 text-secondary-700 border border-secondary-200 px-2 py-0.5 text-[11px] font-bold">{t.acceptedBadge}</span>
                )}
                <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{htmlToPlainText(a.body).slice(0, 160)}</p>
                <div className="flex flex-wrap gap-4 mt-2">
                  <Stat value={a.question.views} label={t.statViews} />
                  <Stat value={a.upvotes} label={t.statVotes} />
                  <Stat value={a.thanksCount} label={t.statThanks} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination
          page={aPage.page}
          totalPages={totalPages(myAnswersTotal, PER_PAGE)}
          buildUrl={buildAUrl}
          t={dict.pagination}
        />
      </section>
    </div>
  );
}
