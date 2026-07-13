"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseLines } from "@/lib/health-topic";

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

/** Split une saisie « valeurs séparées par des virgules » → tableau unique. */
function normCsv(raw: string): string[] {
  const seen = new Set<string>();
  for (const v of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
    seen.add(v);
  }
  return [...seen];
}

/** Liste « 1 item par ligne » re-normalisée (puces tolérées). Vide → "". */
function normLines(raw: string): string {
  return parseLines(raw).join("\n");
}

/** Valide la FAQ JSON [{q,a}] ; vide → null ; format invalide → throw. */
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

/** Valide les sources JSON [{label,url,publisher?,year?}] ; vide → null. */
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
  const kind = ((formData.get("kind") ?? "SYMPTOM") as string).trim().toUpperCase();
  const term = ((formData.get("term") ?? "") as string).trim();
  const slug = toSlug(((formData.get("slug") ?? "") as string).trim() || term);
  const shortAnswer = ((formData.get("shortAnswer") ?? "") as string).trim();
  const causes = normLines((formData.get("causes") as string) ?? "");
  const redFlags = normLines((formData.get("redFlags") as string) ?? "");
  const whenToConsult = ((formData.get("whenToConsult") ?? "") as string).trim() || null;
  const faqJson = normFaq((formData.get("faqJson") as string) ?? "");
  const synonyms = normCsv((formData.get("synonyms") as string) ?? "");
  const specialtyId = ((formData.get("specialtyId") ?? "") as string).trim() || null;
  const relatedSlugs = normCsv((formData.get("relatedSlugs") as string) ?? "");
  const glossarySlugs = normCsv((formData.get("glossarySlugs") as string) ?? "");
  const sources = normSources((formData.get("sources") as string) ?? "");

  // Version arabe
  const termAr = ((formData.get("termAr") ?? "") as string).trim() || null;
  const shortAnswerAr = ((formData.get("shortAnswerAr") ?? "") as string).trim() || null;
  const causesArRaw = normLines((formData.get("causesAr") as string) ?? "");
  const causesAr = causesArRaw || null;
  const redFlagsArRaw = normLines((formData.get("redFlagsAr") as string) ?? "");
  const redFlagsAr = redFlagsArRaw || null;
  const whenToConsultAr = ((formData.get("whenToConsultAr") ?? "") as string).trim() || null;
  const faqJsonAr = normFaq((formData.get("faqJsonAr") as string) ?? "");
  const sourcesAr = normSources((formData.get("sourcesAr") as string) ?? "");

  const status = ((formData.get("status") ?? "PUBLISHED") as string).trim().toUpperCase();
  const publish = formData.get("publish");

  if (!term) throw new Error("Le terme (FR) est obligatoire.");
  if (!slug) throw new Error("Le slug est obligatoire.");
  if (!shortAnswer) throw new Error("La réponse courte est obligatoire.");

  return {
    kind: kind === "DISEASE" ? "DISEASE" : "SYMPTOM",
    term,
    slug,
    shortAnswer,
    causes,
    redFlags,
    whenToConsult,
    faqJson,
    synonyms,
    specialtyId,
    relatedSlugs,
    glossarySlugs,
    sources,
    termAr,
    shortAnswerAr,
    causesAr,
    redFlagsAr,
    whenToConsultAr,
    faqJsonAr,
    sourcesAr,
    status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    // Le bouton « Publier » force PUBLISHED ; « Brouillon » force DRAFT.
    publishOverride: publish === "true" ? "PUBLISHED" : publish === "false" ? "DRAFT" : null,
  };
}

function isP2002(e: unknown): boolean {
  return !!e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002";
}

export async function createTopic(formData: FormData) {
  await requireAdmin();
  const f = readFields(formData);
  const markReviewed = formData.get("markReviewed") === "true";
  const markArReviewed = formData.get("markArReviewed") === "true";
  const status = f.publishOverride ?? f.status;

  try {
    await prisma.healthTopic.create({
      data: {
        kind: f.kind,
        term: f.term,
        slug: f.slug,
        shortAnswer: f.shortAnswer,
        causes: f.causes,
        redFlags: f.redFlags,
        whenToConsult: f.whenToConsult,
        faqJson: f.faqJson,
        synonyms: f.synonyms,
        specialtyId: f.specialtyId,
        relatedSlugs: f.relatedSlugs,
        glossarySlugs: f.glossarySlugs,
        sources: f.sources,
        termAr: f.termAr,
        shortAnswerAr: f.shortAnswerAr,
        causesAr: f.causesAr,
        redFlagsAr: f.redFlagsAr,
        whenToConsultAr: f.whenToConsultAr,
        faqJsonAr: f.faqJsonAr,
        sourcesAr: f.sourcesAr,
        status,
        reviewedAt: markReviewed ? new Date() : null,
        arReviewedAt: markArReviewed ? new Date() : null,
      },
    });
  } catch (e) {
    if (isP2002(e)) throw new Error(`Le slug « ${f.slug} » est déjà utilisé.`);
    throw e;
  }

  revalidatePath("/symptomes");
  revalidatePath(`/symptomes/${f.slug}`);
  revalidatePath("/ar/symptomes");
  revalidatePath(`/ar/symptomes/${f.slug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/symptomes");
}

export async function updateTopic(id: string, formData: FormData) {
  await requireAdmin();
  const f = readFields(formData);
  const markReviewed = formData.get("markReviewed") === "true";
  const markArReviewed = formData.get("markArReviewed") === "true";
  const unmarkReviewed = formData.get("unmarkReviewed") === "true";
  const unmarkArReviewed = formData.get("unmarkArReviewed") === "true";
  const status = f.publishOverride ?? f.status;

  try {
    await prisma.healthTopic.update({
      where: { id },
      data: {
        kind: f.kind,
        term: f.term,
        slug: f.slug,
        shortAnswer: f.shortAnswer,
        causes: f.causes,
        redFlags: f.redFlags,
        whenToConsult: f.whenToConsult,
        faqJson: f.faqJson,
        synonyms: f.synonyms,
        specialtyId: f.specialtyId,
        relatedSlugs: f.relatedSlugs,
        glossarySlugs: f.glossarySlugs,
        sources: f.sources,
        termAr: f.termAr,
        shortAnswerAr: f.shortAnswerAr,
        causesAr: f.causesAr,
        redFlagsAr: f.redFlagsAr,
        whenToConsultAr: f.whenToConsultAr,
        faqJsonAr: f.faqJsonAr,
        sourcesAr: f.sourcesAr,
        status,
        // Re-relecture : retrait prioritaire (repasse en noindex) ; sinon pose la date si cochée.
        ...(unmarkReviewed ? { reviewedAt: null } : markReviewed ? { reviewedAt: new Date() } : {}),
        ...(unmarkArReviewed ? { arReviewedAt: null } : markArReviewed ? { arReviewedAt: new Date() } : {}),
      },
    });
  } catch (e) {
    if (isP2002(e)) throw new Error(`Le slug « ${f.slug} » est déjà utilisé.`);
    throw e;
  }

  revalidatePath("/symptomes");
  revalidatePath(`/symptomes/${f.slug}`);
  revalidatePath("/ar/symptomes");
  revalidatePath(`/ar/symptomes/${f.slug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/symptomes");
}

export async function deleteTopic(id: string) {
  await requireAdmin();
  await prisma.healthTopic.delete({ where: { id } });
  revalidatePath("/symptomes");
  revalidatePath("/sitemap.xml");
}
