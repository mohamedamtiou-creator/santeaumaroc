import { NextResponse } from "next/server";
import { tryGetSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

/**
 * Avis de l'UTILISATEUR CONNECTÉ sur un médicament (pour préremplir / éditer).
 *
 * Cette donnée est personnalisée (dépend de la session) : elle est volontairement
 * SORTIE du rendu de la fiche (`/medicaments/[slug]`, statique / ISR mise en
 * cache). Le composant client la récupère ici, après hydratation, uniquement si
 * l'utilisateur est connecté (cookie `sm_auth`). Ne renvoie QUE les données de
 * l'utilisateur courant (pas d'IDOR).
 */
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await tryGetSession();
  if (!session?.userId) return NextResponse.json({ existingReview: null });

  const r = await prisma.medicationReview.findFirst({
    where: { userId: session.userId, medicationId: id },
    select: { note: true, commentaire: true },
  });

  return NextResponse.json({
    existingReview: r ? { rating: r.note, comment: r.commentaire } : null,
  });
}
