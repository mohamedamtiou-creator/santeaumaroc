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

function parseTableRobust(sql: string, table: string): Record<string, string | null>[] {
  const insertMarker = `INSERT INTO \`${table}\``;
  const insertPos = sql.indexOf(insertMarker);
  if (insertPos === -1) return [];
  const colOpen  = sql.indexOf("(", insertPos);
  const colClose = sql.indexOf(")", insertPos);
  const cols = sql.slice(colOpen + 1, colClose).split(",").map(c => c.trim().replace(/`/g, ""));
  const valuesPos  = sql.indexOf("VALUES", colClose);
  if (valuesPos === -1) return [];
  const nextInsert = sql.indexOf("\nINSERT INTO `", valuesPos);
  const section    = sql.slice(valuesPos + 6, nextInsert > 0 ? nextInsert : sql.length);
  return splitRows(section).map(row => {
    const vals = parseValues(row);
    if (vals.length !== cols.length) return null;
    const obj: Record<string, string | null> = {};
    cols.forEach((col, i) => { obj[col] = vals[i]; });
    return obj;
  }).filter((r): r is Record<string, string | null> => r !== null);
}

async function main() {
  const sql = fs.readFileSync(DUMP_PATH, "utf8");

  const patients = parseTableRobust(sql, "patients");
  console.log(`patients dans le dump : ${patients.length}`);
  if (patients.length > 0) {
    const maxId = Math.max(...patients.map(p => parseInt(p.id ?? "0")));
    const minId = Math.min(...patients.map(p => parseInt(p.id ?? "0")));
    console.log(`  ids : ${minId} → ${maxId}`);
    console.log("  Exemples :", patients.slice(0, 3).map(p => `${p.id} ${p.prenom} ${p.nom}`).join(", "));
  }

  const avis = parseTableRobust(sql, "etablissements_avis");
  console.log(`\navis dans le dump : ${avis.length}`);

  // Vérifier combien de patient_id existent dans patients
  const patientIds = new Set(patients.map(p => p.id));
  const matched = avis.filter(r => patientIds.has(r.id_patient));
  const unmatched = avis.filter(r => !patientIds.has(r.id_patient));
  console.log(`  patient_id matchés   : ${matched.length}`);
  console.log(`  patient_id non matchés: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log("  ids sans patient :", [...new Set(unmatched.map(r => r.id_patient))].join(", "));
  }

  // Vérifier les dates
  console.log("\nExemples de date_creation :");
  avis.slice(0, 5).forEach(r => console.log(`  id=${r.id}  date_creation=${r.date_creation}  avis="${(r.avis ?? "").slice(0, 50)}"`));
}

main().catch(console.error);
