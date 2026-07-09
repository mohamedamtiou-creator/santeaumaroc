import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const preview = await prisma.establishment.findMany({
    where: { nom: { startsWith: "Faculté", mode: "insensitive" } },
    select: { id: true, nom: true, type: true, isActive: true },
  });

  console.log(`\n${preview.length} établissement(s) trouvé(s) :\n`);
  preview.forEach((e) =>
    console.log(`  [${e.isActive ? "actif" : "déjà inactif"}] ${e.nom} (${e.type})`)
  );

  const result = await prisma.establishment.updateMany({
    where: { nom: { startsWith: "Faculté", mode: "insensitive" } },
    data: { isActive: false },
  });

  console.log(`\n✓ ${result.count} établissement(s) désactivé(s).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
