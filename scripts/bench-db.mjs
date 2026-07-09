import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function time(label, fn) {
  const t = Date.now();
  const r = await fn();
  const ms = Date.now() - t;
  const count = Array.isArray(r) ? r.length : r;
  console.log(`${label}: ${ms}ms → ${count}`);
  return r;
}

await prisma.$connect();
console.log("Connected\n");

// Run twice to see warm vs cold
for (let pass = 0; pass < 2; pass++) {
  console.log(`=== Pass ${pass + 1} ===`);
  await time("specialty.count()",
    () => prisma.specialty.count());

  await time("doctor.findMany(take=5)",
    () => prisma.doctor.findMany({ where: { isActive: true }, take: 5, select: { id: true } }));

  await time("specialty + _count orderBy",
    () => prisma.specialty.findMany({ select: { slug: true, name: true }, orderBy: { doctors: { _count: "desc" } } }));

  await time("city + _count orderBy",
    () => prisma.city.findMany({ select: { slug: true, name: true }, orderBy: { doctors: { _count: "desc" } } }));

  await time("doctor.findMany(take=15) + relations + _count",
    () => prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        specialty: { select: { name: true, slug: true } },
        city:      { select: { name: true, slug: true } },
        _count:    { select: { reviews: true } },
      },
      orderBy: [{ isVerified: "desc" }, { averageRating: "desc" }],
      take: 15,
      skip: 0,
    }));

  await time("doctor.count(isActive)",
    () => prisma.doctor.count({ where: { isActive: true } }));

  console.log();
}

await prisma.$disconnect();
