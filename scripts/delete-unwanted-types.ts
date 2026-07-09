import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const TYPES_TO_DELETE = ["établissement pharmaceutique", "hôpital"];

async function main() {
  const preview = await prisma.establishment.findMany({
    where: { type: { in: TYPES_TO_DELETE } },
    select: { id: true, nom: true, type: true },
    orderBy: { type: "asc" },
  });

  console.log(`\n${preview.length} établissement(s) à supprimer :\n`);
  preview.forEach((e) => console.log(`  [${e.type}] ${e.nom}`));

  const result = await prisma.establishment.deleteMany({
    where: { type: { in: TYPES_TO_DELETE } },
  });

  console.log(`\n✓ ${result.count} établissement(s) supprimé(s) définitivement.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
