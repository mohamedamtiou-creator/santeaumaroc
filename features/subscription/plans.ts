/*
 * Tarifs de l'offre Pro et de l'add-on « Mise en avant Premium ».
 * Source unique de vérité — utilisée par la grille tarifaire (PricingPlans),
 * le tunnel de souscription et l'activation par l'admin.
 * Montants en MAD (dirhams entiers). ⚠️ Placeholders à valider.
 *
 * Fichier volontairement « pur » (pas d'accès env / DB) pour être importable
 * aussi bien côté client (grille tarifaire) que côté serveur (server actions).
 */

export type Billing = "MONTHLY" | "ANNUAL";

/* ── Offre Pro ── */
export const PRO_MONTHLY = 249; // MAD / mois
export const PRO_ANNUAL_PER_MONTH = 199; // MAD / mois (facturé annuellement)
export const PRO_ANNUAL_TOTAL = 2388; // MAD / an (12 × 199 — 2 mois offerts)

/* ── Add-on « Mise en avant Premium » (boost visibilité, badge, top résultats) ── */
export const FEATURED_MONTHLY = 99; // MAD / mois
export const FEATURED_ANNUAL_PER_MONTH = 79; // MAD / mois (facturé annuellement)
export const FEATURED_ANNUAL_TOTAL = 948; // MAD / an (12 × 79)

export const MONTHS_BY_BILLING: Record<Billing, number> = { MONTHLY: 1, ANNUAL: 12 };

/** Durée de l'essai gratuit Pro (jours). 1 essai par médecin. */
export const TRIAL_DAYS = 15;

export function isBilling(v: unknown): v is Billing {
  return v === "MONTHLY" || v === "ANNUAL";
}

/** "mensuel" | "annuel" (query string) → Billing. Tout le reste retombe sur MONTHLY. */
export function billingFromCycle(cycle: string | undefined | null): Billing {
  return cycle === "annuel" ? "ANNUAL" : "MONTHLY";
}

export function cycleFromBilling(b: Billing): "mensuel" | "annuel" {
  return b === "ANNUAL" ? "annuel" : "mensuel";
}

export type OrderQuote = {
  billing: Billing;
  featured: boolean;
  months: number;
  proAmount: number; // total Pro sur la période
  featuredAmount: number; // total add-on sur la période (0 si non sélectionné)
  amount: number; // total exact à virer
};

export function computeOrder({
  billing,
  featured,
}: {
  billing: Billing;
  featured: boolean;
}): OrderQuote {
  const months = MONTHS_BY_BILLING[billing];
  const proAmount = billing === "ANNUAL" ? PRO_ANNUAL_TOTAL : PRO_MONTHLY;
  const featuredAmount = featured
    ? billing === "ANNUAL"
      ? FEATURED_ANNUAL_TOTAL
      : FEATURED_MONTHLY
    : 0;
  return { billing, featured, months, proAmount, featuredAmount, amount: proAmount + featuredAmount };
}

/** Ajoute n mois à une date (immuable). */
export function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

/** Format d'un montant : "2 388 MAD" (espaces fines, FR). */
export function formatAmount(amount: number, currency = "MAD"): string {
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
}

/**
 * Référence de virement lisible, servant aussi de n° de dossier : "SAM-XXXX-XXXX".
 * Alphabet sans caractères ambigus (I, O, 0, 1). L'unicité est garantie par la
 * contrainte @unique en base — l'appelant régénère en cas de collision.
 */
export function generateReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `SAM-${pick(4)}-${pick(4)}`;
}
