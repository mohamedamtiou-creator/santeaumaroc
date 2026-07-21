"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseLines } from "@/lib/treatment";

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
  const options = normLines((formData.get("options") as string) ?? "");
  const duration = ((formData.get("duration") ?? "") as string).trim() || null;
  const sideEffects = normLines((formData.get("sideEffects") as string) ?? "") || null;
  const redFlags = normLines((formData.get("redFlags") as string) ?? "") || null;
  const whenToConsult = ((formData.get("whenToConsult") ?? "") as string).trim() || null;
  const faqJson = normFaq((formData.get("faqJson") as string) ?? "");
  const synonyms = normCsv((formData.get("synonyms") as string) ?? "");
  const specialtyId = ((formData.get("specialtyId") ?? "") as string).trim() || null;
  const relatedSlugs = normCsv((formData.get("relatedSlugs") as string) ?? "");
  const glossarySlugs = normCsv((formData.get("glossarySlugs") as string) ?? "");
  const sources = normSources((formData.get("sources") as string) ?? "");

  const nameAr = ((formData.get("nameAr") ?? "") as string).trim() || null;
  const shortAnswerAr = ((formData.get("shortAnswerAr") ?? "") as string).trim() || null;
  const optionsAr = normLines((formData.get("optionsAr") as string) ?? "") || null;
  const durationAr = ((formData.get("durationAr") ?? "") as string).trim() || null;
  const sideEffectsAr = normLines((formData.get("sideEffectsAr") as string) ?? "") || null;
  const redFlagsAr = normLines((formData.get("redFlagsAr") as string) ?? "") || null;
  const whenToConsultAr = ((formData.get("whenToConsultAr") ?? "") as string).trim() || null;
  const faqJsonAr = normFaq((formData.get("faqJsonAr") as string) ?? "");
  const sourcesAr = normSources((formData.get("sourcesAr") as string) ?? "");

  const status = ((formData.get("status") ?? "PUBLISHED") as string).trim().toUpperCase();
  const publish = formData.get("publish");

  if (!name) throw new Error("Le nom (FR) est obligatoire.");
  if (!slug) throw new Error("Le slug est obligatoire.");
  if (!shortAnswer) throw new Error("La réponse courte est obligatoire.");

  return {
    name, slug, category, shortAnswer, options, duration, sideEffects, redFlags, whenToConsult,
    faqJson, synonyms, specialtyId, relatedSlugs, glossarySlugs, sources,
    nameAr, shortAnswerAr, optionsAr, durationAr, sideEffectsAr, redFlagsAr, whenToConsultAr,
    faqJsonAr, sourcesAr,
    status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    publishOverride: publish === "true" ? "PUBLISHED" : publish === "false" ? "DRAFT" : null,
  };
}

function isP2002(e: unknown): boolean {
  return !!e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002";
}

function revalidateAll(slug: string) {
  revalidatePath("/traitements");
  revalidatePath(`/traitements/${slug}`);
  revalidatePath("/ar/traitements");
  revalidatePath(`/ar/traitements/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function createTreatment(formData: FormData) {
  await requireAdmin();
  const f = readFields(formData);
  const markReviewed = formData.get("markReviewed") === "true";
  const markArReviewed = formData.get("markArReviewed") === "true";
  const status = f.publishOverride ?? f.status;

  try {
    await prisma.treatment.create({
      data: {
        name: f.name, slug: f.slug, category: f.category,
        shortAnswer: f.shortAnswer, options: f.options, duration: f.duration,
        sideEffects: f.sideEffects, redFlags: f.redFlags, whenToConsult: f.whenToConsult,
        faqJson: f.faqJson, synonyms: f.synonyms, specialtyId: f.specialtyId,
        relatedSlugs: f.relatedSlugs, glossarySlugs: f.glossarySlugs, sources: f.sources,
        nameAr: f.nameAr, shortAnswerAr: f.shortAnswerAr, optionsAr: f.optionsAr,
        durationAr: f.durationAr, sideEffectsAr: f.sideEffectsAr, redFlagsAr: f.redFlagsAr,
        whenToConsultAr: f.whenToConsultAr, faqJsonAr: f.faqJsonAr, sourcesAr: f.sourcesAr,
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
  redirect("/admin/traitements");
}

export async function updateTreatment(id: string, formData: FormData) {
  await requireAdmin();
  const f = readFields(formData);
  const markReviewed = formData.get("markReviewed") === "true";
  const markArReviewed = formData.get("markArReviewed") === "true";
  const unmarkReviewed = formData.get("unmarkReviewed") === "true";
  const unmarkArReviewed = formData.get("unmarkArReviewed") === "true";
  const status = f.publishOverride ?? f.status;

  try {
    await prisma.treatment.update({
      where: { id },
      data: {
        name: f.name, slug: f.slug, category: f.category,
        shortAnswer: f.shortAnswer, options: f.options, duration: f.duration,
        sideEffects: f.sideEffects, redFlags: f.redFlags, whenToConsult: f.whenToConsult,
        faqJson: f.faqJson, synonyms: f.synonyms, specialtyId: f.specialtyId,
        relatedSlugs: f.relatedSlugs, glossarySlugs: f.glossarySlugs, sources: f.sources,
        nameAr: f.nameAr, shortAnswerAr: f.shortAnswerAr, optionsAr: f.optionsAr,
        durationAr: f.durationAr, sideEffectsAr: f.sideEffectsAr, redFlagsAr: f.redFlagsAr,
        whenToConsultAr: f.whenToConsultAr, faqJsonAr: f.faqJsonAr, sourcesAr: f.sourcesAr,
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
  redirect("/admin/traitements");
}

export async function deleteTreatment(id: string) {
  await requireAdmin();
  await prisma.treatment.delete({ where: { id } });
  revalidatePath("/traitements");
  revalidatePath("/sitemap.xml");
}
