import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const cliniques = await prisma.establishment.findMany({
    where: { type: "clinique" },
    select: { id: true, nom: true, isActive: true },
    orderBy: { nom: "asc" },
  });

  console.log(`\n── Cliniques actuelles (${cliniques.length} total) ─────────────────\n`);
  cliniques.forEach((e) =>
    console.log(`  [${e.isActive ? "actif  " : "inactif"}]  ${e.nom}`)
  );

  // Détection d'anomalies dans les cliniques
  const labPattern    = /laboratoire|labo\b|analyses|biologie/i;
  const pharmaciePattern = /pharmacie|pharm\b/i;
  const grossistePattern = /distribu|r[eé]partition|grossiste/i;
  const vaguPattern   = /^[A-Z]{2,6}$|^\d/; // sigles purs ou commence par chiffre

  console.log(`\n── Anomalies dans les cliniques ──────────────────────────\n`);

  const labSuspects = cliniques.filter(e => labPattern.test(e.nom));
  if (labSuspects.length) {
    console.log(`[${labSuspects.length}] Ressemblent à des labos :`);
    labSuspects.forEach(e => console.log(`  ${e.nom}`));
    console.log();
  }

  const pharmaSuspects = cliniques.filter(e => pharmaciePattern.test(e.nom));
  if (pharmaSuspects.length) {
    console.log(`[${pharmaSuspects.length}] Ressemblent à des pharmacies :`);
    pharmaSuspects.forEach(e => console.log(`  ${e.nom}`));
    console.log();
  }

  const grossisteSuspects = cliniques.filter(e => grossistePattern.test(e.nom));
  if (grossisteSuspects.length) {
    console.log(`[${grossisteSuspects.length}] Ressemblent à des grossistes :`);
    grossisteSuspects.forEach(e => console.log(`  ${e.nom}`));
    console.log();
  }

  // Cliniques sans mot-clé médical évident
  const medicalKeywords = /clinique|polyclinique|centre|h[oô]pital|médical|medical|sant[eé]|soin|chirurgie|maternit[eé]|ophtalmolog|cardio|dentaire|orthop[eé]d/i;
  const noKeyword = cliniques.filter(e => !medicalKeywords.test(e.nom));
  if (noKeyword.length) {
    console.log(`[${noKeyword.length}] Sans mot-clé médical reconnaissable :`);
    noKeyword.forEach(e => console.log(`  [${e.isActive ? "actif" : "inactif"}]  ${e.nom}`));
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
