/**
 * Contrôle de couverture i18n du cluster `/outils` : détecte tout champ arabe
 * manquant (qui retomberait silencieusement en français) et rappelle l'état du
 * verrou d'indexation AR.
 *   npx tsx scripts/check-tools-i18n.ts
 */
import { TOOL_SLUGS } from "@/lib/health-tools";
import { getToolContent } from "@/lib/tools-content";
import { TOOLS_CONTENT_AR, TOOLS_AR_REVIEWED } from "@/lib/tools-content-ar";

const isAr = (s: string) => /[؀-ۿ]/.test(s);
let gaps = 0;
console.log("verrou AR (TOOLS_AR_REVIEWED) :", TOOLS_AR_REVIEWED ?? "null → AR en noindex");
for (const slug of TOOL_SLUGS) {
  const c = getToolContent(slug, "ar");
  const ar = TOOLS_CONTENT_AR[slug];
  const missing: string[] = [];
  if (!ar) missing.push("TOUT");
  else {
    if (!isAr(c.h1)) missing.push("h1");
    if (!isAr(c.metaTitle)) missing.push("metaTitle");
    if (!isAr(c.intro)) missing.push("intro");
    for (const [k, v] of Object.entries(c.fields)) if (!isAr(v.label)) missing.push(`champ:${k}`);
    for (const [k, v] of Object.entries(c.categories)) if (!isAr(v.label) || !isAr(v.advice)) missing.push(`catégorie:${k}`);
    for (const [k, v] of Object.entries(c.notes)) if (!isAr(v)) missing.push(`note:${k}`);
    for (const [k, v] of Object.entries(c.detailLabels)) if (!isAr(v)) missing.push(`détail:${k}`);
    if (c.limits.some((l) => !isAr(l))) missing.push("limites");
    if (c.howTo.some((h) => !isAr(h))) missing.push("méthode");
    if (c.faq.some((f) => !isAr(f.q) || !isAr(f.a))) missing.push("faq");
  }
  if (missing.length) { gaps++; console.log(`  ${slug} → repli FR sur : ${missing.join(", ")}`); }
  else console.log(`  ${slug} → arabe complet (${c.faq.length} questions)`);
}
console.log(gaps === 0 ? `\nTraduction arabe complète sur les ${TOOL_SLUGS.length} outils` : `\n${gaps} outil(s) avec repli FR`);
