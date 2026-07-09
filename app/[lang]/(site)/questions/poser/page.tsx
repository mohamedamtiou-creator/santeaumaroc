import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { AskForm } from "@/components/qa/AskForm";
import { UrgencySafetyNote } from "@/components/qa/UrgencySafetyNote";

export const metadata: Metadata = {
  // Pas de marque ici : le layout racine ajoute déjà « | SantéauMaroc ».
  title: "Poser une question à un médecin",
  description:
    "Posez gratuitement votre question de santé à des médecins vérifiés au Maroc. Réponse générale sous ~24 h, confidentiel. Ne remplace pas une consultation.",
  robots: { index: false },
  alternates: { canonical: "/questions/poser" },
};

export default async function AskQuestionPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.qa;

  const session = await tryGetSession();
  const isAuthed = !!session?.userId;

  const [specialtiesRaw, docCount] = await Promise.all([
    prisma.specialty.findMany({
      select: { id: true, name: true },
      orderBy: { order: "asc" },
    }),
    prisma.doctor.count({ where: { isVerified: true, isActive: true } }),
  ]);
  const specialties = specialtiesRaw.map((s) => ({ id: s.id, name: tSpecialty(s.name, locale) }));

  const nf = locale === "ar" ? "ar-MA" : "fr";
  const reassurance = [
    t.askReassureDoctors.replace("{n}", docCount.toLocaleString(nf)),
    t.reGratuit,
    t.reDelai,
    t.reConfidentiel,
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link href="/questions" className="hover:text-secondary-600 transition-colors">{t.breadcrumb}</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700">{t.ask}</span>
      </nav>

      <header className="mb-5">
        <h1 className="section-title">{t.askPageTitle}</h1>
        <p className="section-subtitle mt-2">{t.askPageSubtitle}</p>
      </header>

      <ul className="mb-6 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
        {reassurance.map((r) => (
          <li key={r} className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 shrink-0 text-secondary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7.5" /></svg>
            {r}
          </li>
        ))}
      </ul>

      {/* Comment ça marche — séquence de 3 étapes (numérotation justifiée). */}
      <ol className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[t.askHowStep1, t.askHowStep2, t.askHowStep3].map((step, i) => (
          <li key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-700 text-xs font-bold tabular-nums">{i + 1}</span>
            <span className="text-sm text-slate-600 leading-snug">{step}</span>
          </li>
        ))}
      </ol>

      <AskForm specialties={specialties} isAuthed={isAuthed} t={t} locale={locale} />

      {/* Filet de sécurité sobre, placé sous le formulaire (option A). Le signal
          fort reste l'alerte rouge dynamique d'AskForm et la bannière /[slug]. */}
      <div className="mt-4">
        <UrgencySafetyNote t={t} />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900 text-sm mb-3">{t.askGuidelinesTitle}</h2>
        <ul className="flex flex-col gap-2 text-sm text-slate-600">
          {[t.askGuideline1, t.askGuideline2, t.askGuideline3].map((g, i) => (
            <li key={i} className="flex gap-2.5">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 text-secondary-500 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 4.5 6.5 11.5 3 8" /></svg>
              {g}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 text-center">
        <Link href="/questions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-600 hover:text-secondary-700 transition-colors">
          {t.askBrowseLink}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
        </Link>
      </div>
    </div>
  );
}
