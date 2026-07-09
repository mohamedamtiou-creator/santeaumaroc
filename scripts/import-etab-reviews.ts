import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const DUMP_PATH = path.resolve("C:/Next/Santeaumaroc_old/santeaum_sam.sql");

// ── Parsers (résistants aux semicolons dans les reviews) ─────────────────────

function splitRows(valuesPart: string): string[] {
  const rows: string[] = [];
  let depth = 0, inStr = false, escape = false, start = -1;
  for (let i = 0; i < valuesPart.length; i++) {
    const ch = valuesPart[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === "'" && !inStr) { inStr = true; continue; }
    if (ch === "'" && inStr) { inStr = false; continue; }
    if (inStr) continue;
    if (ch === "(") { if (depth === 0) start = i + 1; depth++; }
    else if (ch === ")") {
      depth--;
      if (depth === 0 && start >= 0) { rows.push(valuesPart.slice(start, i)); start = -1; }
    }
  }
  return rows;
}

function parseValues(row: string): (string | null)[] {
  const values: (string | null)[] = [];
  let i = 0;
  while (i < row.length) {
    while (i < row.length && /\s/.test(row[i])) i++;
    if (i >= row.length) break;
    if (row.slice(i, i + 4).toUpperCase() === "NULL") {
      values.push(null); i += 4;
    } else if (row[i] === "'") {
      i++;
      let str = "";
      while (i < row.length) {
        if (row[i] === "\\" && i + 1 < row.length) {
          const next = row[i + 1];
          str += next === "n" ? "\n" : next === "r" ? "\r" : next === "t" ? "\t" : next;
          i += 2;
        } else if (row[i] === "'" && row[i + 1] === "'") { str += "'"; i += 2; }
        else if (row[i] === "'") { i++; break; }
        else { str += row[i]; i++; }
      }
      values.push(str);
    } else {
      let num = "";
      while (i < row.length && row[i] !== "," && !/\s/.test(row[i])) { num += row[i]; i++; }
      values.push(num === "" ? null : num);
    }
    while (i < row.length && (row[i] === "," || /\s/.test(row[i]))) i++;
  }
  return values;
}

/** Trouve le ; terminal d'un INSERT (depth=0, hors guillemets) */
function findInsertEnd(sql: string, from: number): number {
  let inStr = false, escape = false, depth = 0;
  for (let i = from; i < sql.length; i++) {
    const ch = sql[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === "'" && !inStr) { inStr = true; continue; }
    if (ch === "'" && inStr) { inStr = false; continue; }
    if (inStr) continue;
    if (ch === "(") { depth++; continue; }
    if (ch === ")") { depth--; continue; }
    if (ch === ";" && depth === 0) return i;
  }
  return sql.length;
}

/** Parser robuste : multi-INSERT + fin de bloc par vrai ; terminal */
function parseTableRobust(sql: string, table: string): Record<string, string | null>[] {
  const results: Record<string, string | null>[] = [];
  const insertMarker = `INSERT INTO \`${table}\``;
  let searchFrom = 0;
  while (true) {
    const insertPos = sql.indexOf(insertMarker, searchFrom);
    if (insertPos === -1) break;
    const colOpen  = sql.indexOf("(", insertPos);
    const colClose = sql.indexOf(")", insertPos);
    const cols = sql.slice(colOpen + 1, colClose).split(",").map(c => c.trim().replace(/`/g, ""));
    const valuesPos = sql.indexOf("VALUES", colClose);
    if (valuesPos === -1) break;
    const valuesStart = valuesPos + 6;
    const insertEnd   = findInsertEnd(sql, valuesStart);
    const section     = sql.slice(valuesStart, insertEnd);
    for (const row of splitRows(section)) {
      const vals = parseValues(row);
      if (vals.length !== cols.length) continue;
      const obj: Record<string, string | null> = {};
      cols.forEach((col, i) => { obj[col] = vals[i]; });
      results.push(obj);
    }
    searchFrom = insertEnd + 1;
  }
  return results;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Lecture du dump MySQL…");
  const sql = fs.readFileSync(DUMP_PATH, "utf8");

  // ── 1. Avis depuis le dump ───────────────────────────────────
  const avisRows = parseTableRobust(sql, "etablissements_avis");
  console.log(`  ${avisRows.length} avis dans etablissements_avis`);

  // ── 2. Mapping old_id → nom depuis le dump ───────────────────
  const etabMysqlRows = parseTableRobust(sql, "etablissements");
  const oldIdToNom = new Map<string, string>();
  for (const r of etabMysqlRows) {
    if (r.id && r.nom) oldIdToNom.set(r.id, r.nom.trim());
  }
  console.log(`  ${oldIdToNom.size} établissements dans le dump`);

  // ── 3. Mapping nom normalisé → Prisma id ─────────────────────
  const prismaEstabs = await prisma.establishment.findMany({ select: { id: true, nom: true } });
  const nomToNewId = new Map<string, string>();
  for (const e of prismaEstabs) nomToNewId.set(normalize(e.nom), e.id);
  console.log(`  ${prismaEstabs.length} établissements en base PostgreSQL`);

  // ── 4. Patients ──────────────────────────────────────────────
  const patientRows = parseTableRobust(sql, "patients");
  const patientMap  = new Map<string, string>();
  for (const p of patientRows) {
    if (!p.id) continue;
    const name = [(p.prenom ?? "").trim(), (p.nom ?? "").trim()].filter(Boolean).join(" ");
    patientMap.set(p.id, name || "Anonyme");
  }

  // ── 5. Construire les avis ────────────────────────────────────
  let skippedInactive = 0, skippedNoMatch = 0, skippedBadNote = 0;
  const noMatchNames = new Set<string>();
  const toCreate: {
    establishmentId: string; auteur: string;
    note: number; commentaire: string | null; isPublic: boolean;
  }[] = [];

  for (const r of avisRows) {
    if (r.statut === "0") { skippedInactive++; continue; }

    const oldNom = oldIdToNom.get(r.id_etablissement ?? "");
    if (!oldNom) { skippedNoMatch++; noMatchNames.add(`[no-mysql-id] ${r.id_etablissement}`); continue; }

    const newId = nomToNewId.get(normalize(oldNom));
    if (!newId) { skippedNoMatch++; noMatchNames.add(oldNom); continue; }

    const note = parseInt(r.note ?? "0");
    if (note < 1 || note > 5) { skippedBadNote++; continue; }

    const dateCreation = r.date_creation ? new Date(r.date_creation.replace(" ", "T") + "Z") : null;

    toCreate.push({
      establishmentId: newId,
      auteur:          patientMap.get(r.id_patient ?? "") ?? "Anonyme",
      note,
      commentaire:     (r.avis ?? "").trim() || null,
      isPublic:        true,
      ...(dateCreation && !isNaN(dateCreation.getTime()) ? { createdAt: dateCreation } : {}),
    });
  }

  console.log(`\n  À importer  : ${toCreate.length}`);
  console.log(`  Inactifs    : ${skippedInactive}`);
  console.log(`  Sans match  : ${skippedNoMatch}`);
  console.log(`  Note invalide: ${skippedBadNote}`);
  if (noMatchNames.size > 0) {
    console.log("\n  Établissements sans correspondance :");
    [...noMatchNames].slice(0, 20).forEach(n => console.log(`    - ${n}`));
    if (noMatchNames.size > 20) console.log(`    … et ${noMatchNames.size - 20} autres`);
  }

  if (toCreate.length === 0) { console.log("\nAucun avis à importer."); return; }

  // ── 6. Éviter les doublons (avis déjà importés) ───────────────
  const existingCount = await prisma.establishmentReview.count();
  console.log(`\n  Avis déjà en base : ${existingCount}`);

  // Supprimer les doublons déjà importés (même etablissementId + auteur + note + commentaire)
  const existing = await prisma.establishmentReview.findMany({
    select: { establishmentId: true, auteur: true, note: true, commentaire: true },
  });
  const existingSet = new Set(
    existing.map(r => `${r.establishmentId}|${r.auteur}|${r.note}|${r.commentaire ?? ""}`)
  );
  const fresh = toCreate.filter(r =>
    !existingSet.has(`${r.establishmentId}|${r.auteur}|${r.note}|${r.commentaire ?? ""}`)
  );
  console.log(`  Nouveaux (hors doublons) : ${fresh.length}`);

  if (fresh.length === 0) { console.log("\nTous les avis sont déjà en base."); return; }

  // ── 7. Insertion ─────────────────────────────────────────────
  const result = await prisma.establishmentReview.createMany({ data: fresh, skipDuplicates: false });
  console.log(`\n✓ ${result.count} avis importés.`);

  // ── 8. Recalculer averageRating ──────────────────────────────
  console.log("Recalcul des notes moyennes…");
  const estabIds = [...new Set(fresh.map(r => r.establishmentId))];
  let updated = 0;
  for (const id of estabIds) {
    const agg = await prisma.establishmentReview.aggregate({
      where: { establishmentId: id },
      _avg: { note: true },
      _count: { note: true },
    });
    if (agg._avg.note !== null) {
      await prisma.establishment.update({
        where: { id },
        data: { averageRating: Math.round(agg._avg.note * 10) / 10 },
      });
      updated++;
    }
  }
  console.log(`✓ ${updated} notes moyennes recalculées.`);

  // ── 9. Résumé ────────────────────────────────────────────────
  const totals = await prisma.establishment.groupBy({
    by: ["type"],
    where: { averageRating: { gt: 0 }, isActive: true },
    _count: { id: true },
    _avg: { averageRating: true },
  });
  console.log("\nÉtablissements notés :");
  totals.forEach(t =>
    console.log(`  ${t.type} : ${t._count.id} établissements, moyenne ${t._avg.averageRating?.toFixed(2)}`)
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
