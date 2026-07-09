import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Dictionary, Locale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { answersLabel } from "@/lib/qa";
import { localizedTitle } from "@/lib/qa-content";
import { formatDoctorName } from "@/lib/utils";

type QaT = Dictionary["qa"];

// En dessous de ce seuil, le compteur de vues est masqué : un « 14 vues »
// public est un anti-signal (site sans trafic) plutôt qu'une preuve sociale.
const VIEW_THRESHOLD = 500;

type CardDoctor = {
  slug: string | null;
  prenom: string | null;
  nom: string | null;
  civilite: string | null;
  isVerified: boolean;
};

export type QuestionCardData = {
  slug: string;
  title: string;
  titleAr?: string | null;
  arReviewedAt?: Date | null;
  answersCount: number;
  views: number;
  publishedAt: Date | null;
  specialty: { name: string; slug: string } | null;
  // Meilleure réponse (accepted/score) → signal d'autorité affiché sur la carte.
  answers?: { doctor: CardDoctor }[];
};

function VerifiedCheck({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-secondary-600 font-medium">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m4 8 3 3 5-6" /></svg>
      {label}
    </span>
  );
}

export function QuestionCard({
  q,
  t,
  locale,
  as: Heading = "h2",
}: {
  q: QuestionCardData;
  t: QaT;
  locale: Locale;
  as?: "h2" | "h3";
}) {
  const hasAnswers = q.answersCount > 0;
  const doctor = q.answers?.[0]?.doctor ?? null;
  const doctorName = doctor ? formatDoctorName(doctor) : null;
  const date = q.publishedAt
    ? new Date(q.publishedAt).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <article className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <Heading className="font-semibold text-slate-900 leading-snug text-[15px] sm:text-base min-w-0">
          <Link href={`/questions/${q.slug}`} className="hover:text-primary-700 transition-colors" dir="auto">
            {localizedTitle(q, locale)}
          </Link>
        </Heading>
        {!hasAnswers && (
          <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 text-xs font-semibold">
            {t.noAnswerYet}
          </span>
        )}
      </div>

      {/* Autorité : médecin répondeur + fraîcheur (signal EEAT / extraction IA). */}
      {doctorName && (
        <p className="mt-2.5 text-[13px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-slate-400">{t.answeredBy}</span>
          {doctor?.slug ? (
            <Link href={`/praticiens/${doctor.slug}`} className="font-semibold text-slate-800 hover:text-primary-700">{doctorName}</Link>
          ) : (
            <span className="font-semibold text-slate-800">{doctorName}</span>
          )}
          {doctor?.isVerified && <VerifiedCheck label={t.verifiedBadge} />}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500">
        {q.specialty && (
          <Link
            href={`/questions/specialite/${q.specialty.slug}`}
            className="inline-flex items-center rounded-full bg-primary-50 text-primary-700 px-2.5 py-1 font-medium hover:bg-primary-100 transition-colors"
          >
            {tSpecialty(q.specialty.name, locale)}
          </Link>
        )}
        <span className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h12v7H6l-3 3z" />
          </svg>
          {answersLabel(q.answersCount, t.oneAnswer, t.manyAnswers)}
        </span>
        {date && (
          <time className="inline-flex items-center gap-1.5" dateTime={q.publishedAt!.toISOString()}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M2 6h12M5 1.5v2M11 1.5v2" />
            </svg>
            {date}
          </time>
        )}
        {q.views >= VIEW_THRESHOLD && (
          <span className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" />
            </svg>
            {t.views.replace("{n}", q.views.toLocaleString(locale === "ar" ? "ar-MA" : "fr"))}
          </span>
        )}
      </div>
    </article>
  );
}
