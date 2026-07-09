/**
 * Regroupement des spécialités par « famille » clinique approximative.
 *
 * Source unique de la classification, réutilisée par :
 *  - la coloration sémantique de la grille /specialites (getSpecialtyAccent) ;
 *  - le maillage « Spécialités proches » des pages spécialité (autorité topique).
 *
 * Volontairement grossier (heuristique sur le libellé) : sert à proposer un
 * voisinage pertinent, pas à établir une taxonomie médicale exacte.
 */
export type SpecialtyFamily = "technique" | "femme-enfant-mental" | "medecine";

function normalize(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "");
}

export function specialtyFamily(name: string): SpecialtyFamily {
  const n = normalize(name);
  if (/orthop|traumato|chirurg|radiolog|imagerie|oncolog|cancer|anesthes|reanimat|urolog|ophtalmo|orl|oto/.test(n))
    return "technique";
  if (/ped|gynec|obstet|dermatol|psychiatr|psycholog|gastro|rhuma|endocrin|diabet|stomato|dentist|dent|nutrition|sage-femme/.test(n))
    return "femme-enfant-mental";
  return "medecine";
}
