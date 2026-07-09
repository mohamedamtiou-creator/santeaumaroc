import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const total = await prisma.establishmentReview.count();
  const reviews = await prisma.establishmentReview.findMany({
    orderBy: { createdAt: "asc" },
    include: { establishment: { select: { nom: true, type: true } } },
    take: 10,
  });

  console.log(`Total : ${total} avis\n`);
  for (const r of reviews) {
    console.log(`[${r.createdAt.toISOString().slice(0, 10)}] ${r.establishment.type} — ${r.note}/5 — auteur: "${r.auteur}"`);
    console.log(`  ${r.establishment.nom}: "${(r.commentaire ?? "").slice(0, 70)}"\n`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
