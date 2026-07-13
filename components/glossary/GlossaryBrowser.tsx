"use client";

import { useMemo, useState } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Dictionary } from "@/lib/i18n";
import type { GlossaryCategory } from "@/lib/glossary";

export type GlossaryItem = {
  slug: string;
  term: string;
  definition: string;
  category: GlossaryCategory;
  synonyms: string[];
};

const CATS: GlossaryCategory[] = ["symptome", "maladie", "examen", "traitement", "anatomie", "general"];

/** Normalise pour une recherche insensible à la casse et aux accents. */
function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Navigateur du glossaire : recherche + filtre par catégorie, entièrement côté
 * client (aucune URL indexable générée → pas de contenu dupliqué). Le serveur
 * rend la liste complète dans le DOM ; ce composant ne fait que la filtrer.
 */
export function GlossaryBrowser({ items, t }: { items: GlossaryItem[]; t: Dictionary["glossary"] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<GlossaryCategory | "all">("all");

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    return items.filter((it) => {
      if (cat !== "all" && it.category !== cat) return false;
      if (!nq) return true;
      return (
        norm(it.term).includes(nq) ||
        it.synonyms.some((s) => norm(s).includes(nq)) ||
        norm(it.definition).includes(nq)
      );
    });
  }, [items, q, cat]);

  const available = useMemo(() => new Set(items.map((i) => i.category)), [items]);

  return (
    <div>
      {/* Recherche */}
      <div className="relative mb-5">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
          className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400">
          <circle cx="9" cy="9" r="6" /><path d="m19 19-4.5-4.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchAria}
          className="w-full ps-12 pe-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
        />
      </div>

      {/* Filtres catégorie */}
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label={t.title}>
        <button
          type="button"
          onClick={() => setCat("all")}
          aria-pressed={cat === "all"}
          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${cat === "all" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
        >
          {t.allCategories}
        </button>
        {CATS.filter((c) => available.has(c)).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${cat === c ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {t.cats[c]}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500 mb-4">{t.count.replace("{n}", String(filtered.length))}</p>

      {filtered.length === 0 ? (
        <p className="text-slate-500 py-10 text-center">{t.empty}</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {filtered.map((it) => (
            <li key={it.slug}>
              <Link
                href={`/glossaire/${it.slug}`}
                className="card p-4 flex flex-col h-full hover:border-primary-300 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="text-base font-bold text-slate-900" dir="auto">{it.term}</span>
                  <span className="text-[11px] font-semibold text-primary-600 uppercase tracking-wide">{t.cats[it.category]}</span>
                </div>
                {it.synonyms.length > 0 && (
                  <p className="text-xs text-slate-400 mt-0.5" dir="auto">
                    {t.alsoCalled} : {it.synonyms.join(" · ")}
                  </p>
                )}
                <p className="text-sm text-slate-600 leading-relaxed mt-2 line-clamp-3 flex-1" dir="auto">{it.definition}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
