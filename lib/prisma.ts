import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Pool de connexions EXPLICITE. Le défaut de node-postgres (utilisé par
// @prisma/adapter-pg) est `max: 10` sans timeouts bornés. En multi-instance /
// serverless, N instances × 10 connexions saturent vite Postgres → on rend `max`
// tunable par env (le baisser + pooler type PgBouncer en prod serverless), et on
// borne les timeouts pour éviter les connexions zombies et les attentes infinies.
const POOL_MAX = Number(process.env.DATABASE_POOL_MAX) || 10;

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    max: POOL_MAX,
    idleTimeoutMillis: 10_000,        // libère une connexion inactive après 10 s
    connectionTimeoutMillis: 10_000,  // échoue vite si le pool est saturé (10 s)
  });
  return new PrismaClient({ adapter, log: ["error"] });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
