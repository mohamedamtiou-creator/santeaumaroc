import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const r = await prisma.establishment.updateMany({
    where: { nom: { contains: "Hemolab", mode: "insensitive" } },
    data: { isActive: false },
  });
  console.log(`✓ Hemolab Pharma désactivé (${r.count} enregistrement)`);

  const labs = await prisma.establishment.findMany({
    where: { type: "laboratoire", isActive: true },
    select: { nom: true },
    orderBy: { nom: "asc" },
  });
  console.log(`\nLaboratoires actifs restants (${labs.length}) :`);
  labs.forEach((l) => console.log(`  ✓  ${l.nom}`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
