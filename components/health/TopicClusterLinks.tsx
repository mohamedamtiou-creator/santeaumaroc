import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { isTopicArReady } from "@/lib/health-topic";
import type { Locale } from "@/lib/i18n";

/**
 * Maillage du cocon santé : sur une fiche/angle (symptôme, maladie, intention,
 * traitement), propose (1) les AUTRES angles du même sujet (« quel médecin »,
 * « comment traiter »…) et (2) les SUJETS LIÉS (topic ↔ topic via `relatedTopicSlugs`).
 * Rend les clusters navigables en boucle et densifie le maillage interne (SEO).
 *
 * Server Component : résout les slugs liés en base (topics relus uniquement, pour
 * rester cohérent avec l'indexabilité — pas de lien vers une fiche en noindex).
 */
type Angle = { href: string; label: string };

type Props = {
  locale: Locale;
  title: string;              // « Sujets liés »
  anglesTitle?: string;       // titre de la bande « autres angles » (optionnel)
  angles?: Angle[];           // autres angles du même sujet (pré-calculés par l'appelant)
  relatedTopicSlugs: string[];
};

export async function TopicClusterLinks({ locale, title, anglesTitle, angles = [], relatedTopicSlugs }: Props) {
  const cleanAngles = angles.filter((a) => a && a.href && a.label);

  const related = relatedTopicSlugs.length
    ? await prisma.healthTopic.findMany({
        where: { slug: { in: relatedTopicSlugs }, status: "PUBLISHED", reviewedAt: { not: null } },
        select: { slug: true, kind: true, term: true, termAr: true, arReviewedAt: true, shortAnswerAr: true },
      })
    : [];

  if (cleanAngles.length === 0 && related.length === 0) return null;

  const term = (t: (typeof related)[number]) =>
    locale === "ar" && isTopicArReady(t) && t.termAr ? t.termAr : t.term;

  return (
    <nav aria-label={title} className="mt-10 pt-8 border-t border-slate-100 space-y-6">
      {cleanAngles.length > 0 && (
        <div>
          {anglesTitle && <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">{anglesTitle}</h2>}
          <ul className="flex flex-wrap gap-2">
            {cleanAngles.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50/50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-colors" dir="auto">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                  <span>{a.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {related.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">{title}</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {related.map((r) => {
              const hub = r.kind === "DISEASE" ? "/maladies" : "/symptomes";
              return (
                <li key={r.slug}>
                  <Link href={`${hub}/${r.slug}`} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50/40 transition-colors" dir="auto">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 text-primary-400 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                    <span>{term(r)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
