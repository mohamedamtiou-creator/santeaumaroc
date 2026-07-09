import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // ── 1. Désactiver les fabricants pharmaceutiques classés "laboratoire" ──
  const DISABLE = [
    "Laboratoire Pharmaceutique Iberma (Iberma)",
    "Laboratoires Pharmaceutique Novopharma (Novopharma)",
    "Laboratoires Pharmaceutiques Galenica (Galenica)",
  ];

  console.log("\n── Désactivation fabricants pharmaceutiques ───────────────");
  for (const nom of DISABLE) {
    const r = await prisma.establishment.updateMany({
      where: { nom: { equals: nom, mode: "insensitive" } },
      data: { isActive: false },
    });
    console.log(`  ${r.count > 0 ? "✓" : "–"} [${r.count}] ${nom}`);
  }

  // ── 2. Reclasser Hemolab et Tangelab en laboratoire ────────────
  const RECLASSIFY = ["Hemolab Pharma", "Tangelab"];

  console.log("\n── Reclassification → laboratoire ────────────────────────");
  for (const nom of RECLASSIFY) {
    const r = await prisma.establishment.updateMany({
      where: { nom: { contains: nom, mode: "insensitive" } },
      data: { type: "laboratoire", isActive: true },
    });
    console.log(`  ${r.count > 0 ? "✓" : "–"} [${r.count}] ${nom} → laboratoire`);
  }

  // ── 3. Bilan final ──────────────────────────────────────────────
  const labs = await prisma.establishment.findMany({
    where: { type: "laboratoire", isActive: true },
    select: { nom: true },
    orderBy: { nom: "asc" },
  });

  console.log(`\n── Laboratoires actifs après correction (${labs.length}) ────────`);
  labs.forEach((e) => console.log(`  ✓  ${e.nom}`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
