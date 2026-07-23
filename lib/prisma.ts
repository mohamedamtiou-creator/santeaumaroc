import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Pool de connexions EXPLICITE. Le défaut de node-postgres (utilisé par
// @prisma/adapter-pg) est `max: 10` sans timeouts bornés. En multi-instance /
// serverless, N instances × 10 connexions saturent vite Postgres → on rend `max`
// tunable par env (le baisser + pooler type PgBouncer en prod serverless), et on
// borne les timeouts pour éviter les connexions zombies et les attentes infinies.
const CONFIGURED_MAX = Number(process.env.DATABASE_POOL_MAX) || 20;

// Au build (`next build`), Next lance plusieurs workers pour le pré-rendu
// statique, et CHAQUE worker est un process Node distinct avec SON propre pool.
// Sans pooler PG, `workers × CONFIGURED_MAX` dépasse vite `max_connections`
// (~100) → soit P2037 « too many connections », soit `ETIMEDOUT` quand Postgres
// cesse de répondre aux nouvelles connexions TCP, en plein export. On plafonne
// donc le pool par process pendant le build à 5, ET on borne le nombre de
// workers à 8 (`experimental.cpus`, cf. next.config.ts) → pic 8 × 5 = 40 < 100.
// Le runtime garde le pool complet.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const POOL_MAX = isBuild ? Math.min(CONFIGURED_MAX, 5) : CONFIGURED_MAX;

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
