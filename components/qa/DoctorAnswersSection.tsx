import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { getDictionary, type Locale } from "@/lib/i18n";

/**
 * Maillage entrant + E-E-A-T + vitrine Pro : les questions auxquelles ce médecin
 * a répondu, affichées sur sa fiche. Composant serveur autonome (rend `null` si
 * aucune réponse) — l'injection dans la fiche se limite à une ligne.
 */
export async function DoctorAnswersSection({
  doctorId, doctorFirstName, locale,
}: {
  doctorId: string;
  doctorFirstName: string;
  locale: Locale;
}) {
  const answers = await prisma.answer.findMany({
    where: { doctorId, status: "PUBLISHED", question: { status: "PUBLISHED" } },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { question: { select: { slug: true, title: true } } },
  });

  const seen = new Set<string>();
  const items: { slug: string; title: string }[] = [];
  for (const a of answers) {
    if (!seen.has(a.question.slug)) {
      seen.add(a.question.slug);
      items.push(a.question);
    }
  }
  if (items.length === 0) return null;

  const t = getDictionary(locale).qa;
  return (
    <section className="card p-5 sm:p-6 mt-6" aria-labelledby="doctor-answers-title">
      <h2 id="doctor-answers-title" className="font-bold text-slate-900 text-base mb-1">{t.doctorAnswersTitle}</h2>
      <p className="text-sm text-slate-500 mb-4">{t.doctorAnswersSubtitle.replace("{doctor}", doctorFirstName)}</p>
      <ul className="flex flex-col divide-y divide-slate-100">
        {items.slice(0, 6).map((q) => (
          <li key={q.slug}>
            <Link href={`/questions/${q.slug}`} className="group flex items-center gap-2 py-2.5 text-sm font-medium text-primary-700 hover:text-primary-800">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 shrink-0 text-primary-400" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h12v7H6l-3 3z" /></svg>
              <span className="underline-offset-2 group-hover:underline" dir="auto">{q.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
