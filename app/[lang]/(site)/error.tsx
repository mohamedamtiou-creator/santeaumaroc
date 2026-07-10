"use client";

import { useEffect } from "react";
import { LocaleLink as Link, useLocaleContext } from "@/components/i18n/LocaleLink";
import type { Locale } from "@/lib/i18n";

/**
 * Boundary d'erreur du groupe `(site)` — rendu DANS le chrome du site
 * (navbar + footer). Client Component (obligatoire pour un `error.tsx` : il
 * reçoit `reset`). La locale vient du `LocaleProvider` posé par le layout
 * `[lang]` (contexte, aucune API dynamique serveur → n'affecte pas le
 * pré-rendu statique du reste du groupe). Libellés locaux à la page (aucune
 * nouvelle clé i18n globale), cohérents avec `NotFoundView`.
 */

type Copy = {
  code: string;
  title: string;
  lead: string;
  retry: string;
  home: string;
  helpPre: string;
  helpLink: string;
  refLabel: string;
  trust: string;
  quickTitle: string;
  quick: { path: string; label: string }[];
};

const COPY: Record<Locale, Copy> = {
  fr: {
    code: "Erreur inattendue",
    title: "Oups, un problème est survenu",
    lead: "Notre équipe a été informée. Réessayez dans un instant : la plupart du temps, un simple rechargement suffit. Vous pouvez aussi revenir à l’accueil ou continuer votre recherche.",
    retry: "Réessayer",
    home: "Retour à l’accueil",
    helpPre: "Le problème persiste ?",
    helpLink: "Contactez notre équipe",
    refLabel: "Référence",
    trust: "Plus de 20 000 praticiens partout au Maroc",
    quickTitle: "Continuer votre recherche",
    quick: [
      { path: "/praticiens", label: "Trouver un médecin" },
      { path: "/specialites", label: "Spécialités médicales" },
      { path: "/cliniques", label: "Établissements de santé" },
    ],
  },
  ar: {
    code: "خطأ غير متوقع",
    title: "عذرًا، حدث خطأ ما",
    lead: "تم إعلام فريقنا. حاول مرة أخرى بعد لحظات: غالبًا ما تكفي إعادة التحميل. يمكنك أيضًا العودة إلى الرئيسية أو متابعة بحثك.",
    retry: "إعادة المحاولة",
    home: "العودة إلى الرئيسية",
    helpPre: "هل استمرت المشكلة؟",
    helpLink: "تواصل مع فريقنا",
    refLabel: "المرجع",
    trust: "أكثر من 20 000 طبيب في جميع أنحاء المغرب",
    quickTitle: "تابع بحثك",
    quick: [
      { path: "/praticiens", label: "ابحث عن طبيب" },
      { path: "/specialites", label: "التخصصات الطبية" },
      { path: "/cliniques", label: "المؤسسات الصحية" },
    ],
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocaleContext();
  const t = COPY[locale];

  useEffect(() => {
    // Log vers le service de monitoring quand il sera branché.
    console.error(error);
  }, [error]);

  return (
    <section
      aria-labelledby="err-title"
      className="relative isolate flex min-h-[70vh] items-center overflow-hidden px-4 py-16 sm:py-24"
    >
      {/* Fond décoratif — glows brand doux + zellige discret (aria-hidden). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgb(217 119 6 / 0.10), transparent 70%)," +
              "radial-gradient(ellipse 50% 40% at 85% 20%, rgb(37 99 235 / 0.07), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-pattern-moroccan opacity-40" />
      </div>

      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        {/* Eyebrow — nature de l'erreur, communiquée textuellement. */}
        <p className="badge-accent mb-6">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-500" />
          </span>
          {t.code}
        </p>

        {/* Emblème — triangle d'alerte, décoratif. */}
        <div aria-hidden="true" className="mb-8 flex select-none items-center justify-center">
          <span className="relative inline-flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
            <span className="absolute inset-0 rounded-full bg-accent-400/15 animate-ping" />
            <span
              className="relative flex h-full w-full items-center justify-center rounded-full text-white shadow-lg"
              style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)", boxShadow: "0 12px 30px -8px rgb(217 119 6 / 0.5)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-11 w-11 sm:h-12 sm:w-12" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </span>
          </span>
        </div>

        {/* Titre + accroche rassurante */}
        <h1 id="err-title" className="text-3xl font-bold text-slate-900 sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500">
          {t.lead}
        </p>

        {/* Actions : réessayer (primaire) + retour accueil */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="btn-primary h-12 px-7 text-base inline-flex items-center gap-2"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M2 8a6 6 0 1 0 6-6 6 6 0 0 0-4.24 1.76L2 6" strokeLinecap="round" />
              <path d="M2 2v4h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.retry}
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 px-7 text-base font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 rtl:rotate-180" aria-hidden="true">
              <path d="m10 3-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.home}
          </Link>
        </div>

        {/* Récupération — liens rapides (maillage interne + reprise du parcours) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-medium text-slate-400">{t.quickTitle} :</span>
          {t.quick.map((q) => (
            <Link
              key={q.path}
              href={q.path}
              className="tag-specialty transition-colors hover:bg-primary-100 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            >
              {q.label}
            </Link>
          ))}
        </div>

        {/* Aide + référence technique */}
        <p className="mt-8 text-sm text-slate-500">
          {t.helpPre}{" "}
          <Link href="/contact" className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800">
            {t.helpLink}
          </Link>
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-slate-300">
            {t.refLabel} : {error.digest}
          </p>
        )}

        {/* Réassurance */}
        <p className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-slate-400">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5 text-secondary-500" aria-hidden="true">
            <path d="M8 1.5 2.5 4v3.5c0 3 2.3 5.6 5.5 6.5 3.2-.9 5.5-3.5 5.5-6.5V4L8 1.5Z" strokeLinejoin="round" />
            <path d="m5.75 8 1.5 1.5 3-3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.trust}
        </p>
      </div>
    </section>
  );
}
