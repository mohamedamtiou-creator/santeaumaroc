/**
 * Génère un DDL PostgreSQL IDEMPOTENT pour aligner des tables en prod :
 *   - CREATE TABLE IF NOT EXISTS (définition complète + PK)  → si la table manque
 *   - ADD COLUMN IF NOT EXISTS (par colonne)                 → si des colonnes manquent
 *   - CREATE [UNIQUE] INDEX IF NOT EXISTS                     → index
 *   - ALTER TABLE ADD CONSTRAINT … (FK, sous garde d'exception)
 *
 * Introspecte la base LOCALE (= schéma cible). Réexécutable sans risque.
 *
 *   npx tsx --env-file=.env scripts/gen-table-ddl.ts medical_exams treatments glossary_terms > scripts/mep/2026-07-other-tables-schema.sql
 */
import { prisma } from "@/lib/prisma";

function pgType(udt: string, dataType: string, charMax: number | null, numP: number | null, numS: number | null): string {
  if (dataType === "USER-DEFINED") return `"${udt}"`; // enum PG → suppose le type déjà présent
  switch (udt) {
    case "text": return "TEXT";
    case "varchar": return charMax ? `VARCHAR(${charMax})` : "TEXT";
    case "bpchar": return charMax ? `CHAR(${charMax})` : "CHAR";
    case "timestamp": return "TIMESTAMP(3)";
    case "timestamptz": return "TIMESTAMPTZ(3)";
    case "date": return "DATE";
    case "int2": return "SMALLINT";
    case "int4": return "INTEGER";
    case "int8": return "BIGINT";
    case "bool": return "BOOLEAN";
    case "float4": return "REAL";
    case "float8": return "DOUBLE PRECISION";
    case "numeric": return numP ? `NUMERIC(${numP},${numS ?? 0})` : "NUMERIC";
    case "jsonb": return "JSONB";
    case "json": return "JSON";
    case "_text": return "TEXT[]";
    case "_int4": return "INTEGER[]";
    case "uuid": return "UUID";
    default: return udt.toUpperCase();
  }
}

async function main() {
  const tables = process.argv.slice(2);
  if (!tables.length) { console.error("Usage: gen-table-ddl.ts <table> [table…]"); process.exit(1); }

  const out: string[] = [];
  out.push("-- =============================================================================");
  out.push("-- MEP — Alignement schéma d'autres tables (idempotent). Généré depuis local.");
  out.push(`-- Tables : ${tables.join(", ")}`);
  out.push("-- =============================================================================");
  out.push("SET client_min_messages = WARNING;");

  for (const table of tables) {
    const cols: any[] = await prisma.$queryRawUnsafe(
      `SELECT column_name, data_type, udt_name, is_nullable, column_default,
              character_maximum_length AS char_max, numeric_precision AS num_p, numeric_scale AS num_s, ordinal_position
       FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position;`, table);
    if (!cols.length) { out.push(`\n-- ⚠ table ${table} introuvable en local, ignorée`); continue; }

    const pk: any[] = await prisma.$queryRawUnsafe(
      `SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=ANY(i.indkey)
       WHERE i.indrelid=$1::regclass AND i.indisprimary ORDER BY a.attnum;`, table);
    const pkCols = pk.map((p) => `"${p.attname}"`);

    const colDef = (c: any) => {
      const type = pgType(c.udt_name, c.data_type, c.char_max, c.num_p, c.num_s);
      const nn = c.is_nullable === "NO" ? " NOT NULL" : "";
      const def = c.column_default ? ` DEFAULT ${c.column_default}` : "";
      return `"${c.column_name}" ${type}${nn}${def}`;
    };

    out.push(`\n-- ── ${table} ──────────────────────────────────────────────`);
    // 1) CREATE TABLE IF NOT EXISTS (complet)
    const lines = cols.map((c) => "  " + colDef(c));
    if (pkCols.length) lines.push(`  CONSTRAINT "${table}_pkey" PRIMARY KEY (${pkCols.join(", ")})`);
    out.push(`CREATE TABLE IF NOT EXISTS "${table}" (\n${lines.join(",\n")}\n);`);

    // 2) ADD COLUMN IF NOT EXISTS (relaxé : pas de NOT NULL sauf si default présent)
    for (const c of cols) {
      const type = pgType(c.udt_name, c.data_type, c.char_max, c.num_p, c.num_s);
      const def = c.column_default ? ` DEFAULT ${c.column_default}` : "";
      const nn = c.is_nullable === "NO" && c.column_default ? " NOT NULL" : "";
      out.push(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${c.column_name}" ${type}${def}${nn};`);
    }

    // 3) Index (hors PK) idempotents
    const idx: any[] = await prisma.$queryRawUnsafe(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename=$1;`, table);
    for (const i of idx) {
      if (i.indexname === `${table}_pkey`) continue;
      out.push(i.indexdef.replace(/^CREATE (UNIQUE )?INDEX /, (_m: string, u: string) => `CREATE ${u ?? ""}INDEX IF NOT EXISTS `) + ";");
    }

    // 4) FKs sous garde
    const fks: any[] = await prisma.$queryRawUnsafe(
      `SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid=$1::regclass AND contype='f';`, table);
    for (const fk of fks) {
      out.push(`DO $$ BEGIN\n  ALTER TABLE "${table}" ADD CONSTRAINT "${fk.conname}" ${fk.def};\nEXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    }
  }

  console.log(out.join("\n"));
}

main().finally(() => prisma.$disconnect());
