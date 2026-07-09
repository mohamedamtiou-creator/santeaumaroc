import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { processCache } from "@/lib/process-cache";
import { getDictionary, type Locale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { answersLabel } from "@/lib/qa";

/**
 * Maillage + trafic : questions publiées de la spécialité, affichées sur la page
 * /specialites/[slug]. Composant serveur autonome (rend `null` si aucune).
 */
export async function SpecialtyQuestionsSection({
  specialtyId, specialtySlug, specialtyName, locale,
}: {
  specialtyId: string;
  specialtySlug: string;
  specialtyName: string;
  locale: Locale;
}) {
  // Résultat JSON-sérialisable simple (pas de Decimal) → processCache in-process
  // évite un aller-retour DB non caché à CHAQUE rendu de page spécialité.
  const questions = await processCache(
    `specialite:questions:${specialtyId}`,
    3600,
    () =>
      prisma.question.findMany({
        where: { status: "PUBLISHED", specialtyId },
        orderBy: { publishedAt: "desc" },
        take: 6,
        select: { slug: true, title: true, answersCount: true },
      }),
  );
  if (questions.length === 0) return null;

  const t = getDictionary(locale).qa;
  const label = tSpecialty(specialtyName, locale);
  return (
    <section className="card p-5 sm:p-6 mt-4" aria-labelledby="specialty-questions-title">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h2 id="specialty-questions-title" className="font-bold text-slate-900 text-base">
          {t.specialtyQuestionsTitle.replace("{specialty}", label)}
        </h2>
        <Link href={`/questions/specialite/${specialtySlug}`} className="text-sm font-medium text-secondary-600 hover:text-secondary-700 whitespace-nowrap">
          {t.seeAllQuestions} →
        </Link>
      </div>
      <p className="text-sm text-slate-500 mb-4">{t.specialtyQuestionsSubtitle}</p>
      <ul className="flex flex-col divide-y divide-slate-100">
        {questions.map((q) => (
          <li key={q.slug}>
            <Link href={`/questions/${q.slug}`} className="group flex items-center justify-between gap-3 py-2.5 text-sm font-medium text-primary-700 hover:text-primary-800">
              <span className="underline-offset-2 group-hover:underline min-w-0" dir="auto">{q.title}</span>
              <span className="shrink-0 text-xs text-slate-400 font-normal whitespace-nowrap">
                {answersLabel(q.answersCount, t.oneAnswer, t.manyAnswers)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <Link href="/questions/poser" className="btn-outline text-sm py-2 px-4 inline-flex">{t.ask}</Link>
      </div>
    </section>
  );
}
