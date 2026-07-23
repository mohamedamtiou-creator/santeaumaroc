import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishArticleNow } from "@/features/articles/publish";

/*
 * Publie les articles approuvés dont la date de planification (`scheduledFor`)
 * est échue. Protégé par CRON_SECRET — à déclencher par un planificateur externe
 * (Vercel Cron, GitHub Actions…) toutes les 5–15 min :
 *   GET /api/cron/publish-scheduled  — en-tête  Authorization: Bearer <CRON_SECRET>
 *
 * `actorId = null` = publication système (tracée comme telle dans EditorialEvent).
 */

export const dynamic = "force-dynamic";

const MAX_BATCH = 100; // garde-fou

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET non configuré." }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const due = await prisma.post.findMany({
    where: { editorialStatus: "APPROVED", scheduledFor: { not: null, lte: new Date() } },
    orderBy: { scheduledFor: "asc" },
    take: MAX_BATCH,
    select: { id: true },
  });

  const published: string[] = [];
  let failed = 0;
  for (const p of due) {
    try {
      const slug = await publishArticleNow(p.id, null);
      if (slug) published.push(slug);
    } catch (e) {
      failed++;
      console.error("[cron:publish-scheduled] échec", p.id, e);
    }
  }

  return NextResponse.json({ ok: true, candidates: due.length, published: published.length, failed, slugs: published });
}
