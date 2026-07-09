/**
 * Passe un utilisateur en rôle ADMIN.
 * Usage : npx tsx scripts/make-admin.ts ton@email.com
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/make-admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: { id: true, email: true, role: true },
  });

  console.log("✓ Compte mis à jour :", user);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
