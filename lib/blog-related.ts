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
  // Vague 2 — fiches Maladie (piliers autonomes)
  "asthme-maroc":                             SPECIALTIES.pneumologie,
  "cholesterol-maroc":                        SPECIALTIES.cardiologie,
  "avc-accident-vasculaire-cerebral-maroc":   SPECIALTIES.cardiologie,
  // (anemie-maroc → médecine générale et depression-maroc → psychiatrie via le
  //  repli de catégorie CATEGORY_TO_SPECIALTY — mapping explicite inutile.)
  // Vague 3 — fiches Maladie (piliers autonomes)
  "hypothyroidie-maroc":                      SPECIALTIES.endocrinologie,
  "ulcere-estomac-maroc":                     SPECIALTIES["gastro-enterologie"],
  // (allergie / migraine / insuffisance-renale / arthrose → médecine générale via
  //  le repli de catégorie — pas de page spécialité dédiée pour allergo/neuro/néphro/rhumato.)
  // Vague 4 — fiches Maladie (piliers autonomes)
  "obesite-maroc":                            SPECIALTIES.endocrinologie,
  "hepatite-maroc":                           SPECIALTIES["gastro-enterologie"],
  "osteoporose-maroc":                        SPECIALTIES.endocrinologie,
  "reflux-gastro-oesophagien-maroc":          SPECIALTIES["gastro-enterologie"],
  "bpco-maroc":                               SPECIALTIES.pneumologie,
  // (goutte-maroc → médecine générale via le repli de catégorie — pas de page rhumato.)
  // Vague 5 — fiches Maladie (piliers autonomes)
  "zona-maroc":                               SPECIALTIES.dermatologie,
  "cancer-colorectal-maroc":                  SPECIALTIES["gastro-enterologie"],
  "hemorroides-maroc":                        SPECIALTIES["gastro-enterologie"],
  // Catégorie Symptômes — spécialiste évident quand il existe (sinon repli
  // médecine générale via CATEGORY_TO_SPECIALTY["symptomes"]).
  "mal-au-ventre-maroc":                      SPECIALTIES["gastro-enterologie"],
  "toux-maroc":                               SPECIALTIES.pneumologie,
  "douleur-poitrine-maroc":                   SPECIALTIES.cardiologie,
  // Symptômes lot 2
  "essoufflement-dyspnee-maroc":              SPECIALTIES.pneumologie,
  "palpitations-maroc":                       SPECIALTIES.cardiologie,
  "nausees-vomissements-maroc":               SPECIALTIES["gastro-enterologie"],
  // Symptômes lot 3
  "diarrhee-maroc":                           SPECIALTIES["gastro-enterologie"],
  "constipation-maroc":                       SPECIALTIES["gastro-enterologie"],
  "demangeaisons-maroc":                      SPECIALTIES.dermatologie,
  // Symptômes lot 4
  "jambes-gonflees-oedeme-maroc":             SPECIALTIES.cardiologie,
  "eruption-cutanee-boutons-maroc":           SPECIALTIES.dermatologie,
  "ballonnements-maroc":                      SPECIALTIES["gastro-enterologie"],
  // Examens lot 3
  "holter-ecg-maroc":                         SPECIALTIES.cardiologie,
  "mapa-holter-tensionnel-maroc":             SPECIALTIES.cardiologie,
  "echo-doppler-maroc":                       SPECIALTIES.cardiologie,
  // (insomnie / douleur-articulaire / saignement-de-nez → symptomes→GP ;
  //  fond-d-oeil / test-allergie / eeg → examens→GP.)
  // (vertiges / fatigue-permanente / mal-de-gorge → médecine générale via CATEGORY_TO_SPECIALTY["symptomes"].)
  // Catégorie Examens — spécialiste évident quand il existe (sinon repli
  // médecine générale via CATEGORY_TO_SPECIALTY["examens"] : imagerie/biologie
  // n'ayant pas de page spécialité dédiée).
  "electrocardiogramme-ecg-maroc":            SPECIALTIES.cardiologie,
  "coloscopie-maroc":                         SPECIALTIES["gastro-enterologie"],
  // Examens lot 2
  "mammographie-maroc":                       SPECIALTIES["gyneco-obstetrique"],
  "gastroscopie-maroc":                       SPECIALTIES["gastro-enterologie"],
  "spirometrie-efr-maroc":                    SPECIALTIES.pneumologie,
  "epreuve-effort-cardiaque-maroc":           SPECIALTIES.cardiologie,
  // (radiographie / osteodensitometrie → médecine générale via CATEGORY_TO_SPECIALTY["examens"].)
  // (sinusite → ORL, calculs-renaux → urologie, varices → angiologie : pas de page
  //  spécialité dédiée → repli médecine générale via CATEGORY_TO_SPECIALTY.)
  // Densification en cocons — satellites des piliers Maladie
  // Cocon Asthme → pneumologie (asthme de l'enfant → pédiatrie)
  "asthme-crise-que-faire-maroc":             SPECIALTIES.pneumologie,
  "asthme-inhalateur-traitement-maroc":       SPECIALTIES.pneumologie,
  "asthme-enfant-maroc":                      SPECIALTIES.pediatrie,
  "asthme-allergique-maroc":                  SPECIALTIES.pneumologie,
  // Cocon Cholestérol → cardiologie
  "cholesterol-alimentation-maroc":           SPECIALTIES.cardiologie,
  "cholesterol-statines-maroc":               SPECIALTIES.cardiologie,
  "bilan-lipidique-maroc":                    SPECIALTIES.cardiologie,
  "triglycerides-eleves-maroc":               SPECIALTIES.cardiologie,
  // Cocon AVC → cardiologie
  "avc-signes-reconnaitre-maroc":             SPECIALTIES.cardiologie,
  "avc-recuperation-reeducation-maroc":       SPECIALTIES.cardiologie,
  "avc-prevention-maroc":                     SPECIALTIES.cardiologie,
  "ait-accident-ischemique-transitoire-maroc": SPECIALTIES.cardiologie,
  // Cocons vague 2
  "imc-tour-de-taille-maroc":                 SPECIALTIES.endocrinologie,
  "maigrir-durablement-maroc":                SPECIALTIES.endocrinologie,
  "chirurgie-bariatrique-maroc":              SPECIALTIES.endocrinologie,
  "antidepresseurs-maroc":                    SPECIALTIES.psychiatrie,
  "depression-ou-deprime-maroc":              SPECIALTIES.psychiatrie,
  "depression-post-partum-maroc":             SPECIALTIES.psychiatrie,
  "aliments-riches-en-fer-maroc":             SPECIALTIES["medecine-generale"],
  "anemie-fer-carence-maroc":                 SPECIALTIES["medecine-generale"],
  "anemie-grossesse-maroc":                   SPECIALTIES["gyneco-obstetrique"],
  // Cocons vague 3
  "urticaire-maroc":                          SPECIALTIES.dermatologie,
  // (rhinite / allergie-alimentaire → GP ; arthrose genou/hanche/cervicale → GP ;
  //  migraine aura/crise/règles → GP, via CATEGORY_TO_SPECIALTY["maladies-traitements"].)
  // Médicaments lot 2 (classes)
  "antihypertenseurs-maroc":                  SPECIALTIES.cardiologie,
  "anticoagulants-maroc":                     SPECIALTIES.cardiologie,
  // (antihistaminiques / corticoides / ains / antibiotiques → medicaments→GP.)
  // Cocons vague 4
  "hepatite-b-maroc":                         SPECIALTIES["gastro-enterologie"],
  "hepatite-c-maroc":                         SPECIALTIES["gastro-enterologie"],
  "foie-gras-steatose-maroc":                 SPECIALTIES["gastro-enterologie"],
  "calcium-vitamine-d-os-maroc":              SPECIALTIES.endocrinologie,
  "osteoporose-menopause-maroc":              SPECIALTIES.endocrinologie,
  "osteoporose-traitement-maroc":             SPECIALTIES.endocrinologie,
  "arret-tabac-sevrage-maroc":                SPECIALTIES.pneumologie,
  "bpco-exacerbation-maroc":                  SPECIALTIES.pneumologie,
  "bpco-vivre-avec-rehabilitation-maroc":     SPECIALTIES.pneumologie,
  // Cocons vague 5
  "reflux-alimentation-mesures-maroc":        SPECIALTIES["gastro-enterologie"],
  "reflux-nourrisson-maroc":                  SPECIALTIES.pediatrie,
  "hernie-hiatale-maroc":                     SPECIALTIES["gastro-enterologie"],
  // (dialyse / insuffisance-renale-alimentation / proteger-ses-reins → GP ;
  //  crise-de-goutte / alimentation-goutte / acide-urique-eleve → GP.)
  // Cocons vague 6
  "levothyroxine-traitement-thyroide-maroc":  SPECIALTIES.endocrinologie,
  "thyroide-grossesse-maroc":                 SPECIALTIES.endocrinologie,
  "hyperthyroidie-maroc":                     SPECIALTIES.endocrinologie,
  "depistage-cancer-colorectal-maroc":        SPECIALTIES["gastro-enterologie"],
  "polypes-colon-maroc":                      SPECIALTIES["gastro-enterologie"],
  "cancer-colorectal-signes-alerte-maroc":    SPECIALTIES["gastro-enterologie"],
  // (colique-nephretique / prevenir-calculs / types-calculs → GP via catégorie.)
  // Cocons vague 7
  "zona-ophtalmique-maroc":                   SPECIALTIES.dermatologie,
  "douleurs-post-zona-maroc":                 SPECIALTIES.dermatologie,
  "vaccin-zona-maroc":                        SPECIALTIES.dermatologie,
  "crise-hemorroidaire-que-faire-maroc":      SPECIALTIES["gastro-enterologie"],
  "hemorroides-grossesse-maroc":              SPECIALTIES["gastro-enterologie"],
  "traitement-hemorroides-maroc":             SPECIALTIES["gastro-enterologie"],
  // (varices : jambes-lourdes / bas-contention / traitement-varices → GP via catégorie.)
  // Questions fréquentes (spécialiste par question)
  "diabete-se-guerit-il-maroc":               SPECIALTIES.endocrinologie,
  "comment-faire-baisser-tension-maroc":      SPECIALTIES.cardiologie,
  "premiers-signes-avc-maroc":                SPECIALTIES.cardiologie,
  "quand-consulter-pour-une-toux-maroc":      SPECIALTIES.pneumologie,
  "tension-normale-c-est-quoi-maroc":         SPECIALTIES.cardiologie,
  // (fatigue / migraine / mal de tête → médecine générale via la catégorie.)
  // Cocon Ulcère / gastrite
  "helicobacter-pylori-maroc":                SPECIALTIES["gastro-enterologie"],
  "gastrite-maroc":                           SPECIALTIES["gastro-enterologie"],
  "ulcere-ains-prevention-maroc":             SPECIALTIES["gastro-enterologie"],
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
  symptomes:              SPECIALTIES["medecine-generale"],
  examens:                SPECIALTIES["medecine-generale"],
  medicaments:            SPECIALTIES["medecine-generale"],
  "questions-frequentes": SPECIALTIES["medecine-generale"],
  "sante-femme":          SPECIALTIES["gyneco-obstetrique"],
  "sante-enfant":         SPECIALTIES.pediatrie,
  "sante-senior":         SPECIALTIES["medecine-generale"],
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
