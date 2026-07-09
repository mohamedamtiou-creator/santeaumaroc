import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // ── 1. Labos actuellement en type "laboratoire" ─────────────
  const currentLabs = await prisma.establishment.findMany({
    where: { type: "laboratoire" },
    select: { id: true, nom: true, isActive: true, adresse: true },
    orderBy: { nom: "asc" },
  });

  console.log(`\n── Laboratoires actuels (type=laboratoire) ────────────────`);
  currentLabs.forEach((e) =>
    console.log(`  [${e.isActive ? "actif  " : "inactif"}]  ${e.nom}`)
  );

  // ── 2. Établissements classés "pharmacie" ou "clinique"
  //       dont le nom suggère un laboratoire d'analyses ─────────
  const labKeywords = [
    "laboratoire", "labo ", "analyses", "biologie", "biopathologie",
    "hémato", "biochimie", "microbiologie", "cytologie", "anatomo",
    "sérologie", "virologie", "tangelab", "hemolab",
  ];

  const suspects = await prisma.establishment.findMany({
    where: {
      type: { in: ["pharmacie", "clinique"] },
      isActive: true,
      OR: labKeywords.map((kw) => ({ nom: { contains: kw, mode: "insensitive" as const } })),
    },
    select: { id: true, nom: true, type: true },
    orderBy: { nom: "asc" },
  });

  console.log(`\n── Possibles labos d'analyses dans pharmacie/clinique ─────`);
  console.log(`   (${suspects.length} résultats)\n`);
  suspects.forEach((e) => console.log(`  [${e.type}]  ${e.nom}`));

  // ── 3. Noms "Labo" dans les pharmacies inactives ────────────
  const inactiveLabs = await prisma.establishment.findMany({
    where: {
      type: "pharmacie",
      isActive: false,
      OR: labKeywords.map((kw) => ({ nom: { contains: kw, mode: "insensitive" as const } })),
    },
    select: { nom: true },
    orderBy: { nom: "asc" },
  });

  if (inactiveLabs.length > 0) {
    console.log(`\n── Labos potentiels déjà désactivés (pour info) ──────────`);
    inactiveLabs.forEach((e) => console.log(`  ${e.nom}`));
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
