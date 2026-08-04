/**
 * Calendrier national de vaccination du Maroc — données officielles.
 *
 * ⚠️ PROVENANCE, à lire avant toute modification.
 * Transcrit depuis le document officiel du Centre Anti Poison et de
 * Pharmacovigilance du Maroc (CAPM, Ministère de la Santé) :
 *   https://www.capm-sante.ma/uploads/documents/CALENDRIER%20Vaccination%20Maroc.pdf
 * Transcription du 2 août 2026, par extraction POSITIONNELLE du PDF (coordonnées
 * x/y de chaque cellule) et non de mémoire : l'alignement dose ↔ colonne d'âge
 * reproduit exactement la grille du document. Les intitulés des antigènes et des
 * colonnes sont ceux du document, y compris « Durant le premier mois ».
 *
 * RÈGLE : ne jamais modifier ces valeurs sans reprendre le document source à
 * jour. Un âge de vaccination erroné est l'erreur la plus grave que ce site
 * puisse publier. Si le calendrier officiel évolue, mettre à jour ce fichier ET
 * `SCHEDULE_REVISION` ci-dessous, puis rejouer `scripts/check-vaccination.ts`.
 */

/** Jalons du calendrier, dans l'ordre du document. */
export const MILESTONES = [
  "naissance",
  "premierMois",
  "m2",
  "m3",
  "m4",
  "m9",
  "m12",
  "m18",
  "y5",
] as const;

export type Milestone = (typeof MILESTONES)[number];

/** Âge de chaque jalon, en jours après la naissance (base du calcul de dates). */
export const MILESTONE_AGE_DAYS: Record<Milestone, number> = {
  naissance: 0,
  premierMois: 15, // « durant le premier mois » : on vise le milieu du mois
  m2: 61,
  m3: 91,
  m4: 122,
  m9: 274,
  m12: 365,
  m18: 548,
  y5: 1826,
};

/** Un antigène du calendrier et ses doses, par jalon. */
export type Antigen = {
  /** Clé stable pour la traduction. */
  key: string;
  /** Intitulé exact du document (français). */
  label: string;
  /** Sigle court affiché dans la grille. */
  short: string;
  /** Dose administrée à chaque jalon — absent = rien à ce jalon. */
  doses: Partial<Record<Milestone, string>>;
};

/**
 * Le calendrier lui-même. Chaque entrée correspond à une ligne du tableau
 * officiel ; chaque dose à une cellule remplie, à la colonne où elle figure.
 */
export const ANTIGENS: readonly Antigen[] = [
  {
    key: "hb",
    label: "Vaccin contre l'hépatite B (HB)",
    short: "HB",
    doses: {
      // Le document distingue explicitement les deux cas.
      naissance: "HB1 dans les 24 h (maternité ou clinique)",
      premierMois: "Dose 1 si elle n'a pas été administrée dans les 24 h",
    },
  },
  {
    key: "bcg",
    label: "Vaccin anti BCG (tuberculose)",
    short: "BCG",
    doses: { premierMois: "Dose 1" },
  },
  {
    key: "vpo",
    label: "Vaccin anti Polio Oral (VPO)",
    short: "VPO",
    doses: {
      premierMois: "Dose 0",
      m2: "Dose 1",
      m3: "Dose 2",
      m4: "Dose 3",
      m18: "Dose 4",
      y5: "Dose 5",
    },
  },
  {
    key: "pneumo",
    label: "Vaccin anti pneumococcique",
    short: "Pneumo",
    doses: { m2: "Dose 1", m4: "Dose 2", m12: "Dose 3" },
  },
  {
    key: "rotavirus",
    label: "Vaccin anti rotavirus (série de 3 doses)",
    short: "Rotavirus",
    doses: { m2: "Dose 1", m3: "Dose 2", m4: "Dose 3" },
  },
  {
    key: "pentavalent",
    label: "Vaccin anti DTC-Hib-HB (vaccin pentavalent)",
    short: "Pentavalent",
    doses: { m2: "Dose 1", m3: "Dose 2", m4: "Dose 3" },
  },
  {
    key: "vpi",
    label: "Vaccin antipoliomyélitique inactivé (VPI)",
    short: "VPI",
    doses: { m4: "Dose 1" },
  },
  {
    key: "rr",
    label: "Vaccin combiné RR (rougeole-rubéole)",
    short: "RR",
    doses: { m9: "Dose 1", m18: "Dose 2" },
  },
  {
    key: "dtc",
    label: "Vaccin anti DTC",
    short: "DTC",
    doses: { m18: "Rappel 1", y5: "Rappel 2" },
  },
];

/** Révision de la transcription — à incrémenter à chaque reprise du document. */
export const SCHEDULE_REVISION = "2026-08-02";

export const SCHEDULE_SOURCE = {
  label: "Calendrier national de vaccination — Programme national d'immunisation",
  publisher: "Centre Anti Poison et de Pharmacovigilance du Maroc (Ministère de la Santé)",
  url: "https://www.capm-sante.ma/uploads/documents/CALENDRIER%20Vaccination%20Maroc.pdf",
} as const;

/** Antigènes dus à un jalon donné, dans l'ordre du document. */
export function antigensAt(milestone: Milestone): { antigen: Antigen; dose: string }[] {
  return ANTIGENS.flatMap((a) => {
    const dose = a.doses[milestone];
    return dose ? [{ antigen: a, dose }] : [];
  });
}
