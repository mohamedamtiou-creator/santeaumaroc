/**
 * Exporte la liste des URLs ARABES à vrai contenu (à inspecter/soumettre en priorité
 * dans Search Console). Écrit `ar-urls-to-index.txt` à la racine du projet.
 *
 * NB : Google découvre déjà ces URLs via les alternates hreflang des 4 sitemaps.
 * Cet export sert à l'inspection/soumission manuelle prioritaire.
 *
 *   npx tsx --env-file=.env scripts/export-ar-urls.ts
 */
import { writeFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const AR = `${BASE}/ar`;

async function main() {
  // Hubs & pages statiques rendues en arabe (chrome + contenu via couche de traduction)
  const hubs = [
    "", "/blog", "/questions", "/specialites", "/villes", "/praticiens",
    "/cliniques", "/pharmacies", "/laboratoires", "/medicaments",
    "/glossaire", "/symptomes", "/maladies", "/examens", "/traitements", "/prix",
  ].map((p) => `${AR}${p}`);

  const [specialties, cities, posts, questions] = await Promise.all([
    // Spécialités & villes : contenu AR via lib/specialty-i18n + specialty-content/city-content
    prisma.specialty.findMany({ select: { slug: true }, orderBy: { order: "asc" } }),
    prisma.city.findMany({ where: { doctors: { some: { isActive: true } } }, select: { slug: true }, orderBy: { order: "asc" } }),
    // Éditorial AR réellement servi/indexé (arReviewedAt + traduction)
    prisma.post.findMany({ where: { status: "PUBLISHED", arReviewedAt: { not: null }, contentAr: { not: null } }, select: { slug: true } }),
    prisma.question.findMany({ where: { status: "PUBLISHED", arReviewedAt: { not: null }, titleAr: { not: null } }, select: { slug: true } }),
  ]);

  const sections: [string, string[]][] = [
    ["# Hubs & pages AR", hubs],
    ["# Spécialités (AR via couche de traduction)", specialties.map((s) => `${AR}/specialites/${s.slug}`)],
    ["# Villes (AR via couche de traduction)", cities.map((c) => `${AR}/villes/${c.slug}`)],
    ["# Blog (AR relu)", posts.map((p) => `${AR}/blog/${p.slug}`)],
    ["# Questions/Réponses (AR relu)", questions.map((q) => `${AR}/questions/${q.slug}`)],
  ];

  const lines: string[] = [];
  let total = 0;
  for (const [title, urls] of sections) {
    lines.push(`${title} (${urls.length})`);
    lines.push(...urls);
    lines.push("");
    total += urls.length;
  }

  writeFileSync("ar-urls-to-index.txt", lines.join("\n"), "utf8");
  console.log(`✓ ar-urls-to-index.txt écrit — ${total} URLs AR.`);
  for (const [title, urls] of sections) console.log(`  ${title.replace("# ", "")}: ${urls.length}`);
  console.log("ℹ Combos spécialité×ville en AR : déjà déclarés via hreflang dans sitemap/combos.xml (non listés ici, trop volumineux).");
  await prisma.$disconnect();
}

main();
