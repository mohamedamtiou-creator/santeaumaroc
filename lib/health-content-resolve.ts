import "server-only";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/i18n";
import { isTopicArReady, isTopicReviewed } from "@/lib/health-topic";
import { isExamArReady, isExamReviewed } from "@/lib/medical-exam";
import { tSpecialty } from "@/lib/specialty-i18n";
import { getSpecialtyContent, pluralizeSynonyme } from "@/lib/specialty-content";

/**
 * Résolution de listes de slugs vers du contenu RÉELLEMENT publiable.
 *
 * Un seul endroit applique les verrous YMYL du site — publié, relu en français,
 * et relu en arabe quand la page est servie en arabe. Les pages qui agrègent du
 * catalogue (outils, clusters de parcours de vie) partagent ce module pour que
 * la règle ne puisse pas diverger d'un gabarit à l'autre.
 *
 * Un slug inconnu, dépublié ou non relu est silencieusement ignoré : le maillage
 * ne casse jamais, il se densifie au fil des relectures.
 */

export type ResolvedItem = { slug: string; label: string; href: string };

export type ResolvedSpecialty = {
  slug: string;
  /** Nom localisé, pour la navigation. */
  name: string;
  /** Forme plurielle pour les CTA (« Voir les nutritionnistes »). */
  plural: string;
};

/** Le hub d'une fiche dépend de son type : un symptôme n'est pas une maladie. */
const topicHref = (kind: string, slug: string) =>
  `${kind === "DISEASE" ? "/maladies" : "/symptomes"}/${slug}`;

/** Conserve l'ordre DÉCLARÉ (priorité éditoriale), pas celui de la base. */
function inDeclaredOrder(items: ResolvedItem[], slugs: readonly string[]): ResolvedItem[] {
  return [...items].sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
}

export async function resolveTopics(slugs: readonly string[], locale: Locale): Promise<ResolvedItem[]> {
  if (slugs.length === 0) return [];
  const rows = await prisma.healthTopic.findMany({
    where: { slug: { in: [...slugs] }, status: "PUBLISHED" },
    select: {
      slug: true, kind: true, term: true, termAr: true,
      reviewedAt: true, arReviewedAt: true, shortAnswerAr: true,
    },
  });
  const ar = locale === "ar";
  const items = rows
    .filter(isTopicReviewed)
    .filter((t) => !ar || isTopicArReady(t))
    .map((t) => ({
      slug: t.slug,
      label: ar && t.termAr ? t.termAr : t.term,
      href: topicHref(t.kind, t.slug),
    }));
  return inDeclaredOrder(items, slugs);
}

export async function resolveExams(slugs: readonly string[], locale: Locale): Promise<ResolvedItem[]> {
  if (slugs.length === 0) return [];
  const rows = await prisma.medicalExam.findMany({
    where: { slug: { in: [...slugs] }, status: "PUBLISHED" },
    select: {
      slug: true, name: true, nameAr: true,
      reviewedAt: true, arReviewedAt: true, shortAnswerAr: true,
    },
  });
  const ar = locale === "ar";
  const items = rows
    .filter(isExamReviewed)
    .filter((e) => !ar || isExamArReady(e))
    .map((e) => ({
      slug: e.slug,
      label: ar && e.nameAr ? e.nameAr : e.name,
      href: `/examens/${e.slug}`,
    }));
  return inDeclaredOrder(items, slugs);
}

export async function resolveTreatments(slugs: readonly string[], locale: Locale): Promise<ResolvedItem[]> {
  if (slugs.length === 0) return [];
  const rows = await prisma.treatment.findMany({
    where: { slug: { in: [...slugs] }, status: "PUBLISHED" },
    select: {
      slug: true, name: true, nameAr: true,
      reviewedAt: true, arReviewedAt: true, shortAnswerAr: true,
    },
  });
  const ar = locale === "ar";
  // Même verrou que les examens : le modèle porte les mêmes champs de relecture.
  const items = rows
    .filter((t) => !!t.reviewedAt)
    .filter((t) => !ar || (!!t.arReviewedAt && !!t.shortAnswerAr))
    .map((t) => ({
      slug: t.slug,
      label: ar && t.nameAr ? t.nameAr : t.name,
      href: `/traitements/${t.slug}`,
    }));
  return inDeclaredOrder(items, slugs);
}

export async function resolvePosts(slugs: readonly string[], locale: Locale): Promise<ResolvedItem[]> {
  if (slugs.length === 0) return [];
  const rows = await prisma.post.findMany({
    where: { slug: { in: [...slugs] }, status: "PUBLISHED" },
    select: { slug: true, title: true, titleAr: true, arReviewedAt: true },
  });
  const ar = locale === "ar";
  // Un guide n'a pas de verrou `reviewedAt` bloquant (il est publié ou non),
  // mais sa version arabe suit la même règle que partout : `arReviewedAt`.
  const items = rows.map((p) => ({
    slug: p.slug,
    label: ar && p.arReviewedAt && p.titleAr ? p.titleAr : p.title,
    href: `/blog/${p.slug}`,
  }));
  return inDeclaredOrder(items, slugs);
}

export async function resolveSpecialties(
  slugs: readonly string[],
  locale: Locale,
): Promise<ResolvedSpecialty[]> {
  if (slugs.length === 0) return [];
  const rows = await prisma.specialty.findMany({
    where: { slug: { in: [...slugs] } },
    select: { slug: true, name: true },
  });
  const bySlug = new Map(rows.map((s) => [s.slug, s.name] as const));
  return slugs.flatMap((slug) => {
    const name = bySlug.get(slug);
    if (!name) return [];
    if (locale === "ar") {
      const arName = tSpecialty(name, "ar");
      return [{ slug, name: arName, plural: arName }];
    }
    const content = getSpecialtyContent(slug, "fr");
    return [{ slug, name, plural: content.synonymePluriel ?? pluralizeSynonyme(content.synonyme) }];
  });
}
