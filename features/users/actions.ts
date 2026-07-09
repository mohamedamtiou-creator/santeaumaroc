"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary, type Dictionary } from "@/lib/i18n";

type Errs = Dictionary["dashboard"]["errors"];

async function dashErrors(): Promise<Errs> {
  return getDictionary(await getLocale()).dashboard.errors;
}

const makeProfileSchema = (e: Errs) => z.object({
  name: z.string().min(2, e.nameMin).trim(),
  phone: z.string().optional(),
});

const makePasswordSchema = (e: Errs) => z
  .object({
    currentPassword: z.string().min(1, e.required),
    newPassword: z.string().min(8, e.passwordMin8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: e.passwordsMismatch,
    path: ["confirmPassword"],
  });

export async function updateProfile(state: FormState, formData: FormData): Promise<FormState> {
  const e = await dashErrors();
  const session = await tryGetSession();
  if (!session?.userId) return { message: e.unauthorized };

  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
  };

  const validated = makeProfileSchema(e).safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: validated.data,
  });

  revalidatePath("/tableau-de-bord/profil");
  return { message: "ok" };
}

export async function changePassword(state: FormState, formData: FormData): Promise<FormState> {
  const e = await dashErrors();
  const session = await tryGetSession();
  if (!session?.userId) return { message: e.unauthorized };

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validated = makePasswordSchema(e).safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { message: e.userNotFound };

  const match = await bcrypt.compare(validated.data.currentPassword, user.password);
  if (!match) {
    return { errors: { currentPassword: [e.currentPasswordWrong] } };
  }

  const hashed = await bcrypt.hash(validated.data.newPassword, 10);
  await prisma.user.update({
    where: { id: session.userId },
    data: { password: hashed },
  });

  return { message: "ok" };
}
