import type { Locale } from "./i18n";

/**
 * Options fixes pour le conventionnement et les modes de paiement.
 * Source UNIQUE partagée par le formulaire praticien et la fiche publique,
 * afin que valeurs stockées et libellés traduits restent cohérents.
 *
 * La valeur stockée en base (`value`) est canonique et langage-neutre autant
 * que possible (les acronymes marocains CNSS/AMO/CNOPS/RAMED s'écrivent pareil
 * en FR et en AR). Seuls les libellés variables sont traduits.
 */

type Option = { value: string; fr: string; ar: string };

export const CONVENTION_OPTIONS: readonly Option[] = [
  { value: "CNSS",            fr: "CNSS",            ar: "CNSS" },
  { value: "AMO",             fr: "AMO",             ar: "AMO" },
  { value: "CNOPS",           fr: "CNOPS",           ar: "CNOPS" },
  { value: "RAMED",           fr: "RAMED",           ar: "RAMED" },
  { value: "Mutuelle privée", fr: "Mutuelle privée", ar: "تأمين خاص" },
] as const;

export const PAYMENT_OPTIONS: readonly Option[] = [
  { value: "Espèces",        fr: "Espèces",        ar: "نقداً" },
  { value: "Carte bancaire", fr: "Carte bancaire", ar: "بطاقة بنكية" },
  { value: "Chèque",         fr: "Chèque",         ar: "شيك" },
  { value: "Virement",       fr: "Virement",       ar: "تحويل بنكي" },
] as const;

const CONVENTION_VALUES = new Set(CONVENTION_OPTIONS.map((o) => o.value));
const PAYMENT_VALUES    = new Set(PAYMENT_OPTIONS.map((o) => o.value));

export const isConvention = (v: string) => CONVENTION_VALUES.has(v);
export const isPayment    = (v: string) => PAYMENT_VALUES.has(v);

export function tConvention(value: string, locale: Locale): string {
  return CONVENTION_OPTIONS.find((o) => o.value === value)?.[locale] ?? value;
}
export function tPayment(value: string, locale: Locale): string {
  return PAYMENT_OPTIONS.find((o) => o.value === value)?.[locale] ?? value;
}
