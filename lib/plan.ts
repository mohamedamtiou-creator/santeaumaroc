/**
 * Statut « Pro » effectif d'un médecin — porte d'accès aux fonctions premium
 * (prise de rendez-vous en ligne, agenda, rappels, mise en avant…).
 *
 * Un médecin est Pro si son plan est PRO ou CABINET et que l'éventuelle
 * date d'expiration n'est pas dépassée (null = activation sans échéance).
 */
export function isProPlan(plan?: string | null, expiresAt?: Date | null): boolean {
  if (plan !== "PRO" && plan !== "CABINET") return false;
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) return false;
  return true;
}

/**
 * Mise en avant « Premium » active — add-on payant qui propulse la fiche en
 * tête des résultats et affiche un badge Premium. Actif tant que `featuredUntil`
 * n'est pas dépassée.
 */
export function isFeaturedActive(featuredUntil?: Date | null): boolean {
  return !!(featuredUntil && new Date(featuredUntil).getTime() > Date.now());
}

/** Essai gratuit Pro en cours (débloque les RDV en ligne sans paiement). */
export function isTrialActive(trialEndsAt?: Date | null): boolean {
  return !!(trialEndsAt && new Date(trialEndsAt).getTime() > Date.now());
}

/**
 * Accès aux fonctions Pro (prise de RDV en ligne…) : soit un abonnement Pro
 * payant actif, soit un essai gratuit en cours. Porte unique pour le gating RDV.
 */
export function hasProAccess(
  plan?: string | null,
  expiresAt?: Date | null,
  trialEndsAt?: Date | null,
): boolean {
  return isProPlan(plan, expiresAt) || isTrialActive(trialEndsAt);
}
