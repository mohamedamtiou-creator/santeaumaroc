"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { rateLimit } from "@/lib/rate-limit";
import { logQa } from "@/lib/qa";

const TARGET_TYPES = new Set(["QUESTION", "ANSWER", "COMMENT"]);
const REASONS = new Set(["SPAM", "DANGEROUS", "MISINFORMATION", "DUPLICATE", "OTHER"]);

/** Signalement d'un contenu (spam, danger, désinformation, doublon…). */
export async function submitReport(state: FormState, formData: FormData): Promise<FormState> {
  const t = getDictionary(await getLocale()).qa;

  const session = await tryGetSession();
  if (!session?.userId) return { message: t.loginToAsk, code: "UNAUTH" };

  const limit = rateLimit(`qa:report:${session.userId}`, 20, 60 * 60 * 1000);
  if (!limit.success) return { message: t.rateLimited };

  const targetType = ((formData.get("targetType") ?? "") as string).trim().toUpperCase();
  const targetId = ((formData.get("targetId") ?? "") as string).trim();
  const reason = ((formData.get("reason") ?? "") as string).trim().toUpperCase();
  const detail = ((formData.get("detail") ?? "") as string).trim().slice(0, 500);

  if (!TARGET_TYPES.has(targetType) || !targetId || !REASONS.has(reason)) {
    return { message: t.genericError };
  }

  // Idempotent : un seul signalement actif par utilisateur et par cible.
  const existing = await prisma.report.findFirst({
    where: { targetType, targetId, reporterId: session.userId, status: "OPEN" },
    select: { id: true },
  });
  if (!existing) {
    const report = await prisma.report.create({
      data: { targetType, targetId, reporterId: session.userId, reason, detail: detail || null },
      select: { id: true },
    });
    await logQa("REPORT", report.id, "SUBMITTED", session.userId, `${targetType}:${targetId} → ${reason}`);
  }

  revalidatePath("/admin/questions");
  return { message: "ok" };
}
