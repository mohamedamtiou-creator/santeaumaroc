"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseLines } from "@/lib/medical-exam";

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

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

function normCsv(raw: string): string[] {
  const seen = new Set<string>();
  for (const v of raw.split(",").map((s) => s.trim()).filter(Boolean)) seen.add(v);
  return [...seen];
}

function normLines(raw: string): string {
  return parseLines(raw).join("\n");
}

/** Entier positif ou null (durée, prix en MAD). */
function normInt(raw: string): number | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function normFaq(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    throw new Error('FAQ : JSON invalide. Format attendu : [{ "q": "…", "a": "…" }]');
  }
  if (!Array.isArray(parsed) || !parsed.every((x) => x && typeof x.q === "string" && typeof x.a === "string")) {
    throw new Error("FAQ : chaque entrée doit contenir « q » et « a » (texte).");
  }
  return JSON.stringify(parsed.map((x) => ({ q: x.q.trim(), a: x.a.trim() })));
}

function normSources(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    throw new Error('Sources : JSON invalide. Format attendu : [{ "label": "…", "url": "https://…" }]');
  }
  if (!Array.isArray(parsed) || !parsed.every((x) => x && typeof x.label === "string" && typeof x.url === "string" && x.label.trim() && x.url.trim())) {
    throw new Error("Sources : chaque entrée doit contenir « label » et « url » (texte non vide).");
  }
  return JSON.stringify(
    parsed.map((x) => ({
      label: x.label.trim(),
      url: x.url.trim(),
      ...(x.publisher ? { publisher: String(x.publisher).trim() } : {}),
      ...(x.year ? { year: String(x.year).trim() } : {}),
    })),
  );
}

function readFields(formData: FormData) {
  const name = ((formData.get("name") ?? "") as string).trim();
  const slug = toSlug(((formData.get("slug") ?? "") as string).trim() || name);
  const category = ((formData.get("category") ?? "general") as string).trim() || "general";
  const shortAnswer = ((formData.get("shortAnswer") ?? "") as string).trim();
  const indications = normLines((formData.get("indications") as string) ?? "");
  const procedure = normLines((formData.get("procedure") as string) ?? "");
  const preparation = ((formData.get("preparation") ?? "") as string).trim() || null;
  const precautions = normLines((formData.get("precautions") as string) ?? "") || null;
  const durationMin = normInt((formData.get("durationMin") as string) ?? "");
  const priceMin = normInt((formData.get("priceMin") as string) ?? "");
  const priceMax = normInt((formData.get("priceMax") as string) ?? "");
  const reimbursement = ((formData.get("reimbursement") ?? "") as string).trim() || null;
  const faqJson = normFaq((formData.get("faqJson") as string) ?? "");
  const synonyms = normCsv((formData.get("synonyms") as string) ?? "");
  const specialtyId = ((formData.get("specialtyId") ?? "") as string).trim() || null;
  const relatedSlugs = normCsv((formData.get("relatedSlugs") as string) ?? "");
  const glossarySlugs = normCsv((formData.get("glossarySlugs") as string) ?? "");
  const sources = normSources((formData.get("sources") as string) ?? "");

  const nameAr = ((formData.get("nameAr") ?? "") as string).trim() || null;
  const shortAnswerAr = ((formData.get("shortAnswerAr") ?? "") as string).trim() || null;
  const indicationsAr = normLines((formData.get("indicationsAr") as string) ?? "") || null;
  const procedureAr = normLines((formData.get("procedureAr") as string) ?? "") || null;
  const preparationAr = ((formData.get("preparationAr") ?? "") as string).trim() || null;
  const precautionsAr = normLines((formData.get("precautionsAr") as string) ?? "") || null;
  const reimbursementAr = ((formData.get("reimbursementAr") ?? "") as string).trim() || null;
  const faqJsonAr = normFaq((formData.get("faqJsonAr") as string) ?? "");
  const sourcesAr = normSources((formData.get("sourcesAr") as string) ?? "");

  const status = ((formData.get("status") ?? "PUBLISHED") as string).trim().toUpperCase();
  const publish = formData.get("publish");

  if (!name) throw new Error("Le nom (FR) est obligatoire.");
  if (!slug) throw new Error("Le slug est obligatoire.");
  if (!shortAnswer) throw new Error("La réponse courte est obligatoire.");
  if (priceMin !== null && priceMax !== null && priceMin > priceMax) {
    throw new Error("Le prix minimum ne peut pas dépasser le prix maximum.");
  }

  return {
    name, slug, category, shortAnswer, indications, procedure, preparation, precautions,
    durationMin, priceMin, priceMax, reimbursement, faqJson, synonyms, specialtyId,
    relatedSlugs, glossarySlugs, sources,
    nameAr, shortAnswerAr, indicationsAr, procedureAr, preparationAr, precautionsAr,
    reimbursementAr, faqJsonAr, sourcesAr,
    status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    publishOverride: publish === "true" ? "PUBLISHED" : publish === "false" ? "DRAFT" : null,
  };
}

function isP2002(e: unknown): boolean {
  return !!e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002";
}

function revalidateAll(slug: string) {
  revalidatePath("/examens");
  revalidatePath(`/examens/${slug}`);
  revalidatePath("/ar/examens");
  revalidatePath(`/ar/examens/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function createExam(formData: FormData) {
  await requireAdmin();
  const f = readFields(formData);
  const markReviewed = formData.get("markReviewed") === "true";
  const markArReviewed = formData.get("markArReviewed") === "true";
  const status = f.publishOverride ?? f.status;

  try {
    await prisma.medicalExam.create({
      data: {
        name: f.name, slug: f.slug, category: f.category,
        shortAnswer: f.shortAnswer, indications: f.indications, procedure: f.procedure,
        preparation: f.preparation, precautions: f.precautions,
        durationMin: f.durationMin, priceMin: f.priceMin, priceMax: f.priceMax, reimbursement: f.reimbursement,
        faqJson: f.faqJson, synonyms: f.synonyms, specialtyId: f.specialtyId,
        relatedSlugs: f.relatedSlugs, glossarySlugs: f.glossarySlugs, sources: f.sources,
        nameAr: f.nameAr, shortAnswerAr: f.shortAnswerAr, indicationsAr: f.indicationsAr,
        procedureAr: f.procedureAr, preparationAr: f.preparationAr, precautionsAr: f.precautionsAr,
        reimbursementAr: f.reimbursementAr, faqJsonAr: f.faqJsonAr, sourcesAr: f.sourcesAr,
        status,
        reviewedAt: markReviewed ? new Date() : null,
        arReviewedAt: markArReviewed ? new Date() : null,
      },
    });
  } catch (e) {
    if (isP2002(e)) throw new Error(`Le slug « ${f.slug} » est déjà utilisé.`);
    throw e;
  }

  revalidateAll(f.slug);
  redirect("/admin/examens");
}

export async function updateExam(id: string, formData: FormData) {
  await requireAdmin();
  const f = readFields(formData);
  const markReviewed = formData.get("markReviewed") === "true";
  const markArReviewed = formData.get("markArReviewed") === "true";
  const unmarkReviewed = formData.get("unmarkReviewed") === "true";
  const unmarkArReviewed = formData.get("unmarkArReviewed") === "true";
  const status = f.publishOverride ?? f.status;

  try {
    await prisma.medicalExam.update({
      where: { id },
      data: {
        name: f.name, slug: f.slug, category: f.category,
        shortAnswer: f.shortAnswer, indications: f.indications, procedure: f.procedure,
        preparation: f.preparation, precautions: f.precautions,
        durationMin: f.durationMin, priceMin: f.priceMin, priceMax: f.priceMax, reimbursement: f.reimbursement,
        faqJson: f.faqJson, synonyms: f.synonyms, specialtyId: f.specialtyId,
        relatedSlugs: f.relatedSlugs, glossarySlugs: f.glossarySlugs, sources: f.sources,
        nameAr: f.nameAr, shortAnswerAr: f.shortAnswerAr, indicationsAr: f.indicationsAr,
        procedureAr: f.procedureAr, preparationAr: f.preparationAr, precautionsAr: f.precautionsAr,
        reimbursementAr: f.reimbursementAr, faqJsonAr: f.faqJsonAr, sourcesAr: f.sourcesAr,
        status,
        ...(unmarkReviewed ? { reviewedAt: null } : markReviewed ? { reviewedAt: new Date() } : {}),
        ...(unmarkArReviewed ? { arReviewedAt: null } : markArReviewed ? { arReviewedAt: new Date() } : {}),
      },
    });
  } catch (e) {
    if (isP2002(e)) throw new Error(`Le slug « ${f.slug} » est déjà utilisé.`);
    throw e;
  }

  revalidateAll(f.slug);
  redirect("/admin/examens");
}

export async function deleteExam(id: string) {
  await requireAdmin();
  await prisma.medicalExam.delete({ where: { id } });
  revalidatePath("/examens");
  revalidatePath("/sitemap.xml");
}
