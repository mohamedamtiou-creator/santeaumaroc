require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg }     = require("@prisma/adapter-pg");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });
prisma.specialty
  .findMany({ select: { name: true, order: true }, orderBy: { name: "asc" } })
  .then((rows) => {
    const todo = rows.filter((r) => r.order === 999);
    console.log("Specialites order=999 (" + todo.length + "):");
    todo.forEach((r) => console.log("  " + r.name));
  })
  .finally(() => prisma.$disconnect());
