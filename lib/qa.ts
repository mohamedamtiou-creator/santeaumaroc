import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { computeAnswerScore } from "@/lib/qa-ranking";
import { isProPlan, isFeaturedActive } from "@/lib/plan";

/**
 * Slug unique pour une question, dérivé du titre (longue traîne SEO).
 * Tronqué à ~70 caractères, suffixe numérique en cas de collision.
 */
export async function uniqueQuestionSlug(title: string): Promise<string> {
  const base = slugify(title).split("-").slice(0, 12).join("-").slice(0, 70) || "question";
  let slug = base;
  let n = 1;
  while (await prisma.question.findUnique({ where: { slug }, select: { id: true } })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

/**
 * Détection heuristique d'urgence médicale (MVP — l'IA affinera en phase 2).
 * Repère des signaux de gravité (FR + arabe) ; en cas de doute → URGENT, on
 * affiche la bannière secours plutôt que de risquer un retard de prise en charge.
 */
const URGENT_PATTERNS: RegExp[] = [
  /douleur\s+(thoraciqu|à\s+la\s+poitrine|poitrine)/i,
  /mal\s+à\s+respirer|difficult\w*\s+à\s+respirer|essouffl|étouff|suffoqu/i,
  /perte\s+de\s+connaissance|évanou|malaise\s+grave|inconscient/i,
  /\bavc\b|accident\s+vasculaire|paralysie|hémiplég/i,
  /h[ée]morragie|saigne\w*\s+(abondam|beaucoup|sans\s+arr[êe]t)/i,
  /infarctus|crise\s+cardiaque/i,
  /convuls|crise\s+d['e]\s*épileps/i,
  /suicid|envie\s+d['e]\s*en\s+finir|me\s+faire\s+du\s+mal/i,
  /overdose|intoxication\s+grave|empoisonn/i,
  /\bbébé\b.*(ne\s+respire|bleu|inerte)/i,
  // arabe : ألم في الصدر، صعوبة في التنفس، فقدان الوعي، نزيف، انتحار
  /ألم\s+في\s+الصدر|صعوبة\s+في\s+التنفس|فقدان\s+الوعي|نزيف\s+حاد|انتحار|سكتة\s+دماغية/,
];

export function detectUrgency(text: string): "NONE" | "URGENT" {
  const t = (text || "").normalize("NFC");
  return URGENT_PATTERNS.some((re) => re.test(t)) ? "URGENT" : "NONE";
}

/** « 1 réponse » / « N réponses » selon le compteur, via le dictionnaire i18n. */
export function answersLabel(n: number, oneAnswer: string, manyAnswers: string): string {
  if (n === 1) return oneAnswer;
  return manyAnswers.replace("{n}", String(n));
}

/**
 * Recalcule et persiste le score de classement d'une réponse à partir de ses
 * compteurs dénormalisés et du statut du médecin (vérifié / Pro / mis en avant).
 */
export async function recomputeAnswerScore(answerId: string): Promise<void> {
  const a = await prisma.answer.findUnique({
    where: { id: answerId },
    select: {
      upvotes: true,
      thanksCount: true,
      isAccepted: true,
      createdAt: true,
      doctor: { select: { isVerified: true, plan: true, planExpiresAt: true, featuredUntil: true } },
    },
  });
  if (!a) return;
  const score = computeAnswerScore({
    upvotes: a.upvotes,
    thanksCount: a.thanksCount,
    isAccepted: a.isAccepted,
    isVerified: a.doctor.isVerified,
    isPro: isProPlan(a.doctor.plan, a.doctor.planExpiresAt),
    isFeatured: isFeaturedActive(a.doctor.featuredUntil),
    createdAt: a.createdAt,
  });
  await prisma.answer.update({ where: { id: answerId }, data: { score } });
}

/** Enregistre un instantané (snapshot) avant modification (best-effort). */
export async function snapshotRevision(
  entityType: "QUESTION" | "ANSWER",
  entityId: string,
  editorId: string | null,
  previousTitle: string | null,
  previousBody: string | null,
): Promise<void> {
  try {
    await prisma.qaRevision.create({
      data: { entityType, entityId, editorId, previousTitle, previousBody },
    });
  } catch {
    /* l'historique ne doit jamais bloquer l'action métier */
  }
}

/** Écrit une entrée au journal d'audit de modération Q/R (best-effort). */
export async function logQa(
  entityType: string,
  entityId: string,
  action: string,
  actorId?: string | null,
  note?: string | null,
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.qaModerationLog.create({
      data: {
        entityType,
        entityId,
        action,
        actorId: actorId ?? null,
        note: note ?? null,
        meta: meta ? (meta as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch {
    /* le journal ne doit jamais bloquer l'action métier */
  }
}
