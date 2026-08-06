"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { PraticienCard } from "@/components/PraticienCard";
import { PraticienCardSkeleton } from "@/components/PraticienCardSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { tSpecialty, tCity } from "@/lib/specialty-i18n";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { DoctorCardDTO, FilterOption } from "@/lib/praticiens-query";

type Props = {
  /** Liste de base (page 1, sans filtre) rendue côté serveur = shell SEO statique. */
  children: React.ReactNode;
  locale: Locale;
  cardT: Dictionary["card"];
  paginationT: Dictionary["pagination"];
  tp: Dictionary["praticiens"];
};

/**
 * Bascule statique/dynamique du listing praticiens.
 *  - Aucun paramètre d'URL → rend la liste de base SSR (`children`), donc la page
 *    /praticiens reste 100 % statique (le serveur ne lit jamais searchParams).
 *  - Filtre/recherche/pagination présents → récupère les résultats via
 *    /api/praticiens/search et les rend côté client (vues noindex, hors SEO).
 * Enveloppé dans <Suspense> par la page (requis pour useSearchParams en statique).
 */
export function PraticiensResults({ children, locale, cardT, paginationT, tp }: Props) {
  const sp = useSearchParams();
  const q          = (sp.get("q") ?? "").trim();
  const specialite = (sp.get("specialite") ?? "").trim();
  const ville      = (sp.get("ville") ?? "").trim();
  const page       = Math.max(1, Number(sp.get("page")) || 1);
  const hasFilter  = !!(q || specialite || ville || page > 1);

  // Clé de la vue courante. `entry` porte SA clé → `loading` est DÉRIVÉ (l'entrée
  // en cache ne correspond pas encore à la clé courante), ce qui évite tout
  // setState synchrone dans l'effet (setState uniquement dans les callbacks async).
  const key = `${q}|${specialite}|${ville}|${page}`;
  type Entry = {
    key: string;
    doctors: DoctorCardDTO[];
    total: number;
    totalPages: number;
    /** Libellés des filtres actifs, résolus par l'API (cf. route search). */
    activeSpecialty: FilterOption | null;
    activeCity: FilterOption | null;
  };
  const [entry, setEntry] = useState<Entry | null>(null);

  useEffect(() => {
    if (!hasFilter) return;
    const params = new URLSearchParams();
    if (q)          params.set("q", q);
    if (specialite) params.set("specialite", specialite);
    if (ville)      params.set("ville", ville);
    if (page > 1)   params.set("page", String(page));
    const ac = new AbortController();
    fetch(`/api/praticiens/search?${params.toString()}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => setEntry({
        key,
        doctors: json.doctors,
        total: json.total,
        totalPages: json.totalPages,
        activeSpecialty: json.activeSpecialty ?? null,
        activeCity: json.activeCity ?? null,
      }))
      .catch((e) => {
        if (e.name !== "AbortError")
          setEntry({ key, doctors: [], total: 0, totalPages: 0, activeSpecialty: null, activeCity: null });
      });
    return () => ac.abort();
  }, [hasFilter, key, q, specialite, ville, page]);

  // Pas de filtre → liste de base SSR (SEO). Rendu identique serveur/hydratation.
  if (!hasFilter) return <>{children}</>;

  const removeParam = (drop: "q" | "specialite" | "ville") => {
    const params = new URLSearchParams();
    if (drop !== "q"          && q)          params.set("q", q);
    if (drop !== "specialite" && specialite) params.set("specialite", specialite);
    if (drop !== "ville"      && ville)      params.set("ville", ville);
    const qs = params.toString();
    return `/praticiens${qs ? `?${qs}` : ""}`;
  };
  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q)          params.set("q", q);
    if (specialite) params.set("specialite", specialite);
    if (ville)      params.set("ville", ville);
    if (p > 1)      params.set("page", String(p));
    const qs = params.toString();
    return `/praticiens${qs ? `?${qs}` : ""}`;
  };

  // Entrée valide seulement si elle correspond à la clé courante ; sinon on charge.
  const current = entry?.key === key ? entry : null;
  const loading = !current;
  const total = current?.total ?? 0;
  const doctors = current?.doctors ?? [];
  const totalPages = current?.totalPages ?? 0;
  // Libellés fournis par l'API (plus de liste complète en props). Traduits ici :
  // l'API renvoie le nom FR de la base, comme pour les cartes.
  const activeSpecialty = current?.activeSpecialty
    ? tSpecialty(current.activeSpecialty.name, locale)
    : null;
  const activeCity = current?.activeCity ? tCity(current.activeCity.name, locale) : null;

  return (
    <>
      {/* Compteur : rendu seulement une fois les données arrivées. Auparavant il
          annonçait « 0 trouvés » pendant le chargement avant de basculer sur le
          vrai total — trompeur, et doublement annoncé par aria-live. */}
      <p className="text-slate-500 mt-2 text-sm leading-relaxed min-h-5" role="status" aria-live="polite" aria-atomic="true">
        {loading ? (
          <span className="sr-only">{tp.emptyTitle}</span>
        ) : (
          <>
            <span className="font-semibold text-slate-700">{total.toLocaleString(locale === "ar" ? "ar-MA" : "fr")}</span>{" "}
            {total !== 1 ? tp.foundMany : tp.foundOne}
            {activeCity && ` ${tp.inCity} ${activeCity}`}
            {" · "}
            <Link href="/praticiens" className="text-secondary-600 hover:text-secondary-700 underline underline-offset-2 font-medium">
              {tp.showAll}
            </Link>
          </>
        )}
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        {/* La puce de recherche vient de l'URL → affichable immédiatement. Les
            puces spécialité/ville attendent leur libellé (résolu par l'API) :
            afficher le slug brut (« gyneco-obstetrique ») serait pire que rien. */}
        {q && (
          <Link href={removeParam("q")} aria-label={`${tp.removeSearch} ${q}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
            « {q} » ✕
          </Link>
        )}
        {activeSpecialty && (
          <Link href={removeParam("specialite")} aria-label={`${tp.removeSpecialty} ${activeSpecialty}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
            {activeSpecialty} ✕
          </Link>
        )}
        {activeCity && (
          <Link href={removeParam("ville")} aria-label={`${tp.removeCity} ${activeCity}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-100 text-secondary-800 text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
            {activeCity} ✕
          </Link>
        )}
      </div>

      <div className="mt-4 h-0.5 rounded-full"
        style={{ background: "linear-gradient(90deg, #93c5fd 0%, #6ee7b7 60%, transparent 100%)" }} />

      {loading ? (
        <div className="mt-4 flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => <PraticienCardSkeleton key={i} />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="empty-state mt-4">
          <p className="font-semibold text-slate-700 text-base">{tp.emptyTitle}</p>
          <p className="text-sm text-slate-500 max-w-xs text-center">{tp.emptyText}</p>
          <Link href="/praticiens"
            className="mt-2 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            {tp.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          {doctors.map((d) => (
            <PraticienCard key={d.id} praticien={d} isPro={d.isPro} isFeatured={d.isFeatured}
              canBookOnline={d.canBookOnline} slots={d.slots} t={cardT} locale={locale} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={paginationT} />
      )}
    </>
  );
}
