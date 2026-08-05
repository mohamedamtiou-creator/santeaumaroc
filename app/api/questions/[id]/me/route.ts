import { NextResponse } from "next/server";
import { tryGetSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

/**
 * Données PERSONNALISÉES de l'utilisateur connecté pour une question :
 * votes et remerciements déjà posés, suivi de la question, droit d'accepter une
 * réponse, et éligibilité du composer (médecin vérifié n'ayant pas encore
 * répondu).
 *
 * Sorties du rendu de `/questions/[slug]` pour que la page reste STATIQUE / ISR.
 * Elle appelait `tryGetSession()` SANS CONDITION, ce qui la rendait dynamique
 * pour tout le monde, crawlers anonymes compris : aucune mise en cache, rendu et
 * requêtes SQL complets à chaque visite.
 *
 * Même contrat que `/api/praticiens/[id]/me` : ne renvoie QUE les données de
 * l'utilisateur courant (pas d'IDOR), et reproduit à l'identique la logique de
 * droits qui vivait dans la page.
 */
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await tryGetSession();
  if (!session?.userId) return NextResponse.json({ loggedIn: false });

  const userId = session.userId;
  const role = session.role ?? null;

  const question = await prisma.question.findUnique({
    where: { id },
    select: { id: true, askedById: true, answers: { select: { id: true } } },
  });
  if (!question) return NextResponse.json({ loggedIn: true, role });

  const answerIds = question.answers.map((a) => a.id);

  const [voted, thanked, follow, doctor] = await Promise.all([
    answerIds.length
      ? prisma.answerVote.findMany({ where: { userId, answerId: { in: answerIds } }, select: { answerId: true } })
      : Promise.resolve([]),
    answerIds.length
      ? prisma.thank.findMany({ where: { userId, answerId: { in: answerIds } }, select: { answerId: true } })
      : Promise.resolve([]),
    prisma.questionFollow.findUnique({
      where: { questionId_userId: { questionId: id, userId } },
      select: { id: true },
    }),
    // Composer : réservé au médecin vérifié, actif, non blacklisté, et qui n'a
    // pas déjà répondu à cette question.
    role === "DOCTOR"
      ? prisma.doctor.findUnique({
          where: { userId },
          select: { id: true, isVerified: true, isActive: true, isBlacklisted: true },
        })
      : Promise.resolve(null),
  ]);

  let showComposer = false;
  if (doctor?.isVerified && doctor.isActive && !doctor.isBlacklisted) {
    const already = await prisma.answer.findFirst({
      where: { questionId: id, doctorId: doctor.id },
      select: { id: true },
    });
    showComposer = !already;
  }

  return NextResponse.json({
    loggedIn: true,
    role,
    canAccept: question.askedById === userId || role === "ADMIN",
    following: !!follow,
    voted: voted.map((v) => v.answerId),
    thanked: thanked.map((v) => v.answerId),
    showComposer,
  });
}
