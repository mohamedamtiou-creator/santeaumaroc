/**
 * Active les extensions Postgres requises par la recherche full-text Q/R
 * (lib/qa-search.ts). Idempotent — à rejouer sur chaque environnement DB.
 *
 * Usage : tsx --env-file=.env scripts/enable-search-extensions.ts
 */
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS unaccent;");
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
  console.log("✓ Extensions unaccent + pg_trgm activées");
}

main()
  .catch((e) => {
    console.error("✗ Échec activation extensions:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
