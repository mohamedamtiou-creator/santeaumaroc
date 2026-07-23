import "server-only";

import { prisma } from "@/lib/prisma";
import { AUTHOR_STATUS } from "@/lib/contributor";
import { createNotification } from "@/features/notifications/dispatch";

/**
 * Gamification — moteur d'attribution automatique de badges.
 *
 * Appelé en best-effort après la publication d'un article (hors transaction).
 * Idempotent : `grantBadge` upsert le catalogue + l'attribution, donc rejouer
 * ne double rien et ne notifie qu'à la première obtention.
 */

export type BadgeDef = { code: string; label: string; labelAr: string; icon: string };

/** Catalogue des badges. TOP_AUTHOR reste manuel (mise en avant éditoriale). */
export const BADGES: Record<string, BadgeDef> = {
  VERIFIED: { code: "VERIFIED", label: "Auteur vérifié", labelAr: "كاتب موثَّق", icon: "badge-check" },
  ARTICLES_10: { code: "ARTICLES_10", label: "10 articles publiés", labelAr: "10 مقالات منشورة", icon: "pen" },
  ARTICLES_100: { code: "ARTICLES_100", label: "100 articles publiés", labelAr: "100 مقال منشور", icon: "trophy" },
  VIEWS_100K: { code: "VIEWS_100K", label: "100 000 vues", labelAr: "100000 مشاهدة", icon: "eye" },
  EXPERT: { code: "EXPERT", label: "Expert", labelAr: "خبير", icon: "star" },
  TOP_AUTHOR: { code: "TOP_AUTHOR", label: "Top auteur", labelAr: "أفضل كاتب", icon: "award" },
};

/**
 * Attribue un badge à un utilisateur (idempotent). Renvoie true si c'est une
 * NOUVELLE obtention (→ le caller peut notifier), false si déjà détenu.
 */
export async function grantBadge(userId: string, code: string): Promise<boolean> {
  const def = BADGES[code];
  if (!def) return false;
  const badge = await prisma.badge.upsert({
    where: { code: def.code },
    create: { code: def.code, label: def.label, labelAr: def.labelAr, icon: def.icon },
    update: {},
    select: { id: true },
  });
  const existing = await prisma.authorBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
    select: { userId: true },
  });
  if (existing) return false;
  await prisma.authorBadge.create({ data: { userId, badgeId: badge.id } });
  return true;
}

/**
 * Recalcule les compteurs dénormalisés de l'auteur et attribue les badges de
 * seuil franchis. À appeler après chaque publication d'article.
 */
export async function evaluateAuthorBadges(userId: string): Promise<void> {
  try {
    const [published, viewsAgg, user] = await Promise.all([
      prisma.post.count({ where: { authorId: userId, status: "PUBLISHED" } }),
      prisma.post.aggregate({ where: { authorId: userId, status: "PUBLISHED" }, _sum: { views: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { authorStatus: true } }),
    ]);
    const totalViews = viewsAgg._sum.views ?? 0;

    // Garde les compteurs dénormalisés du profil à jour (dashboard, annuaire).
    await prisma.contributorProfile.updateMany({
      where: { userId },
      data: { articlesCount: published, totalViews },
    });

    const toGrant: string[] = [];
    if (published >= 10) toGrant.push("ARTICLES_10");
    if (published >= 100) toGrant.push("ARTICLES_100");
    if (totalViews >= 100_000) toGrant.push("VIEWS_100K");
    if (published >= 10 && user?.authorStatus === AUTHOR_STATUS.VERIFIED) toGrant.push("EXPERT");

    for (const code of toGrant) {
      const isNew = await grantBadge(userId, code);
      if (isNew) {
        await createNotification({
          userId,
          kind: "BADGE",
          title: `Nouveau badge : ${BADGES[code].label}`,
          body: "Félicitations ! Un badge a été ajouté à votre profil d'auteur.",
          href: "/espace-auteur",
        });
      }
    }
  } catch (err) {
    console.error("[badges] évaluation échouée", err);
  }
}
