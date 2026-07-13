import type { Dictionary } from "@/lib/i18n";

export type SourceItem = {
  label: string;
  url?: string;
  publisher?: string;
  year?: string;
};

/**
 * Parse le champ `sources` (JSON) en liste typée, tolérant aux entrées
 * malformées. Format attendu : [{ label, url?, publisher?, year? }].
 */
export function parseSources(raw: string | null | undefined): SourceItem[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && typeof x.label === "string" && x.label.trim())
      .map((x) => ({
        label: String(x.label).trim(),
        url: typeof x.url === "string" && x.url.trim() ? x.url.trim() : undefined,
        publisher: typeof x.publisher === "string" && x.publisher.trim() ? x.publisher.trim() : undefined,
        year: x.year != null && String(x.year).trim() ? String(x.year).trim() : undefined,
      }));
  } catch {
    return [];
  }
}

/**
 * Bloc « Sources et références » en pied d'article.
 *
 * Rôle E-E-A-T / GEO : rendre visibles et vérifiables les références médicales
 * qui appuient le contenu (OMS, HAS, Ministère de la Santé, PubMed…). Les liens
 * sortants vers des sources d'autorité sont eux-mêmes un signal de confiance ;
 * on ne les met donc PAS en `nofollow`. Les données sont aussi émises en
 * JSON-LD `citation` sur l'article (côté page) pour l'attribution par les IA.
 */
export function ArticleSources({ items, t }: { items: SourceItem[]; t: Dictionary["blog"] }) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label={t.sourcesTitle}
      className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
        {t.sourcesTitle}
      </h2>
      <p className="text-sm text-slate-500 mb-4">{t.sourcesNote}</p>
      <ol className="space-y-2.5 list-none m-0 p-0">
        {items.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed">
            <span
              aria-hidden="true"
              className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 tabular-nums"
            >
              {i + 1}
            </span>
            <span className="min-w-0 text-slate-600" dir="auto">
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener"
                  className="font-medium text-primary-700 underline decoration-primary-200 underline-offset-2 hover:decoration-primary-500 break-words"
                >
                  {s.label}
                </a>
              ) : (
                <span className="font-medium text-slate-700">{s.label}</span>
              )}
              {(s.publisher || s.year) && (
                <span className="text-slate-400">
                  {" — "}
                  {[s.publisher, s.year].filter(Boolean).join(", ")}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
