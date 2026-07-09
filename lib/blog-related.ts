/**
 * Maillage interne contextuel blog → annuaire.
 * Associe chaque article (par slug) à la spécialité la plus pertinente afin de
 * proposer : un bloc « Voir les {spécialité} », un widget de praticiens
 * réservables, et des liens « {spécialité} à {ville} » vers les grandes villes.
 * Renforce le SEO interne et le taux de conversion (article → prise de RDV).
 *
 * On ne lie que vers des pages spécialité existantes ; repli sur /praticiens.
 */

import { slugify } from "@/lib/utils";

export type RelatedSpecialty = {
  slug: string;            // slug de la page /specialites/[slug] (doit exister)
  labelFr: string;         // libellé pluriel FR (« cardiologues »)
  labelAr: string;         // libellé AR
};

// Slugs de spécialités disposant d'une page dédiée (cf. lib/specialty-content.ts)
const SPECIALTIES: Record<string, RelatedSpecialty> = {
  cardiologie:          { slug: "cardiologie",          labelFr: "cardiologues",          labelAr: "أطباء القلب" },
  "gyneco-obstetrique": { slug: "gyneco-obstetrique",   labelFr: "gynécologues",          labelAr: "أطباء النساء" },
  psychiatrie:          { slug: "psychiatrie",          labelFr: "psychiatres",           labelAr: "الأطباء النفسيين" },
  "medecine-generale":  { slug: "medecine-generale",    labelFr: "médecins généralistes", labelAr: "الأطباء العامين" },
  "gastro-enterologie": { slug: "gastro-enterologie",   labelFr: "gastro-entérologues",   labelAr: "أطباء الجهاز الهضمي" },
  endocrinologie:       { slug: "endocrinologie-et-maladies-metaboliques", labelFr: "endocrinologues", labelAr: "أطباء الغدد" },
  pediatrie:            { slug: "pediatrie",            labelFr: "pédiatres",             labelAr: "أطباء الأطفال" },
  dermatologie:         { slug: "dermatologie",         labelFr: "dermatologues",         labelAr: "أطباء الجلد" },
  pneumologie:          { slug: "pneumo-phtisiologie",  labelFr: "pneumologues",          labelAr: "أطباء الرئة" },
};

// Article (slug) → spécialité associée
const POST_TO_SPECIALTY: Record<string, RelatedSpecialty> = {
  // Cocon Hypertension → cardiologie
  "hypertension-arterielle-maroc":            SPECIALTIES.cardiologie,
  "symptomes-hypertension-arterielle-maroc":  SPECIALTIES.cardiologie,
  "alimentation-anti-hypertension-maroc":     SPECIALTIES.cardiologie,
  "mesurer-tension-arterielle-maroc":         SPECIALTIES.cardiologie,
  // Cocon Diabète → endocrinologie
  "diabete-type-2-maroc":                     SPECIALTIES.endocrinologie,
  "diabete-symptomes-signes-maroc":           SPECIALTIES.endocrinologie,
  "diabete-ramadan-jeune-maroc":              SPECIALTIES.endocrinologie,
  "alimentation-diabete-cuisine-marocaine":   SPECIALTIES.endocrinologie,
  "prix-consultation-endocrinologue-maroc":   SPECIALTIES.endocrinologie,
  // Cocon Santé de la femme → gynéco-obstétrique
  "sante-femme-guide-maroc":                  SPECIALTIES["gyneco-obstetrique"],
  "suivi-grossesse-maroc":                    SPECIALTIES["gyneco-obstetrique"],
  "menopause-symptomes-solutions-maroc":      SPECIALTIES["gyneco-obstetrique"],
  "contraception-maroc-methodes":             SPECIALTIES["gyneco-obstetrique"],
  "cancer-col-uterus-depistage-frottis-maroc": SPECIALTIES["gyneco-obstetrique"],
  "infertilite-pma-maroc":                    SPECIALTIES["gyneco-obstetrique"],
  "cancer-sein-maroc-depistage-prevention":   SPECIALTIES["gyneco-obstetrique"],
  // Cocon Santé de l'enfant → pédiatrie
  "sante-enfant-guide-maroc":                 SPECIALTIES.pediatrie,
  "calendrier-vaccinal-enfant-maroc":         SPECIALTIES.pediatrie,
  "fievre-enfant-que-faire-maroc":            SPECIALTIES.pediatrie,
  "maladies-infantiles-courantes-maroc":      SPECIALTIES.pediatrie,
  "choisir-pediatre-suivi-enfant-maroc":      SPECIALTIES.pediatrie,
  // Cocon Santé mentale → psychiatrie
  "sante-mentale-guide-maroc":                SPECIALTIES.psychiatrie,
  "anxiete-troubles-anxieux-maroc":           SPECIALTIES.psychiatrie,
  "depression-symptomes-aide-maroc":          SPECIALTIES.psychiatrie,
  "troubles-sommeil-insomnie-maroc":          SPECIALTIES.psychiatrie,
  "psychiatre-ou-psychologue-maroc":          SPECIALTIES.psychiatrie,
  "stress-chronique-burn-out-maroc":          SPECIALTIES.psychiatrie,
  // Cocon Prévention → médecine générale
  "prevention-sante-guide-maroc":             SPECIALTIES["medecine-generale"],
  "vaccination-adulte-maroc":                 SPECIALTIES["medecine-generale"],
  "bilan-de-sante-quand-faire-maroc":         SPECIALTIES["medecine-generale"],
  "activite-physique-sante-maroc":            SPECIALTIES["medecine-generale"],
  "alimentation-mediterraneenne-maroc":       SPECIALTIES["medecine-generale"],
};

// Repli par catégorie si l'article n'est pas mappé individuellement.
// La catégorie « Médecins » (B2B) n'a volontairement PAS de spécialité associée :
// ces articles ciblent les praticiens, pas la prise de RDV patient.
const CATEGORY_TO_SPECIALTY: Record<string, RelatedSpecialty> = {
  "prevention-sante":     SPECIALTIES["medecine-generale"],
  "nutrition-bien-etre":  SPECIALTIES["medecine-generale"],
  "maladies-traitements": SPECIALTIES["medecine-generale"],
  "sante-femme":          SPECIALTIES["gyneco-obstetrique"],
  "sante-enfant":         SPECIALTIES.pediatrie,
  "sante-mentale":        SPECIALTIES.psychiatrie,
};

export function relatedSpecialty(postSlug: string, categorySlug: string): RelatedSpecialty | null {
  return POST_TO_SPECIALTY[postSlug] ?? CATEGORY_TO_SPECIALTY[categorySlug] ?? null;
}

/**
 * Inverse du mapping : articles de blog pertinents pour une page spécialité.
 * Alimente le maillage retour annuaire → blog (bloc « À lire aussi »).
 */
export function articleSlugsForSpecialty(specialtySlug: string): string[] {
  return Object.entries(POST_TO_SPECIALTY)
    .filter(([, spec]) => spec.slug === specialtySlug)
    .map(([postSlug]) => postSlug);
}

// ── Grandes villes pour le maillage local « {spécialité} à {ville} » ──────────
// Slugs alignés sur les pages /villes/[slug] et /specialites/[slug]/[ville].
export type TopCity = { name: string; slug: string };
export const TOP_CITIES: TopCity[] = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir",
].map((name) => ({ name, slug: slugify(name) }));

/**
 * Liens « {spécialité} à {ville} » vers /specialites/[slug]/[ville].
 * Retourne [] si l'article n'a pas de spécialité associée.
 */
export function specialtyCityLinks(
  spec: RelatedSpecialty | null,
): { href: string; city: string }[] {
  if (!spec) return [];
  return TOP_CITIES.map((c) => ({
    href: `/specialites/${spec.slug}/${c.slug}`,
    city: c.name,
  }));
}
