import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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
