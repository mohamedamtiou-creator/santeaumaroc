/**
 * Ajoute « Darija » aux langues parlées de TOUS les médecins qui ne l'ont pas déjà.
 * Idempotent : relançable sans créer de doublon.
 * Usage : npx tsx --env-file=.env scripts/add-darija-langues.ts
 */
import { prisma } from "../lib/prisma";

async function main() {
  const before = await prisma.doctor.count();
  const withDarija = await prisma.doctor.count({ where: { langues: { has: "Darija" } } });
  console.log(`Médecins : ${before} — déjà « Darija » : ${withDarija}`);

  const { count } = await prisma.doctor.updateMany({
    where: { NOT: { langues: { has: "Darija" } } },
    data: { langues: { push: "Darija" } },
  });

  console.log(`✓ « Darija » ajoutée à ${count} fiche(s).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
