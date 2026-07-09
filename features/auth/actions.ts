"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import {
  makeLoginSchema,
  makeRegisterSchema,
  makeForgotPasswordSchema,
  makeResetPasswordSchema,
  type FormState,
} from "@/lib/definitions";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { z } from "zod";
import crypto from "crypto";

/** Messages d'erreur localisés selon la locale courante (cookie). */
async function authMessages() {
  return getDictionary(await getLocale()).auth.errors;
}

const EmailSchema = z.string().email().trim();

/**
 * Vérifie en temps réel (au blur du champ e-mail) si une adresse est déjà
 * utilisée, afin d'éviter un échec tardif après remplissage complet du tunnel.
 * Renvoie `available: true` par défaut quand l'e-mail est mal formé — la
 * validation de format est gérée côté client / au submit.
 */
export async function checkEmailAvailable(email: string): Promise<{ available: boolean }> {
  const parsed = EmailSchema.safeParse(email);
  if (!parsed.success) return { available: true };
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data },
    select: { id: true },
  });
  return { available: !existing };
}

// 5 tentatives par email sur 15 minutes
function checkLoginLimit(email: string) {
  return rateLimit(`login:${email}`, 5, 15 * 60 * 1_000);
}

// 3 inscriptions par email par heure (edge case: essais répétés)
function checkRegisterLimit(email: string) {
  return rateLimit(`register:${email}`, 3, 60 * 60 * 1_000);
}

// 3 demandes de réinitialisation par email par heure
function checkForgotLimit(email: string) {
  return rateLimit(`forgot:${email}`, 3, 60 * 60 * 1_000);
}

// 3 renvois d'e-mail de vérification par email par heure
function checkResendLimit(email: string) {
  return rateLimit(`resend-verif:${email}`, 3, 60 * 60 * 1_000);
}

export async function register(state: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    name:     formData.get("name"),
    email:    formData.get("email"),
    phone:    formData.get("phone") || undefined,
    password: formData.get("password"),
  };

  const m = await authMessages();
  const validated = makeRegisterSchema(m).safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, phone, password } = validated.data;

  const limit = checkRegisterLimit(email);
  if (!limit.success) {
    return { message: m.tooManyRegister };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: [m.emailInUse] } };
  }

  const hashedPassword       = await bcrypt.hash(password, 10);
  const verificationToken    = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.create({
    data: { name, email, phone, password: hashedPassword, verificationToken, verificationTokenExpiry },
  });

  // Email failure must not block account creation
  try {
    await sendVerificationEmail(email, name, verificationToken);
  } catch (err) {
    console.error("[register] Verification email failed:", err);
  }

  redirect(`/auth/verification-envoyee?email=${encodeURIComponent(email)}`);
}

export async function resendVerification(state: FormState, formData: FormData): Promise<FormState> {
  const m = await authMessages();
  const validated = makeForgotPasswordSchema(m).safeParse({ email: formData.get("email") });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email } = validated.data;

  // Rate-limit silencieux : on n'expose pas l'état pour éviter l'énumération/l'abus.
  const limit = checkResendLimit(email);
  if (limit.success) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.emailVerified) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken,
          verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      try {
        await sendVerificationEmail(email, user.name, verificationToken);
      } catch (err) {
        console.error("[resendVerification] Verification email failed:", err);
      }
    }
  }

  // Réponse générique identique dans tous les cas (anti-énumération).
  return { message: m.resendSuccess };
}

/**
 * Cœur d'authentification partagé par `login` (redirection pleine page) et
 * `loginInline` (auth sans navigation, pour le tunnel RDV). En cas de succès,
 * la session est créée ; l'appelant décide ensuite quoi faire (rediriger ou
 * rendre la main au client). Retourne un `FormState` d'erreur sinon.
 */
async function authenticateCore(formData: FormData): Promise<{ ok: true } | { ok: false; state: FormState }> {
  const raw = {
    email:    formData.get("email"),
    password: formData.get("password"),
  };

  const m = await authMessages();
  const validated = makeLoginSchema(m).safeParse(raw);
  if (!validated.success) {
    return { ok: false, state: { errors: validated.error.flatten().fieldErrors } };
  }

  const { email, password } = validated.data;

  const limit = checkLoginLimit(email);
  if (!limit.success) {
    const mins = Math.ceil(limit.retryAfterMs / 60_000);
    return { ok: false, state: { message: m.tooManyLogin.replace("{mins}", String(mins)) } };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, state: { message: m.invalidCredentials } };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return { ok: false, state: { message: m.invalidCredentials } };
  }

  if (!user.emailVerified || !user.isActive) {
    return { ok: false, state: { message: m.emailNotVerified, code: "UNVERIFIED" } };
  }

  await createSession(user.id, user.role);
  return { ok: true };
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const result = await authenticateCore(formData);
  if (!result.ok) return result.state;

  const callbackUrl = (formData.get("callbackUrl") as string | null)?.trim();
  const destination = callbackUrl?.startsWith("/") ? callbackUrl : "/tableau-de-bord";
  redirect(destination);
}

/**
 * Connexion « inline » : identique à `login` mais SANS redirection serveur.
 * Utilisée dans le tunnel RDV pour que l'utilisateur de retour se connecte
 * sans quitter la page (le créneau choisi reste en état côté client) ; le
 * client appelle ensuite `router.refresh()` pour révéler la confirmation.
 */
export async function loginInline(state: FormState, formData: FormData): Promise<FormState> {
  const result = await authenticateCore(formData);
  if (!result.ok) return result.state;
  return { message: "ok" };
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    const m = await authMessages();
    return { success: false, error: m.linkInvalidOrExpired };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified:           true,
      isActive:                true,
      verificationToken:       null,
      verificationTokenExpiry: null,
    },
  });

  return { success: true };
}

export async function forgotPassword(state: FormState, formData: FormData): Promise<FormState> {
  const raw = { email: formData.get("email") };
  const m = await authMessages();
  const validated = makeForgotPasswordSchema(m).safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email } = validated.data;

  const limit = checkForgotLimit(email);
  if (!limit.success) {
    // Silently redirect to avoid email enumeration via error message
    redirect("/auth/email-envoye");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken:       token,
        resetPasswordTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    try {
      await sendPasswordResetEmail(email, user.name, token);
    } catch (err) {
      console.error("[forgotPassword] Reset email failed:", err);
    }
  }

  redirect("/auth/email-envoye");
}

export async function resetPassword(
  token: string,
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = {
    password:        formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const m = await authMessages();
  const validated = makeResetPasswordSchema(m).safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken:       token,
      resetPasswordTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return { message: m.linkInvalidOrExpired };
  }

  const hashedPassword = await bcrypt.hash(validated.data.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password:                 hashedPassword,
      resetPasswordToken:       null,
      resetPasswordTokenExpiry: null,
    },
  });

  redirect("/connexion?reset=success");
}
