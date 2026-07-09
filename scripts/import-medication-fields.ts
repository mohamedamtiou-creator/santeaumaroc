import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const DUMP_PATH = path.resolve("C:/Next/Santeaumaroc_old/santeaum_sam.sql");

// ── Parsers ────────────────────────────────────────────────────────────────────
function splitRows(v: string): string[] {
  const rows: string[] = []; let d = 0, inS = false, esc = false, start = -1;
  for (let i = 0; i < v.length; i++) {
    const ch = v[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === "'" && !inS) { inS = true; continue; }
    if (ch === "'" && inS) { inS = false; continue; }
    if (inS) continue;
    if (ch === "(") { if (d === 0) start = i + 1; d++; }
    else if (ch === ")") { d--; if (d === 0 && start >= 0) { rows.push(v.slice(start, i)); start = -1; } }
  }
  return rows;
}

function parseValues(row: string): (string | null)[] {
  const vals: (string | null)[] = []; let i = 0;
  while (i < row.length) {
    while (i < row.length && /\s/.test(row[i])) i++;
    if (i >= row.length) break;
    if (row.slice(i, i + 4).toUpperCase() === "NULL") { vals.push(null); i += 4; }
    else if (row[i] === "'") {
      i++; let s = "";
      while (i < row.length) {
        if (row[i] === "\\" && i + 1 < row.length) { const n = row[i + 1]; s += n === "n" ? "\n" : n === "r" ? "\r" : n === "t" ? "\t" : n; i += 2; }
        else if (row[i] === "'" && row[i + 1] === "'") { s += "'"; i += 2; }
        else if (row[i] === "'") { i++; break; }
        else { s += row[i]; i++; }
      }
      vals.push(s);
    } else {
      let n = "";
      while (i < row.length && row[i] !== "," && !/\s/.test(row[i])) { n += row[i]; i++; }
      vals.push(n || null);
    }
    while (i < row.length && (row[i] === "," || /\s/.test(row[i]))) i++;
  }
  return vals;
}

function findInsertEnd(sql: string, from: number): number {
  let inS = false, esc = false, d = 0;
  for (let i = from; i < sql.length; i++) {
    const ch = sql[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === "'" && !inS) { inS = true; continue; }
    if (ch === "'" && inS) { inS = false; continue; }
    if (inS) continue;
    if (ch === "(") { d++; continue; }
    if (ch === ")") { d--; continue; }
    if (ch === ";" && d === 0) return i;
  }
  return sql.length;
}

function parseTableRobust(sql: string, table: string): Record<string, string | null>[] {
  const results: Record<string, string | null>[] = [];
  const marker = `INSERT INTO \`${table}\``;
  let from = 0;
  while (true) {
    const pos = sql.indexOf(marker, from); if (pos === -1) break;
    const co = sql.indexOf("(", pos), cc = sql.indexOf(")", pos);
    const cols = sql.slice(co + 1, cc).split(",").map(c => c.trim().replace(/`/g, ""));
    const vp = sql.indexOf("VALUES", cc); if (vp === -1) break;
    const vs = vp + 6, ie = findInsertEnd(sql, vs);
    for (const row of splitRows(sql.slice(vs, ie))) {
      const v = parseValues(row); if (v.length !== cols.length) continue;
      const o: Record<string, string | null> = {}; cols.forEach((c, i) => { o[c] = v[i]; }); results.push(o);
    }
    from = ie + 1;
  }
  return results;
}

function slugify(t: string): string {
  return t.toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function toDecimal(val: string | null | undefined): number | null {
  if (!val) return null;
  const cleaned = val.trim().replace(",", ".").replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Lecture du dump…");
  const sql = fs.readFileSync(DUMP_PATH, "utf8");

  const medRows = parseTableRobust(sql, "medicaments");
  console.log(`  medicaments dans le dump : ${medRows.length}`);

  // Colonnes disponibles dans le dump (affichage informatif)
  if (medRows.length > 0) {
    console.log("  Colonnes :", Object.keys(medRows[0]).join(", "));
  }

  // Reconstruire le mapping old_mysql_id → slug (même algo que le seed)
  const medSlugCount = new Map<string, number>();
  const oldIdToSlug  = new Map<string, string>();
  for (const r of medRows) {
    const nom = (r.nom ?? "").trim();
    if (!nom) continue;
    const base  = slugify(nom);
    if (!base) continue;
    const count = medSlugCount.get(base) ?? 0;
    const slug  = count === 0 ? base : `${base}-${count + 1}`;
    medSlugCount.set(base, count + 1);
    if (r.id) oldIdToSlug.set(r.id, slug);
  }

  // Récupérer tous les médicaments en base (slug → id)
  const dbMeds = await prisma.medication.findMany({ select: { id: true, slug: true } });
  const slugToId = new Map(dbMeds.map(m => [m.slug, m.id]));
  console.log(`  médicaments en base : ${dbMeds.length}`);

  let updated = 0, skipped = 0, notFound = 0;

  for (const r of medRows) {
    if (!r.id) continue;
    const slug = oldIdToSlug.get(r.id);
    if (!slug) { skipped++; continue; }
    const dbId = slugToId.get(slug);
    if (!dbId) { notFound++; continue; }

    const dosage           = (r.dosage1 ?? "").trim() || null;
    const uniteDosage      = (r.unite_dosage1 ?? "").trim() || null;
    const presentation     = (r.presentation ?? "").trim() || null;
    const princepsGenerique = (r.princeps_generique ?? "").trim() || null;
    const tauxRemboursement = (r.taux_remboursement ?? "").trim() || null;
    const ppv              = toDecimal(r.ppv);
    const ph               = toDecimal(r.ph);
    const prixBR           = toDecimal(r.prix_br);

    // Ne mettre à jour que si au moins un champ n'est pas null
    if (!dosage && !uniteDosage && !presentation && !princepsGenerique &&
        !tauxRemboursement && ppv === null && ph === null && prixBR === null) {
      skipped++;
      continue;
    }

    await prisma.medication.update({
      where: { id: dbId },
      data: {
        dosage,
        uniteDosage,
        presentation,
        princepsGenerique,
        tauxRemboursement,
        ...(ppv   !== null ? { ppv }   : {}),
        ...(ph    !== null ? { ph }    : {}),
        ...(prixBR !== null ? { prixBR } : {}),
      },
    });
    updated++;
  }

  console.log(`\n✓ ${updated} médicaments mis à jour`);
  console.log(`  ignorés (aucune donnée nouvelle) : ${skipped}`);
  console.log(`  non trouvés en base              : ${notFound}`);

  // Échantillon de vérification
  const sample = await prisma.medication.findMany({
    where: {
      OR: [
        { dosage: { not: null } },
        { ppv: { not: null } },
        { princepsGenerique: { not: null } },
      ],
    },
    select: {
      nom: true, dosage: true, uniteDosage: true,
      forme: true, princepsGenerique: true,
      ppv: true, ph: true, prixBR: true, tauxRemboursement: true,
    },
    take: 8,
    orderBy: { nom: "asc" },
  });

  console.log("\nÉchantillon :");
  for (const m of sample) {
    console.log(
      `  ${m.nom} | ${m.dosage ?? "–"}${m.uniteDosage ? " " + m.uniteDosage : ""} | ${m.forme ?? "–"} | ${m.princepsGenerique ?? "–"} | ppv=${m.ppv ?? "–"} | taux=${m.tauxRemboursement ?? "–"}`
    );
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
