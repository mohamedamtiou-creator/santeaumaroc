import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const result = await prisma.establishment.updateMany({
    where: { nom: { contains: "PHARMACIE", mode: "insensitive" } },
    data: { type: "pharmacie" },
  });
  console.log(`${result.count} établissement(s) mis à jour → type "pharmacie"`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
