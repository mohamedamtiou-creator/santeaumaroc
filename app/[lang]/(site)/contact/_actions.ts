"use server";

import { prisma } from "@/lib/prisma";
import { SUBJECTS } from "./_constants";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export type ContactState = {
  success?: boolean;
  errors?: Partial<Record<"name" | "email" | "subject" | "message", string>>;
  serverError?: string;
};

type Msgs = ReturnType<typeof getDictionary>["contact"]["errors"];

function validate(raw: Record<string, unknown>, m: Msgs): ContactState | null {
  const errors: ContactState["errors"] = {};

  const name = String(raw.name ?? "").trim();
  const email = String(raw.email ?? "").trim();
  const subject = String(raw.subject ?? "").trim();
  const message = String(raw.message ?? "").trim();

  if (name.length < 2)         errors.name    = m.name;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = m.email;
  if (!SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) errors.subject = m.subject;
  if (message.length < 10)     errors.message = m.message;

  return Object.keys(errors).length > 0 ? { errors } : null;
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = {
    name:    formData.get("name"),
    email:   formData.get("email"),
    phone:   formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    _hp:     formData.get("_hp"),
  };

  // Honeypot anti-spam
  if (raw._hp) return { success: true };

  const msgs = getDictionary(await getLocale()).contact.errors;
  const validationError = validate(raw, msgs);
  if (validationError) return validationError;

  try {
    await prisma.contactRequest.create({
      data: {
        name:    String(raw.name).trim(),
        email:   String(raw.email).trim(),
        phone:   raw.phone ? String(raw.phone).trim() || undefined : undefined,
        subject: String(raw.subject).trim(),
        message: String(raw.message).trim(),
      },
    });
    return { success: true };
  } catch {
    return { serverError: msgs.server };
  }
}
