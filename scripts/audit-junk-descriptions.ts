/**
 * Audit des champs `description` de médecins contenant de la donnée-poubelle
 * (« Test », « import », placeholders, texte trop court…) qui polluent la
 * <meta description>, le bloc « À propos » et le JSON-LD des fiches.
 *
 * Utilise la MÊME logique que la fiche (cleanDoctorDescription) : est considérée
 * comme poubelle toute description non vide que ce helper réduit à `null`.
 *
 * Audit (dry-run, ne modifie rien) :   npx tsx scripts/audit-junk-descriptions.ts
 * Nettoyage (met ces descriptions à NULL) :  npx tsx scripts/audit-junk-descriptions.ts --fix
 */

import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { cleanDoctorDescription } from "../lib/utils";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const FIX = process.argv.includes("--fix");

async function main() {
  const total = await prisma.doctor.count();
  const withDesc = await prisma.doctor.findMany({
    where: { description: { not: null } },
    select: { id: true, slug: true, description: true },
  });

  const junk = withDesc.filter((d) => cleanDoctorDescription(d.description) === null);

  // Répartition par valeur exacte (normalisée) pour repérer les gros lots.
  const byValue = new Map<string, number>();
  for (const d of junk) {
    const key = (d.description ?? "").trim().toLowerCase().slice(0, 40) || "(vide)";
    byValue.set(key, (byValue.get(key) ?? 0) + 1);
  }
  const top = [...byValue.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);

  console.log("─".repeat(60));
  console.log(`Médecins au total ............ ${total}`);
  console.log(`Avec une description ......... ${withDesc.length}`);
  console.log(`Descriptions POUBELLE ........ ${junk.length}`);
  console.log(`Descriptions exploitables .... ${withDesc.length - junk.length}`);
  console.log("─".repeat(60));
  console.log("Top valeurs poubelle (valeur — occurrences) :");
  for (const [val, n] of top) {
    console.log(`  ${String(n).padStart(5)} × "${val}"`);
  }
  console.log("─".repeat(60));
  console.log("Exemples de fiches concernées :");
  for (const d of junk.slice(0, 10)) {
    console.log(`  /praticiens/${d.slug}  →  "${(d.description ?? "").slice(0, 50)}"`);
  }
  console.log("─".repeat(60));

  if (!FIX) {
    console.log(`Dry-run. Relancez avec --fix pour mettre ces ${junk.length} description(s) à NULL.`);
    return;
  }

  if (junk.length === 0) {
    console.log("Rien à nettoyer.");
    return;
  }

  const ids = junk.map((d) => d.id);
  const result = await prisma.doctor.updateMany({
    where: { id: { in: ids } },
    data: { description: null },
  });
  console.log(`✔ ${result.count} description(s) poubelle mise(s) à NULL.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
