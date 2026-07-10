"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { QaSafetyNote } from "@/components/qa/QaSafetyNote";
import { loadMoreQuestions, type QaListCard } from "@/features/qa/list-actions";
import type { Dictionary, Locale } from "@/lib/i18n";

type QaT = Dictionary["qa"];

/**
 * Vue « résultats » de /questions (recherche `q`, filtre spécialité, tri) rendue
 * ENTIÈREMENT côté client → la page /questions reste STATIQUE (le serveur ne lit
 * jamais searchParams et pré-rend la home éditoriale `QaHome` = `children`).
 * Aucun paramètre → home canonique ; sinon → liste paginée (infinite scroll) via
 * la server action `loadMoreQuestions`. Ces vues sont noindex (hors SEO).
 * Enveloppé dans <Suspense> par la page (requis pour useSearchParams en statique).
 */
export function QuestionsResults({
  children, locale, t,
}: {
  children: React.ReactNode;
  locale: Locale;
  t: QaT;
}) {
  const sp = useSearchParams();
  const q          = (sp.get("q") ?? "").trim();
  const specialite = (sp.get("specialite") ?? "").trim();
  const triRaw     = (sp.get("tri") ?? "").trim();
  const hasFilter  = !!(q || specialite || triRaw);
  const tri        = triRaw || "recent";

  const key = `${q}|${specialite}|${tri}`;
  const [items, setItems] = useState<QaListCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ready">("idle");
  const [loadingMore, setLoadingMore] = useState(false);
  const [armed, setArmed] = useState(false);
  const loadedKey = useRef<string>("");
  const sentinel = useRef<HTMLDivElement | null>(null);

  // Chargement de la page 1 (et rechargement quand la clé de filtre change).
  useEffect(() => {
    if (!hasFilter) return;
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    setState("loading");
    let cancelled = false;
    loadMoreQuestions({ q, specialite, tri, page: 1 })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setHasMore(res.hasMore);
        setPage(1);
        setState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]); setTotal(0); setHasMore(false); setState("ready");
      });
    return () => { cancelled = true; };
  }, [hasFilter, key, q, specialite, tri]);

  const loadNext = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    try {
      const res = await loadMoreQuestions({ q, specialite, tri, page: next });
      setItems((prev) => [...prev, ...res.items]);
      setPage(next);
      setHasMore(res.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, q, specialite, tri]);

  // Le chargement auto ne s'active qu'au premier scroll (anti-CLS).
  useEffect(() => {
    const onScroll = () => setArmed(true);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || !armed) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadNext(); },
      { rootMargin: "400px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadNext, hasMore, armed]);

  // Aucun filtre → home éditoriale SSR (canonique). Rendu identique serveur/hydratation.
  if (!hasFilter) return <>{children}</>;

  const listHeading = q
    ? t.resultsFor.replace("{q}", q)
    : tri === "sans-reponse"
      ? t.listUnanswered
      : t.allQuestions;

  const sortLink = (skey: string, label: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (specialite) params.set("specialite", specialite);
    if (skey !== "recent") params.set("tri", skey);
    const active = tri === skey;
    return (
      <Link
        key={skey}
        href={`/questions${params.toString() ? `?${params}` : ""}`}
        className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
          active ? "bg-primary-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
        }`}
      >
        {label}
      </Link>
    );
  };

  const loading = state !== "ready";

  return (
    <div className="page-outer">
      <header className="mb-6">
        <p className="section-eyebrow mb-1.5">{t.eyebrow}</p>
        <h1 className="section-title" dir="auto">{listHeading}</h1>
        <p className="section-subtitle mt-2">{t.listSubtitle}</p>
        <div className="mt-5">
          <Link href="/questions/poser" className="btn-primary inline-flex text-sm py-2.5 px-5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 me-1.5" aria-hidden="true" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
            {t.ask}
          </Link>
        </div>
      </header>

      <div className="mb-5">
        <QaSafetyNote t={t} />
      </div>

      {/* Recherche */}
      <form action="/questions" method="get" className="mb-4">
        {specialite && <input type="hidden" name="specialite" value={specialite} />}
        {tri !== "recent" && <input type="hidden" name="tri" value={tri} />}
        <div className="relative">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t.search}
            aria-label={t.searchAria}
            className="input-field ps-10"
          />
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="4.5" /><path d="m11 11 3 3" /></svg>
        </div>
      </form>

      {/* Tri */}
      <div className="flex flex-wrap gap-2 mb-5">
        {sortLink("recent", t.sortRecent)}
        {sortLink("populaires", t.sortPopular)}
        {sortLink("sans-reponse", t.sortUnanswered)}
      </div>

      <p className="text-sm text-slate-500 mb-3" role="status" aria-live="polite">
        <span className="font-semibold text-slate-700">{total.toLocaleString(locale === "ar" ? "ar-MA" : "fr")}</span>{" "}
        {total === 1 ? t.foundOne : t.foundMany}
        {" · "}
        <Link href="/questions" className="text-secondary-600 hover:text-secondary-700 underline underline-offset-2 font-medium">{t.showAll}</Link>
      </p>

      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 sm:p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/3 mt-3" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p className="font-semibold text-slate-700">{t.emptyTitle}</p>
          <p className="text-sm text-slate-500">{t.emptyText}</p>
          <Link href="/questions/poser" className="btn-primary mt-3 text-sm">{t.ask}</Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((q2) => (
              <article key={q2.slug} className="card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-slate-900 leading-snug text-[15px] sm:text-base min-w-0">
                    <Link href={`/questions/${q2.slug}`} className="hover:text-primary-700 transition-colors" dir="auto">{q2.title}</Link>
                  </h2>
                  {!q2.hasAnswers && (
                    <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 text-xs font-semibold">{t.noAnswerYet}</span>
                  )}
                </div>
                {q2.doctorName && (
                  <p className="mt-2.5 text-[13px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-slate-400">{t.answeredBy}</span>
                    <span className="font-semibold text-slate-800">{q2.doctorName}</span>
                    {q2.doctorVerified && (
                      <span className="inline-flex items-center gap-1 text-secondary-600 font-medium">
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m4 8 3 3 5-6" /></svg>
                        {t.verifiedBadge}
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

          {hasMore && (
            <div ref={sentinel} className="mt-4 flex justify-center">
              <button type="button" onClick={loadNext} disabled={loadingMore} className="btn-outline text-sm py-2 px-5">
                {loadingMore ? t.loading : t.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
