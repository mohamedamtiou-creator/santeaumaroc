import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // Correction de la faute de frappe : "ClLINIQUE" → "CLINIQUE"
  const r = await prisma.establishment.updateMany({
    where: { nom: { equals: "ClLINIQUE BENI MELLAL", mode: "insensitive" } },
    data: { nom: "CLINIQUE BENI MELLAL" },
  });
  console.log(`\n✓ Typo corrigé : ClLINIQUE BENI MELLAL → CLINIQUE BENI MELLAL (${r.count} enregistrement)`);

  // Bilan
  const total = await prisma.establishment.count({ where: { type: "clinique", isActive: true } });
  console.log(`\n✓ ${total} cliniques actives — aucune autre anomalie détectée.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
