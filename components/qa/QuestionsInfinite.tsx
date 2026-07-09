"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { loadMoreQuestions, type QaListCard } from "@/features/qa/list-actions";

type Props = {
  q: string;
  specialite: string;
  tri: string;
  totalPages: number;
  noAnswerYet: string;
  loadingLabel: string;
  moreLabel: string;
  answeredByLabel: string;
  verifiedLabel: string;
};

/**
 * Charge les pages suivantes au défilement (la page 1 est rendue côté serveur
 * pour le SEO). Bouton « Charger plus » de repli pour l'accessibilité.
 */
export function QuestionsInfinite({ q, specialite, tri, totalPages, noAnswerYet, loadingLabel, moreLabel, answeredByLabel, verifiedLabel }: Props) {
  const [items, setItems] = useState<QaListCard[]>([]);
  const [page, setPage] = useState(1); // page 1 déjà rendue par le serveur
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(totalPages <= 1);
  const [armed, setArmed] = useState(false); // chargement auto seulement après 1er scroll (anti-CLS)
  const sentinel = useRef<HTMLDivElement | null>(null);

  const loadNext = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    const next = page + 1;
    try {
      const res = await loadMoreQuestions({ q, specialite, tri, page: next });
      setItems((prev) => [...prev, ...res.items]);
      setPage(next);
      if (!res.hasMore || next >= totalPages) setDone(true);
    } finally {
      setLoading(false);
    }
  }, [loading, done, page, q, specialite, tri, totalPages]);

  // Le chargement auto ne s'active qu'au premier scroll : évite un chargement
  // immédiat (sentinelle déjà visible à l'hydratation) qui décalerait le footer.
  useEffect(() => {
    const onScroll = () => setArmed(true);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done || !armed) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadNext(); },
      { rootMargin: "400px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadNext, done, armed]);

  return (
    <>
      {items.length > 0 && (
        <div className="flex flex-col gap-3 mt-3">
          {items.map((q2) => (
            <article key={q2.slug} className="card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-slate-900 leading-snug text-[15px] sm:text-base min-w-0">
                  <Link href={`/questions/${q2.slug}`} className="hover:text-primary-700 transition-colors" dir="auto">{q2.title}</Link>
                </h2>
                {!q2.hasAnswers && (
                  <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 text-xs font-semibold">{noAnswerYet}</span>
                )}
              </div>
              {q2.doctorName && (
                <p className="mt-2.5 text-[13px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-slate-400">{answeredByLabel}</span>
                  <span className="font-semibold text-slate-800">{q2.doctorName}</span>
                  {q2.doctorVerified && (
                    <span className="inline-flex items-center gap-1 text-secondary-600 font-medium">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m4 8 3 3 5-6" /></svg>
                      {verifiedLabel}
                    </span>
                  )}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500">
                {q2.specialtySlug && q2.specialtyName && (
                  <Link href={`/questions/specialite/${q2.specialtySlug}`} className="inline-flex items-center rounded-full bg-primary-50 text-primary-700 px-2.5 py-1 font-medium hover:bg-primary-100 transition-colors">
                    {q2.specialtyName}
                  </Link>
                )}
                <span>{q2.answersText}</span>
                {q2.dateText && <span>{q2.dateText}</span>}
                {q2.viewsText && <span>{q2.viewsText}</span>}
              </div>
            </article>
          ))}
        </div>
      )}

      {!done && (
        <div ref={sentinel} className="mt-4 flex justify-center">
          <button type="button" onClick={loadNext} disabled={loading} className="btn-outline text-sm py-2 px-5">
            {loading ? loadingLabel : moreLabel}
          </button>
        </div>
      )}
    </>
  );
}
