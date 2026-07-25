import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { isTopicArReady } from "@/lib/health-topic";
import { getDictionary, type Locale } from "@/lib/i18n";

/**
 * Bloc « pillar » de la page spécialité : liste les symptômes et maladies RELUS
 * rattachés à cette spécialité (liens vers leurs fiches) + un lien vers le guide
 * « Quand consulter … ». Ferme la boucle du cocon (spécialité ↔ topics) et
 * densifie le maillage interne. Ne montre que du contenu indexable (reviewedAt).
 *
 * Server Component.
 */
type Props = {
  specialtyId: string;
  specialtySlug: string;
  locale: Locale;
};

export async function SpecialtyPillarTopics({ specialtyId, specialtySlug, locale }: Props) {
  const [topics, guide] = await Promise.all([
    prisma.healthTopic.findMany({
      where: { specialtyId, status: "PUBLISHED", reviewedAt: { not: null } },
      orderBy: { term: "asc" },
      select: { slug: true, kind: true, term: true, termAr: true, arReviewedAt: true, shortAnswerAr: true },
    }),
    prisma.specialtyGuide.findFirst({
      where: { specialtyId, status: "PUBLISHED", reviewedAt: { not: null } },
      select: { id: true },
    }),
  ]);

  if (topics.length === 0 && !guide) return null;

  const t = getDictionary(locale).specialtyPillar;
  const term = (tp: (typeof topics)[number]) =>
    locale === "ar" && isTopicArReady(tp) && tp.termAr ? tp.termAr : tp.term;

  const symptoms = topics.filter((tp) => tp.kind !== "DISEASE");
  const diseases = topics.filter((tp) => tp.kind === "DISEASE");

  const group = (items: typeof topics, label: string, hub: string) =>
    items.length > 0 ? (
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2.5">{label}</h3>
        <ul className="flex flex-wrap gap-2">
          {items.map((tp) => (
            <li key={tp.slug}>
              <Link href={`${hub}/${tp.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50/40 transition-colors" dir="auto">
                {term(tp)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <section aria-labelledby="pillar-title" className="mt-8 pt-6 border-t border-slate-100">
      <h2 id="pillar-title" className="text-lg font-bold text-slate-900">{t.title}</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">{t.subtitle}</p>

      <div className="space-y-5">
        {group(symptoms, t.symptomsLabel, "/symptomes")}
        {group(diseases, t.diseasesLabel, "/maladies")}
      </div>

      {guide && (
        <Link href={`/quand-consulter/${specialtySlug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
          {t.guideCta}
        </Link>
      )}
    </section>
  );
}
