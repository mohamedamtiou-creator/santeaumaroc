import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const rows = await prisma.establishment.groupBy({
    by: ["type"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  console.log("\nTypes en base :\n");
  rows.forEach((r) =>
    console.log(`  ${String(r._count.id).padStart(5)}  ${r.type ?? "(null)"}`)
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
