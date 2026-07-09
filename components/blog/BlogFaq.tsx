import type { Dictionary } from "@/lib/i18n";

export type FaqItem = { q: string; a: string };

/**
 * Section FAQ : accordéon natif (details/summary, zéro JS) + JSON-LD FAQPage
 * émis au même endroit pour garantir la parité contenu visible / données
 * structurées (exigence Google). Cible « People Also Ask » + citations IA.
 */
export function BlogFaq({
  items,
  t,
}: {
  items: FaqItem[];
  t: Dictionary["blog"];
}) {
  if (!items.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <section aria-labelledby="faq-title" className="mt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <h2 id="faq-title" className="text-2xl font-extrabold text-slate-900 tracking-tight mb-5 flex items-center gap-2.5">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-6 h-6 shrink-0 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="8"/><path d="M7.5 7.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3"/><circle cx="10" cy="14" r=".5" fill="currentColor"/>
        </svg>
        {t.faqTitle}
      </h2>
      <div className="space-y-3">
        {items.map((it, i) => (
          <details
            key={i}
            dir="auto"
            className="group rounded-xl border border-slate-200 bg-white overflow-hidden [&[open]]:border-primary-200 [&[open]]:shadow-sm"
          >
            <summary className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 cursor-pointer text-[15px] font-semibold text-slate-800 [&::-webkit-details-marker]:hidden list-none select-none hover:text-primary-700">
              <span>{it.q}</span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="m4 6 4 4 4-4"/>
              </svg>
            </summary>
            <div className="px-4 sm:px-5 pb-4 pt-0 text-[15px] leading-relaxed text-slate-600 border-t border-slate-100">
              <p className="pt-3">{it.a}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
