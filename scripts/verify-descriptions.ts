import { config } from "dotenv";
config();
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const remaining = await prisma.doctor.count({
    where: { description: { contains: "import", mode: "insensitive" } },
  });
  console.log(`Fiches contenant encore "import" : ${remaining}`);

  const samples = await prisma.doctor.findMany({
    where: { description: { not: null } },
    select: { prenom: true, nom: true, description: true },
    take: 5,
  });

  console.log("\n── 5 exemples de descriptions après nettoyage ──");
  for (const d of samples) {
    console.log(`\n  ${d.prenom ?? ""} ${d.nom ?? ""}`);
    console.log(`  ${d.description}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
