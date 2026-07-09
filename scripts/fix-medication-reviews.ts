import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
const DUMP_PATH = path.resolve("C:/Next/Santeaumaroc_old/santeaum_sam.sql");

// ── Parsers ───────────────────────────────────────────────────────────────────
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
        if (row[i] === "\\" && i + 1 < row.length) { const n = row[i+1]; s += n==="n"?"\n":n==="r"?"\r":n==="t"?"\t":n; i += 2; }
        else if (row[i] === "'" && row[i+1] === "'") { s += "'"; i += 2; }
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

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Lecture du dump…");
  const sql = fs.readFileSync(DUMP_PATH, "utf8");

  // ── 1. medicaments_avis ──────────────────────────────────────
  const avisRows = parseTableRobust(sql, "medicaments_avis");
  console.log(`  medicaments_avis : ${avisRows.length} lignes`);

  // ── 2. Mapping médicament : old_id → Medication.id ───────────
  const medRows = parseTableRobust(sql, "medicaments");
  const medSlugCount = new Map<string, number>();
  const medOldIdToSlug = new Map<string, string>();
  for (const r of medRows) {
    const nom = (r.nom ?? "").trim();
    if (!nom) continue;
    let base = slugify(nom);
    if (!base) continue;
    const count = medSlugCount.get(base) ?? 0;
    const slug = count === 0 ? base : `${base}-${count + 1}`;
    medSlugCount.set(base, count + 1);
    medOldIdToSlug.set(r.id!, slug);
  }

  const allMeds = await prisma.medication.findMany({ select: { id: true, slug: true } });
  const medSlugToId = new Map(allMeds.map(m => [m.slug, m.id]));

  const medIdMap = new Map<string, string>();
  for (const [oldId, slug] of medOldIdToSlug) {
    const newId = medSlugToId.get(slug);
    if (newId) medIdMap.set(oldId, newId);
  }
  console.log(`  medIdMap : ${medIdMap.size} entrées`);

  // ── 3. Noms patients ─────────────────────────────────────────
  const patientRows = parseTableRobust(sql, "patients");
  const patientNameMap = new Map<string, string>();
  for (const p of patientRows) {
    if (!p.id) continue;
    const name = [(p.prenom ?? "").trim(), (p.nom ?? "").trim()].filter(Boolean).join(" ");
    patientNameMap.set(p.id, name || "Anonyme");
  }
  console.log(`  patients dans le dump : ${patientRows.length}`);

  // ── 4. Construire les avis ────────────────────────────────────
  const toCreate: {
    medicationId: string; auteur: string; note: number;
    commentaire: string | null; isPublic: boolean; createdAt?: Date;
  }[] = [];
  let skipped = 0;

  for (const r of avisRows) {
    if (r.statut !== "1") { skipped++; continue; }
    const medicationId = medIdMap.get(r.id_medicament ?? "");
    if (!medicationId) { skipped++; continue; }
    const note = parseInt(r.note ?? "0");
    if (note < 1 || note > 5) { skipped++; continue; }

    const auteur = patientNameMap.get(r.id_patient ?? "") ?? "Anonyme";
    const dateCreation = r.date_creation
      ? new Date(r.date_creation.replace(" ", "T") + "Z")
      : null;

    toCreate.push({
      medicationId,
      auteur,
      note,
      commentaire:  (r.avis ?? "").trim() || null,
      isPublic:     true,
      ...(dateCreation && !isNaN(dateCreation.getTime()) ? { createdAt: dateCreation } : {}),
    });
  }

  console.log(`\n  À importer : ${toCreate.length} (sautés: ${skipped})`);

  // ── 5. Remplacer les avis existants ───────────────────────────
  const existing = await prisma.medicationReview.count();
  console.log(`  Avis en base (dates incorrectes) : ${existing}`);
  if (existing > 0) await prisma.medicationReview.deleteMany({});

  if (toCreate.length === 0) { console.log("Aucun avis à importer."); return; }

  const result = await prisma.medicationReview.createMany({ data: toCreate });
  console.log(`\n✓ ${result.count} avis médicaments importés.`);

  // ── 6. Vérification ──────────────────────────────────────────
  const sample = await prisma.medicationReview.findMany({
    orderBy: { createdAt: "asc" },
    include: { medication: { select: { nom: true } } },
    take: 7,
  });
  console.log("\nRésultat :");
  sample.forEach(r =>
    console.log(`  [${r.createdAt.toISOString().slice(0, 10)}] ${r.medication.nom} — ${r.note}/5 — ${r.auteur}: "${(r.commentaire ?? "").slice(0, 60)}"`)
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
