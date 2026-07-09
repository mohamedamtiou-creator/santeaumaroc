import type { Dictionary } from "@/lib/i18n";

/**
 * Encadré « À retenir » (TL;DR) placé en tête d'article.
 * Synthèse en puces des points clés — c'est la matière première extraite
 * par Google AI Overview, ChatGPT, Perplexity & Gemini (GEO).
 * Rendu uniquement si des points sont fournis.
 */
export function KeyTakeaways({
  items,
  t,
}: {
  items: string[];
  t: Dictionary["blog"];
}) {
  if (!items.length) return null;
  return (
    <aside
      aria-label={t.keyTakeawaysTitle}
      className="blog-takeaways mb-10 rounded-2xl border border-secondary-200 bg-secondary-50/60 p-5 sm:p-6"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-secondary-800 mb-3">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 shrink-0 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v3M10 2a5 5 0 0 0-3 9c.6.5 1 1.2 1 2h4c0-.8.4-1.5 1-2a5 5 0 0 0-3-9z"/>
          <path d="M8 18h4"/>
        </svg>
        {t.keyTakeawaysTitle}
      </p>
      <ul className="space-y-2.5" dir="auto">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25" className="w-4 h-4 mt-1 shrink-0 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 8 3.5 3.5L13 4"/>
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
