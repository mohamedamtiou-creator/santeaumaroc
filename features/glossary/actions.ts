"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeCategory } from "@/lib/glossary";

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

/** Normalise un libellé en slug kebab minuscule (identique au blog). */
function toSlug(str: string): string {
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

/** Découpe « synonymes séparés par des virgules » → tableau trimé, unique, non vide. */
function normSynonyms(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of raw.split(",").map((x) => x.trim()).filter(Boolean)) {
    const key = s.toLowerCase();
    if (!seen.has(key)) { seen.add(key); out.push(s); }
  }
  return out.slice(0, 20);
}

/**
 * Valide le champ Sources : JSON [{ label, url, publisher?, year? }].
 * Vide → null. Format invalide → throw avec message clair.
 * `label` et `url` obligatoires par entrée.
 */
function normSources(raw: string): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    throw new Error("Sources : JSON invalide. Format attendu : [{ \"label\": \"…\", \"url\": \"https://…\" }]");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("Sources : le JSON doit être un tableau [ … ].");
  }
  const clean = parsed.map((x, i) => {
    if (!x || typeof x !== "object") {
      throw new Error(`Sources : entrée n°${i + 1} invalide (objet attendu).`);
    }
    const o = x as Record<string, unknown>;
    if (typeof o.label !== "string" || !o.label.trim()) {
      throw new Error(`Sources : entrée n°${i + 1} — « label » obligatoire.`);
    }
    if (typeof o.url !== "string" || !o.url.trim()) {
      throw new Error(`Sources : entrée n°${i + 1} — « url » obligatoire.`);
    }
    const entry: Record<string, string> = { label: o.label.trim(), url: o.url.trim() };
    if (typeof o.publisher === "string" && o.publisher.trim()) entry.publisher = o.publisher.trim();
    if (typeof o.year === "string" && o.year.trim()) entry.year = o.year.trim();
    else if (typeof o.year === "number") entry.year = String(o.year);
    return entry;
  });
  return clean.length ? JSON.stringify(clean) : null;
}

/** Erreur de contrainte d'unicité Prisma (slug déjà pris). */
function isUniqueViolation(e: unknown): boolean {
  return !!e && typeof e === "object" && (e as { code?: string }).code === "P2002";
}

/** Extrait et valide les champs communs depuis le FormData. */
function readFields(formData: FormData) {
  const term = ((formData.get("term") as string) ?? "").trim();
  const slugRaw = ((formData.get("slug") as string) ?? "").trim();
  const slug = toSlug(slugRaw || term);
  const definition = ((formData.get("definition") as string) ?? "").trim();
  const category = normalizeCategory((formData.get("category") as string) ?? "general");
  const synonyms = normSynonyms((formData.get("synonyms") as string) ?? "");
  const specialtyId = ((formData.get("specialtyId") as string) ?? "").trim() || null;
  const relatedSlug = ((formData.get("relatedSlug") as string) ?? "").trim() || null;
  const sources = normSources((formData.get("sources") as string) ?? "");
  const termAr = ((formData.get("termAr") as string) ?? "").trim() || null;
  const definitionAr = ((formData.get("definitionAr") as string) ?? "").trim() || null;
  const sourcesAr = normSources((formData.get("sourcesAr") as string) ?? "");
  const status = ((formData.get("status") as string) === "DRAFT") ? "DRAFT" : "PUBLISHED";
  const markReviewed = formData.get("markReviewed") === "true";
  const markArReviewed = formData.get("markArReviewed") === "true";
  const unmarkReviewed = formData.get("unmarkReviewed") === "true";
  const unmarkArReviewed = formData.get("unmarkArReviewed") === "true";

  if (!term) throw new Error("Le terme est obligatoire.");
  if (!slug) throw new Error("Le slug est obligatoire.");
  if (!definition) throw new Error("La définition est obligatoire.");

  return {
    term, slug, definition, category, synonyms, specialtyId, relatedSlug,
    sources, termAr, definitionAr, sourcesAr, status,
    markReviewed, markArReviewed, unmarkReviewed, unmarkArReviewed,
  };
}

export async function createTerm(formData: FormData) {
  await requireAdmin();
  const f = readFields(formData);

  try {
    await prisma.glossaryTerm.create({
      data: {
        term: f.term,
        slug: f.slug,
        definition: f.definition,
        category: f.category,
        synonyms: f.synonyms,
        specialtyId: f.specialtyId,
        relatedSlug: f.relatedSlug,
        sources: f.sources,
        termAr: f.termAr,
        definitionAr: f.definitionAr,
        sourcesAr: f.sourcesAr,
        status: f.status,
        reviewedAt: f.markReviewed ? new Date() : null,
        arReviewedAt: f.markArReviewed ? new Date() : null,
      },
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw new Error(`Le slug « ${f.slug} » est déjà utilisé.`);
    throw e;
  }

  revalidatePath("/glossaire");
  revalidatePath(`/glossaire/${f.slug}`);
  revalidatePath("/ar/glossaire");
  revalidatePath(`/ar/glossaire/${f.slug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/glossaire");
}

export async function updateTerm(id: string, formData: FormData) {
  await requireAdmin();
  const f = readFields(formData);

  try {
    await prisma.glossaryTerm.update({
      where: { id },
      data: {
        term: f.term,
        slug: f.slug,
        definition: f.definition,
        category: f.category,
        synonyms: f.synonyms,
        specialtyId: f.specialtyId,
        relatedSlug: f.relatedSlug,
        sources: f.sources,
        termAr: f.termAr,
        definitionAr: f.definitionAr,
        sourcesAr: f.sourcesAr,
        status: f.status,
        // Relecture : retrait prioritaire (repasse en noindex) ; sinon pose la date si cochée.
        ...(f.unmarkReviewed ? { reviewedAt: null } : f.markReviewed ? { reviewedAt: new Date() } : {}),
        ...(f.unmarkArReviewed ? { arReviewedAt: null } : f.markArReviewed ? { arReviewedAt: new Date() } : {}),
      },
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw new Error(`Le slug « ${f.slug} » est déjà utilisé.`);
    throw e;
  }

  revalidatePath("/glossaire");
  revalidatePath(`/glossaire/${f.slug}`);
  revalidatePath("/ar/glossaire");
  revalidatePath(`/ar/glossaire/${f.slug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/glossaire");
}

export async function deleteTerm(id: string) {
  await requireAdmin();
  await prisma.glossaryTerm.delete({ where: { id } });
  revalidatePath("/glossaire");
  revalidatePath("/sitemap.xml");
}
