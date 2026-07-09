import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const del = await prisma.establishmentReview.deleteMany({});
  console.log("Supprimé :", del.count, "reviews");
  const reset = await prisma.establishment.updateMany({
    where: { averageRating: { gt: 0 } },
    data: { averageRating: 0 },
  });
  console.log("Moyennes remises à 0 :", reset.count, "établissements");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
