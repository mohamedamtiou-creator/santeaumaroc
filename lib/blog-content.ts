/**
 * Localisation FR/AR des articles de blog (garde-fou YMYL).
 *
 * L'arabe n'est servi/indexé QUE si `arReviewedAt` est posé (relecture humaine
 * validée) ET que la traduction du contenu existe. Sinon, repli FR intégral.
 * Même principe que lib/qa-content pour la Q/R.
 */
import type { Locale } from "@/lib/i18n";

export type BlogArSource = {
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string | null;
  metaDesc: string | null;
  keyTakeaways: string | null;
  faqJson: string | null;
  coverAlt: string | null;
  titleAr: string | null;
  excerptAr: string | null;
  contentAr: string | null;
  metaTitleAr: string | null;
  metaDescAr: string | null;
  keyTakeawaysAr: string | null;
  faqJsonAr: string | null;
  arReviewedAt: Date | null;
};

/** L'arabe est-il prêt à être servi pour cet article ? (relu + traduit) */
export function isBlogArReady(post: { arReviewedAt: Date | null; contentAr: string | null }): boolean {
  return !!post.arReviewedAt && !!post.contentAr;
}

/**
 * Renvoie les champs à afficher selon la locale. En `ar`, sert la traduction
 * validée ; sinon repli FR champ par champ (une traduction partielle ne casse
 * jamais l'affichage). `isArabic` indique si le contenu servi est réellement AR.
 */
/**
 * Version légère pour les cartes de liste (PostCard) : ne localise que
 * titre + extrait, sans avoir besoin de charger `contentAr`. Le verrou repose
 * ici sur `arReviewedAt` (relecture validée) ET la présence de `titleAr`.
 * Repli FR sinon. `locale` accepté en string pour coller aux composants carte.
 */
export function blogCardLocalized(
  post: { title: string; excerpt: string; titleAr?: string | null; excerptAr?: string | null; arReviewedAt?: Date | string | null },
  locale: string,
) {
  const ar = locale === "ar" && !!post.arReviewedAt && !!post.titleAr;
  return {
    title: ar ? post.titleAr! : post.title,
    excerpt: ar && post.excerptAr ? post.excerptAr : post.excerpt,
  };
}

export function blogLocalized<T extends BlogArSource>(post: T, locale: Locale) {
  const ar = locale === "ar" && isBlogArReady(post);
  const pick = (arVal: string | null, frVal: string) => (ar && arVal ? arVal : frVal);
  const pickN = (arVal: string | null, frVal: string | null) => (ar && arVal ? arVal : frVal);
  return {
    isArabic: ar,
    title: pick(post.titleAr, post.title),
    excerpt: pick(post.excerptAr, post.excerpt),
    content: pick(post.contentAr, post.content),
    metaTitle: pickN(post.metaTitleAr, post.metaTitle),
    metaDesc: pickN(post.metaDescAr, post.metaDesc),
    keyTakeaways: pickN(post.keyTakeawaysAr, post.keyTakeaways),
    faqJson: pickN(post.faqJsonAr, post.faqJson),
    coverAlt: post.coverAlt, // l'alt reste factuel (photo) — non traduit pour l'instant
  };
}
