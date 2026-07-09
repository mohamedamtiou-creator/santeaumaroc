import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

/* Mots-clés suspects dans les noms d'établissements par type courant */
const SUSPECT_PATTERNS: { label: string; regex: RegExp; expectedType: string }[] = [
  // Mal classés comme "pharmacie"
  { label: "Clinique → devrait être clinique",          regex: /clinique/i,                   expectedType: "clinique" },
  { label: "Laboratoire → devrait être laboratoire",    regex: /laboratoire|labo\b/i,          expectedType: "laboratoire" },
  { label: "Centre médical / imagerie",                 regex: /centre\s+(m[eé]dical|d.imagerie|radiologie|soin)/i, expectedType: "centre" },
  { label: "Coopérative pharmaceutique (grossiste)",    regex: /coop[eé]rative|cooper\s/i,     expectedType: "coopérative" },
  { label: "Distribution / grossiste",                  regex: /distribu|grossiste|r[eé]partition/i, expectedType: "grossiste" },
  { label: "Industrie / fabricant",                     regex: /industrie|industriel|fabricat/i, expectedType: "industriel" },
  { label: "Cabinet médical",                           regex: /cabinet\s+(m[eé]dical|dentaire|v[eé]t[eé]rinaire)/i, expectedType: "cabinet" },
  { label: "Hôpital",                                   regex: /h[oô]pital|hopital/i,          expectedType: "hôpital" },
  { label: "S.A. / SARL (pas pharmacie de détail)",     regex: /\bs\.?a\.?\b|\bsarl\b|\bsarl\.?\b/i, expectedType: "entreprise" },
  { label: "Polyclinique",                              regex: /polyclinique/i,                expectedType: "clinique" },
];

async function main() {
  const establishments = await prisma.establishment.findMany({
    select: { id: true, nom: true, type: true, isActive: true },
    orderBy: { nom: "asc" },
  });

  console.log(`\n══ AUDIT CLASSIFICATIONS ══════════════════════════════════`);
  console.log(`Total établissements actifs : ${establishments.filter(e => e.isActive).length}`);
  console.log(`Total établissements (tous) : ${establishments.length}\n`);

  // Résumé par type actuel
  const byType: Record<string, number> = {};
  for (const e of establishments) {
    byType[e.type ?? "(null)"] = (byType[e.type ?? "(null)"] ?? 0) + 1;
  }
  console.log("── Types actuels ─────────────────────────────────────────");
  for (const [t, count] of Object.entries(byType).sort((a,b) => b[1]-a[1])) {
    console.log(`  ${String(count).padStart(6)}  ${t}`);
  }

  // Détection des anomalies
  console.log("\n── Anomalies détectées ───────────────────────────────────\n");

  for (const pattern of SUSPECT_PATTERNS) {
    const matches = establishments.filter(
      (e) => pattern.regex.test(e.nom) && e.type !== pattern.expectedType
    );
    if (matches.length === 0) continue;

    console.log(`[${matches.length}] ${pattern.label}`);
    for (const m of matches.slice(0, 20)) {
      console.log(`        [${m.type}]  ${m.nom}`);
    }
    if (matches.length > 20) console.log(`        … et ${matches.length - 20} autres`);
    console.log();
  }

  // Pharmacies avec noms non-standards (hors mots-clés classiques)
  const pharmacies = establishments.filter(e => e.type === "pharmacie");
  const standardPharmaWords = /pharmacie|pharmac|pharm\b|officine/i;
  const nonStandardPharmacies = pharmacies.filter(e => !standardPharmaWords.test(e.nom));

  console.log(`── Pharmacies sans "pharmacie/pharm/officine" dans le nom ─`);
  console.log(`   (${nonStandardPharmacies.length} sur ${pharmacies.length} pharmacies)\n`);
  for (const e of nonStandardPharmacies.slice(0, 50)) {
    console.log(`  ${e.nom}`);
  }
  if (nonStandardPharmacies.length > 50) {
    console.log(`  … et ${nonStandardPharmacies.length - 50} autres`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
