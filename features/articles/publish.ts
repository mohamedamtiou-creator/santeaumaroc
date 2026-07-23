import "server-only";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EDITORIAL_STATUS } from "@/lib/contributor";
import { transition } from "./transitions";
import { notifyArticlePublished } from "@/features/notifications/dispatch";
import { evaluateAuthorBadges } from "@/features/badges/engine";

/**
 * Publie effectivement un article approuvé (APPROVED → PUBLISHED) et rend
 * l'ensemble des effets de bord : compteur auteur, badges, notification,
 * revalidation. Partagé par la Server Action `publishApproved` (déclenchée par
 * un éditeur) et le cron de publication planifiée (`actorId = null`).
 *
 * Renvoie le slug publié, ou null si l'article n'était pas dans l'état attendu.
 */
export async function publishArticleNow(postId: string, actorId: string | null): Promise<string | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      editorialStatus: true, slug: true, title: true, reviewedAt: true,
      author: { select: { id: true, name: true, email: true } },
    },
  });
  if (!post || post.editorialStatus !== EDITORIAL_STATUS.APPROVED) return null;

  await prisma.$transaction(async (tx) => {
    await transition(tx, {
      postId,
      from: post.editorialStatus,
      to: EDITORIAL_STATUS.PUBLISHED,
      actorId,
      action: "PUBLISHED",
      extraData: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        scheduledFor: null,
        // Filet YMYL : garantit lastReviewed même si l'approbation ne l'a pas posé.
        ...(post.reviewedAt ? {} : { reviewedById: actorId, reviewedAt: new Date() }),
      },
    });
    await tx.contributorProfile.updateMany({
      where: { userId: post.author.id },
      data: { articlesCount: { increment: 1 } },
    });
  });

  // Effets post-commit (best-effort).
  await evaluateAuthorBadges(post.author.id);
  await notifyArticlePublished({
    authorId: post.author.id,
    authorEmail: post.author.email,
    authorName: post.author.name,
    articleTitle: post.title,
    slug: post.slug,
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/ar/blog");
  revalidatePath("/sitemap.xml");
  return post.slug;
}
