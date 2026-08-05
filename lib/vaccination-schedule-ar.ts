import type { Antigen, Milestone } from "./vaccination-schedule";
import type { Locale } from "./i18n";

/**
 * Habillage arabe du calendrier vaccinal.
 *
 * Fichier SÉPARÉ de `vaccination-schedule.ts`, à dessein : la transcription
 * française y est une copie positionnelle du document officiel du CAPM et ne doit
 * bouger qu'avec ce document. Ici on ne traduit que l'HABILLAGE — sigle affiché et
 * libellé de dose. Aucun âge, aucun jalon, aucune correspondance dose ↔ colonne
 * d'âge n'est redéfini : ils restent lus depuis la transcription.
 *
 * TERMINOLOGIE : reprise terme pour terme de celle déjà relue par l'éditeur le
 * 3 août 2026 dans `tools-content-ar.ts` (réponse FAQ « ما هي اللقاحات… »), pour
 * ne pas faire coexister deux vocabulaires arabes sur le même sujet. Le format
 * « nom arabe (SIGLE) » est celui de l'éditeur : le sigle latin est ce qui figure
 * sur le carnet de santé, il permet le recoupement.
 *
 * Traduction partielle tolérée, comme pour `ToolContentAr` : une entrée ou une
 * dose absente retombe sur le français plutôt que d'afficher du vide.
 */
type AntigenAr = {
  short: string;
  doses: Partial<Record<Milestone, string>>;
};

const ANTIGENS_AR: Record<string, AntigenAr> = {
  hb: {
    short: "التهاب الكبد B",
    doses: {
      // Le français encode la dose dans le sigle (« HB1 ») ; on l'explicite en
      // chiffre, comme toutes les autres cellules du tableau.
      naissance: "الجرعة 1 خلال 24 ساعة (بمستشفى الولادة أو المصحة)",
      premierMois: "الجرعة 1 إذا لم تُعطَ خلال 24 ساعة",
    },
  },
  bcg: {
    short: "السلّ (BCG)",
    doses: { premierMois: "الجرعة 1" },
  },
  vpo: {
    short: "شلل الأطفال الفموي (VPO)",
    doses: {
      premierMois: "الجرعة 0",
      m2: "الجرعة 1",
      m3: "الجرعة 2",
      m4: "الجرعة 3",
      m18: "الجرعة 4",
      y5: "الجرعة 5",
    },
  },
  pneumo: {
    short: "المكوّرات الرئوية",
    doses: { m2: "الجرعة 1", m4: "الجرعة 2", m12: "الجرعة 3" },
  },
  rotavirus: {
    short: "الروتافيروس",
    doses: { m2: "الجرعة 1", m3: "الجرعة 2", m4: "الجرعة 3" },
  },
  pentavalent: {
    short: "اللقاح الخماسي",
    doses: { m2: "الجرعة 1", m3: "الجرعة 2", m4: "الجرعة 3" },
  },
  vpi: {
    short: "شلل الأطفال المُحقَن (VPI)",
    doses: { m4: "الجرعة 1" },
  },
  rr: {
    short: "الحصبة-الحصبة الألمانية (RR)",
    doses: { m9: "الجرعة 1", m18: "الجرعة 2" },
  },
  dtc: {
    short: "الدفتيريا-الكزاز-الشاهوق (DTC)",
    doses: { m18: "تذكير 1", y5: "تذكير 2" },
  },
};

/**
 * Libellé « sigle — dose » d'un antigène à un jalon, dans la locale demandée.
 * C'est le SEUL point où le calendrier devient du texte affichable : les cellules
 * du planning en sortent déjà localisées.
 */
export function antigenDoseLabel(
  antigen: Antigen,
  milestone: Milestone,
  dose: string,
  locale: Locale,
): string {
  if (locale !== "ar") return `${antigen.short} — ${dose}`;
  const ar = ANTIGENS_AR[antigen.key];
  return `${ar?.short ?? antigen.short} — ${ar?.doses[milestone] ?? dose}`;
}
