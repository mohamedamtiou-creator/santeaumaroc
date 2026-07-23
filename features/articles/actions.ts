"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { slugify } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { calcReadingTime, normTakeaways, normFaq, normSources, orNull } from "@/lib/article-content";
import { canContribute, isVerifiedAuthor, EDITORIAL_STATUS, EVIDENCE_KEYS } from "@/lib/contributor";
import { computeQuality } from "./quality.server";
import { transition, snapshotRevision } from "./transitions";
import { notifyArticleSubmitted } from "@/features/notifications/dispatch";
import type { Prisma } from "@prisma/client";

export type ArticleState =
  | { ok?: boolean; id?: string; quality?: { score: number; warnings: string[] }; errors?: Record<string, string> }
  | undefined;

/** États dans lesquels un auteur peut encore éditer son article. */
const EDITABLE = [EDITORIAL_STATUS.DRAFT, EDITORIAL_STATUS.CHANGES_REQUESTED] as string[];

async function uniqueArticleSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "article";
  let slug = root;
  let n = 1;
  for (;;) {
    const found = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === excludeId) return slug;
    n++;
    slug = `${root}-${n}`;
  }
}

/** Extrait les champs éditables d'un article depuis le FormData (FR + AR + méta). */
function extractArticleFields(formData: FormData) {
  const evidenceRaw = String(formData.get("evidenceLevel") ?? "").trim();
  return {
    title: String(formData.get("title") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: String(formData.get("content") ?? ""),
    coverImage: orNull(formData.get("coverImage")),
    coverAlt: orNull(formData.get("coverAlt")),
    categoryId: String(formData.get("categoryId") ?? "").trim(),
    metaTitle: orNull(formData.get("metaTitle")),
    metaDesc: orNull(formData.get("metaDesc")),
    keyTakeaways: normTakeaways(String(formData.get("keyTakeaways") ?? "")),
    faqJson: normFaq(String(formData.get("faqJson") ?? "")),
    sources: normSources(String(formData.get("sources") ?? "")),
    aboutEntity: orNull(formData.get("aboutEntity")),
    bibliography: orNull(formData.get("bibliography")),
    conflictOfInterest: orNull(formData.get("conflictOfInterest")),
    evidenceLevel: (EVIDENCE_KEYS as readonly string[]).includes(evidenceRaw) ? evidenceRaw : null,
    // Version arabe : collectée, mais JAMAIS servie/indexée tant que arReviewedAt
    // n'est pas posé par un relecteur (garde-fou YMYL) → l'auteur ne peut pas le poser.
    titleAr: orNull(formData.get("titleAr")),
    excerptAr: orNull(formData.get("excerptAr")),
    contentAr: (() => {
      const c = String(formData.get("contentAr") ?? "").trim();
      return c && c !== "<p></p>" ? c : null;
    })(),
    metaTitleAr: orNull(formData.get("metaTitleAr")),
    metaDescAr: orNull(formData.get("metaDescAr")),
    keyTakeawaysAr: normTakeaways(String(formData.get("keyTakeawaysAr") ?? "")),
    faqJsonAr: normFaq(String(formData.get("faqJsonAr") ?? ""), "FAQ (AR)"),
    sourcesAr: normSources(String(formData.get("sourcesAr") ?? ""), "Sources (AR)"),
  };
}

/**
 * Enregistre un brouillon (création ou mise à jour). Un CONTRIBUTOR peut préparer
 * un brouillon même non vérifié ; la SOUMISSION, elle, exige la vérification.
 * Ownership strict : on ne peut éditer que ses propres articles, en état éditable.
 */
export async function saveArticleDraft(_prev: ArticleState, formData: FormData): Promise<ArticleState> {
  const session = await verifySession();
  if (!canContribute(session.role)) return { errors: { form: "Accès refusé." } };

  const id = String(formData.get("id") ?? "").trim() || null;

  let f: ReturnType<typeof extractArticleFields>;
  try {
    f = extractArticleFields(formData);
  } catch (e) {
    return { errors: { form: e instanceof Error ? e.message : "Contenu invalide." } };
  }

  if (!f.title || !f.excerpt || !f.content || !f.categoryId) {
    return { errors: { form: "Titre, résumé, contenu et catégorie sont obligatoires." } };
  }

  const data: Prisma.PostUncheckedCreateInput | Prisma.PostUpdateInput = {
    title: f.title,
    excerpt: f.excerpt,
    content: f.content,
    coverImage: f.coverImage,
    coverAlt: f.coverAlt,
    categoryId: f.categoryId,
    metaTitle: f.metaTitle,
    metaDesc: f.metaDesc,
    keyTakeaways: f.keyTakeaways,
    faqJson: f.faqJson,
    sources: f.sources,
    aboutEntity: f.aboutEntity,
    bibliography: f.bibliography,
    conflictOfInterest: f.conflictOfInterest,
    evidenceLevel: f.evidenceLevel,
    titleAr: f.titleAr,
    excerptAr: f.excerptAr,
    contentAr: f.contentAr,
    metaTitleAr: f.metaTitleAr,
    metaDescAr: f.metaDescAr,
    keyTakeawaysAr: f.keyTakeawaysAr,
    faqJsonAr: f.faqJsonAr,
    sourcesAr: f.sourcesAr,
    readingTime: calcReadingTime(f.content),
  };

  // ── Mise à jour ──
  if (id) {
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true, editorialStatus: true },
    });
    if (!existing || existing.authorId !== session.userId) return { errors: { form: "Article introuvable." } };
    if (!EDITABLE.includes(existing.editorialStatus)) {
      return { errors: { form: "Cet article ne peut plus être modifié dans son état actuel." } };
    }
    await prisma.post.update({ where: { id }, data });
    revalidatePath("/espace-auteur/articles");
    return { ok: true, id };
  }

  // ── Création ──
  const limit = rateLimit(`article-create:${session.userId}`, 20, 60 * 60 * 1000);
  if (!limit.success) return { errors: { form: "Trop de créations. Réessayez plus tard." } };

  const slug = await uniqueArticleSlug(f.title);
  const created = await prisma.post.create({
    data: {
      ...(data as Prisma.PostUncheckedCreateInput),
      slug,
      authorId: session.userId,
      status: "DRAFT",
      editorialStatus: EDITORIAL_STATUS.DRAFT,
    },
    select: { id: true },
  });

  revalidatePath("/espace-auteur/articles");
  return { ok: true, id: created.id };
}

/**
 * Soumet un article à la relecture médicale (DRAFT|CHANGES_REQUESTED → SUBMITTED).
 * Exige un auteur vérifié + passe le contrôle qualité (blockers = refus).
 * Fige une révision et journalise l'événement.
 */
export async function submitArticle(id: string): Promise<ArticleState> {
  const session = await verifySession();
  if (!canContribute(session.role)) return { errors: { form: "Accès refusé." } };

  const author = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, authorStatus: true, role: true },
  });
  // Un ADMIN/EDITOR peut soumettre pour test ; sinon l'auteur doit être vérifié.
  if (author && author.role !== "ADMIN" && !isVerifiedAuthor(author.authorStatus)) {
    return { errors: { form: "Vous devez être un auteur vérifié pour soumettre un article." } };
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      authorId: true, title: true, editorialStatus: true,
      content: true, excerpt: true, metaTitle: true, metaDesc: true,
      coverAlt: true, sources: true, faqJson: true, conflictOfInterest: true,
    },
  });
  if (!post || post.authorId !== session.userId) return { errors: { form: "Article introuvable." } };
  if (!EDITABLE.includes(post.editorialStatus)) {
    return { errors: { form: "Cet article a déjà été soumis." } };
  }

  const { score, report } = computeQuality({
    content: post.content,
    excerpt: post.excerpt,
    metaTitle: post.metaTitle,
    metaDesc: post.metaDesc,
    coverAlt: post.coverAlt,
    sources: post.sources,
    faqJson: post.faqJson,
    conflictOfInterest: post.conflictOfInterest,
  });

  if (report.blockers.length) {
    return { errors: { quality: report.blockers.join(" ") } };
  }

  await prisma.$transaction(async (tx) => {
    await snapshotRevision(tx, { postId: id, authorId: session.userId, note: "Soumission" });
    await transition(tx, {
      postId: id,
      from: post.editorialStatus,
      to: EDITORIAL_STATUS.SUBMITTED,
      actorId: session.userId,
      action: "SUBMITTED",
      extraData: {
        submittedAt: new Date(),
        qualityScore: score,
        qualityReport: report as unknown as Prisma.InputJsonValue,
      },
    });
  });

  await notifyArticleSubmitted({
    authorId: session.userId,
    authorName: author?.name ?? "Un auteur",
    articleTitle: post.title,
    postId: id,
  });

  revalidatePath("/espace-auteur/articles");
  revalidatePath("/admin/articles");
  return { ok: true, id, quality: { score, warnings: report.warnings } };
}

/** Suppression d'un brouillon par son auteur (uniquement en DRAFT). */
export async function deleteArticleDraft(id: string): Promise<ArticleState> {
  const session = await verifySession();
  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true, editorialStatus: true } });
  if (!post || post.authorId !== session.userId) return { errors: { form: "Article introuvable." } };
  if (post.editorialStatus !== EDITORIAL_STATUS.DRAFT) {
    return { errors: { form: "Seul un brouillon peut être supprimé." } };
  }
  await prisma.post.delete({ where: { id } });
  revalidatePath("/espace-auteur/articles");
  return { ok: true };
}
