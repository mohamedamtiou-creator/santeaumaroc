"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true, isActive: true },
  });
  if (!user || user.role !== "ADMIN" || !user.isActive) {
    throw new Error("Accès refusé");
  }
  return session;
}

function calcReadingTime(html: string): number {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = plain.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Normalise le champ « À retenir » : 1 point par ligne, vide → null. */
function normTakeaways(raw: string): string | null {
  const lines = raw.split(/\r?\n/).map((l) => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
  return lines.length ? lines.join("\n") : null;
}

/** Valide la FAQ JSON [{q,a}] ; vide → null ; format invalide → throw. */
function normFaq(raw: string, label = "FAQ"): string | null {
  const s = raw.trim();
  if (!s) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    throw new Error(`${label} : JSON invalide. Format attendu : [{ "q": "…", "a": "…" }]`);
  }
  if (!Array.isArray(parsed) || !parsed.every((x) => x && typeof x.q === "string" && typeof x.a === "string")) {
    throw new Error(`${label} : chaque entrée doit contenir « q » et « a » (texte).`);
  }
  return JSON.stringify(parsed.map((x) => ({ q: x.q.trim(), a: x.a.trim() })));
}

/** Valide les sources JSON [{label,url,publisher?,year?}] ; vide → null ; invalide → throw. */
function normSources(raw: string, label = "Sources"): string | null {
  const s = raw.trim();
  if (!s) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    throw new Error(`${label} : JSON invalide. Format attendu : [{ "label": "…", "url": "https://…" }]`);
  }
  if (
    !Array.isArray(parsed) ||
    !parsed.every((x) => x && typeof x.label === "string" && x.label.trim() && typeof x.url === "string" && x.url.trim())
  ) {
    throw new Error(`${label} : chaque entrée doit contenir « label » et « url » (texte non vide).`);
  }
  return JSON.stringify(
    parsed.map((x) => ({
      label: x.label.trim(),
      url: x.url.trim(),
      ...(typeof x.publisher === "string" && x.publisher.trim() ? { publisher: x.publisher.trim() } : {}),
      ...(x.year != null && String(x.year).trim() ? { year: String(x.year).trim() } : {}),
    })),
  );
}

/** Champ texte AR : trim, vide → null. */
function orNull(raw: unknown): string | null {
  const s = ((raw ?? "") as string).trim();
  return s || null;
}

/**
 * Extrait et valide les champs de la version arabe + sources depuis le FormData.
 * Partagé par createPost/updatePost. `arReviewedAt` n'est renvoyé que si demandé
 * (garde-fou YMYL : la relecture AR doit être explicitement cochée).
 */
function extractArAndSources(formData: FormData) {
  const contentAr = (formData.get("contentAr") as string | null) ?? "";
  const markArReviewed = formData.get("markArReviewed") === "true";
  const unmarkArReviewed = formData.get("unmarkArReviewed") === "true";
  return {
    sources:   normSources((formData.get("sources") as string) ?? ""),
    sourcesAr: normSources((formData.get("sourcesAr") as string) ?? "", "Sources (AR)"),
    titleAr:        orNull(formData.get("titleAr")),
    excerptAr:      orNull(formData.get("excerptAr")),
    contentAr:      contentAr.trim() && contentAr.trim() !== "<p></p>" ? contentAr : null,
    metaTitleAr:    orNull(formData.get("metaTitleAr")),
    metaDescAr:     orNull(formData.get("metaDescAr")),
    keyTakeawaysAr: normTakeaways((formData.get("keyTakeawaysAr") as string) ?? ""),
    faqJsonAr:      normFaq((formData.get("faqJsonAr") as string) ?? "", "FAQ (AR)"),
    // Retrait prioritaire → repasse en repli FR (noindex AR) ; sinon coché → relu
    // maintenant ; sinon on ne touche pas (préserve une relecture antérieure).
    ...(unmarkArReviewed ? { arReviewedAt: null } : markArReviewed ? { arReviewedAt: new Date() } : {}),
  };
}

/** Revalide la page du pilier pour rafraîchir son bloc « Dans ce dossier ». */
async function revalidatePillar(pillarId: string | null) {
  if (!pillarId) return;
  const pillar = await prisma.post.findUnique({ where: { id: pillarId }, select: { slug: true } });
  if (pillar) revalidatePath(`/blog/${pillar.slug}`);
}

export async function createPost(formData: FormData) {
  const session = await requireAdmin();

  const title      = (formData.get("title")      as string).trim();
  const slug       = (formData.get("slug")        as string).trim();
  const excerpt    = (formData.get("excerpt")     as string).trim();
  const content    = (formData.get("content")     as string);
  const coverImage = (formData.get("coverImage")  as string).trim() || null;
  const coverAlt   = (formData.get("coverAlt")    as string).trim() || null;
  const categoryId = (formData.get("categoryId")  as string).trim();
  const metaTitle  = (formData.get("metaTitle")   as string).trim() || null;
  const metaDesc   = (formData.get("metaDesc")    as string).trim() || null;
  const featured   = formData.get("featured") === "true";
  const publish    = formData.get("publish")  === "true";
  const keyTakeaways = normTakeaways((formData.get("keyTakeaways") as string) ?? "");
  const faqJson      = normFaq((formData.get("faqJson") as string) ?? "");
  const aboutEntity  = (formData.get("aboutEntity") as string).trim() || null;
  const pillarId     = (formData.get("pillarId")    as string).trim() || null;
  const markReviewed = formData.get("markReviewed") === "true";
  const arAndSources = extractArAndSources(formData);

  if (!title || !slug || !excerpt || !content || !categoryId) {
    throw new Error("Champs obligatoires manquants.");
  }
  // (Le retrait de relecture FR n'a de sens qu'en édition — cf. updatePost.)

  await prisma.post.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      coverAlt,
      categoryId,
      authorId:    session.userId,
      metaTitle,
      metaDesc,
      featured,
      keyTakeaways,
      faqJson,
      aboutEntity,
      pillarId,
      ...arAndSources,
      reviewedById: markReviewed ? session.userId : null,
      reviewedAt:   markReviewed ? new Date() : null,
      readingTime: calcReadingTime(content),
      status:      publish ? "PUBLISHED" : "DRAFT",
      publishedAt: publish ? new Date() : null,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/ar/blog");
  await revalidatePillar(pillarId);
  revalidatePath("/sitemap.xml");
  redirect("/admin/blog");
}

export async function updatePost(id: string, formData: FormData) {
  const session = await requireAdmin();

  const title      = (formData.get("title")      as string).trim();
  const slug       = (formData.get("slug")        as string).trim();
  const excerpt    = (formData.get("excerpt")     as string).trim();
  const content    = (formData.get("content")     as string);
  const coverImage = (formData.get("coverImage")  as string).trim() || null;
  const coverAlt   = (formData.get("coverAlt")    as string).trim() || null;
  const categoryId = (formData.get("categoryId")  as string).trim();
  const metaTitle  = (formData.get("metaTitle")   as string).trim() || null;
  const metaDesc   = (formData.get("metaDesc")    as string).trim() || null;
  const featured   = formData.get("featured") === "true";
  const keyTakeaways = normTakeaways((formData.get("keyTakeaways") as string) ?? "");
  const faqJson      = normFaq((formData.get("faqJson") as string) ?? "");
  const aboutEntity  = (formData.get("aboutEntity") as string).trim() || null;
  const pillarIdRaw  = (formData.get("pillarId")    as string).trim();
  // Un article ne peut pas être son propre pilier.
  const pillarId     = pillarIdRaw && pillarIdRaw !== id ? pillarIdRaw : null;
  const markReviewed = formData.get("markReviewed") === "true";
  const unmarkReviewed = formData.get("unmarkReviewed") === "true";
  const arAndSources = extractArAndSources(formData);

  if (!title || !slug || !excerpt || !content || !categoryId) {
    throw new Error("Champs obligatoires manquants.");
  }

  await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      coverAlt,
      categoryId,
      metaTitle,
      metaDesc,
      featured,
      keyTakeaways,
      faqJson,
      aboutEntity,
      pillarId,
      ...arAndSources,
      // Relecture médicale FR : retrait prioritaire (repasse en noindex) ; sinon
      // met à jour la date + le relecteur si coché (rafraîchit aussi lastReviewed).
      ...(unmarkReviewed
        ? { reviewedById: null, reviewedAt: null }
        : markReviewed
          ? { reviewedById: session.userId, reviewedAt: new Date() }
          : {}),
      readingTime: calcReadingTime(content),
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/ar/blog");
  revalidatePath(`/ar/blog/${slug}`);
  // Rafraîchit le bloc « Dans ce dossier » du pilier rattaché
  await revalidatePillar(pillarId);
  redirect("/admin/blog");
}

export async function publishPost(id: string) {
  await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id }, select: { slug: true } });
  if (!post) throw new Error("Article introuvable");

  await prisma.post.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/sitemap.xml");
}

export async function unpublishPost(id: string) {
  await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id }, select: { slug: true } });
  if (!post) throw new Error("Article introuvable");

  await prisma.post.update({ where: { id }, data: { status: "DRAFT" } });
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
}

export async function deletePost(id: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NewsletterResult = { ok: boolean; error?: "invalid" | "server" };

/** Inscription newsletter santé (capture lead depuis le blog). Idempotent. */
export async function subscribeNewsletter(
  email: string,
  opts?: { locale?: string; source?: string },
): Promise<NewsletterResult> {
  const clean = (email ?? "").trim().toLowerCase();
  if (!clean || clean.length > 254 || !EMAIL_RE.test(clean)) {
    return { ok: false, error: "invalid" };
  }
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: clean },
      update: {},
      create: {
        email: clean,
        locale: opts?.locale === "ar" ? "ar" : "fr",
        source: opts?.source?.slice(0, 120) ?? "blog",
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "server" };
  }
}

export async function incrementViews(slug: string) {
  await prisma.post.update({
    where: { slug },
    data: { views: { increment: 1 } },
  }).catch(() => {/* silently ignore */});
}
