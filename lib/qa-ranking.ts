/**
 * Classement intelligent des réponses médicales.
 *
 * Le score est recalculé et stocké (dénormalisé) sur `Answer.score` à chaque
 * événement (vote, merci, acceptation, édition) ; la liste se trie ensuite par
 * `score DESC` — pas d'agrégation au runtime.
 *
 * Pondération (qualité E-E-A-T + valeur d'abonnement, sans écraser le mérite) :
 *   - votes utiles et remerciements = signal patient ;
 *   - réponse acceptée = forte priorité (remonte en tête) ;
 *   - médecin vérifié / abonné Pro / mis en avant = léger boost de confiance ;
 *   - fraîcheur = petit bonus dégressif pour ne pas figer une vieille réponse.
 */

export type AnswerScoreInput = {
  upvotes: number;
  thanksCount: number;
  isAccepted: boolean;
  isVerified: boolean;
  isPro: boolean;
  isFeatured: boolean;
  createdAt: Date;
  now?: number; // injectable pour les tests
};

const W_UPVOTE = 3;
const W_THANK = 2;
const ACCEPTED_BONUS = 80; // garantit la tête de liste
const VERIFIED_BONUS = 4;
const PRO_BONUS = 8;
const FEATURED_BONUS = 4;
const RECENCY_MAX = 10; // bonus à J0
const RECENCY_HALFLIFE_DAYS = 14;

export function computeAnswerScore(a: AnswerScoreInput): number {
  const now = a.now ?? Date.now();
  const ageDays = Math.max(0, (now - a.createdAt.getTime()) / 86_400_000);
  const recency = RECENCY_MAX * Math.pow(0.5, ageDays / RECENCY_HALFLIFE_DAYS);

  let score = a.upvotes * W_UPVOTE + a.thanksCount * W_THANK + recency;
  if (a.isAccepted) score += ACCEPTED_BONUS;
  if (a.isVerified) score += VERIFIED_BONUS;
  if (a.isPro) score += PRO_BONUS;
  if (a.isFeatured) score += FEATURED_BONUS;

  return Math.round(score * 100) / 100;
}
