"use client";

import { useMemo, useState } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Dictionary } from "@/lib/i18n";

export type SymptomItem = {
  slug: string;
  term: string;
  shortAnswer: string;
  synonyms: string[];
};

function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Liste + recherche des symptômes, entièrement côté client (pas d'URL
 * indexable). Le serveur rend la liste complète dans le DOM (SEO) ; ce
 * composant ne fait que la filtrer.
 */
export function SymptomBrowser({ items, t }: { items: SymptomItem[]; t: Dictionary["symptoms"] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    if (!nq) return items;
    return items.filter(
      (it) => norm(it.term).includes(nq) || it.synonyms.some((s) => norm(s).includes(nq)) || norm(it.shortAnswer).includes(nq),
    );
  }, [items, q]);

  return (
    <div>
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

      <p className="text-sm text-slate-500 mb-4">{t.count.replace("{n}", String(filtered.length))}</p>

      {filtered.length === 0 ? (
        <p className="text-slate-500 py-10 text-center">{t.empty}</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {filtered.map((it) => (
            <li key={it.slug}>
              <Link href={`/symptomes/${it.slug}`} className="card p-4 flex flex-col h-full hover:border-primary-300 transition-colors">
                <span className="text-base font-bold text-slate-900" dir="auto">{it.term}</span>
                {it.synonyms.length > 0 && (
                  <p className="text-xs text-slate-400 mt-0.5" dir="auto">{t.alsoCalled} : {it.synonyms.join(" · ")}</p>
                )}
                <p className="text-sm text-slate-600 leading-relaxed mt-2 line-clamp-3 flex-1" dir="auto">{it.shortAnswer}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
