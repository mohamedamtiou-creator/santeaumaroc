import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

export const revalidate = 86400; // revalidate sitemap every 24h

// Google limite chaque fichier sitemap à 50 000 URL. On segmente par catégorie
// via generateSitemaps (Next génère automatiquement l'index /sitemap.xml qui
// pointe vers /sitemap/<id>.xml), et on borne chaque requête sous ce plafond
// pour rester valide même en cas de forte croissance du référentiel.
const MAX_PER_SITEMAP = 45000;

// Segments : chacun reste largement sous les 50 000 URL aux volumes actuels
// (~20 k médecins, ~24 k combos max, ~6,4 k établissements).
export async function generateSitemaps() {
  return [
    { id: "core" },      // pages statiques + spécialités + villes + catégories blog + spécialités Q/R
    { id: "doctors" },   // fiches praticiens
    { id: "combos" },    // combos spécialité × ville
    { id: "content" },   // établissements + médicaments + blog + questions
  ];
}

// Déclare la variante arabe (/ar) de chaque URL via hreflang : Google découvre
// et associe les deux versions linguistiques d'une même page.
const withHreflang = (entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap =>
  entries.map((e) => {
    const fr = e.url;
    const ar = fr.replace(BASE, `${BASE}/ar`);
    return {
      ...e,
      alternates: { languages: { "fr-MA": fr, "ar-MA": ar, "x-default": fr } },
    };
  });

function staticPages(now: Date): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`,                          lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/praticiens`,                lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/blog`,                      lastModified: now, changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/questions`,                 lastModified: now, changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/sante-darija`,              lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/specialites`,               lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/villes`,                    lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/cliniques`,                 lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/pharmacies`,                lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/laboratoires`,              lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/medicaments`,               lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/a-propos`,                  lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`,                   lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/inscription-praticien`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/guide-du-medecin`,          lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/gerer-ma-fiche`,            lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/badge`,                     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/presse`,                    lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/remboursement-amo-cnss`,    lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/observatoire-sante-maroc`,  lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/charte-editoriale`,         lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/plan-du-site`,              lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/conditions-utilisation`,    lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/politique-confidentialite`, lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];
}

async function coreEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  const [specialties, cities, postCategories, questionSpecialties] = await Promise.all([
    prisma.specialty.findMany({ select: { slug: true }, orderBy: { order: "asc" } }),
    prisma.city.findMany({ select: { slug: true }, orderBy: { order: "asc" } }),
    prisma.postCategory.findMany({
      where: { posts: { some: { status: "PUBLISHED" } } },
      select: { slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.specialty.findMany({
      where: { questions: { some: { status: "PUBLISHED" } } },
      select: { slug: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return [
    ...staticPages(now),
    ...specialties.map((s) => ({ url: `${BASE}/specialites/${s.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...cities.map((c) => ({ url: `${BASE}/villes/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...postCategories.map((c) => ({ url: `${BASE}/blog/categorie/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.75 })),
    ...questionSpecialties.map((s) => ({ url: `${BASE}/questions/specialite/${s.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.65 })),
  ];
}

async function doctorEntries(): Promise<MetadataRoute.Sitemap> {
  const doctors = await prisma.doctor.findMany({
    where: { isActive: true, slug: { not: null } },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: MAX_PER_SITEMAP,
  });
  return doctors
    .filter((d) => d.slug)
    .map((d) => ({
      url: `${BASE}/praticiens/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
}

// Seuil aligné sur app/specialites/[slug]/[ville]/page.tsx : un combo sous ce
// nombre de praticiens est mis en noindex, on ne le déclare donc pas au sitemap
// (cohérence découverte ↔ indexabilité, pas d'URL noindex advertisée).
const MIN_COMBO_DOCTORS = 3;

async function comboEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  const [grouped, specialties, cities] = await Promise.all([
    prisma.doctor.groupBy({
      by: ["specialtyId", "cityId"],
      where: { isActive: true },
      _count: { _all: true },
    }),
    prisma.specialty.findMany({ select: { id: true, slug: true } }),
    prisma.city.findMany({ select: { id: true, slug: true } }),
  ]);

  const specSlug = new Map(specialties.map((s) => [s.id, s.slug]));
  const citySlug = new Map(cities.map((c) => [c.id, c.slug]));

  const combos: MetadataRoute.Sitemap = [];
  for (const g of grouped) {
    if (g._count._all < MIN_COMBO_DOCTORS) continue;
    const sSlug = specSlug.get(g.specialtyId);
    const cSlug = citySlug.get(g.cityId);
    if (!sSlug || !cSlug) continue;
    combos.push({
      url: `${BASE}/specialites/${sSlug}/${cSlug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    });
  }
  return combos;
}

async function contentEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  const [establishments, medications, posts, questions] = await Promise.all([
    prisma.establishment.findMany({
      where: { isActive: true },
      select: { slug: true, type: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: MAX_PER_SITEMAP,
    }),
    prisma.medication.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: MAX_PER_SITEMAP,
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: MAX_PER_SITEMAP,
    }),
    prisma.question.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, lastAnswerAt: true },
      orderBy: { publishedAt: "desc" },
      take: MAX_PER_SITEMAP,
    }),
  ]);

  const establishmentPages: MetadataRoute.Sitemap = establishments.map((e) => {
    const type = (e.type ?? "").toLowerCase();
    const section = type.includes("pharma") ? "pharmacies" : type.includes("labo") ? "laboratoires" : "cliniques";
    return { url: `${BASE}/${section}/${e.slug}`, lastModified: e.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 };
  });

  return [
    ...posts.map((p) => ({ url: `${BASE}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...questions.map((qn) => ({ url: `${BASE}/questions/${qn.slug}`, lastModified: qn.lastAnswerAt ?? qn.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...establishmentPages,
    ...medications.map((m) => ({ url: `${BASE}/medicaments/${m.slug}`, lastModified: m.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  // Next 16 : l'id de generateSitemaps est fourni comme Promise<string>.
  const which = await id;
  const now = new Date();

  try {
    switch (which) {
      case "doctors":
        return withHreflang(await doctorEntries());
      case "combos":
        return withHreflang(await comboEntries(now));
      case "content":
        return withHreflang(await contentEntries(now));
      case "core":
      default:
        return withHreflang(await coreEntries(now));
    }
  } catch {
    // En cas d'échec DB : ne jamais rendre un sitemap invalide. Le segment
    // « core » retombe sur les pages statiques ; les autres restent vides.
    return which === "core" || which === undefined ? withHreflang(staticPages(now)) : [];
  }
}
