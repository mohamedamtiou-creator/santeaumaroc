/**
 * Plateforme contributive « Publier un article » — constantes & helpers PURS.
 *
 * Module SANS import serveur (pas de `next/headers`, pas de `prisma`) → importable
 * côté client ET serveur, comme `lib/i18n.ts`. Les gardes de session vivent dans
 * `lib/dal.ts` ; la résolution de slug unique (qui touche la DB) dans les actions.
 */

import type { Locale } from "@/lib/i18n";

/* ── Rôles ──────────────────────────────────────────────────────────────── */
// Étend PATIENT | DOCTOR | ADMIN (existants) avec la couche contributive.
export const ROLE_CONTRIBUTOR = "CONTRIBUTOR"; // professionnel qui rédige des articles
export const ROLE_EDITOR = "EDITOR"; // relecteur médical (valide les articles)

/** Un DOCTOR revendiqué peut aussi contribuer : ces rôles ont accès à l'espace auteur. */
export function canContribute(role: string | undefined | null): boolean {
  return role === ROLE_CONTRIBUTOR || role === "DOCTOR" || role === "ADMIN";
}

/** Peut relire/valider des articles (éditeur médical ou admin). */
export function canReview(role: string | undefined | null): boolean {
  return role === ROLE_EDITOR || role === "ADMIN";
}

/* ── Professions autorisées ─────────────────────────────────────────────── */

export type VerificationTrack = "ORDER" | "ACADEMIC" | "ORGANIZATION";

export type Profession = {
  kind: string;
  label: string;
  labelAr: string;
  icon: string; // clé d'icône du design system
  track: VerificationTrack;
};

/** Les 13 types de contributeurs acceptés. `kind` = valeur stockée dans User.professionKind. */
export const PROFESSIONS: readonly Profession[] = [
  { kind: "MEDECIN", label: "Médecin", labelAr: "طبيب", icon: "stethoscope", track: "ORDER" },
  { kind: "DENTISTE", label: "Dentiste", labelAr: "طبيب أسنان", icon: "tooth", track: "ORDER" },
  { kind: "PHARMACIEN", label: "Pharmacien", labelAr: "صيدلي", icon: "pill", track: "ORDER" },
  { kind: "PSYCHOLOGUE", label: "Psychologue", labelAr: "أخصائي نفسي", icon: "brain", track: "ORDER" },
  { kind: "NUTRITIONNISTE", label: "Nutritionniste", labelAr: "أخصائي تغذية", icon: "apple", track: "ORDER" },
  { kind: "KINE", label: "Kinésithérapeute", labelAr: "أخصائي علاج طبيعي", icon: "activity", track: "ORDER" },
  { kind: "SAGE_FEMME", label: "Sage-femme", labelAr: "قابلة", icon: "baby", track: "ORDER" },
  { kind: "INFIRMIER", label: "Infirmier", labelAr: "ممرض", icon: "heart-pulse", track: "ORDER" },
  { kind: "PROFESSEUR", label: "Professeur universitaire", labelAr: "أستاذ جامعي", icon: "graduation-cap", track: "ACADEMIC" },
  { kind: "CHERCHEUR", label: "Chercheur", labelAr: "باحث", icon: "microscope", track: "ACADEMIC" },
  { kind: "ASSOCIATION", label: "Association médicale", labelAr: "جمعية طبية", icon: "users", track: "ORGANIZATION" },
  { kind: "HOPITAL", label: "Hôpital", labelAr: "مستشفى", icon: "hospital", track: "ORGANIZATION" },
  { kind: "CLINIQUE", label: "Clinique", labelAr: "عيادة", icon: "building", track: "ORGANIZATION" },
] as const;

export const PROFESSION_KINDS = PROFESSIONS.map((p) => p.kind);

export function getProfession(kind: string | null | undefined): Profession | undefined {
  return PROFESSIONS.find((p) => p.kind === kind);
}

export function professionLabel(kind: string | null | undefined, locale: Locale = "fr"): string {
  const p = getProfession(kind);
  if (!p) return "";
  return locale === "ar" ? p.labelAr : p.label;
}

export function isOrganizationProfession(kind: string | null | undefined): boolean {
  return getProfession(kind)?.track === "ORGANIZATION";
}

/* ── Statut auteur (vérification d'identité) ────────────────────────────── */

export const AUTHOR_STATUS = {
  UNVERIFIED: "UNVERIFIED", // compte créé, aucune preuve soumise
  PENDING: "PENDING", // documents soumis, en attente de contrôle admin
  VERIFIED: "VERIFIED", // identité prouvée → badge + droit de soumettre
  SUSPENDED: "SUSPENDED", // droit de publier retiré (modération)
} as const;

/** Auteur autorisé à SOUMETTRE un article (identité prouvée). */
export function isVerifiedAuthor(status: string | null | undefined): boolean {
  return status === AUTHOR_STATUS.VERIFIED;
}

/* ── Preuves d'identité ─────────────────────────────────────────────────── */

export const LICENSE_KINDS = ["ORDRE", "DIPLOME", "CARTE_PRO", "RC", "STATUTS", "AUTRE"] as const;

/** Documents attendus selon le parcours de vérification. */
export function requiredLicenseKinds(kind: string | null | undefined): string[] {
  const track = getProfession(kind)?.track;
  if (track === "ORGANIZATION") return ["RC", "STATUTS"];
  if (track === "ACADEMIC") return ["DIPLOME"];
  return ["ORDRE", "DIPLOME"]; // praticiens individuels
}

/* ── Workflow éditorial (machine à états) ───────────────────────────────── */

export const EDITORIAL_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  IN_REVIEW: "IN_REVIEW",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
  REJECTED: "REJECTED",
} as const;

export type EditorialStatus = (typeof EDITORIAL_STATUS)[keyof typeof EDITORIAL_STATUS];

/**
 * Transitions autorisées. Source de vérité de la machine à états — toute
 * transition hors de cette table est refusée côté serveur (features/articles/transitions.ts).
 */
export const EDITORIAL_TRANSITIONS: Record<EditorialStatus, EditorialStatus[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["IN_REVIEW", "CHANGES_REQUESTED", "REJECTED"],
  IN_REVIEW: ["APPROVED", "CHANGES_REQUESTED", "REJECTED"],
  CHANGES_REQUESTED: ["SUBMITTED"],
  APPROVED: ["PUBLISHED", "CHANGES_REQUESTED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: ["PUBLISHED"],
  REJECTED: [],
};

export function canTransition(from: string, to: string): boolean {
  const allowed = EDITORIAL_TRANSITIONS[from as EditorialStatus];
  return Array.isArray(allowed) && allowed.includes(to as EditorialStatus);
}

export const EDITORIAL_LABELS: Record<EditorialStatus, { label: string; labelAr: string; tone: string }> = {
  DRAFT: { label: "Brouillon", labelAr: "مسودة", tone: "grey" },
  SUBMITTED: { label: "Soumis", labelAr: "مُرسَل", tone: "blue" },
  IN_REVIEW: { label: "En révision", labelAr: "قيد المراجعة", tone: "blue" },
  CHANGES_REQUESTED: { label: "Corrections demandées", labelAr: "تعديلات مطلوبة", tone: "amber" },
  APPROVED: { label: "Approuvé", labelAr: "مُوافَق عليه", tone: "green" },
  PUBLISHED: { label: "Publié", labelAr: "منشور", tone: "green" },
  ARCHIVED: { label: "Archivé", labelAr: "مؤرشف", tone: "grey" },
  REJECTED: { label: "Refusé", labelAr: "مرفوض", tone: "rose" },
};

/* ── Niveaux de preuve (aligné sur /methodologie) ───────────────────────── */

export const EVIDENCE_LEVELS = [
  { key: "RECO_OFFICIELLE", label: "Recommandation officielle", labelAr: "توصية رسمية" },
  { key: "META_ANALYSE", label: "Méta-analyse / revue systématique", labelAr: "تحليل تجميعي" },
  { key: "ESSAI", label: "Essai clinique contrôlé", labelAr: "تجربة سريرية" },
  { key: "CONSENSUS", label: "Consensus d'experts", labelAr: "إجماع الخبراء" },
  { key: "AVIS_EXPERT", label: "Avis d'expert", labelAr: "رأي خبير" },
] as const;

export const EVIDENCE_KEYS = EVIDENCE_LEVELS.map((e) => e.key);

export function evidenceLabel(key: string | null | undefined, locale: Locale = "fr"): string {
  const e = EVIDENCE_LEVELS.find((x) => x.key === key);
  if (!e) return "";
  return locale === "ar" ? e.labelAr : e.label;
}

/* ── Slug auteur ────────────────────────────────────────────────────────── */

/**
 * Base de slug auteur à partir d'un nom (« Dr Ahmed Alaoui » → « dr-ahmed-alaoui »).
 * L'unicité est résolue en base par la Server Action (suffixe -2, -3…).
 * On duplique la logique de `slugify` pour garder ce module pur (pas d'import utils
 * qui tirerait des dépendances serveur). Simple et suffisant pour des noms latins ;
 * repli « auteur » si le nom est non-latin (ex. saisi en arabe).
 */
export function authorSlugBase(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "auteur";
}
