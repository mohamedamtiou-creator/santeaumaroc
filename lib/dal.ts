import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canContribute, canReview } from "@/lib/contributor";

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/connexion");
  }

  return { isAuth: true, userId: session.userId, role: session.role };
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      phone: true,
      doctorProfile: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });

  return user;
});

export const getCurrentDoctor = cache(async () => {
  const session = await verifySession();
  if (session.role !== "DOCTOR") redirect("/tableau-de-bord");

  return prisma.doctor.findUnique({
    where: { userId: session.userId },
    select: {
      id: true,
      slug: true,
      nom: true,
      prenom: true,
      civilite: true,
      phone: true,
      adresse: true,
      latitude: true,
      longitude: true,
      description: true,
      prix: true,
      experience: true,
      langues: true,
      conventions: true,
      paymentMethods: true,
      motifs: true,
      consultationDuration: true,
      avatar: true,
      isVerified: true,
      isActive: true,
      smsReminderEnabled: true,
      specialtyId: true,
      cityId: true,
      specialty: { select: { id: true, name: true } },
      city: { select: { id: true, name: true } },
    },
  });
});

export const tryGetSession = cache(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  return await decrypt(cookie);
});

/**
 * Garde de page pour l'espace auteur (/espace-auteur). Redirige les visiteurs
 * qui ne peuvent pas contribuer. Renvoie l'utilisateur + ses champs auteur.
 * cf lib/contributor.ts (canContribute).
 */
export const getContributorUser = cache(async () => {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      professionKind: true,
      authorSlug: true,
      authorStatus: true,
      jobTitle: true,
      credentials: true,
      bio: true,
      bioAr: true,
      registrationNumber: true,
      orderName: true,
      university: true,
      website: true,
      linkedin: true,
      cabinetUrl: true,
      authorCityId: true,
      authorSpecialtyId: true,
      contributorProfile: true,
      // Cas « médecin + auteur » : permet le lien croisé vers l'espace praticien.
      doctorProfile: { select: { slug: true } },
    },
  });
  if (!user || !canContribute(user.role)) redirect("/devenir-auteur");
  return user;
});

/** Garde de page pour la relecture (éditeur médical ou admin). */
export const getEditorUser = cache(async () => {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true, isActive: true },
  });
  if (!user || !user.isActive || !canReview(user.role)) redirect("/tableau-de-bord");
  return user;
});
