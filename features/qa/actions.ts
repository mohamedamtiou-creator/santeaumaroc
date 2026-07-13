"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tryGetSession, verifySession } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { rateLimit } from "@/lib/rate-limit";
import { uniqueQuestionSlug, detectUrgency, logQa, snapshotRevision } from "@/lib/qa";
import { sendQuestionPublishedEmail } from "@/lib/email";
import { preCheckQuestion, isAiEnabled } from "@/lib/qa-ai";
import { verifyTurnstile, isTurnstileEnabled } from "@/lib/turnstile";

/** Recheck ADMIN depuis la base — un JWT peut survivre à un changement de rôle. */
async function requireAdmin() {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true, isActive: true },
  });
  if (!user || user.role !== "ADMIN" || !user.isActive) throw new Error("Accès refusé");
  return session;
}

// ── Patient : poser une question (modérée avant publication) ──────────────────
export async function askQuestion(state: FormState, formData: FormData): Promise<FormState> {
  const t = getDictionary(await getLocale()).qa;

  const session = await tryGetSession();
  if (!session?.userId) return { message: t.loginToAsk, code: "UNAUTH" };

  // E-mail vérifié requis (anti-spam / anti-bot).
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { emailVerified: true, isActive: true },
  });
  if (!user?.emailVerified || !user.isActive) return { message: t.genericError, code: "UNVERIFIED" };

  // Honeypot : champ invisible rempli = bot → on simule un succès silencieux.
  if (((formData.get("website") ?? "") as string).trim() !== "") return { message: "ok" };

  // Rate limit : 5 questions / heure / utilisateur.
  const limit = rateLimit(`qa:ask:${session.userId}`, 5, 60 * 60 * 1000);
  if (!limit.success) return { message: t.rateLimited };

  // CAPTCHA (si configuré) — anti-bot supplémentaire ; gracieux si non activé.
  if (isTurnstileEnabled()) {
    const captcha = ((formData.get("cf-turnstile-response") ?? "") as string).trim();
    if (!(await verifyTurnstile(captcha))) return { message: t.captchaFailed };
  }

  const title = ((formData.get("title") ?? "") as string).trim().replace(/\s+/g, " ");
  const body = ((formData.get("body") ?? "") as string).trim();
  const specialtyId = ((formData.get("specialtyId") ?? "") as string).trim();
  const isAnonymous = formData.get("isAnonymous") === "on" || formData.get("isAnonymous") === "true";

  if (title.length < 10 || title.length > 200) return { errors: { title: [t.askTitleHint] } };
  if (body.length > 4000) return { errors: { body: [t.genericError] } };

  // Spécialité facultative — validée si fournie.
  let validSpecialtyId: string | null = null;
  if (specialtyId) {
    const sp = await prisma.specialty.findUnique({ where: { id: specialtyId }, select: { id: true } });
    validSpecialtyId = sp?.id ?? null;
  }

  // Heuristique d'urgence (toujours), puis affinage IA (best-effort).
  let urgencyLevel = detectUrgency(`${title}\n${body}`);
  let resolvedSpecialtyId = validSpecialtyId;
  let tags: string[] = [];
  let moderationNote: string | null = null;
  let aiMeta: Record<string, unknown> | null = null;

  if (isAiEnabled()) {
    const [specialties, candidates] = await Promise.all([
      prisma.specialty.findMany({ select: { id: true, slug: true, name: true }, orderBy: { order: "asc" } }),
      prisma.question.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 25,
        select: { slug: true, title: true },
      }),
    ]);
    const ai = await preCheckQuestion({
      title,
      body,
      specialties: specialties.map((s) => ({ slug: s.slug, name: s.name })),
      candidates,
    });
    if (ai) {
      if (ai.urgencyLevel === "URGENT") urgencyLevel = "URGENT"; // l'IA peut élever, jamais abaisser
      tags = ai.suggestedTags;
      if (!resolvedSpecialtyId && ai.suggestedSpecialtySlug) {
        resolvedSpecialtyId = specialties.find((s) => s.slug === ai.suggestedSpecialtySlug)?.id ?? null;
      }
      if (ai.danger && ai.dangerReason) moderationNote = `⚠️ IA : ${ai.dangerReason}`;
      aiMeta = {
        correctedTitle: ai.correctedTitle,
        suggestedSpecialtySlug: ai.suggestedSpecialtySlug,
        suggestedTags: ai.suggestedTags,
        danger: ai.danger,
        dangerReason: ai.dangerReason,
        duplicateSlugs: ai.duplicateSlugs,
        isMedical: ai.isMedical,
      };
    }
  }

  const slug = await uniqueQuestionSlug(title);

  const question = await prisma.question.create({
    data: {
      slug,
      title,
      body: body || null,
      status: "PENDING",
      askedById: session.userId,
      specialtyId: resolvedSpecialtyId,
      isAnonymous,
      urgencyLevel,
      tags,
      moderationNote,
    },
    select: { id: true },
  });

  await logQa("QUESTION", question.id, "SUBMITTED", session.userId, urgencyLevel === "URGENT" ? "urgence détectée" : null);
  if (aiMeta) await logQa("QUESTION", question.id, "AI_CHECK", null, null, aiMeta);

  revalidatePath("/admin/questions");
  return { message: "ok", code: urgencyLevel === "URGENT" ? "URGENT" : undefined };
}

// ── Incrément du compteur de vues (best-effort, appelé au rendu) ──────────────
export async function incrementQuestionViews(slug: string): Promise<void> {
  await prisma.question
    .update({ where: { slug }, data: { views: { increment: 1 } } })
    .catch(() => {});
}

// ── Admin : publier une question ──────────────────────────────────────────────
export async function publishQuestion(id: string): Promise<void> {
  const session = await requireAdmin();

  const q = await prisma.question.findUnique({
    where: { id },
    select: {
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
      askedBy: { select: { email: true, emailVerified: true } },
    },
  });
  if (!q) return;

  await prisma.question.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: q.publishedAt ?? new Date() },
  });

  await logQa("QUESTION", id, "PUBLISHED", session.userId);

  // Notification e-mail (best-effort, non bloquant).
  if (q.askedBy?.email && q.askedBy.emailVerified) {
    try {
      await sendQuestionPublishedEmail(q.askedBy.email, q.title, q.slug);
    } catch (err) {
      console.error("[qa] sendQuestionPublishedEmail", err);
    }
  }

  revalidatePath("/questions");
  revalidatePath(`/questions/${q.slug}`);
  revalidatePath("/admin/questions");
  revalidatePath("/sitemap.xml");
}

// ── Admin : rejeter une question ──────────────────────────────────────────────
export async function rejectQuestion(id: string, note?: string): Promise<void> {
  const session = await requireAdmin();
  const q = await prisma.question.findUnique({ where: { id }, select: { slug: true } });
  if (!q) return;

  await prisma.question.update({
    where: { id },
    data: { status: "REJECTED", moderationNote: note?.trim() || null },
  });
  await logQa("QUESTION", id, "REJECTED", session.userId, note?.trim() || null);

  revalidatePath("/questions");
  revalidatePath(`/questions/${q.slug}`);
  revalidatePath("/admin/questions");
  revalidatePath("/sitemap.xml");
}

// ── Admin : éditer une question (titre, contexte, taxonomie, SEO) ─────────────
export async function editQuestion(state: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin();

  const id = ((formData.get("id") ?? "") as string).trim();
  const title = ((formData.get("title") ?? "") as string).trim().replace(/\s+/g, " ");
  const body = ((formData.get("body") ?? "") as string).trim();
  const specialtyId = ((formData.get("specialtyId") ?? "") as string).trim();
  const aiSummary = ((formData.get("aiSummary") ?? "") as string).trim();
  const metaTitle = ((formData.get("metaTitle") ?? "") as string).trim();
  const metaDesc = ((formData.get("metaDesc") ?? "") as string).trim();
  const tagsRaw = ((formData.get("tags") ?? "") as string).trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8) : [];
  // ── Version arabe (traduction relue) ──
  const titleAr = ((formData.get("titleAr") ?? "") as string).trim();
  const bodyAr = ((formData.get("bodyAr") ?? "") as string).trim();
  const aiSummaryAr = ((formData.get("aiSummaryAr") ?? "") as string).trim();
  const metaTitleAr = ((formData.get("metaTitleAr") ?? "") as string).trim();
  const metaDescAr = ((formData.get("metaDescAr") ?? "") as string).trim();
  const markArReviewed = formData.get("markArReviewed") === "true";
  const unmarkArReviewed = formData.get("unmarkArReviewed") === "true";

  if (!id || title.length < 10 || title.length > 200) return { message: "Titre invalide." };

  const q = await prisma.question.findUnique({ where: { id }, select: { slug: true, title: true, body: true } });
  if (!q) return { message: "Introuvable." };

  await snapshotRevision("QUESTION", id, session.userId, q.title, q.body);

  // Gouvernance « L'essentiel » : le résumé AR fourni à la main est conservé
  // (traduction relue). Il reste servi tant que `arReviewedAt >= aiSummaryAt` ;
  // on ré-horodate donc `aiSummaryAt` à chaque édition du résumé FR pour que la
  // traduction AR non re-cochée soit tenue à l'écart jusqu'à nouvelle relecture.
  // Résumé FR vidé → on efface tout (FR + AR + provenance).
  const summaryData = aiSummary
    ? { aiSummary, aiSummaryAr: aiSummaryAr || null, aiSummaryAt: new Date() }
    : { aiSummary: null, aiSummaryAr: null, aiSummarySourceAnswerId: null, aiSummaryAt: null };

  await prisma.question.update({
    where: { id },
    data: {
      title,
      body: body || null,
      specialtyId: specialtyId || null,
      ...summaryData,
      metaTitle: metaTitle || null,
      metaDesc: metaDesc || null,
      tags,
      titleAr: titleAr || null,
      bodyAr: bodyAr || null,
      metaTitleAr: metaTitleAr || null,
      metaDescAr: metaDescAr || null,
      // Retrait prioritaire → repli FR (noindex AR) ; sinon coché → relecture AR
      // validée maintenant (autorise l'affichage/indexation AR).
      ...(unmarkArReviewed ? { arReviewedAt: null } : markArReviewed ? { arReviewedAt: new Date() } : {}),
    },
  });
  await logQa("QUESTION", id, "EDITED", session.userId);

  revalidatePath(`/questions/${q.slug}`);
  revalidatePath(`/ar/questions/${q.slug}`);
  revalidatePath("/admin/questions");
  return { message: "ok" };
}
