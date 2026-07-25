/**
 * Crée les pages intention « quel médecin consulter pour X ? » en posant
 * `intentSlug` sur les symptômes DÉJÀ RELUS (kind SYMPTOM, reviewedAt non nul,
 * spécialité renseignée). L'URL devient /quel-medecin-pour/<intentSlug>.
 *
 * L'`intentSlug` reprend le slug du symptôme (ex. « mal-de-dos » →
 * /quel-medecin-pour/mal-de-dos). La question et la réponse ne sont PAS écrites
 * ici : elles sont composées à la volée depuis le graph (libellé + spécialité,
 * cf. lib/health-topic.composeIntent*) — aiguillage, pas de contenu médical à
 * relire. L'indexation réutilise le verrou YMYL du topic (`reviewedAt`), donc
 * ces pages sont indexables dès leur création (topic déjà relu).
 *
 *   Tout poser :        npx tsx --env-file=.env scripts/seed-intent-pages.ts
 *   Un symptôme précis : npx tsx --env-file=.env scripts/seed-intent-pages.ts mal-de-dos
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const only = process.argv[2];
  const topics = await prisma.healthTopic.findMany({
    where: {
      // Symptômes ET maladies : « quel médecin pour [symptôme] » comme « quel
      // médecin pour [maladie] » sont des requêtes d'intention légitimes.
      kind: { in: ["SYMPTOM", "DISEASE"] },
      status: "PUBLISHED",
      reviewedAt: { not: null },
      specialtyId: { not: null },
      intentSlug: null,
      ...(only ? { slug: only } : {}),
    },
    select: { id: true, slug: true, term: true },
    orderBy: { term: "asc" },
  });

  if (topics.length === 0) {
    console.log("Aucun symptôme éligible (déjà posé, non relu, ou sans spécialité).");
    return;
  }

  let n = 0;
  for (const t of topics) {
    await prisma.healthTopic.update({ where: { id: t.id }, data: { intentSlug: t.slug } });
    console.log(`  + /quel-medecin-pour/${t.slug}  (${t.term})`);
    n++;
  }
  console.log(`\n✓ ${n} page(s) intention créée(s).`);
}

main().finally(() => prisma.$disconnect());
