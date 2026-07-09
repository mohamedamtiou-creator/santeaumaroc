import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

/* ─────────────────────────────────────────────────────────────
   Noms EXACTS à désactiver : grossistes, fabricants, coopératives
   Non accessibles aux patients
──────────────────────────────────────────────────────────────── */
const DISABLE_EXACT: string[] = [
  // Coopératives pharmaceutiques (grossiste régional)
  "Cooper Chaouia Ouardigha",
  "Cooper Oriental Médica",
  "Cooper Pharma (usine)",
  // Distributeurs / répartiteurs
  "Consortium Pharmaceutique de Répartition",
  "Global Distribution Pharmaceutique (Globaldis)",
  "Ouest Répartition Pharmaceutique",
  "Répartition Pharmaceutiques de Larache (Rephal)",
  "Société de Distribution Pharmaceutique de Taza (Disphat)",
  "Société de répartition de médicaments (Soremed)",
  "Maroc Phagro (R.g.p.)",
  // Fabricants / industriels
  "Servier Maroc (usine)",
  "Sté de Thérapeutique Marocaine (Sothema)",
  "Union Farmaceutica Marroqui (Unifarma)",
  // Fabricants classés "laboratoire" (pas des labos d'analyses médicales)
  "Afric Phar Laboratoires (Afric-Phar s.a.)",
  "Laboratoire Zenth Pharma S.a",
  "Laboratoires Pfizer s.a. (Pfizer s.a.)",
  // Noms vagues / non identifiables
  "Archi-in",
  "Catric",
  "Intellix",
  "Tecmom",
  "Univers Rangement",
];

/* ─────────────────────────────────────────────────────────────
   RECLASSIFICATIONS : cliniques actuellement en type incorrect
──────────────────────────────────────────────────────────────── */
const RECLASSIFY_TO_CLINIQUE_PATTERNS: RegExp[] = [
  /^polyclinique/i,
];

async function main() {
  let totalDisabled = 0;
  let totalReclassified = 0;

  // ── 1. Désactivation par nom exact ─────────────────────────
  console.log("\n── Désactivation grossistes/fabricants/coopératives ──────");
  for (const nom of DISABLE_EXACT) {
    const result = await prisma.establishment.updateMany({
      where: { nom: { equals: nom, mode: "insensitive" } },
      data: { isActive: false },
    });
    if (result.count > 0) {
      console.log(`  ✓ [${result.count}] désactivé : ${nom}`);
      totalDisabled += result.count;
    } else {
      console.log(`  – [0] non trouvé : ${nom}`);
    }
  }

  // ── 2. Désactivation des "Rephar" (répartition pharmaceutique) ─
  const repharResult = await prisma.establishment.updateMany({
    where: {
      nom: { contains: "Rephar", mode: "insensitive" },
      type: "pharmacie",
    },
    data: { isActive: false },
  });
  if (repharResult.count > 0) {
    console.log(`  ✓ [${repharResult.count}] désactivé(s) contenant "Rephar"`);
    totalDisabled += repharResult.count;
  }

  // ── 3. Désactivation de "Marepha" (répartition) ──────────────
  const marephaResult = await prisma.establishment.updateMany({
    where: {
      nom: { contains: "Marepha", mode: "insensitive" },
      type: "pharmacie",
    },
    data: { isActive: false },
  });
  if (marephaResult.count > 0) {
    console.log(`  ✓ [${marephaResult.count}] désactivé(s) contenant "Marepha"`);
    totalDisabled += marephaResult.count;
  }

  // ── 4. Désactivation des polycliniques classées "pharmacie" ──
  // (polycliniques sont cliniques, et les noms "Pharmacie Polyclinique"
  //  sont en réalité des pharmacies proches — on les garde tels quels)
  // Aucune reclassification ici.

  // ── 5. Bilan final ──────────────────────────────────────────
  const counts = await prisma.establishment.groupBy({
    by: ["type"],
    where: { isActive: true },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  console.log(`\n── Bilan ─────────────────────────────────────────────────`);
  console.log(`  Désactivés : ${totalDisabled}`);
  console.log(`\n  Types actifs restants :`);
  counts.forEach((r) =>
    console.log(`    ${String(r._count.id).padStart(6)}  ${r.type}`)
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
