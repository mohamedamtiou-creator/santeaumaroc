"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tryGetSession, verifySession } from "@/lib/dal";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import {
  sendSubscriptionLeadConfirmation,
  sendSubscriptionLeadAdminNotification,
} from "@/lib/email";

const LEAD_STATUSES = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"];

export type LeadResult = {
  error?: string;
  fieldErrors?: Record<string, string>;
  leadId?: string;
};

const PLANS: readonly string[] = ["PRO", "CABINET"];
const BILLINGS: readonly string[] = ["MONTHLY", "ANNUAL"];

export async function submitSubscriptionLead(formData: FormData): Promise<LeadResult> {
  const t = getDictionary(await getLocale()).tarifs.lead;

  const plan      = String(formData.get("plan") ?? "").toUpperCase();
  const billingIn = String(formData.get("billing") ?? "").toUpperCase();
  const name      = String(formData.get("name") ?? "").trim();
  const email     = String(formData.get("email") ?? "").trim();
  const phone     = String(formData.get("phone") ?? "").trim();
  const city      = String(formData.get("city") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const message   = String(formData.get("message") ?? "").trim();

  if (!PLANS.includes(plan)) return { error: t.errPlan };

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = t.errName;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fieldErrors.email = t.errEmail;
  if (!/^[+0-9\s().-]{6,20}$/.test(phone)) fieldErrors.phone = t.errPhone;
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const session = await tryGetSession();
  const billing = plan === "PRO" && BILLINGS.includes(billingIn) ? billingIn : null;

  let lead;
  try {
    lead = await prisma.subscriptionLead.create({
      data: {
        plan,
        billing,
        name,
        email,
        phone,
        city:      city || null,
        specialty: specialty || null,
        message:   message || null,
        userId:    session?.userId ?? null,
      },
    });
  } catch {
    return { error: t.errGeneric };
  }

  const planLabel = plan === "PRO" ? t.planPro : t.planCabinet;
  // E-mails non bloquants (la demande est déjà enregistrée).
  try { await sendSubscriptionLeadConfirmation(email, name, planLabel); } catch {}
  try {
    await sendSubscriptionLeadAdminNotification({
      id: lead.id, plan, billing, name, email, phone,
      city: city || null, specialty: specialty || null, message: message || null,
    });
  } catch {}

  return { leadId: lead.id };
}

/* ── Admin : faire avancer un lead dans le pipeline ── */
export async function updateLeadStatus(
  leadId: string,
  status: string,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Accès refusé." };
  if (!LEAD_STATUSES.includes(status)) return { error: "Statut invalide." };

  await prisma.subscriptionLead.update({
    where: { id: leadId },
    data: { status },
  });

  revalidatePath("/admin/abonnements");
  revalidatePath(`/admin/abonnements/${leadId}`);
  return {};
}
