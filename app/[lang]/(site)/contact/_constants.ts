export const SUBJECTS = [
  "Question générale",
  "Prise de rendez-vous",
  "Référencement / partenariat",
  "Signalement d'erreur",
  "Problème technique",
  "Autre",
] as const;

export type Subject = (typeof SUBJECTS)[number];
