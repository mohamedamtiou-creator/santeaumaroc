"use server";

import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export type CallbackState = {
  success?: boolean;
  errors?: Partial<Record<"name" | "phone", string>>;
  serverError?: string;
};

const SLOTS = ["asap", "morning", "afternoon"] as const;

/** Demande de rappel pour un praticien sans agenda en ligne (anti-cul-de-sac CRO). */
export async function submitCallback(
  _prev: CallbackState,
  formData: FormData,
): Promise<CallbackState> {
  const doctorId = String(formData.get("doctorId") ?? "").trim();
  const name     = String(formData.get("name") ?? "").trim();
  const phone    = String(formData.get("phone") ?? "").trim();
  const slot     = String(formData.get("preferredSlot") ?? "").trim();
  // Motif facultatif (texte libre) — borné pour éviter les abus de longueur.
  const reason   = String(formData.get("reason") ?? "").trim().slice(0, 200);

  // Honeypot anti-spam
  if (formData.get("_hp")) return { success: true };

  const t = getDictionary(await getLocale()).doctor.callback;

  const errors: CallbackState["errors"] = {};
  if (name.length < 2) errors.name = t.errName;
  if (phone.replace(/\D/g, "").length < 6) errors.phone = t.errPhone;
  if (Object.keys(errors).length > 0) return { errors };

  if (!doctorId) return { serverError: t.errServer };

  try {
    await prisma.callbackRequest.create({
      data: {
        doctorId,
        name,
        phone,
        preferredSlot: SLOTS.includes(slot as (typeof SLOTS)[number]) ? slot : null,
        reason: reason || null,
      },
    });
    return { success: true };
  } catch {
    return { serverError: t.errServer };
  }
}
