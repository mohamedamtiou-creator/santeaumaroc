import Link from "next/link";
import type { Metadata } from "next";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { answersLabel } from "@/lib/qa";
import { DashboardHeader } from "../_components/DashboardHeader";

export const metadata: Metadata = { title: "Mes questions — SantéauMaroc", robots: { index: false } };

// Pastille de statut + filet coloré à gauche de la carte (repère visuel rapide).
const STATUS_STYLE: Record<string, { pill: string; rail: string }> = {
  PENDING:   { pill: "bg-amber-50 text-amber-700 border-amber-200",           rail: "bg-amber-400" },
  PUBLISHED: { pill: "bg-secondary-50 text-secondary-700 border-secondary-200", rail: "bg-secondary-500" },
  REJECTED:  { pill: "bg-red-50 text-red-600 border-red-200",                 rail: "bg-red-400" },
  MERGED:    { pill: "bg-slate-100 text-slate-500 border-slate-200",           rail: "bg-slate-300" },
};

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"
      className={className} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h12v9H8l-3 3z" /><path d="M7 7.5h6M7 10h4" />
    </svg>
  );
}

function EmptyCard({ children, cta }: { children: React.ReactNode; cta?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 flex flex-col items-center text-center gap-3">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 ring-1 ring-slate-200">
        <ChatIcon className="w-6 h-6" />
      </span>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{children}</p>
      {cta}
    </div>
  );
}

export default async function PatientQuestionsPage() {
  const session = await verifySession();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.qa;
  const tp = dict.dashboard.patient;

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

  const askCta = (
    <Link href="/questions/poser" className="btn-primary text-sm py-2 px-4">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v10M3 8h10" /></svg>
      {t.ask}
    </Link>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* ── Mes questions ── */}
      <section>
        <DashboardHeader eyebrow={tp.eyebrow} title={t.myQuestions} action={askCta} />

        {mine.length === 0 ? (
          <div className="mt-5">
            <EmptyCard cta={<Link href="/questions/poser" className="btn-primary text-sm py-2 px-4">{t.ask}</Link>}>
              {t.noQuestionsYet}
            </EmptyCard>
          </div>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {mine.map((q) => {
              const cfg = STATUS_STYLE[q.status] ?? STATUS_STYLE.PENDING;
              const clickable = q.status === "PUBLISHED";
              const inner = (
                <div className="relative card p-4 pl-5 flex items-start justify-between gap-3 overflow-hidden">
                  <span className={`absolute start-0 inset-y-0 w-1 ${cfg.rail}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className={`font-semibold text-slate-900 leading-snug ${clickable ? "group-hover:text-primary-700 transition-colors" : ""}`} dir="auto">{q.title}</p>
                    <p className="text-xs text-slate-400 mt-1.5 inline-flex items-center gap-1.5">
                      <ChatIcon className="w-3.5 h-3.5" />
                      {answersLabel(q.answersCount, t.oneAnswer, t.manyAnswers)}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.pill}`}>
                    {statusLabel(q.status)}
                  </span>
                </div>
              );
              return (
                <li key={q.slug}>
                  {clickable ? <Link href={`/questions/${q.slug}`} className="group block">{inner}</Link> : inner}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Questions suivies ── */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3.5 12 7.5l4.5.6-3.2 3.1.8 4.4L10 13.6 5.9 15.6l.8-4.4L3.5 8.1 8 7.5z" /></svg>
          {t.followedQuestions}
        </h2>

        {followed.length === 0 ? (
          <div className="mt-4"><EmptyCard>{t.noFollowed}</EmptyCard></div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {followed.map((f) => (
              <li key={f.question.slug}>
                <Link href={`/questions/${f.question.slug}`} className="group card p-4 flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900 leading-snug min-w-0 group-hover:text-primary-700 transition-colors" dir="auto">{f.question.title}</span>
                  <span className="shrink-0 text-xs text-slate-400 inline-flex items-center gap-1.5">
                    <ChatIcon className="w-3.5 h-3.5" />
                    {answersLabel(f.question.answersCount, t.oneAnswer, t.manyAnswers)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
