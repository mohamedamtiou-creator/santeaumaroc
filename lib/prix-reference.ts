/**
 * RÉFÉRENTIEL DE PRIX — source de vérité unique du silo tarifaire.
 *
 * ── POURQUOI CE FICHIER EXISTE ────────────────────────────────────────────
 * Avant lui, quatre sources publiaient des montants pour les mêmes actes, sans
 * arbitre : la constante `CONSULT` de `/prix`, les 68 tables de
 * `lib/specialty-content.ts`, les champs `priceMin`/`priceMax` de `MedicalExam`
 * en base, et le corpus blog. Résultat mesuré le 1er août 2026 : sur 16 actes
 * comparables entre le corpus blog et la base examens, 12 divergeaient (IRM
 * 3 500 vs 4 000, scanner 2 000 vs 2 500, échographie 500 vs 700…).
 *
 * Sur du YMYL financier, deux montants différents pour le même acte sur le même
 * site est un défaut de fiabilité, pas un détail éditorial.
 *
 * ── LA RÈGLE, EN UNE PHRASE ───────────────────────────────────────────────
 * Aucun montant ne peut être affiché sans porter son REGISTRE, sa SOURCE et son
 * STATUT de validation. Un montant sans source n'est pas publiable comme chiffre.
 *
 * ── LES DEUX REGISTRES, JAMAIS MÉLANGÉS ───────────────────────────────────
 * C'est la distinction que tout le silo doit rendre lisible :
 *
 *  · `tnr`               Tarification Nationale de Référence — base de calcul
 *                        OFFICIELLE du remboursement, fixée par convention sous
 *                        l'égide de l'ANAM. Ce n'est PAS ce que paie le patient.
 *  · `honoraires-libres` Ce que facture réellement le secteur privé, où les
 *                        honoraires sont libres. Fourchettes OBSERVÉES, datées,
 *                        jamais présentées comme officielles.
 *
 * Confondre les deux dans une même colonne est la faute la plus fréquente sur ce
 * sujet, et la plus trompeuse pour un patient qui essaie d'anticiper son reste à
 * charge.
 *
 * ── ÉTAT DU TNR AU 1er AOÛT 2026 : EN RÉVISION ────────────────────────────
 * Le TNR est dans une transition non résolue, et les sources publiques se
 * contredisent :
 *   · révision 2020 : généraliste 80 → 150 MAD, spécialiste 150 → 250 MAD,
 *     taux porté de 70 % à 80 % (aujourdhui.ma, 18/01/2020) ;
 *   · d'autres sources décrivent un remboursement à 70 % du TNR sur des barèmes
 *     de 2006 (ecoactu.ma) ;
 *   · 13/01/2026 : trois conventions ANAM/CNSS signées, effet 2 mois après
 *     publication au Bulletin Officiel (lebrief.ma) ;
 *   · 18/06/2026 : la CNSS approuve la révision, mais une convention reste à
 *     signer pour l'application effective (lematin.ma).
 * La grille officielle n'est pas récupérable publiquement (anam.ma renvoie 403).
 *
 * ⇒ Tout montant de registre `tnr` porte donc `revisionEnCours: true` et DOIT
 *   être affiché avec cette réserve. Ne jamais présenter un TNR comme un acquis
 *   stable tant que la convention n'est pas publiée au BO.
 *
 * ── COMMENT AJOUTER UN MONTANT ────────────────────────────────────────────
 * 1. Renseigner `source` : une référence vérifiable (texte + URL + date), pas
 *    « estimation interne ».
 * 2. Choisir le registre. En cas de doute, c'est `honoraires-libres`.
 * 3. Laisser `statut: "a-relire"` jusqu'à validation par un praticien en
 *    exercice, conformément à RELECTURE-MEDICALE-YMYL.md.
 * 4. Ne JAMAIS recopier le montant ailleurs : les consommateurs lisent ce
 *    fichier. C'est tout l'intérêt.
 */

/** Registre d'un montant. Voir l'en-tête : ils ne se mélangent jamais. */
export type Registre = "tnr" | "honoraires-libres";

/**
 * Statut de validation YMYL.
 *  · `valide`   relu et confirmé contre la source par un praticien en exercice
 *  · `a-relire` publié mais NON confirmé — état par défaut, et état réel de la
 *               quasi-totalité des chiffres du site au 1er août 2026
 *               (RELECTURE-MEDICALE-YMYL.md, section 1, aucune case cochée)
 *  · `retire`   volontairement sans chiffre : la recommandation du dossier YMYL
 *               quand aucune source fiable n'existe. Le consommateur doit
 *               afficher un renvoi vers l'établissement, PAS un montant.
 */
export type StatutPrix = "valide" | "a-relire" | "retire";

export type SourcePrix = {
  /** Libellé lisible, affichable tel quel sous un tableau. */
  label: string;
  url?: string;
  /** Date de la source (ISO), pas la date de lecture. */
  date?: string;
};

export type MontantPrix = {
  registre: Registre;
  /** Bornes en MAD. `null` sur les deux si `statut === "retire"`. */
  min: number | null;
  max: number | null;
  source: SourcePrix;
  statut: StatutPrix;
  /** Obligatoire et vrai pour le registre `tnr` tant que la révision n'est pas publiée au BO. */
  revisionEnCours?: boolean;
  /** Précision affichable (ex. « secteur privé, hors examens complémentaires »). */
  note?: string;
};

export type ActeTarifaire = {
  /** Identifiant stable. Pour un acte technique, ALIGNÉ sur MedicalExam.slug. */
  slug: string;
  labelFr: string;
  labelAr: string;
  /** Montant officiel de référence, s'il est connu et sourçable. */
  tnr?: MontantPrix;
  /** Fourchette observée dans le privé, s'il y en a une. */
  prive?: MontantPrix;
};

/* ── Sources ────────────────────────────────────────────────────────────── */

const S_TNR_2020: SourcePrix = {
  label: "Révision de la TNR (convention ANAM/CNSS) — Aujourd'hui le Maroc",
  url: "https://aujourdhui.ma/societe/amo-cnss-tout-ce-quil-faut-savoir-sur-la-revision-de-la-tnr-de-plusieurs-actes-medicaux",
  date: "2020-01-18",
};

/**
 * Marqueur des montants HÉRITÉS de l'ancien contenu du site (constante CONSULT
 * de /prix, tables de specialty-content, priceMin/priceMax de MedicalExam).
 * Ils sont conservés pour ne pas dégrader les pages, mais leur statut dit la
 * vérité : personne ne les a confirmés contre une source réelle.
 */
const S_EDITORIAL_HERITE: SourcePrix = {
  label: "Estimation éditoriale SantéauMaroc — non confirmée contre une grille tarifaire réelle",
  date: "2026-07-12", // date de génération du dossier de relecture YMYL
};

/* ── Consultations ──────────────────────────────────────────────────────── */

/**
 * Le TNR consultation est le SEUL montant du référentiel adossé à une source
 * externe identifiable. Il reste marqué `revisionEnCours` : la convention de
 * janvier 2026 n'est pas confirmée publiée au BO, et le taux applicable (70 %
 * ou 80 %) est rapporté de façon contradictoire selon les sources.
 */
export const CONSULTATIONS: ActeTarifaire[] = [
  {
    slug: "consultation-generaliste",
    labelFr: "Consultation de médecine générale",
    labelAr: "استشارة الطب العام",
    tnr: {
      registre: "tnr",
      min: 150,
      max: 150,
      source: S_TNR_2020,
      statut: "a-relire",
      revisionEnCours: true,
      note: "Base de remboursement, et non le prix payé au cabinet.",
    },
    prive: {
      registre: "honoraires-libres",
      min: 100,
      max: 250,
      source: S_EDITORIAL_HERITE,
      statut: "a-relire",
      note: "Secteur privé. Honoraires libres : variables selon la ville et le praticien.",
    },
  },
  {
    slug: "consultation-specialiste",
    labelFr: "Consultation chez un spécialiste",
    labelAr: "استشارة أخصائي",
    tnr: {
      registre: "tnr",
      min: 250,
      max: 250,
      source: S_TNR_2020,
      statut: "a-relire",
      revisionEnCours: true,
      note: "Base de remboursement, et non le prix payé au cabinet.",
    },
    prive: {
      registre: "honoraires-libres",
      min: 200,
      max: 500,
      source: S_EDITORIAL_HERITE,
      statut: "a-relire",
      note: "Toutes spécialités confondues. La fourchette par spécialité est plus fiable.",
    },
  },
  {
    slug: "consultation-dentaire",
    labelFr: "Consultation dentaire",
    labelAr: "استشارة الأسنان",
    prive: {
      registre: "honoraires-libres",
      min: 150,
      max: 400,
      source: S_EDITORIAL_HERITE,
      statut: "a-relire",
    },
  },
  {
    slug: "consultation-psy",
    labelFr: "Psychiatrie / psychologie",
    labelAr: "الطب النفسي",
    prive: {
      registre: "honoraires-libres",
      min: 250,
      max: 600,
      source: S_EDITORIAL_HERITE,
      statut: "a-relire",
    },
  },
];

/* ── Taux de remboursement ──────────────────────────────────────────────── */

/**
 * Taux appliqués au TNR. VOLONTAIREMENT exprimés en fourchette : les sources
 * publiques divergent (70 % sur des barèmes 2006 selon ecoactu.ma, 80 % depuis
 * la révision de 2020 selon aujourdhui.ma). Toute page qui calcule un
 * remboursement doit présenter une fourchette, jamais un montant unique faussement
 * précis — c'est la différence entre informer et induire en erreur.
 */
export const TAUX_REMBOURSEMENT = {
  ambulatoireMin: 70,
  ambulatoireMax: 80,
  hospitalisation: 90,
  source: {
    label: "Sources de presse concordantes sur la fourchette, divergentes sur le taux exact",
    date: "2026-06-18",
  } satisfies SourcePrix,
  statut: "a-relire" as StatutPrix,
  revisionEnCours: true,
} as const;

/* ── Accès ──────────────────────────────────────────────────────────────── */

const BY_SLUG = new Map(CONSULTATIONS.map((a) => [a.slug, a]));

export function getActe(slug: string): ActeTarifaire | undefined {
  return BY_SLUG.get(slug);
}

/** Formate une fourchette. Renvoie null si le montant est retiré ou vide. */
export function formatMontant(m: MontantPrix | undefined, locale: "fr" | "ar" = "fr"): string | null {
  if (!m || m.statut === "retire") return null;
  const unit = locale === "ar" ? "درهم" : "MAD";
  if (m.min != null && m.max != null && m.min !== m.max) return `${m.min} – ${m.max} ${unit}`;
  const one = m.min ?? m.max;
  return one != null ? `${one} ${unit}` : null;
}

/**
 * Un montant est-il publiable comme CHIFFRE ?
 * `retire` ⇒ non : le consommateur doit afficher un renvoi vers l'établissement.
 * Les montants `a-relire` restent affichés (ils le sont déjà aujourd'hui) mais
 * l'appelant DOIT accompagner l'affichage de la réserve, cf. mentionReserve().
 */
export function estPubliable(m: MontantPrix | undefined): boolean {
  return !!m && m.statut !== "retire" && (m.min != null || m.max != null);
}

/** Réserve à afficher sous un montant, selon son registre et son statut. */
export function mentionReserve(m: MontantPrix, locale: "fr" | "ar" = "fr"): string {
  const ar = locale === "ar";
  if (m.registre === "tnr" && m.revisionEnCours) {
    return ar
      ? "التسعيرة الوطنية المرجعية قيد المراجعة: هذا المبلغ قد يتغير."
      : "La tarification nationale de référence est en cours de révision : ce montant peut évoluer.";
  }
  if (m.registre === "tnr") {
    return ar ? "أساس التعويض، وليس السعر المدفوع." : "Base de remboursement, et non le prix payé.";
  }
  return ar
    ? "الأتعاب حرة في القطاع الخاص: مبالغ إرشادية تختلف حسب المدينة والطبيب."
    : "Honoraires libres dans le privé : montants indicatifs, variables selon la ville et le praticien.";
}
