import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Signature de relecture éditoriale HONNÊTE : ne s'affiche QUE si `reviewedAt`
 * est posé (une relecture humaine a réellement eu lieu). Attribution non
 * nominative — « la rédaction médicale de SantéauMaroc » — reliée à la page
 * méthodologie (transparence). Pas de médecin nommé fictif.
 */
export function EditorialReviewNote({
  reviewedAt,
  locale,
  tb,
}: {
  reviewedAt: Date | null;
  locale: Locale;
  tb: Dictionary["blog"];
}) {
  if (!reviewedAt) return null;

  const dateStr = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(reviewedAt));

  return (
    <aside className="mt-8 rounded-xl border border-secondary-100 bg-secondary-50/50 p-4 flex items-start gap-3" dir="auto">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
        className="w-5 h-5 shrink-0 text-secondary-600 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.5 10.5 9.5 12.5 13 8.5" /><circle cx="10" cy="10" r="8" />
      </svg>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-secondary-800">{tb.medicallyReviewed}</p>
        <p className="text-xs text-slate-600 mt-0.5">
          {tb.reviewedByLabel} {tb.editorialReviewer} · {tb.reviewedOn.replace("{date}", dateStr)}
        </p>
        <Link href="/methodologie" className="inline-flex items-center gap-1 text-xs font-medium text-secondary-700 hover:text-secondary-800 mt-1.5">
          {tb.methodologyLink}
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 rtl:-scale-x-100" aria-hidden="true"><path d="m4 2 4 4-4 4" strokeLinecap="round" /></svg>
        </Link>
      </div>
    </aside>
  );
}
