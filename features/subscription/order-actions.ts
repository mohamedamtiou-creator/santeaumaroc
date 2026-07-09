"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { getBankDetails } from "@/lib/bank-details";
import {
  computeOrder,
  isBilling,
  generateReference,
  addMonths,
  TRIAL_DAYS,
  type Billing,
} from "@/features/subscription/plans";
import {
  sendSubscriptionOrderInstructions,
  sendSubscriptionOrderAdminNotification,
  sendSubscriptionActivatedEmail,
  sendSubscriptionRejectedEmail,
} from "@/lib/email";

const OPEN_STATUSES = ["PENDING"];

function planLabel(featured: boolean): string {
  return featured ? "Pro + Mise en avant Premium" : "Pro";
}

function doctorDisplayName(d: {
  civilite?: string | null;
  prenom?: string | null;
  nom?: string | null;
  user?: { name?: string | null } | null;
}): string {
  return (
    d.user?.name ??
    ([d.civilite, d.prenom, d.nom].filter(Boolean).join(" ").trim() || "Praticien")
  );
}

/* ── 1. Création d'une commande (tunnel) — compatible useActionState ── */

export type CreateOrderResult = { error?: string };

export async function createSubscriptionOrder(
  _prev: CreateOrderResult,
  formData: FormData,
): Promise<CreateOrderResult> {
  const session = await verifySession(); // redirige vers /connexion si non connecté
  if (session.role !== "DOCTOR") {
    return { error: "Vous devez disposer d'une fiche praticien pour souscrire." };
  }

  const billingIn = String(formData.get("billing") ?? "").toUpperCase();
  const billing: Billing = isBilling(billingIn) ? billingIn : "MONTHLY";
  const featuredRaw = String(formData.get("featured") ?? "");
  const featured = ["on", "1", "true"].includes(featuredRaw);

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.userId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      civilite: true,
      phone: true,
      user: { select: { email: true, name: true } },
    },
  });
  if (!doctor) return { error: "Fiche praticien introuvable." };

  // Anti-doublon : réutiliser une commande ouverte (non payée) au lieu d'en créer une 2e.
  const existing = await prisma.subscriptionOrder.findFirst({
    where: { doctorId: doctor.id, status: { in: OPEN_STATUSES } },
    orderBy: { createdAt: "desc" },
    select: { reference: true },
  });
  if (existing) {
    redirect(`/praticien/tableau-de-bord/abonnement/${existing.reference}`);
  }

  const quote = computeOrder({ billing, featured });

  // Référence unique (réessai en cas de collision @unique).
  let order: { reference: string; amount: number; currency: string } | null = null;
  for (let i = 0; i < 5; i++) {
    try {
      order = await prisma.subscriptionOrder.create({
        data: {
          reference: generateReference(),
          doctorId: doctor.id,
          plan: "PRO",
          billing,
          featured,
          amount: quote.amount,
        },
        select: { reference: true, amount: true, currency: true },
      });
      break;
    } catch (e) {
      const collision =
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      if (!collision || i === 4) {
        return { error: "Impossible de générer la commande. Veuillez réessayer." };
      }
    }
  }
  if (!order) return { error: "Impossible de générer la commande. Veuillez réessayer." };

  // E-mails non bloquants — la commande est déjà créée.
  const email = doctor.user?.email;
  const bank = await getBankDetails();
  if (email) {
    try {
      await sendSubscriptionOrderInstructions(
        email,
        doctorDisplayName(doctor),
        {
          reference: order.reference,
          amount: order.amount,
          currency: order.currency,
          planLabel: planLabel(featured),
        },
        bank,
      );
    } catch {}
  }
  // Notification interne : un virement est attendu pour cette commande.
  try {
    await sendSubscriptionOrderAdminNotification({
      reference: order.reference,
      amount: order.amount,
      currency: order.currency,
      planLabel: planLabel(featured),
      doctorName: doctorDisplayName(doctor),
      email: email ?? "—",
      phone: doctor.phone,
    });
  } catch {}

  redirect(`/praticien/tableau-de-bord/abonnement/${order.reference}`);
}

/* ── 2. Validation par l'admin → active le plan ── */

export async function verifySubscriptionOrder(
  orderId: string,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Accès refusé." };

  const order = await prisma.subscriptionOrder.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      billing: true,
      featured: true,
      doctorId: true,
      doctor: {
        select: {
          planExpiresAt: true,
          civilite: true,
          prenom: true,
          nom: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });
  if (!order) return { error: "Commande introuvable." };
  if (order.status === "VERIFIED") return { error: "Commande déjà validée." };

  const months = order.billing === "ANNUAL" ? 12 : 1;
  const now = new Date();
  // Renouvellement : on prolonge depuis l'échéance actuelle si encore active.
  const base =
    order.doctor.planExpiresAt && order.doctor.planExpiresAt > now
      ? order.doctor.planExpiresAt
      : now;
  const periodEnd = addMonths(base, months);

  await prisma.$transaction([
    prisma.subscriptionOrder.update({
      where: { id: order.id },
      data: {
        status: "VERIFIED",
        reviewedById: session.userId,
        reviewedAt: now,
        periodStart: now,
        periodEnd,
      },
    }),
    prisma.doctor.update({
      where: { id: order.doctorId },
      data: {
        plan: "PRO",
        planActivatedAt: now,
        planExpiresAt: periodEnd,
        ...(order.featured ? { featuredUntil: periodEnd } : {}),
      },
    }),
  ]);

  const email = order.doctor.user?.email;
  if (email) {
    try {
      await sendSubscriptionActivatedEmail(email, doctorDisplayName(order.doctor), {
        planLabel: planLabel(order.featured),
        periodEnd,
        featured: order.featured,
      });
    } catch {}
  }

  revalidatePath("/admin/paiements");
  revalidatePath(`/admin/paiements/${orderId}`);
  revalidatePath("/praticien/tableau-de-bord/abonnement");
  return {};
}

/* ── Essai gratuit Pro (self-service, 1×/médecin) ── */

export async function startProTrial(): Promise<{ error?: string }> {
  const session = await verifySession();
  if (session.role !== "DOCTOR") return { error: "Réservé aux praticiens." };

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.userId },
    select: { id: true, plan: true, planExpiresAt: true, trialUsedAt: true },
  });
  if (!doctor) return { error: "Fiche praticien introuvable." };
  if (doctor.trialUsedAt) return { error: "Vous avez déjà utilisé votre essai gratuit." };

  const now = new Date();
  // Déjà Pro payant actif → l'essai n'apporte rien.
  if (doctor.plan === "PRO" && (!doctor.planExpiresAt || doctor.planExpiresAt > now)) {
    return { error: "Votre offre Pro est déjà active." };
  }

  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.doctor.update({
    where: { id: doctor.id },
    data: { trialEndsAt, trialUsedAt: now },
  });

  revalidatePath("/praticien/tableau-de-bord/abonnement");
  revalidatePath("/praticien/tableau-de-bord");
  return {};
}

/* ── 4. Rejet par l'admin (motif) ── */

export async function rejectSubscriptionOrder(
  orderId: string,
  reason: string,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Accès refusé." };

  const trimmed = (reason ?? "").trim();
  if (trimmed.length < 3) return { error: "Veuillez indiquer un motif." };

  const order = await prisma.subscriptionOrder.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      doctor: {
        select: {
          civilite: true,
          prenom: true,
          nom: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });
  if (!order) return { error: "Commande introuvable." };

  await prisma.subscriptionOrder.update({
    where: { id: order.id },
    data: {
      status: "REJECTED",
      rejectionReason: trimmed,
      reviewedById: session.userId,
      reviewedAt: new Date(),
    },
  });

  const email = order.doctor.user?.email;
  if (email) {
    try {
      await sendSubscriptionRejectedEmail(email, doctorDisplayName(order.doctor), trimmed);
    } catch {}
  }

  revalidatePath("/admin/paiements");
  revalidatePath(`/admin/paiements/${orderId}`);
  return {};
}

/* ── Admin : coordonnées bancaires de virement (singleton) ── */

export async function updateBankSettings(
  _prev: { error?: string; ok?: boolean },
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Accès refusé." };

  const data = {
    holder: String(formData.get("holder") ?? "").trim(),
    bank: String(formData.get("bank") ?? "").trim(),
    rib: String(formData.get("rib") ?? "").trim(),
    iban: String(formData.get("iban") ?? "").trim(),
    swift: String(formData.get("swift") ?? "").trim(),
  };

  await prisma.bankSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  revalidatePath("/admin/paiements");
  revalidatePath("/praticien/tableau-de-bord/abonnement");
  return { ok: true };
}
