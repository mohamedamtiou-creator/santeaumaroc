"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isConvention, isPayment } from "@/lib/doctor-options";

type Errs = Dictionary["dashboard"]["errors"];

async function dashErrors(): Promise<Errs> {
  return getDictionary(await getLocale()).dashboard.errors;
}

async function getDoctorId(userId: string): Promise<string | null> {
  const d = await prisma.doctor.findUnique({
    where: { userId },
    select: { id: true },
  });
  return d?.id ?? null;
}

const makeProfileSchema = (e: Errs) => z.object({
  civilite: z.string().optional(),
  nom: z.string().min(1, e.required).trim(),
  prenom: z.string().min(1, e.required).trim(),
  phone: z.string().min(1, e.required).trim(),
  adresse: z.string().min(1, e.required).trim(),
  description: z.string().optional(),
  prix: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().positive().optional()),
  experience: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().int().nonnegative().optional()),
  consultationDuration: z.preprocess((v) => Number(v), z.number().int().min(10).max(120)).default(30),
  specialtyId: z.string().min(1, e.required),
  cityId: z.string().min(1, e.required),
  latitude: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().min(-90).max(90).nullable()),
  longitude: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().min(-180).max(180).nullable()),
});

export async function updatePraticienProfile(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const e = await dashErrors();
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") return { message: e.unauthorized };

  const doctorId = await getDoctorId(session.userId);
  if (!doctorId) return { message: e.profileNotFound };

  const languesRaw = formData.get("langues") as string;
  const langues = languesRaw
    ? languesRaw.split(",").map((l) => l.trim()).filter(Boolean)
    : [];

  // Motifs de consultation : phrases libres (peuvent contenir des virgules) →
  // séparées par des retours à la ligne. On normalise, déduplique et borne.
  const motifsRaw = formData.get("motifs") as string;
  const motifs = Array.from(
    new Set(
      (motifsRaw ?? "")
        .split("\n")
        .map((m) => m.trim().replace(/\s+/g, " "))
        .filter(Boolean)
        .map((m) => m.slice(0, 80)),
    ),
  ).slice(0, 12);

  // Conventionnement & modes de paiement : cases à cocher sur liste fixe
  // (valeurs séparées par des virgules). On ne garde que les valeurs connues
  // (défense contre une valeur forgée) et on déduplique.
  const parseFixed = (key: string, allow: (v: string) => boolean) =>
    Array.from(
      new Set(
        ((formData.get(key) as string) ?? "")
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v && allow(v)),
      ),
    );
  const conventions    = parseFixed("conventions", isConvention);
  const paymentMethods = parseFixed("paymentMethods", isPayment);

  const raw = {
    civilite: formData.get("civilite") || undefined,
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    phone: formData.get("phone"),
    adresse: formData.get("adresse"),
    description: formData.get("description") || undefined,
    prix: formData.get("prix"),
    experience: formData.get("experience"),
    consultationDuration: formData.get("consultationDuration"),
    specialtyId: formData.get("specialtyId"),
    cityId: formData.get("cityId"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  };

  const validated = makeProfileSchema(e).safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const updated = await prisma.doctor.update({
    where: { id: doctorId },
    data: { ...validated.data, langues, conventions, paymentMethods, motifs },
    select: { slug: true },
  });

  revalidatePath("/praticien/tableau-de-bord/profil");
  // La fiche publique doit refléter les motifs/identité mis à jour.
  if (updated.slug) revalidatePath(`/praticiens/${updated.slug}`);
  return { message: "ok" };
}

export async function updateWorkingHours(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const e = await dashErrors();
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") return { message: e.unauthorized };

  const doctorId = await getDoctorId(session.userId);
  if (!doctorId) return { message: e.profileNotFound };

  const updates = [];
  for (let day = 0; day <= 6; day++) {
    const isActive = formData.get(`day_${day}_active`) === "1";
    const startTime = (formData.get(`day_${day}_start`) as string) || "09:00";
    const endTime = (formData.get(`day_${day}_end`) as string) || "17:00";

    updates.push(
      prisma.workingHours.upsert({
        where: { doctorId_dayOfWeek: { doctorId, dayOfWeek: day } },
        create: { doctorId, dayOfWeek: day, startTime, endTime, isActive },
        update: { startTime, endTime, isActive },
      })
    );
  }

  await prisma.$transaction(updates);

  revalidatePath("/praticien/tableau-de-bord/horaires");
  // Les horaires déterminent les créneaux publics → revalider fiche + page RDV.
  const ref = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { slug: true } });
  if (ref?.slug) {
    revalidatePath(`/praticiens/${ref.slug}`);
    revalidatePath(`/praticiens/${ref.slug}/rdv`);
  }
  return { message: "ok" };
}
