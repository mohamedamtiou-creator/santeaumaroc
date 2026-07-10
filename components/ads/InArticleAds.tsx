import { AdSlot } from "./AdSlot";
import { ADS } from "@/lib/ads/config";

/**
 * Rend le corps HTML d'un article (déjà assaini) et interleave des encarts
 * `AdSlot` entre les sections H2, sans jamais toucher au contenu rédactionnel.
 *
 * Server Component : le HTML reste rendu côté serveur (SSG préservé) ; seul
 * chaque `AdSlot` est un îlot client. Découpe aux ouvertures de `<h2>` — même
 * heuristique que `extractHeadings` (components/blog/TableOfContents.tsx).
 *
 * Grille de densité (cf. étude, §4) appliquée par `adSectionOffsets` :
 *   - < 2 sections H2 → aucun encart (article sans structure)
 *   - après la 1re section H2, puis la 3e, puis en fin — plafond 3
 *   - espacement garanti ≥ 2 sections H2 entre deux encarts
 *
 * Emploi dans la page :
 *   const showAds = adsActive("blog") && !isDoctorAudience;
 *   <InArticleAds html={contentHtml} active={showAds} />
 */

/** Scinde le HTML en segments, un par section H2 (le pré-H2 forme le 1er segment). */
function splitAtH2(html: string): string[] {
  return html.split(/(?=<h2[\s>])/i).filter((s) => s.trim().length > 0);
}

/**
 * Indices (0-based, parmi les SECTIONS H2) après lesquels insérer un encart.
 * `nbSections` = nombre de blocs H2 (hors intro pré-H2).
 */
function adSectionOffsets(nbSections: number): number[] {
  if (nbSections < 2) return [];
  const max = Math.min(3, Math.floor(nbSections / 2));
  const offsets = [0]; // après la 1re section H2
  if (max >= 2) offsets.push(2); // après la 3e section H2
  if (max >= 3) offsets.push(nbSections - 1); // en fin de contenu
  return offsets;
}

export function InArticleAds({ html, active }: { html: string; active: boolean }) {
  // Pas de pub → rendu identique à l'existant (un seul bloc `blog-prose`).
  if (!active || !ADS.inArticleSlot) {
    return <div dir="auto" className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const parts = splitAtH2(html);
  // Le 1er segment est l'intro si elle ne commence pas par un <h2>.
  const introOffset = parts.length > 0 && !/^<h2[\s>]/i.test(parts[0].trim()) ? 1 : 0;
  const nbSections = parts.length - introOffset;

  // Traduit les offsets « parmi les sections H2 » en indices de `parts`.
  const adAfter = new Set(adSectionOffsets(nbSections).map((o) => introOffset + o));

  return (
    <>
      {parts.map((segment, i) => (
        <div key={i}>
          <div dir="auto" className="blog-prose" dangerouslySetInnerHTML={{ __html: segment }} />
          {adAfter.has(i) && <AdSlot slot={ADS.inArticleSlot} />}
        </div>
      ))}
    </>
  );
}
