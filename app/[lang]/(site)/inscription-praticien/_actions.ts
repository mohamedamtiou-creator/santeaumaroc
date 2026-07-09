"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary, type Dictionary } from "@/lib/i18n";

type AuthErrors = Dictionary["auth"]["errors"];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(prenom: string, nom: string): Promise<string> {
  const base = slugify(`${prenom} ${nom}`) || "docteur";
  let slug = base;
  let n = 0;
  while (await prisma.doctor.findUnique({ where: { slug } })) {
    n++;
    slug = `${base}-${n + 1}`;
  }
  return slug;
}

function makeSchema(m: AuthErrors) {
  return z.object({
    email:       z.string().email(m.emailInvalid).trim(),
    password:    z.string().min(8, m.passwordMin8Short).regex(/[0-9]/, m.passwordDigitShort),
    civilite:    z.string().optional(),
    prenom:      z.string().min(2, m.prenomMin).trim(),
    nom:         z.string().min(2, m.nomMin).trim(),
    specialtyId: z.string().min(1, m.specialtyRequired),
    cityId:      z.string().min(1, m.cityRequired),
    adresse:     z.string().min(5, m.addressMin).trim(),
    phone:       z.string().min(8, m.phoneRequired).trim(),
    cgu:         z.literal("on", { message: m.cguRequired }),
  });
}

type DoctorRegisterErrors = Partial<Record<keyof z.infer<ReturnType<typeof makeSchema>>, string>>;

export type DoctorRegisterState = {
  errors?: DoctorRegisterErrors;
  serverError?: string;
} | undefined;

export async function registerDoctor(
  _prev: DoctorRegisterState,
  formData: FormData,
): Promise<DoctorRegisterState> {
  const callbackUrl = (formData.get("callbackUrl") as string | null)?.trim() || undefined;

  const raw = Object.fromEntries(
    ["email", "password", "civilite", "prenom", "nom", "specialtyId", "cityId", "adresse", "phone", "cgu"]
      .map((k) => [k, formData.get(k)])
  );

  const m = getDictionary(await getLocale()).auth.errors;
  const result = makeSchema(m).safeParse(raw);
  if (!result.success) {
    const flat = result.error.flatten().fieldErrors;
    return {
      errors: Object.fromEntries(
        Object.entries(flat).map(([k, v]) => [k, v?.[0]])
      ) as DoctorRegisterErrors,
    };
  }

  const { email, password, civilite, prenom, nom, specialtyId, cityId, adresse, phone } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: m.emailInUse } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const fullName = [civilite, prenom, nom].filter(Boolean).join(" ");
  const slug = await generateUniqueSlug(prenom, nom);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: "DOCTOR",
        phone,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    await tx.doctor.create({
      data: {
        userId:     user.id,
        specialtyId,
        cityId,
        slug,
        nom:        nom || null,
        prenom:     prenom || null,
        civilite:   civilite || null,
        adresse,
        phone,
        isVerified: false,
        isActive:   false,
      },
    });
  });

  // L'échec d'envoi d'e-mail ne doit pas bloquer la création du compte
  // (aligné sur le flux patient `register`). L'utilisateur pourra redemander
  // un e-mail de vérification ; sans ce garde-fou, une erreur Resend laissait
  // un compte créé mais sans redirection ni feedback.
  try {
    await sendVerificationEmail(email, fullName, verificationToken, callbackUrl);
  } catch (err) {
    console.error("[registerDoctor] Verification email failed:", err);
  }
  const params = new URLSearchParams({ email });
  if (callbackUrl) params.set("callbackUrl", callbackUrl);
  redirect(`/auth/verification-envoyee?${params.toString()}`);
}
