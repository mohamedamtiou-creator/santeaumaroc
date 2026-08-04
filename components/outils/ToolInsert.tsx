import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { ToolSlug } from "@/lib/health-tools";
import { getToolContent } from "@/lib/tools-content";
import { ToolIcon } from "@/components/outils/ToolIcon";

/**
 * Encart « outils utiles » posé sur les fiches du catalogue (symptômes, maladies,
 * examens, prévention, spécialités). C'est le maillage retour du cluster
 * `/outils` : la fiche obésité envoie vers le calcul d'IMC et le tour de taille,
 * l'outil renvoie vers la fiche.
 *
 * Server component, sans requête : la liste des outils vient du registre inversé
 * (`lib/health-tools-inserts.ts`). Ne rend rien si aucun outil ne correspond.
 */
export function ToolInsert({
  slugs,
  locale,
  t,
}: {
  slugs: readonly ToolSlug[];
  locale: Locale;
  t: Dictionary["tools"];
}) {
  if (slugs.length === 0) return null;

  return (
    <section aria-labelledby="tool-insert-title" className="mt-8 rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6">
      <h2 id="tool-insert-title" className="text-xs font-bold uppercase tracking-widest text-primary-700 mb-3.5 flex items-center gap-2">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16.5 8 12M13.5 3.5l3 3-6 6-3-3 6-6zM6 14l-1.5 4 4-1.5" />
        </svg>
        {t.insertTitle}
      </h2>

      <ul className={`grid gap-3 ${slugs.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {slugs.map((slug) => {
          const content = getToolContent(slug, locale);
          return (
            <li key={slug}>
              <Link
                href={`/outils/${slug}`}
                className="group flex h-full items-start gap-3 rounded-xl border border-primary-100 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                dir="auto"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                  <ToolIcon slug={slug} className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-slate-900 leading-snug group-hover:text-primary-700">
                    {content.name}
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-500 leading-relaxed">{content.teaser}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
