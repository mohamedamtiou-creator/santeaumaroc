/** Contrôle la liste de candidats avant rédaction : spécialités valides, pas de
 *  doublon ni de collision avec un HealthTopic/intentSlug existant. Jetable. */
import { prisma } from "@/lib/prisma";
import { INTENT_CANDIDATES } from "@/scripts/data/intent-candidates";

async function main() {
  const specs = new Set((await prisma.specialty.findMany({ select: { slug: true } })).map((s) => s.slug));
  const topics = new Set((await prisma.healthTopic.findMany({ select: { slug: true } })).map((t) => t.slug));
  const intents = new Set((await prisma.healthTopic.findMany({ where: { intentSlug: { not: null } }, select: { intentSlug: true } })).map((t) => t.intentSlug!));
  const seen = new Set<string>();
  let badSpec = 0, dupInList = 0, collideTopic = 0, collideIntent = 0;
  const tiers = { 1: 0, 2: 0, 3: 0 } as Record<number, number>;
  const kinds = { SYMPTOM: 0, DISEASE: 0 } as Record<string, number>;

  for (const c of INTENT_CANDIDATES) {
    if (!specs.has(c.specialty)) { console.log("BAD SPECIALTY:", c.slug, "->", c.specialty); badSpec++; }
    if (seen.has(c.slug)) { console.log("DUP IN LIST:", c.slug); dupInList++; }
    seen.add(c.slug);
    if (topics.has(c.slug)) { console.log("COLLIDES topic.slug:", c.slug); collideTopic++; }
    if (intents.has(c.slug)) { console.log("COLLIDES intentSlug:", c.slug); collideIntent++; }
    tiers[c.tier]++; kinds[c.kind]++;
  }

  console.log("---");
  console.log(`candidates: ${INTENT_CANDIDATES.length} | SYMPTOM ${kinds.SYMPTOM} / DISEASE ${kinds.DISEASE}`);
  console.log(`tiers T1/T2/T3: ${tiers[1]}/${tiers[2]}/${tiers[3]}`);
  console.log(`issues → badSpecialty ${badSpec}, dupInList ${dupInList}, collideTopicSlug ${collideTopic}, collideIntentSlug ${collideIntent}`);
  console.log(`intent pages live now: ${intents.size} | projected total if all seeded: ${intents.size + INTENT_CANDIDATES.length}`);
}

main().finally(() => prisma.$disconnect());
