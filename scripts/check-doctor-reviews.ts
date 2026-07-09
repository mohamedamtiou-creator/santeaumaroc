import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const total = await prisma.review.count();
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      patient: { select: { name: true } },
      doctor:  { select: { nom: true, prenom: true } },
    },
    take: 8,
  });

  console.log(`Total avis médecins : ${total}\n`);
  for (const r of reviews) {
    console.log(
      `[${r.createdAt.toISOString().slice(0, 10)}]`,
      `${r.rating}/5`,
      `|`, r.patient.name,
      `→ Dr. ${r.doctor.prenom ?? ""} ${r.doctor.nom ?? ""}`.trim(),
    );
    console.log(`  "${(r.comment ?? "").slice(0, 70)}"\n`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
