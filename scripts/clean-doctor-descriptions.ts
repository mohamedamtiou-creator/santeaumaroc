/**
 * Remove the word "import" (any case) from the description column of all doctors.
 * Run: npx tsx scripts/clean-doctor-descriptions.ts
 */

import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Preview: count affected rows
  const affected = await prisma.doctor.count({
    where: { description: { contains: "import", mode: "insensitive" } },
  });
  console.log(`Doctors with "import" in description: ${affected}`);

  if (affected === 0) {
    console.log("Nothing to clean.");
    return;
  }

  // Remove the word "import" (whole-word, case-insensitive) using PostgreSQL regexp_replace
  const result = await prisma.$executeRaw`
    UPDATE doctors
    SET description = NULLIF(
      TRIM(REGEXP_REPLACE(description, 'import', '', 'ig')),
      ''
    )
    WHERE description ILIKE '%import%'
  `;

  console.log(`Updated ${result} row(s).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
