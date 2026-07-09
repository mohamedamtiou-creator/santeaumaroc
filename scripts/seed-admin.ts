import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

async function main() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name     = process.env.ADMIN_NAME;

  if (!email || !password || !name) {
    console.error("Variables manquantes : ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      password:      hashed,
      role:          "ADMIN",
      isActive:      true,
      emailVerified: true,
    },
    update: {
      name,
      password:      hashed,
      role:          "ADMIN",
      isActive:      true,
      emailVerified: true,
    },
    select: { id: true, email: true, role: true, name: true },
  });

  console.log("✓ Compte admin créé/mis à jour :", user);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
