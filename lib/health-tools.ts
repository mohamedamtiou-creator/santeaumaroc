import type { Locale } from "./i18n";
import { MILESTONES, MILESTONE_AGE_DAYS, antigensAt } from "./vaccination-schedule";

/**
 * Moteur du cluster `/outils` — définitions de champs + calculs purs.
 *
 * ⚠️ Ce module est importé par l'îlot client (`components/outils/ToolCalculator`)
 * ET par les pages serveur : il ne doit JAMAIS importer prisma, `server-only`,
 * ni le dictionnaire i18n en valeur (seul `import type` est autorisé, effacé à
 * la compilation). Tout libellé vit dans `lib/tools-content.ts`.
 *
 * Règle YMYL : ces outils appliquent des formules ou des scores PUBLIÉS et cités
 * (OMS, ESC/ESH, Mifflin-St Jeor, Naegele, FINDRISC). Aucune règle maison, aucun
 * diagnostic. Les seuils numériques ci-dessous doivent rester synchronisés avec
 * les fourchettes rédigées dans `lib/tools-content.ts` (colonne « range »).
 */

// L'ordre porte la logique éditoriale du hub : corpulence, énergie, sport,
// grossesse, cardio, métabolique.
export const TOOL_SLUGS = [
  "calcul-imc",
  "tour-de-taille",
  "calcul-calories",
  "besoins-en-eau",
  "frequence-cardiaque",
  "date-accouchement",
  "semaines-grossesse",
  "ovulation",
  "calendrier-vaccinal",
  "dose-paracetamol",
  "tension-arterielle",
  "risque-diabete",
] as const;

export type ToolSlug = (typeof TOOL_SLUGS)[number];

export function isToolSlug(v: string): v is ToolSlug {
  return (TOOL_SLUGS as readonly string[]).includes(v);
}

/** Sévérité du résultat → couleur et hiérarchie visuelle (jamais un diagnostic). */
export type Severity = "good" | "watch" | "warn" | "alert";

export type FieldKind = "number" | "select" | "date";

export type ToolField = {
  name: string;
  kind: FieldKind;
  /** Clé d'unité affichée dans le champ (libellé dans le contenu localisé). */
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Clés d'options stables pour un `select` (libellés localisés). */
  options?: readonly string[];
  /** Valeur pré-remplie — uniquement des valeurs neutres, jamais une donnée de santé. */
  defaultValue?: string;
  /** Le champ occupe toute la largeur de la grille du formulaire. */
  wide?: boolean;
};

export type ToolOutcome = {
  /** Valeur principale déjà formatée dans la locale. */
  value: string;
  /** Clé d'unité de la valeur principale. */
  unit?: string;
  /** Clé de catégorie → libellé + conseil dans le contenu localisé. */
  categoryKey: string;
  severity: Severity;
  /** Lignes secondaires : clé de libellé (localisée) + valeur formatée. */
  details?: { key: string; value: string }[];
  /**
   * Résultat tabulaire, quand une seule valeur ne suffit pas (un planning, par
   * exemple). Les en-têtes sont des CLÉS résolues dans le contenu localisé ;
   * les cellules sont déjà formatées dans la locale.
   */
  columns?: string[];
  rows?: { cells: string[]; severity?: Severity; emphasis?: boolean }[];
  /** Clés de notes complémentaires à afficher sous le résultat. */
  noteKeys?: string[];
  /** Déclenche l'encadré d'urgence (seuil justifiant un avis rapide). */
  emergency?: boolean;
};

/** Clés d'erreur de validation, résolues dans le contenu localisé. */
export type ErrorKey =
  | "required"
  | "range"
  | "coherence"
  | "futureDate"
  | "tooOld"
  /** Saisies mutuellement invraisemblables (poids/âge) : filet contre la faute de frappe. */
  | "implausible";

export type ToolResult =
  | { ok: true; outcome: ToolOutcome }
  | { ok: false; errors: Record<string, ErrorKey> };

export type ToolDefinition = {
  slug: ToolSlug;
  fields: readonly ToolField[];
  /** Catégories dans l'ordre de la table de référence rendue côté serveur.
   *  La sévérité est portée ici (source unique) afin que la table serveur et le
   *  résultat client affichent exactement le même code couleur. */
  categories: readonly { key: string; severity: Severity }[];
  /** Spécialité du CTA principal (slug vérifié en base). */
  specialtySlug: string;
  /** Spécialités secondaires proposées en second rideau. */
  altSpecialtySlugs: readonly string[];
  /** Slugs `HealthTopic` liés — résolus en base, les absents sont ignorés. */
  topicSlugs: readonly string[];
  /** Slugs `MedicalExam` liés — mêmes règles. */
  examSlugs: readonly string[];
  /** Date ISO de dernière relecture éditoriale de la page (E-E-A-T, `lastReviewed`). */
  reviewed: string;
};

const REVIEWED = "2026-08-02";

// ─────────────────────────────────────────────────────────────────────────────
// Registre
// ─────────────────────────────────────────────────────────────────────────────

const YES_NO = ["oui", "non"] as const;

export const TOOLS: Record<ToolSlug, ToolDefinition> = {
  "calcul-imc": {
    slug: "calcul-imc",
    fields: [
      { name: "poids", kind: "number", unit: "kg", min: 2, max: 400, step: 0.1 },
      { name: "taille", kind: "number", unit: "cm", min: 50, max: 250, step: 0.5 },
    ],
    categories: [
      { key: "maigreur", severity: "watch" },
      { key: "normal", severity: "good" },
      { key: "surpoids", severity: "watch" },
      { key: "obesite1", severity: "warn" },
      { key: "obesite2", severity: "warn" },
      { key: "obesite3", severity: "alert" },
    ],
    specialtySlug: "nutrition",
    altSpecialtySlugs: ["dietetique", "endocrinologie-et-maladies-metaboliques"],
    topicSlugs: ["obesite", "hypertension-arterielle", "diabete", "hypercholesterolemie", "apnee-du-sommeil", "steatose-hepatique"],
    examSlugs: ["prise-de-sang"],
    reviewed: REVIEWED,
  },

  "tour-de-taille": {
    slug: "tour-de-taille",
    fields: [
      { name: "sexe", kind: "select", options: ["femme", "homme"] },
      { name: "tourTaille", kind: "number", unit: "cm", min: 40, max: 250, step: 0.5 },
      { name: "taille", kind: "number", unit: "cm", min: 100, max: 250, step: 0.5 },
      { name: "tourHanches", kind: "number", unit: "cm", min: 50, max: 250, step: 0.5 },
    ],
    categories: [
      { key: "sousLeSeuil", severity: "watch" },
      { key: "sain", severity: "good" },
      { key: "augmente", severity: "warn" },
      { key: "eleve", severity: "alert" },
    ],
    specialtySlug: "nutrition",
    altSpecialtySlugs: ["dietetique", "endocrinologie-et-maladies-metaboliques"],
    topicSlugs: ["obesite", "diabete", "hypertension-arterielle", "apnee-du-sommeil", "steatose-hepatique", "hypercholesterolemie"],
    examSlugs: ["prise-de-sang"],
    reviewed: REVIEWED,
  },

  "calcul-calories": {
    slug: "calcul-calories",
    fields: [
      { name: "sexe", kind: "select", options: ["femme", "homme"] },
      { name: "age", kind: "number", unit: "ans", min: 15, max: 100, step: 1 },
      { name: "poids", kind: "number", unit: "kg", min: 25, max: 400, step: 0.1 },
      { name: "taille", kind: "number", unit: "cm", min: 100, max: 250, step: 0.5 },
      {
        name: "activite",
        kind: "select",
        options: ["sedentaire", "legere", "moderee", "soutenue", "intense"],
        defaultValue: "legere",
        wide: true,
      },
    ],
    categories: [
      { key: "sedentaire", severity: "good" },
      { key: "legere", severity: "good" },
      { key: "moderee", severity: "good" },
      { key: "soutenue", severity: "good" },
      { key: "intense", severity: "good" },
    ],
    specialtySlug: "nutrition",
    altSpecialtySlugs: ["dietetique", "medecine-du-sport"],
    topicSlugs: ["obesite", "denutrition", "troubles-du-comportement-alimentaire", "diabete"],
    examSlugs: [],
    reviewed: REVIEWED,
  },

  "besoins-en-eau": {
    slug: "besoins-en-eau",
    fields: [
      { name: "poids", kind: "number", unit: "kg", min: 25, max: 250, step: 0.5 },
      { name: "sport", kind: "number", unit: "minutes", min: 0, max: 300, step: 15, defaultValue: "0" },
      {
        name: "climat",
        kind: "select",
        options: ["tempere", "chaud", "tresChaud"],
        defaultValue: "tempere",
        wide: true,
      },
    ],
    categories: [
      { key: "tempere", severity: "good" },
      { key: "chaud", severity: "good" },
      { key: "tresChaud", severity: "watch" },
    ],
    specialtySlug: "medecine-generale",
    altSpecialtySlugs: ["nephrologie", "nutrition"],
    topicSlugs: ["coup-de-chaleur", "calculs-renaux", "infection-urinaire", "constipation", "insuffisance-renale"],
    examSlugs: ["analyse-urine", "prise-de-sang"],
    reviewed: REVIEWED,
  },

  "frequence-cardiaque": {
    slug: "frequence-cardiaque",
    fields: [
      { name: "age", kind: "number", unit: "ans", min: 15, max: 100, step: 1 },
      { name: "fcRepos", kind: "number", unit: "bpm", min: 30, max: 140, step: 1 },
    ],
    categories: [
      { key: "basse", severity: "watch" },
      { key: "sportive", severity: "good" },
      { key: "habituelle", severity: "good" },
      { key: "haute", severity: "watch" },
      { key: "tachycardie", severity: "alert" },
    ],
    specialtySlug: "medecine-du-sport",
    altSpecialtySlugs: ["cardiologie", "medecine-generale"],
    topicSlugs: ["palpitations", "hypertension-arterielle", "insuffisance-cardiaque", "fibrillation-auriculaire", "hyperthyroidie", "douleur-thoracique"],
    examSlugs: ["electrocardiogramme", "test-effort", "holter-ecg", "echocardiographie"],
    reviewed: REVIEWED,
  },

  "date-accouchement": {
    slug: "date-accouchement",
    fields: [
      { name: "ddr", kind: "date", wide: true },
      { name: "cycle", kind: "number", unit: "jours", min: 20, max: 45, step: 1, defaultValue: "28" },
    ],
    categories: [
      { key: "t1", severity: "good" },
      { key: "t2", severity: "good" },
      { key: "t3", severity: "good" },
      { key: "terme", severity: "good" },
      { key: "depasse", severity: "alert" },
    ],
    specialtySlug: "gyneco-obstetrique",
    altSpecialtySlugs: ["sage-femme", "pediatrie"],
    topicSlugs: ["diabete-gestationnel", "fausse-couche", "depression-post-partum", "carence-en-fer", "infection-urinaire"],
    examSlugs: ["echographie", "test-grossesse", "amniocentese", "prise-de-sang"],
    reviewed: REVIEWED,
  },

  "semaines-grossesse": {
    slug: "semaines-grossesse",
    fields: [{ name: "sa", kind: "number", unit: "saInput", min: 1, max: 42, step: 1, wide: true }],
    categories: [
      { key: "t1", severity: "good" },
      { key: "t2", severity: "good" },
      { key: "t3", severity: "good" },
      { key: "terme", severity: "good" },
    ],
    specialtySlug: "gyneco-obstetrique",
    altSpecialtySlugs: ["sage-femme"],
    topicSlugs: ["nausees-et-vomissements", "diabete-gestationnel", "fausse-couche", "mal-de-dos"],
    examSlugs: ["echographie", "prise-de-sang"],
    reviewed: REVIEWED,
  },

  ovulation: {
    slug: "ovulation",
    fields: [
      { name: "ddr", kind: "date", wide: true },
      { name: "cycle", kind: "number", unit: "jours", min: 20, max: 45, step: 1, defaultValue: "28" },
      { name: "luteale", kind: "number", unit: "jours", min: 10, max: 16, step: 1, defaultValue: "14" },
    ],
    categories: [
      { key: "regulier", severity: "good" },
      { key: "court", severity: "watch" },
      { key: "long", severity: "watch" },
    ],
    specialtySlug: "gyneco-obstetrique",
    altSpecialtySlugs: ["sage-femme", "endocrinologie-et-maladies-metaboliques"],
    topicSlugs: ["syndrome-des-ovaires-polykystiques", "regles-irregulieres", "absence-de-regles", "infertilite-feminine", "infertilite-masculine", "contraception"],
    examSlugs: ["echographie", "prise-de-sang"],
    reviewed: REVIEWED,
  },

  "calendrier-vaccinal": {
    slug: "calendrier-vaccinal",
    fields: [{ name: "naissance", kind: "date", wide: true }],
    categories: [
      { key: "aVenir", severity: "good" },
      { key: "enCours", severity: "good" },
      { key: "termine", severity: "good" },
      { key: "retard", severity: "warn" },
    ],
    specialtySlug: "pediatrie",
    altSpecialtySlugs: ["medecine-generale", "maladies-infectieuses"],
    topicSlugs: ["rougeole", "rubeole", "coqueluche", "tuberculose", "meningite", "hepatite-virale", "varicelle"],
    examSlugs: [],
    reviewed: REVIEWED,
  },

  "dose-paracetamol": {
    slug: "dose-paracetamol",
    fields: [
      { name: "poids", kind: "number", unit: "kg", min: 3, max: 50, step: 0.1 },
      { name: "ageMois", kind: "number", unit: "mois", min: 0, max: 180, step: 1 },
      { name: "mgParMl", kind: "number", unit: "mgParMl", min: 10, max: 200, step: 1, wide: true },
    ],
    categories: [
      { key: "moinsDeTroisMois", severity: "alert" },
      { key: "nourrisson", severity: "watch" },
      { key: "enfant", severity: "good" },
      { key: "grandEnfant", severity: "good" },
    ],
    specialtySlug: "pediatrie",
    altSpecialtySlugs: ["medecine-generale", "pharmacologie"],
    topicSlugs: ["fievre-chez-l-enfant", "angine", "otite", "toux-chez-l-enfant", "gastro-enterite"],
    examSlugs: [],
    reviewed: REVIEWED,
  },

  "tension-arterielle": {
    slug: "tension-arterielle",
    fields: [
      { name: "systolique", kind: "number", unit: "mmHg", min: 60, max: 300, step: 1 },
      { name: "diastolique", kind: "number", unit: "mmHg", min: 30, max: 200, step: 1 },
    ],
    categories: [
      { key: "hypotension", severity: "watch" },
      { key: "optimale", severity: "good" },
      { key: "normale", severity: "good" },
      { key: "normaleHaute", severity: "watch" },
      { key: "grade1", severity: "warn" },
      { key: "grade2", severity: "warn" },
      { key: "grade3", severity: "alert" },
    ],
    specialtySlug: "cardiologie",
    altSpecialtySlugs: ["medecine-generale", "nephrologie"],
    topicSlugs: ["hypertension-arterielle", "hypotension", "avc", "infarctus-du-myocarde", "insuffisance-cardiaque", "insuffisance-renale"],
    examSlugs: ["electrocardiogramme", "holter-ecg", "echocardiographie", "analyse-urine"],
    reviewed: REVIEWED,
  },

  "risque-diabete": {
    slug: "risque-diabete",
    fields: [
      { name: "sexe", kind: "select", options: ["femme", "homme"] },
      { name: "age", kind: "number", unit: "ans", min: 18, max: 100, step: 1 },
      { name: "poids", kind: "number", unit: "kg", min: 25, max: 400, step: 0.1 },
      { name: "taille", kind: "number", unit: "cm", min: 100, max: 250, step: 0.5 },
      { name: "tourTaille", kind: "number", unit: "cm", min: 40, max: 250, step: 0.5 },
      { name: "activite", kind: "select", options: YES_NO, wide: true },
      { name: "fruitsLegumes", kind: "select", options: YES_NO, wide: true },
      { name: "traitementTension", kind: "select", options: YES_NO, wide: true },
      { name: "glycemieElevee", kind: "select", options: YES_NO, wide: true },
      { name: "antecedents", kind: "select", options: ["aucun", "second", "premier"], wide: true },
    ],
    categories: [
      { key: "faible", severity: "good" },
      { key: "legerementEleve", severity: "watch" },
      { key: "modere", severity: "warn" },
      { key: "eleve", severity: "warn" },
      { key: "tresEleve", severity: "alert" },
    ],
    specialtySlug: "endocrinologie-et-maladies-metaboliques",
    altSpecialtySlugs: ["nutrition", "medecine-generale"],
    topicSlugs: ["diabete", "obesite", "retinopathie-diabetique", "hypertension-arterielle", "hypercholesterolemie"],
    examSlugs: ["prise-de-sang", "analyse-urine", "fond-d-oeil"],
    reviewed: REVIEWED,
  },
};

export const TOOL_LIST: readonly ToolDefinition[] = TOOL_SLUGS.map((s) => TOOLS[s]);

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaires de formatage et de validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `fr-FR` et non `fr-MA` pour le français : CLDR groupe les milliers avec un
 * POINT en fr-MA (« 1.320 kcal »), ce qui se lit comme un décimal. Sur des
 * valeurs de santé, l'ambiguïté n'est pas acceptable — même choix que les pages
 * chiffrées existantes (observatoire, dates de relecture).
 */
const intlLocale = (locale: Locale) => (locale === "ar" ? "ar-MA" : "fr-FR");

function fmtNumber(n: number, locale: Locale, digits = 1): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function fmtInt(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 0 }).format(n);
}

/**
 * Les dates sont manipulées en UTC de bout en bout (parse → arithmétique →
 * formatage) : une date de règles saisie « 2026-03-01 » ne doit pas glisser d'un
 * jour selon le fuseau du visiteur ou un changement d'heure.
 */
function parseDateUtc(v: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(y, mo - 1, d);
  const back = new Date(ms);
  // Rejette les dates inexistantes normalisées par Date.UTC (ex. 31 février).
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return ms;
}

const DAY = 86_400_000;
const addDays = (ms: number, n: number) => ms + n * DAY;

/** Minuit UTC du jour courant — repère de calcul des durées écoulées. */
function todayUtc(): number {
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

function fmtDate(ms: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(ms));
}

function fmtDateShort(ms: number, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(ms));
}

/** Lit un champ numérique et accumule l'erreur de validation le cas échéant. */
function readNumber(
  values: Record<string, string>,
  field: ToolField,
  errors: Record<string, ErrorKey>,
): number | null {
  const raw = (values[field.name] ?? "").trim().replace(",", ".");
  if (!raw) {
    errors[field.name] = "required";
    return null;
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    errors[field.name] = "range";
    return null;
  }
  if ((field.min !== undefined && n < field.min) || (field.max !== undefined && n > field.max)) {
    errors[field.name] = "range";
    return null;
  }
  return n;
}

function readChoice(
  values: Record<string, string>,
  field: ToolField,
  errors: Record<string, ErrorKey>,
): string | null {
  const raw = (values[field.name] ?? "").trim();
  if (!raw || !field.options?.includes(raw)) {
    errors[field.name] = "required";
    return null;
  }
  return raw;
}

const fieldOf = (slug: ToolSlug, name: string): ToolField =>
  TOOLS[slug].fields.find((f) => f.name === name)!;

// ─────────────────────────────────────────────────────────────────────────────
// IMC — seuils OMS adulte
// ─────────────────────────────────────────────────────────────────────────────

/** Catégorie OMS de l'IMC adulte. Exposée pour être réutilisée par FINDRISC. */
export function bmiCategory(imc: number): { key: string; severity: Severity } {
  if (imc < 18.5) return { key: "maigreur", severity: "watch" };
  if (imc < 25) return { key: "normal", severity: "good" };
  if (imc < 30) return { key: "surpoids", severity: "watch" };
  if (imc < 35) return { key: "obesite1", severity: "warn" };
  if (imc < 40) return { key: "obesite2", severity: "warn" };
  return { key: "obesite3", severity: "alert" };
}

function computeImc(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const poids = readNumber(values, fieldOf("calcul-imc", "poids"), errors);
  const taille = readNumber(values, fieldOf("calcul-imc", "taille"), errors);
  if (poids === null || taille === null) return { ok: false, errors };

  const m = taille / 100;
  const imc = poids / (m * m);
  const cat = bmiCategory(imc);

  // Fourchette de poids correspondant à un IMC de 18,5 à 24,9 pour cette taille.
  const lo = 18.5 * m * m;
  const hi = 24.9 * m * m;

  return {
    ok: true,
    outcome: {
      value: fmtNumber(imc, locale, 1),
      unit: "imc",
      categoryKey: cat.key,
      severity: cat.severity,
      details: [
        { key: "fourchette", value: `${fmtNumber(lo, locale, 0)} – ${fmtNumber(hi, locale, 0)} kg` },
      ],
      noteKeys: ["adulteSeulement"],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tour de taille — rapport tour de taille/taille (NICE) + seuils OMS
// ─────────────────────────────────────────────────────────────────────────────

/** Seuils OMS de tour de taille, en cm, différenciés par sexe. */
const WAIST_THRESHOLDS: Record<string, { increased: number; high: number }> = {
  homme: { increased: 94, high: 102 },
  femme: { increased: 80, high: 88 },
};

/** Seuils OMS d'obésité abdominale pour le rapport tour de taille/tour de hanches. */
const WHR_THRESHOLDS: Record<string, number> = { homme: 0.9, femme: 0.85 };

function computeWaist(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const f = (name: string) => fieldOf("tour-de-taille", name);
  const sexe = readChoice(values, f("sexe"), errors);
  const tourTaille = readNumber(values, f("tourTaille"), errors);
  const taille = readNumber(values, f("taille"), errors);
  const tourHanches = readNumber(values, f("tourHanches"), errors);
  if (sexe === null || tourTaille === null || taille === null || tourHanches === null) {
    return { ok: false, errors };
  }

  // Un tour de taille supérieur ou égal à la stature signe une inversion des champs.
  if (tourTaille >= taille) return { ok: false, errors: { tourTaille: "coherence" } };

  // Rapport tour de taille/taille : indicateur retenu par le NICE, indépendant du
  // sexe et de la morphologie, mieux corrélé au risque que l'IMC seul.
  const whtr = tourTaille / taille;
  const whr = tourTaille / tourHanches;

  let categoryKey: string;
  let severity: Severity;
  if (whtr < 0.4) { categoryKey = "sousLeSeuil"; severity = "watch"; }
  else if (whtr < 0.5) { categoryKey = "sain"; severity = "good"; }
  else if (whtr < 0.6) { categoryKey = "augmente"; severity = "warn"; }
  else { categoryKey = "eleve"; severity = "alert"; }

  const w = WAIST_THRESHOLDS[sexe] ?? WAIST_THRESHOLDS.femme;
  const waistNote = tourTaille > w.high ? "tourEleve" : tourTaille >= w.increased ? "tourAugmente" : "tourNormal";
  const whrThreshold = WHR_THRESHOLDS[sexe] ?? WHR_THRESHOLDS.femme;

  return {
    ok: true,
    outcome: {
      value: fmtNumber(whtr, locale, 2),
      unit: "ratio",
      categoryKey,
      severity,
      details: [
        { key: "rapportTailleHanches", value: fmtNumber(whr, locale, 2) },
        { key: "seuilsSexe", value: `${fmtInt(w.increased, locale)} – ${fmtInt(w.high, locale)} cm` },
      ],
      noteKeys: [
        waistNote,
        ...(whr >= whrThreshold ? ["rthEleve"] : []),
        "mesureNote",
      ],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Besoins en eau — apports de référence pondérés par l'effort et le climat
// ─────────────────────────────────────────────────────────────────────────────

/** Apport hydrique total de référence, en millilitres par kilogramme et par jour. */
const WATER_ML_PER_KG = 33;

/** Majoration liée au climat, appliquée au besoin de base (pertes sudorales). */
const CLIMATE_FACTORS: Record<string, number> = { tempere: 1, chaud: 1.1, tresChaud: 1.2 };

/** Compensation par tranche de 30 minutes d'effort, en litres. */
const WATER_PER_30MIN_SPORT = 0.35;

function computeWater(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const f = (name: string) => fieldOf("besoins-en-eau", name);
  const poids = readNumber(values, f("poids"), errors);
  const sport = readNumber(values, f("sport"), errors);
  const climat = readChoice(values, f("climat"), errors);
  if (poids === null || sport === null || climat === null) return { ok: false, errors };

  const base = (poids * WATER_ML_PER_KG) / 1000;
  const total = base * (CLIMATE_FACTORS[climat] ?? 1) + (sport / 30) * WATER_PER_30MIN_SPORT;

  // Environ un quart de l'apport total vient des aliments : seul le reste est à boire.
  const drinks = total * 0.75;
  const glasses = Math.round(drinks / 0.25);

  return {
    ok: true,
    outcome: {
      value: fmtNumber(total, locale, 1),
      unit: "litres",
      categoryKey: climat,
      severity: climat === "tresChaud" ? "watch" : "good",
      details: [
        { key: "eauBoissons", value: `${fmtNumber(drinks, locale, 1)} L` },
        { key: "verres", value: fmtInt(glasses, locale) },
        { key: "apportAliments", value: `${fmtNumber(total * 0.25, locale, 1)} L` },
      ],
      noteKeys: [
        "restrictionMedicale",
        ...(sport > 0 ? ["pendantEffort"] : []),
        "signesInsuffisance",
        "populationsRisque",
      ],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fréquence cardiaque — FCmax (Tanaka) et zones cibles (Karvonen)
// ─────────────────────────────────────────────────────────────────────────────

function restingHrCategory(fc: number): { key: string; severity: Severity; emergency: boolean } {
  if (fc > 100) return { key: "tachycardie", severity: "alert", emergency: true };
  if (fc > 80) return { key: "haute", severity: "watch", emergency: false };
  if (fc >= 60) return { key: "habituelle", severity: "good", emergency: false };
  if (fc >= 50) return { key: "sportive", severity: "good", emergency: false };
  return { key: "basse", severity: "watch", emergency: false };
}

function computeHeartRate(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const f = (name: string) => fieldOf("frequence-cardiaque", name);
  const age = readNumber(values, f("age"), errors);
  const fcRepos = readNumber(values, f("fcRepos"), errors);
  if (age === null || fcRepos === null) return { ok: false, errors };

  // Tanaka (2001) : 208 − 0,7 × âge, plus fidèle que le « 220 − âge » historique.
  const fcMax = Math.round(208 - 0.7 * age);
  const cat = restingHrCategory(fcRepos);

  // Au-delà de 100 bpm au repos, la réserve cardiaque s'effondre et les zones
  // calculées deviennent absurdes (elles se resserreraient juste sous la FCmax)
  // ET dangereuses à afficher : la conduite à tenir est de faire vérifier ce
  // pouls, pas de s'entraîner. On renvoie donc la mesure et l'orientation, sans
  // zone d'effort.
  if (cat.key === "tachycardie") {
    return {
      ok: true,
      outcome: {
        value: fmtInt(fcRepos, locale),
        unit: "bpm",
        categoryKey: cat.key,
        severity: cat.severity,
        details: [{ key: "fcMax", value: `${fmtInt(fcMax, locale)} bpm` }],
        noteKeys: ["mesureRepos", "arretEffort"],
        emergency: true,
      },
    };
  }

  // Karvonen : les zones se calculent sur la RÉSERVE cardiaque (FCmax − FCrepos),
  // ce qui les individualise là où un simple pourcentage de FCmax ne le fait pas.
  const reserve = fcMax - fcRepos;
  const at = (pct: number) => Math.round(fcRepos + pct * reserve);
  const band = (lo: number, hi: number) => `${fmtInt(at(lo), locale)} – ${fmtInt(at(hi), locale)} bpm`;

  return {
    ok: true,
    outcome: {
      value: band(0.6, 0.8),
      unit: "bpm",
      categoryKey: cat.key,
      severity: cat.severity,
      details: [
        { key: "fcMax", value: `${fmtInt(fcMax, locale)} bpm` },
        { key: "zoneEchauffement", value: band(0.5, 0.6) },
        { key: "zoneEndurance", value: band(0.6, 0.7) },
        { key: "zoneSoutenue", value: band(0.7, 0.8) },
        { key: "zoneIntense", value: band(0.8, 0.9) },
      ],
      noteKeys: ["formuleEstimation", "betaBloquants", "arretEffort"],
      emergency: cat.emergency,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Besoins caloriques — Mifflin-St Jeor + facteurs d'activité
// ─────────────────────────────────────────────────────────────────────────────

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentaire: 1.2,
  legere: 1.375,
  moderee: 1.55,
  soutenue: 1.725,
  intense: 1.9,
};

/** Plancher énergétique en deçà duquel on refuse de suggérer un déficit. */
const ENERGY_FLOOR: Record<string, number> = { femme: 1200, homme: 1500 };

function computeCalories(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const sexe = readChoice(values, fieldOf("calcul-calories", "sexe"), errors);
  const age = readNumber(values, fieldOf("calcul-calories", "age"), errors);
  const poids = readNumber(values, fieldOf("calcul-calories", "poids"), errors);
  const taille = readNumber(values, fieldOf("calcul-calories", "taille"), errors);
  const activite = readChoice(values, fieldOf("calcul-calories", "activite"), errors);
  if (sexe === null || age === null || poids === null || taille === null || activite === null) {
    return { ok: false, errors };
  }

  // Mifflin-St Jeor (1990) — équation de référence du métabolisme de base.
  const base = 10 * poids + 6.25 * taille - 5 * age + (sexe === "homme" ? 5 : -161);
  const tdee = base * (ACTIVITY_FACTORS[activite] ?? 1.375);

  const round10 = (n: number) => Math.round(n / 10) * 10;
  const floor = ENERGY_FLOOR[sexe] ?? 1200;
  const deficitBrut = tdee - 500;
  const clamped = deficitBrut < floor;
  const perte = round10(Math.max(deficitBrut, floor));

  return {
    ok: true,
    outcome: {
      value: fmtInt(round10(tdee), locale),
      unit: "kcal",
      categoryKey: activite,
      severity: "good",
      details: [
        { key: "metabolismeBase", value: `${fmtInt(round10(base), locale)} kcal` },
        { key: "perteDePoids", value: `${fmtInt(perte, locale)} kcal` },
        { key: "priseDePoids", value: `${fmtInt(round10(tdee + 300), locale)} kcal` },
      ],
      noteKeys: clamped ? ["estimation", "plancher"] : ["estimation"],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Date d'accouchement — règle de Naegele ajustée au cycle
// ─────────────────────────────────────────────────────────────────────────────

const GESTATION_DAYS = 280; // 40 semaines révolues depuis le début des dernières règles

function computeDueDate(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const cycle = readNumber(values, fieldOf("date-accouchement", "cycle"), errors);
  const raw = (values.ddr ?? "").trim();
  const ddr = raw ? parseDateUtc(raw) : null;
  if (!raw) errors.ddr = "required";
  else if (ddr === null) errors.ddr = "range";

  const today = todayUtc();
  if (ddr !== null) {
    if (ddr > today) errors.ddr = "futureDate";
    // Au-delà de 44 semaines, la saisie ne correspond plus à une grossesse en cours.
    else if (today - ddr > 310 * DAY) errors.ddr = "tooOld";
  }
  if (Object.keys(errors).length > 0 || ddr === null || cycle === null) return { ok: false, errors };

  // Ajustement au cycle : un cycle de 32 jours décale l'ovulation, donc le terme.
  const shift = cycle - 28;
  const dpa = addDays(ddr, GESTATION_DAYS + shift);
  const origin = addDays(ddr, shift);

  const elapsed = Math.floor((today - origin) / DAY);
  const weeks = Math.floor(elapsed / 7);
  const days = elapsed % 7;

  let categoryKey: string;
  let severity: Severity = "good";
  const noteKeys = ["estimationDate"];
  if (weeks < 14) categoryKey = "t1";
  else if (weeks < 28) categoryKey = "t2";
  else if (weeks < 37) categoryKey = "t3";
  else if (weeks < 42) categoryKey = "terme";
  else {
    categoryKey = "depasse";
    severity = "alert";
  }

  return {
    ok: true,
    outcome: {
      value: `${fmtInt(weeks, locale)} SA + ${fmtInt(days, locale)} j`,
      unit: "sa",
      categoryKey,
      severity,
      details: [
        { key: "dpa", value: fmtDate(dpa, locale) },
        { key: "termeDebut", value: fmtDateShort(addDays(origin, 37 * 7), locale) },
        { key: "termeFin", value: fmtDateShort(addDays(origin, 41 * 7), locale) },
        { key: "echoT1", value: `${fmtDateShort(addDays(origin, 11 * 7), locale)} – ${fmtDateShort(addDays(origin, 13 * 7 + 6), locale)}` },
        { key: "echoT2", value: `${fmtDateShort(addDays(origin, 20 * 7), locale)} – ${fmtDateShort(addDays(origin, 25 * 7), locale)}` },
      ],
      noteKeys: categoryKey === "depasse" ? [...noteKeys, "depassementTerme"] : noteKeys,
      emergency: categoryKey === "depasse",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Semaines de grossesse — conversion SA ↔ semaines de grossesse ↔ mois
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deux comptages coexistent et sèment la confusion :
 *   · les semaines d'AMÉNORRHÉE (SA), comptées depuis le 1ᵉʳ jour des dernières
 *     règles — c'est le comptage des professionnels au Maroc ;
 *   · les semaines de GROSSESSE, comptées depuis la conception, soit 2 semaines
 *     plus tard.
 * Le mois de grossesse se compte, lui, sur les semaines de grossesse : un mois
 * obstétrical vaut 4 semaines et 1/3 (365,25 / 12 / 7).
 */
const WEEKS_PER_MONTH = 4.345;

function computePregnancyWeeks(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const sa = readNumber(values, fieldOf("semaines-grossesse", "sa"), errors);
  if (sa === null) return { ok: false, errors };

  const gestationWeeks = Math.max(0, sa - 2);
  // Le « Nᵉ mois » est le mois EN COURS : d'où l'arrondi au supérieur, avec un
  // plancher à 1 pendant les toutes premières semaines.
  const month = Math.min(9, Math.max(1, Math.ceil(gestationWeeks / WEEKS_PER_MONTH)));
  const weeksIntoMonth = Math.max(0, Math.round(gestationWeeks - (month - 1) * WEEKS_PER_MONTH));

  const categoryKey = sa < 14 ? "t1" : sa < 28 ? "t2" : sa < 37 ? "t3" : "terme";

  return {
    ok: true,
    outcome: {
      value: fmtInt(month, locale),
      unit: "moisGrossesse",
      categoryKey,
      severity: "good",
      details: [
        { key: "semainesAmenorrhee", value: `${fmtInt(sa, locale)} SA` },
        { key: "semainesGrossesse", value: `${fmtInt(gestationWeeks, locale)}` },
        { key: "dansLeMois", value: `${fmtInt(weeksIntoMonth, locale)}` },
        { key: "restantAvantTerme", value: `${fmtInt(Math.max(0, 40 - sa), locale)}` },
      ],
      noteKeys: ["deuxComptages", "echographieDate"],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ovulation — fenêtre fertile estimée à partir du cycle
// ─────────────────────────────────────────────────────────────────────────────

function computeOvulation(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const cycle = readNumber(values, fieldOf("ovulation", "cycle"), errors);
  const luteale = readNumber(values, fieldOf("ovulation", "luteale"), errors);
  const raw = (values.ddr ?? "").trim();
  const ddr = raw ? parseDateUtc(raw) : null;
  if (!raw) errors.ddr = "required";
  else if (ddr === null) errors.ddr = "range";

  const today = todayUtc();
  if (ddr !== null) {
    if (ddr > today) errors.ddr = "futureDate";
    else if (today - ddr > 120 * DAY) errors.ddr = "tooOld";
  }
  if (Object.keys(errors).length > 0 || ddr === null || cycle === null || luteale === null) {
    return { ok: false, errors };
  }

  // Le jour de l'ovulation se déduit de la fin du cycle (phase lutéale stable),
  // pas de son début : c'est la phase folliculaire qui varie d'une femme à l'autre.
  const nextPeriod = addDays(ddr, cycle);
  const ovulation = addDays(nextPeriod, -luteale);
  // Survie des spermatozoïdes (~5 j) et de l'ovocyte (~1 j) → fenêtre J−5 / J+1.
  const windowStart = addDays(ovulation, -5);
  const windowEnd = addDays(ovulation, 1);

  const cycle2 = addDays(ovulation, cycle);
  const cycle3 = addDays(ovulation, cycle * 2);

  const categoryKey = cycle < 24 ? "court" : cycle > 35 ? "long" : "regulier";
  const severity: Severity = categoryKey === "regulier" ? "good" : "watch";

  return {
    ok: true,
    outcome: {
      value: `${fmtDateShort(windowStart, locale)} – ${fmtDateShort(windowEnd, locale)}`,
      categoryKey,
      severity,
      details: [
        { key: "ovulation", value: fmtDate(ovulation, locale) },
        { key: "prochainesRegles", value: fmtDate(nextPeriod, locale) },
        { key: "cycleSuivant", value: fmtDateShort(cycle2, locale) },
        { key: "cycleTroisieme", value: fmtDateShort(cycle3, locale) },
      ],
      noteKeys: ["pasContraception", "cycleIrregulier"],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendrier vaccinal — jalons officiels appliqués à une date de naissance
// ─────────────────────────────────────────────────────────────────────────────

function computeVaccination(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const raw = (values.naissance ?? "").trim();
  const birth = raw ? parseDateUtc(raw) : null;
  if (!raw) errors.naissance = "required";
  else if (birth === null) errors.naissance = "range";

  const today = todayUtc();
  if (birth !== null) {
    if (birth > today) errors.naissance = "futureDate";
    // Le calendrier officiel s'arrête à 5 ans : au-delà de 18 ans, la saisie
    // ne correspond plus à un suivi pédiatrique.
    else if (today - birth > 6570 * DAY) errors.naissance = "tooOld";
  }
  if (Object.keys(errors).length > 0 || birth === null) return { ok: false, errors };

  const ageDays = Math.floor((today - birth) / DAY);

  // Une ligne par jalon : échéance, âge, vaccins prévus, statut.
  const rows = MILESTONES.map((m) => {
    const due = addDays(birth, MILESTONE_AGE_DAYS[m]);
    const items = antigensAt(m);
    const passed = ageDays > MILESTONE_AGE_DAYS[m];
    return {
      milestone: m,
      due,
      passed,
      cells: [
        fmtDate(due, locale),
        items.map((i) => `${i.antigen.short} — ${i.dose}`).join(" · "),
      ],
      // On ne SAIT PAS ce qui a été administré : un jalon passé est « à
      // vérifier sur le carnet », jamais « fait ».
      severity: (passed ? "watch" : "good") as Severity,
      emphasis: false,
    };
  });

  // Prochain jalon à venir : c'est la réponse que cherche un parent.
  const next = rows.find((r) => !r.passed);
  if (next) next.emphasis = true;

  const done = rows.filter((r) => r.passed).length;
  const categoryKey =
    ageDays === 0 || done === 0 ? "aVenir" : !next ? "termine" : "enCours";

  return {
    ok: true,
    outcome: {
      value: next ? fmtDate(next.due, locale) : fmtInt(rows.length, locale),
      unit: next ? undefined : "jalons",
      categoryKey,
      severity: "good",
      columns: ["jalon", "vaccins"],
      rows: rows.map((r) => ({ cells: r.cells, severity: r.severity, emphasis: r.emphasis })),
      details: next
        ? [{ key: "prochainsVaccins", value: next.cells[1] || "—" }]
        : undefined,
      noteKeys: ["carnetSante", "calendrierOfficiel", "rattrapage"],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dose de paracétamol chez l'enfant — suspension buvable uniquement
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ⚠️ OUTIL LE PLUS SENSIBLE DU CLUSTER. Toute modification doit préserver les
 * garde-fous, qui sont la raison d'être de ce calcul :
 *
 *  · posologie de référence : 15 mg/kg par prise, sans dépasser 60 mg/kg par
 *    jour ni 4 prises, avec un intervalle minimal de 6 heures ;
 *  · REFUS DE CALCULER en dessous de 3 mois — à cet âge la fièvre impose un avis
 *    médical, pas une automédication ;
 *  · REFUS au-delà de 50 kg (borne du champ) : au-delà, c'est la posologie de
 *    l'adulte, qui ne se déduit pas du poids de la même façon ;
 *  · contrôle de VRAISEMBLANCE poids/âge : une faute de frappe sur le poids est
 *    le risque principal de cet outil, on la bloque plutôt que de la calculer ;
 *  · la concentration est SAISIE depuis le flacon du parent. Aucune liste de
 *    produits n'est codée en dur : les présentations varient, et un mg/mL
 *    erroné se traduirait directement par un surdosage.
 */
const PARACETAMOL_MG_PER_KG = 15;
const PARACETAMOL_MAX_MG_PER_KG_DAY = 60;
const PARACETAMOL_MAX_TAKES = 4;
const PARACETAMOL_MIN_HOURS = 6;
/** Plafond adulte : la dose de l'enfant ne doit jamais le franchir. */
const PARACETAMOL_ABS_MAX_MG_DAY = 3000;

/** Rejette les couples poids/âge grossièrement incompatibles (faute de frappe). */
function implausibleWeightForAge(poids: number, ageMois: number): boolean {
  if (ageMois <= 3 && poids > 9) return true;
  if (ageMois <= 12 && poids > 15) return true;
  if (ageMois >= 12 && poids < 5) return true;
  if (ageMois >= 36 && poids < 8) return true;
  return false;
}

function computeParacetamol(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const f = (name: string) => fieldOf("dose-paracetamol", name);
  const poids = readNumber(values, f("poids"), errors);
  const ageMois = readNumber(values, f("ageMois"), errors);
  const mgParMl = readNumber(values, f("mgParMl"), errors);
  if (poids === null || ageMois === null || mgParMl === null) return { ok: false, errors };

  if (implausibleWeightForAge(poids, ageMois)) {
    return { ok: false, errors: { poids: "implausible", ageMois: "implausible" } };
  }

  // Garde-fou d'âge : avant 3 mois, aucune dose n'est proposée.
  if (ageMois < 3) {
    return {
      ok: true,
      outcome: {
        value: "—",
        categoryKey: "moinsDeTroisMois",
        severity: "alert",
        noteKeys: ["avisObligatoire", "paracetamolCache"],
        emergency: true,
      },
    };
  }

  const perTakeMg = Math.round(poids * PARACETAMOL_MG_PER_KG);
  const maxDailyMg = Math.min(
    Math.round(poids * PARACETAMOL_MAX_MG_PER_KG_DAY),
    PARACETAMOL_ABS_MAX_MG_DAY,
  );
  // Le volume est arrondi au dixième de millilitre : c'est la précision réelle
  // d'une pipette ou d'une seringue graduée.
  const perTakeMl = Math.round((perTakeMg / mgParMl) * 10) / 10;
  const takes = Math.max(1, Math.min(PARACETAMOL_MAX_TAKES, Math.floor(maxDailyMg / perTakeMg)));

  const categoryKey = ageMois < 24 ? "nourrisson" : ageMois < 144 ? "enfant" : "grandEnfant";

  return {
    ok: true,
    outcome: {
      value: fmtNumber(perTakeMl, locale, 1),
      unit: "ml",
      categoryKey,
      severity: categoryKey === "nourrisson" ? "watch" : "good",
      details: [
        { key: "doseMg", value: `${fmtInt(perTakeMg, locale)} mg` },
        { key: "intervalle", value: `${fmtInt(PARACETAMOL_MIN_HOURS, locale)} h` },
        { key: "prisesMax", value: fmtInt(takes, locale) },
        { key: "maxJour", value: `${fmtInt(maxDailyMg, locale)} mg` },
      ],
      noteKeys: ["pipetteGraduee", "paracetamolCache", "poidsReel", "quandConsulter"],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tension artérielle — classification ESC/ESH
// ─────────────────────────────────────────────────────────────────────────────

function bpCategory(sys: number, dia: number): { key: string; severity: Severity; emergency: boolean } {
  // La catégorie retenue est TOUJOURS la plus élevée des deux chiffres.
  if (sys >= 180 || dia >= 110) return { key: "grade3", severity: "alert", emergency: true };
  if (sys >= 160 || dia >= 100) return { key: "grade2", severity: "warn", emergency: false };
  if (sys >= 140 || dia >= 90) return { key: "grade1", severity: "warn", emergency: false };
  if (sys < 90 || dia < 60) return { key: "hypotension", severity: "watch", emergency: false };
  if (sys >= 130 || dia >= 85) return { key: "normaleHaute", severity: "watch", emergency: false };
  if (sys >= 120 || dia >= 80) return { key: "normale", severity: "good", emergency: false };
  return { key: "optimale", severity: "good", emergency: false };
}

function computeBloodPressure(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const sys = readNumber(values, fieldOf("tension-arterielle", "systolique"), errors);
  const dia = readNumber(values, fieldOf("tension-arterielle", "diastolique"), errors);
  if (sys === null || dia === null) return { ok: false, errors };

  // Une systolique inférieure ou égale à la diastolique est une saisie inversée.
  if (sys <= dia) {
    return { ok: false, errors: { systolique: "coherence" } };
  }

  const cat = bpCategory(sys, dia);

  return {
    ok: true,
    outcome: {
      value: `${fmtInt(sys, locale)} / ${fmtInt(dia, locale)}`,
      unit: "mmHg",
      categoryKey: cat.key,
      severity: cat.severity,
      details: [{ key: "pressionPulsee", value: `${fmtInt(sys - dia, locale)} mmHg` }],
      noteKeys: ["mesureUnique", "protocoleMesure"],
      emergency: cat.emergency,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Risque de diabète — FINDRISC (score validé, 8 items, 0 à 26 points)
// ─────────────────────────────────────────────────────────────────────────────

/** Seuils de tour de taille du FINDRISC, différenciés par sexe (en cm). */
const WAIST_POINTS: Record<string, { low: number; high: number }> = {
  homme: { low: 94, high: 102 },
  femme: { low: 80, high: 88 },
};

function findriscCategory(score: number): { key: string; severity: Severity } {
  if (score < 7) return { key: "faible", severity: "good" };
  if (score < 12) return { key: "legerementEleve", severity: "watch" };
  if (score < 15) return { key: "modere", severity: "warn" };
  if (score <= 20) return { key: "eleve", severity: "warn" };
  return { key: "tresEleve", severity: "alert" };
}

function computeDiabetesRisk(values: Record<string, string>, locale: Locale): ToolResult {
  const errors: Record<string, ErrorKey> = {};
  const f = (name: string) => fieldOf("risque-diabete", name);
  const sexe = readChoice(values, f("sexe"), errors);
  const age = readNumber(values, f("age"), errors);
  const poids = readNumber(values, f("poids"), errors);
  const taille = readNumber(values, f("taille"), errors);
  const tourTaille = readNumber(values, f("tourTaille"), errors);
  const activite = readChoice(values, f("activite"), errors);
  const fruitsLegumes = readChoice(values, f("fruitsLegumes"), errors);
  const traitementTension = readChoice(values, f("traitementTension"), errors);
  const glycemieElevee = readChoice(values, f("glycemieElevee"), errors);
  const antecedents = readChoice(values, f("antecedents"), errors);

  if (
    sexe === null || age === null || poids === null || taille === null || tourTaille === null ||
    activite === null || fruitsLegumes === null || traitementTension === null ||
    glycemieElevee === null || antecedents === null
  ) {
    return { ok: false, errors };
  }

  const m = taille / 100;
  const imc = poids / (m * m);

  let score = 0;
  // Âge
  if (age >= 65) score += 4;
  else if (age >= 55) score += 3;
  else if (age >= 45) score += 2;
  // IMC
  if (imc > 30) score += 3;
  else if (imc >= 25) score += 1;
  // Tour de taille
  const w = WAIST_POINTS[sexe] ?? WAIST_POINTS.femme;
  if (tourTaille > w.high) score += 4;
  else if (tourTaille >= w.low) score += 3;
  // Activité physique quotidienne ≥ 30 min
  if (activite === "non") score += 2;
  // Fruits et légumes chaque jour
  if (fruitsLegumes === "non") score += 1;
  // Traitement antihypertenseur
  if (traitementTension === "oui") score += 2;
  // Glycémie élevée déjà constatée
  if (glycemieElevee === "oui") score += 5;
  // Antécédents familiaux
  if (antecedents === "premier") score += 5;
  else if (antecedents === "second") score += 3;

  const cat = findriscCategory(score);

  return {
    ok: true,
    outcome: {
      value: fmtInt(score, locale),
      unit: "points26",
      categoryKey: cat.key,
      severity: cat.severity,
      details: [{ key: "imc", value: `${fmtNumber(imc, locale, 1)} kg/m²` }],
      noteKeys: ["pasDiagnostic", "scoreValide"],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Aiguillage
// ─────────────────────────────────────────────────────────────────────────────

const COMPUTERS: Record<ToolSlug, (v: Record<string, string>, l: Locale) => ToolResult> = {
  "calcul-imc": computeImc,
  "tour-de-taille": computeWaist,
  "calcul-calories": computeCalories,
  "besoins-en-eau": computeWater,
  "frequence-cardiaque": computeHeartRate,
  "date-accouchement": computeDueDate,
  "semaines-grossesse": computePregnancyWeeks,
  ovulation: computeOvulation,
  "calendrier-vaccinal": computeVaccination,
  "dose-paracetamol": computeParacetamol,
  "tension-arterielle": computeBloodPressure,
  "risque-diabete": computeDiabetesRisk,
};

/** Exécute le calcul d'un outil. Pur : mêmes entrées → mêmes sorties. */
export function runTool(slug: ToolSlug, values: Record<string, string>, locale: Locale): ToolResult {
  return COMPUTERS[slug](values, locale);
}
