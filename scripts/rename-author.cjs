require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Affiche les admins actuels
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true },
  });
  console.log("Admins actuels :", admins);

  // Renomme
  const result = await prisma.user.updateMany({
    where: { role: "ADMIN" },
    data: { name: "Équipe SantéauMaroc" },
  });
  console.log(`✓ ${result.count} compte(s) renommé(s) → "Équipe SantéauMaroc"`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
