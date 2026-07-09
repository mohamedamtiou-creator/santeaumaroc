import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import Image from "next/image";
import type { Dictionary, Locale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { getDoctorInitials, formatDoctorName, formatDoctorShortName } from "@/lib/utils";
import { VoteThankBar, AcceptButton } from "@/components/qa/AnswerInteractions";
import { ReportDialog } from "@/components/qa/ReportDialog";
import { CommentForm } from "@/components/qa/CommentForm";

type QaT = Dictionary["qa"];

export type AnswerCardData = {
  id: string;
  body: string; // HTML déjà assaini (stocké)
  isAccepted: boolean;
  upvotes: number;
  thanksCount: number;
  createdAt: Date;
  editedAt: Date | null;
  voted: boolean;
  thanked: boolean;
  doctor: {
    slug: string | null;
    nom: string | null;
    prenom: string | null;
    civilite: string | null;
    avatar: string | null;
    isVerified: boolean;
    isPro: boolean;
    specialtyName: string;
    cityName: string;
  };
  comments: { id: string; body: string; userName: string; createdAt: Date }[];
};

function fmtDate(d: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(d));
}

export function AnswerCard({
  answer, isAuthed, canAccept, t, locale,
}: {
  answer: AnswerCardData;
  isAuthed: boolean;
  canAccept: boolean;
  t: QaT;
  locale: Locale;
}) {
  const d = answer.doctor;
  const name = formatDoctorName(d);
  const profileHref = d.slug ? `/praticiens/${d.slug}` : null;

  return (
    <article
      id={`answer-${answer.id}`}
      className={`card p-5 sm:p-6 ${answer.isAccepted ? "ring-1 ring-secondary-300 bg-secondary-50/30" : ""}`}
    >
      {answer.isAccepted && (
        <p className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-700 mb-3">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
          {t.acceptedBadge}
        </p>
      )}

      {/* En-tête médecin */}
      <div className="flex items-start gap-3">
        {d.avatar ? (
          <Image src={d.avatar} alt={name} width={44} height={44} className="w-11 h-11 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center shrink-0" aria-hidden="true">
            <span className="text-sm font-bold text-primary-700">{getDoctorInitials(d.prenom, d.nom)}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {profileHref ? (
              <Link href={profileHref} className="font-bold text-slate-900 hover:text-primary-700 transition-colors">{name}</Link>
            ) : (
              <span className="font-bold text-slate-900">{name}</span>
            )}
            {d.isVerified && (
              <span className="badge-verified text-[11px]">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3 h-3" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5 2.5 4v3.5c0 3 2.3 5.3 5.5 6.5 3.2-1.2 5.5-3.5 5.5-6.5V4L8 1.5z" /><path d="m5.8 8 1.6 1.6L10.5 6.5" /></svg>
                {t.verifiedBadge}
              </span>
            )}
            {d.isPro && (
              <span className="inline-flex items-center rounded-full bg-accent-50 text-accent-700 border border-accent-200 px-2 py-0.5 text-[11px] font-bold">{t.proBadge}</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {tSpecialty(d.specialtyName, locale)}{d.cityName ? ` · ${d.cityName}` : ""}
          </p>
        </div>
      </div>

      {/* Corps de la réponse (HTML assaini) */}
      <div
        dir="auto"
        className="mt-4 text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap break-words [&_a]:text-primary-700 [&_a]:underline [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5"
        dangerouslySetInnerHTML={{ __html: answer.body }}
      />

      <p className="mt-3 text-xs text-slate-400">
        {t.answeredBy} {name} · {t.answeredOn.replace("{date}", fmtDate(answer.createdAt, locale))}
        {answer.editedAt && ` · ${t.edited}`}
      </p>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <VoteThankBar
          answerId={answer.id}
          upvotes={answer.upvotes}
          thanks={answer.thanksCount}
          voted={answer.voted}
          thanked={answer.thanked}
          isAuthed={isAuthed}
          t={t}
        />
        <div className="flex items-center gap-3">
          {canAccept && <AcceptButton answerId={answer.id} accepted={answer.isAccepted} t={t} />}
          {profileHref && (
            d.isPro ? (
              // Perk Pro : CTA RDV proéminent réservé aux abonnés Pro/Premium.
              <Link href={profileHref} className="btn-secondary text-sm py-2 px-4">
                {t.ctaWithDoctor.replace("{doctor}", formatDoctorShortName(d))}
              </Link>
            ) : (
              <Link href={profileHref} className="text-sm font-medium text-primary-700 hover:text-primary-800 underline underline-offset-2">
                {t.seeProfile}
              </Link>
            )
          )}
          <ReportDialog targetType="ANSWER" targetId={answer.id} t={t} />
        </div>
      </div>

      {/* Commentaires patients */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        {answer.comments.length > 0 && (
          <ul className="flex flex-col gap-3 mb-3">
            {answer.comments.map((c) => (
              <li key={c.id} className="text-sm">
                <span className="font-semibold text-slate-700">{c.userName}</span>
                <span className="text-slate-400"> · {fmtDate(c.createdAt, locale)}</span>
                <p className="text-slate-600 mt-0.5 whitespace-pre-wrap break-words" dir="auto">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
        <CommentForm answerId={answer.id} isAuthed={isAuthed} t={t} />
      </div>
    </article>
  );
}
