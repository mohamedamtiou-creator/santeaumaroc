import { NextResponse } from "next/server";
import { tryGetSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

/**
 * Données PERSONNALISÉES de l'utilisateur connecté pour une fiche médecin :
 * rôle, avis existant (édition), demande de revendication en cours.
 *
 * Sorties du rendu de `/praticiens/[slug]` pour que la fiche reste STATIQUE / ISR.
 * Le contexte client (DoctorUserProvider) les récupère après hydratation, si et
 * seulement si l'utilisateur est connecté (cookie `sm_auth`). Ne renvoie QUE les
 * données de l'utilisateur courant (pas d'IDOR). Reproduit à l'identique la
 * logique de droits qui était côté page : l'avis n'est lu que pour un PATIENT/ADMIN,
 * la revendication que pour un DOCTOR.
 */
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await tryGetSession();
  if (!session?.userId) return NextResponse.json({ loggedIn: false });

  const role = session.role ?? null;
  const canReview = role === "PATIENT" || role === "ADMIN";

  const [review, claim] = await Promise.all([
    canReview
      ? prisma.review.findUnique({
          where: { patientId_doctorId: { patientId: session.userId, doctorId: id } },
          select: { rating: true, comment: true },
        })
      : Promise.resolve(null),
    role === "DOCTOR"
      ? prisma.doctorClaim.findUnique({
          where: { doctorId_userId: { doctorId: id, userId: session.userId } },
          select: { status: true, adminNote: true },
        })
      : Promise.resolve(null),
  ]);

  return NextResponse.json({ loggedIn: true, role, existingReview: review, claim });
}
