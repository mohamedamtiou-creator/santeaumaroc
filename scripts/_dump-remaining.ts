import { INTENT_CANDIDATES } from "@/scripts/data/intent-candidates";
import { prisma } from "@/lib/prisma";

async function main() {
  const seeded = new Set((await prisma.healthTopic.findMany({ select: { slug: true } })).map((t) => t.slug));
  const remaining = INTENT_CANDIDATES.filter((c) => c.tier !== 1 && !seeded.has(c.slug))
    .map((c) => ({ slug: c.slug, term: c.term, kind: c.kind, specialty: c.specialty, tier: c.tier, note: c.note ?? null }));
  console.log(JSON.stringify(remaining));
}
main().finally(() => prisma.$disconnect());
