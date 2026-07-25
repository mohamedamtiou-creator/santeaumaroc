import { INTENT_CANDIDATES } from "@/scripts/data/intent-candidates";
import { prisma } from "@/lib/prisma";

async function main() {
  const seeded = new Set((await prisma.healthTopic.findMany({ select: { slug: true } })).map((t) => t.slug));
  const byTier = (n: number) => INTENT_CANDIDATES.filter((c) => c.tier === n && !seeded.has(c.slug));
  const t1 = byTier(1), t2 = byTier(2), t3 = byTier(3);
  console.log(`RESTANT → T1 ${t1.length} · T2 ${t2.length} · T3 ${t3.length} (total ${t1.length + t2.length + t3.length})`);
  const which = process.argv[2] ?? "1";
  const list = which === "2" ? t2 : which === "3" ? t3 : t1;
  console.log(`--- T${which} (${list.length}) ---`);
  for (const c of list) console.log(`${c.slug} | ${c.term} | ${c.kind} | ${c.specialty}`);
}
main().finally(() => prisma.$disconnect());
