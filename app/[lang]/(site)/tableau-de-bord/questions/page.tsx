import Link from "next/link";
import type { Metadata } from "next";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { answersLabel } from "@/lib/qa";

export const metadata: Metadata = { title: "Mes questions — SantéauMaroc", robots: { index: false } };

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PUBLISHED: "bg-secondary-50 text-secondary-700 border-secondary-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
  MERGED: "bg-slate-100 text-slate-500 border-slate-200",
};

export default async function PatientQuestionsPage() {
  const session = await verifySession();
  const locale = await getLocale();
  const t = getDictionary(locale).qa;

  const statusLabel = (s: string) =>
    s === "PUBLISHED" ? t.statusPublished
    : s === "REJECTED" ? t.statusRejected
    : s === "MERGED" ? t.statusMerged
    : t.statusPending;

  const [mine, followed] = await Promise.all([
    prisma.question.findMany({
      where: { askedById: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { slug: true, title: true, status: true, answersCount: true, createdAt: true },
    }),
    prisma.questionFollow.findMany({
      where: { userId: session.userId, question: { status: "PUBLISHED" } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { question: { select: { slug: true, title: true, answersCount: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* Mes questions */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-slate-900">{t.myQuestions}</h1>
          <Link href="/questions/poser" className="btn-primary text-sm py-2 px-4">{t.ask}</Link>
        </div>
        {mine.length === 0 ? (
          <div className="empty-state"><p className="text-sm text-slate-500">{t.noQuestionsYet}</p></div>
        ) : (
          <ul className="flex flex-col gap-3">
            {mine.map((q) => {
              const clickable = q.status === "PUBLISHED";
              const inner = (
                <div className="card p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 leading-snug" dir="auto">{q.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{answersLabel(q.answersCount, t.oneAnswer, t.manyAnswers)}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[q.status] ?? STATUS_STYLE.PENDING}`}>
                    {statusLabel(q.status)}
                  </span>
                </div>
              );
              return (
                <li key={q.slug}>
                  {clickable ? <Link href={`/questions/${q.slug}`}>{inner}</Link> : inner}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Questions suivies */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">{t.followedQuestions}</h2>
        {followed.length === 0 ? (
          <div className="empty-state"><p className="text-sm text-slate-500">{t.noFollowed}</p></div>
        ) : (
          <ul className="flex flex-col gap-3">
            {followed.map((f) => (
              <li key={f.question.slug}>
                <Link href={`/questions/${f.question.slug}`} className="card p-4 flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900 leading-snug min-w-0" dir="auto">{f.question.title}</span>
                  <span className="shrink-0 text-xs text-slate-400">{answersLabel(f.question.answersCount, t.oneAnswer, t.manyAnswers)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
