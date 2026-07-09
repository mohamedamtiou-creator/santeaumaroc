import * as fs from "fs";
import * as path from "path";

const DUMP_PATH = path.resolve("C:/Next/Santeaumaroc_old/santeaum_sam.sql");

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

/** Trouve la position du ; terminal d'un INSERT (depth=0, hors guillemets) */
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

async function main() {
  const sql = fs.readFileSync(DUMP_PATH, "utf8");

  // Compter le nombre d'INSERT pour recommandations
  const insertCount = [...sql.matchAll(/INSERT INTO `recommandations`/gi)].length;
  console.log(`INSERT INTO \`recommandations\` dans le dump : ${insertCount}`);

  const rows = parseTableRobust(sql, "recommandations");
  console.log(`Lignes parsées (robust multi-INSERT) : ${rows.length}`);

  // Dates et statuts
  const actif   = rows.filter(r => r.statut === "1").length;
  const inactif = rows.filter(r => r.statut === "0").length;
  console.log(`  actifs (statut=1) : ${actif}`);
  console.log(`  inactifs (statut=0) : ${inactif}`);

  // Plage de dates
  const dates = rows.map(r => r.date_creation).filter(Boolean).sort();
  console.log(`  dates : ${dates[0]} → ${dates[dates.length - 1]}`);

  // Exemples
  console.log("\nExemples (5 premiers) :");
  rows.slice(0, 5).forEach(r =>
    console.log(`  id=${r.id} praticien=${r.id_praticien} patient=${r.id_patient} note=${r.note} date=${r.date_creation}`)
  );

  // Vérifier aussi établissements_avis avec le nouveau parser
  const etabAvis = parseTableRobust(sql, "etablissements_avis");
  console.log(`\netablissements_avis (robust multi-INSERT) : ${etabAvis.length} lignes`);
}

main().catch(console.error);
