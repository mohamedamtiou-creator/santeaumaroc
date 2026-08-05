/**
 * Garde-fou sur l'habillage arabe du calendrier vaccinal.
 *
 * `lib/vaccination-schedule-ar.ts` ne traduit que le sigle et le libellé de dose —
 * jamais un âge ni une correspondance dose ↔ jalon. Ce script vérifie que la
 * traduction reste FIDÈLE : même numéro de dose, même nature (dose vs rappel), et
 * pas de cellule oubliée qui retomberait silencieusement en français sur des pages
 * arabes indexées.
 *
 *   npx tsx scripts/check-vaccination-ar.ts
 *
 * À rejouer après toute modification de l'un des deux fichiers.
 */
import { ANTIGENS, MILESTONES } from "../lib/vaccination-schedule";
import { antigenDoseLabel } from "../lib/vaccination-schedule-ar";

/** Sigles latins volontairement conservés en arabe (ils figurent sur le carnet). */
const KEPT_LATIN = /\((?:BCG|VPO|VPI|RR|DTC)\)|التهاب الكبد B/g;

const problems: string[] = [];
let checked = 0;

for (const antigen of ANTIGENS) {
  for (const milestone of MILESTONES) {
    const fr = antigen.doses[milestone];
    if (!fr) continue;
    checked++;

    const frLabel = antigenDoseLabel(antigen, milestone, fr, "fr");
    const arLabel = antigenDoseLabel(antigen, milestone, fr, "ar");
    const at = `${antigen.key}/${milestone}`;

    // 1. Une entrée manquante retombe sur le français : invisible en relecture,
    //    mais bien publié en arabe.
    if (arLabel === frLabel) {
      problems.push(`${at} : non traduit (repli français) — « ${arLabel} »`);
    } else if (/[A-Za-zÀ-ÿ]{4,}/.test(arLabel.replace(KEPT_LATIN, ""))) {
      problems.push(`${at} : reste du français — « ${arLabel} »`);
    }

    // 2. L'invariant critique : le NUMÉRO de dose doit être identique.
    const dosePart = arLabel.split("—").slice(1).join("—");
    const nFr = (fr.match(/\d+/g) ?? []).join(",");
    const nAr = (dosePart.match(/\d+/g) ?? []).join(",");
    if (nFr !== nAr) {
      problems.push(`${at} : numéro divergent — fr[${nFr}] ar[${nAr}] · « ${fr} » / « ${arLabel} »`);
    }

    // 3. Un rappel ne doit pas devenir une dose de primovaccination.
    if (/rappel/i.test(fr) !== /تذكير/.test(arLabel)) {
      problems.push(`${at} : dose/rappel divergent — « ${fr} » / « ${arLabel} »`);
    }
  }
}

if (problems.length > 0) {
  console.error(`✗ ${problems.length} problème(s) sur ${checked} doses :\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`✓ ${checked} doses — habillage arabe fidèle (numéros et nature préservés).`);
