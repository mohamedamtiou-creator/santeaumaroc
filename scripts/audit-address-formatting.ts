/**
 * Audit / normalisation de la CASSE des adresses de médecins en base.
 *
 * Beaucoup de fiches migrées ont des adresses en texte libre incohérent :
 * CAPITALES criardes (« RADIOLOGIE EL MOUSTAKBAL »), minuscules (« sidi maarouf »),
 * espaces multiples, virgules mal espacées. Ce script applique EXACTEMENT la même
 * logique que l'affichage (formatStreetAddress) pour que la donnée en base soit
 * cohérente avec ce que voient les patients, Google et les moteurs IA.
 *
 * Ne touche QUE la casse et l'espacement (Title Case, acronymes CHU/ORL et chiffres
 * romains Hassan II préservés, numéros de villa intacts). Ne supprime rien, ne
 * réécrit pas la structure de l'adresse.
 *
 * Audit (dry-run, ne modifie rien) :   npx tsx scripts/audit-address-formatting.ts
 * Écriture en base :                    npx tsx scripts/audit-address-formatting.ts --fix
 */

import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { formatStreetAddress } from "../lib/utils";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const FIX = process.argv.includes("--fix");
const CHUNK = 200; // taille des lots de mise à jour transactionnelle

async function main() {
  const total = await prisma.doctor.count();
  // `adresse` est non-nullable dans le schéma ; on filtre les vides côté JS.
  const all = await prisma.doctor.findMany({
    select: { id: true, slug: true, adresse: true },
  });
  const withAddr = all.filter((d) => d.adresse.trim() !== "");

  // On ne retient que les lignes dont la casse/l'espacement change réellement.
  const changes = withAddr
    .map((d) => ({ ...d, formatted: formatStreetAddress(d.adresse) }))
    .filter((d) => d.formatted && d.formatted !== d.adresse.trim());

  console.log("─".repeat(70));
  console.log(`Médecins au total .............. ${total}`);
  console.log(`Avec une adresse ............... ${withAddr.length}`);
  console.log(`Adresses à normaliser .......... ${changes.length}`);
  console.log(`Déjà propres ................... ${withAddr.length - changes.length}`);
  console.log("─".repeat(70));
  console.log("Exemples (avant → après) :");
  for (const c of changes.slice(0, 15)) {
    console.log(`  /praticiens/${c.slug}`);
    console.log(`    − ${c.adresse}`);
    console.log(`    + ${c.formatted}`);
  }
  console.log("─".repeat(70));

  if (!FIX) {
    console.log(`Dry-run. Relancez avec --fix pour normaliser ces ${changes.length} adresse(s) en base.`);
    return;
  }

  if (changes.length === 0) {
    console.log("Rien à normaliser.");
    return;
  }

  let done = 0;
  for (let i = 0; i < changes.length; i += CHUNK) {
    const batch = changes.slice(i, i + CHUNK);
    await prisma.$transaction(
      batch.map((c) =>
        prisma.doctor.update({ where: { id: c.id }, data: { adresse: c.formatted } }),
      ),
    );
    done += batch.length;
    console.log(`  … ${done}/${changes.length}`);
  }
  console.log(`✔ ${done} adresse(s) normalisée(s) en base.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
