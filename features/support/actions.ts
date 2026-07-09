"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { sendSupportTicketConfirmation, sendSupportTicketReply } from "@/lib/email";

export type TicketResult = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ticketId?: string;
};

export async function submitSupportTicket(formData: FormData): Promise<TicketResult> {
  const session = await verifySession();

  const category = String(formData.get("category") ?? "").trim();
  const subject  = String(formData.get("subject")  ?? "").trim();
  const message  = String(formData.get("message")  ?? "").trim();
  const priority = String(formData.get("priority") ?? "normal").trim();
  const phone    = String(formData.get("phone")    ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (!category)           fieldErrors.category = "Sélectionnez une catégorie.";
  if (subject.length < 5)  fieldErrors.subject  = "Le sujet doit faire au moins 5 caractères.";
  if (message.length < 20) fieldErrors.message  = "Le message doit faire au moins 20 caractères.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, name: true },
  });
  if (!user) return { error: "Utilisateur introuvable." };

  const ticket = await prisma.supportTicket.create({
    data: {
      userId:   session.userId,
      category,
      subject,
      message,
      priority: ["normal", "urgent"].includes(priority) ? priority : "normal",
      phone:    phone || null,
    },
  });

  try {
    await sendSupportTicketConfirmation(user.email, user.name, ticket.id, subject);
  } catch {}

  return { ticketId: ticket.id };
}

export async function replyToTicket(
  ticketId: string,
  reply: string,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Accès refusé." };
  if (!reply.trim()) return { error: "La réponse ne peut pas être vide." };

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      adminReply:  reply.trim(),
      repliedAt:   new Date(),
      repliedById: session.userId,
      status:      "in_progress",
    },
    include: { user: { select: { email: true, name: true } } },
  });

  try {
    await sendSupportTicketReply(
      ticket.user.email,
      ticket.user.name,
      ticketId,
      ticket.subject,
      reply.trim(),
    );
  } catch {}

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  return {};
}

export async function updateTicketStatus(
  ticketId: string,
  status: string,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Accès refusé." };

  const valid = ["open", "in_progress", "resolved", "closed"];
  if (!valid.includes(status)) return { error: "Statut invalide." };

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  return {};
}
