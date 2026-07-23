import { prisma } from "@/lib/prisma";

/*
 * Rollup quotidien des métriques d'article (dashboard auteur).
 * Endpoint public fire-and-forget (navigator.sendBeacon) :
 *   - type "view" : à l'affichage de l'article
 *   - type "read" : au franchissement de 70 % de scroll (une fois)
 * Best-effort : jamais d'erreur au client, tolérant au bruit (bots, rechargements).
 * Complète Post.views (compteur brut) par une série temporelle jour par jour.
 */

export const dynamic = "force-dynamic";

function startOfUtcDay(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { slug?: unknown; type?: unknown } | null;
    const slug = typeof body?.slug === "string" ? body.slug : null;
    const type = body?.type === "read" ? "read" : "view";
    if (!slug) return new Response(null, { status: 204 });

    const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (!post) return new Response(null, { status: 204 });

    const day = startOfUtcDay();
    const inc = type === "read" ? { reads: { increment: 1 } } : { views: { increment: 1 } };
    await prisma.articleAnalytics
      .upsert({
        where: { postId_day: { postId: post.id, day } },
        create: { postId: post.id, day, views: type === "view" ? 1 : 0, reads: type === "read" ? 1 : 0 },
        update: inc,
      })
      .catch(() => {});
  } catch {
    // fire-and-forget
  }
  return new Response(null, { status: 204 });
}
