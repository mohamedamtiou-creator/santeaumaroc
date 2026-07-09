import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const DUMP_PATH = path.resolve("C:/Next/Santeaumaroc_old/santeaum_sam.sql");

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
    if (row.slice(i, i+4).toUpperCase() === "NULL") { vals.push(null); i += 4; }
    else if (row[i] === "'") {
      i++; let s = "";
      while (i < row.length) {
        if (row[i] === "\\" && i+1 < row.length) { const n=row[i+1]; s+=n==="n"?"\n":n==="r"?"\r":n==="t"?"\t":n; i+=2; }
        else if (row[i]==="'"&&row[i+1]==="'") { s+="'"; i+=2; }
        else if (row[i]==="'") { i++; break; }
        else { s+=row[i]; i++; }
      }
      vals.push(s);
    } else { let n=""; while(i<row.length&&row[i]!==","&&!/\s/.test(row[i])){n+=row[i];i++;} vals.push(n||null); }
    while(i<row.length&&(row[i]===","||/\s/.test(row[i])))i++;
  }
  return vals;
}
function findInsertEnd(sql: string, from: number): number {
  let inS=false,esc=false,d=0;
  for(let i=from;i<sql.length;i++){const ch=sql[i];if(esc){esc=false;continue;}if(ch==="\\"){esc=true;continue;}if(ch==="'"&&!inS){inS=true;continue;}if(ch==="'"&&inS){inS=false;continue;}if(inS)continue;if(ch==="("){d++;continue;}if(ch===")"){d--;continue;}if(ch===";"&&d===0)return i;}
  return sql.length;
}
function parseTableRobust(sql: string, table: string): Record<string, string|null>[] {
  const results: Record<string,string|null>[] = [];
  const marker = `INSERT INTO \`${table}\``;
  let from = 0;
  while (true) {
    const pos = sql.indexOf(marker, from); if (pos===-1) break;
    const co=sql.indexOf("(",pos), cc=sql.indexOf(")",pos);
    const cols=sql.slice(co+1,cc).split(",").map(c=>c.trim().replace(/`/g,""));
    const vp=sql.indexOf("VALUES",cc); if(vp===-1)break;
    const vs=vp+6, ie=findInsertEnd(sql,vs);
    for(const row of splitRows(sql.slice(vs,ie))){
      const v=parseValues(row); if(v.length!==cols.length)continue;
      const o: Record<string,string|null>={}; cols.forEach((c,i)=>{o[c]=v[i];}); results.push(o);
    }
    from=ie+1;
  }
  return results;
}
function slugify(t: string): string {
  return t.toString().normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}

async function main() {
  const sql = fs.readFileSync(DUMP_PATH, "utf8");

  // 1. Trouver le praticien "zakaria el alami" dans le dump
  const praticiens = parseTableRobust(sql, "praticiens");
  const target = praticiens.filter(p =>
    slugify(`${p.prenom ?? ""} ${p.nom ?? ""}`) === "zakaria-el-alami" ||
    (p.nom ?? "").toLowerCase().includes("alami") && (p.prenom ?? "").toLowerCase().includes("zakaria")
  );
  console.log(`Praticien(s) trouvé(s) dans le dump :`, target.map(p => `id=${p.id} ${p.prenom} ${p.nom}`));

  if (target.length === 0) { console.log("Introuvable."); return; }

  const praticienId = target[0].id!;

  // 2. Trouver ses avis dans le dump
  const recomm = parseTableRobust(sql, "recommandations");
  const avis = recomm.filter(r => r.id_praticien === praticienId);
  console.log(`\nAvis dans le dump (id_praticien=${praticienId}) :`, avis.length);
  avis.forEach(r => console.log(
    `  id=${r.id} patient=${r.id_patient} note=${r.note} statut=${r.statut} date=${r.date_creation}`,
    `\n    "${(r.recommandation ?? "").slice(0, 80)}"`
  ));

  // 3. Reconstruire le slug pour trouver son id en base
  const slugCount = new Map<string, number>();
  let doctorNewId: string | null = null;
  for (const p of praticiens) {
    const base = slugify(`${(p.prenom??"")} ${(p.nom??"")}`);
    const count = slugCount.get(base) ?? 0;
    const slug = count === 0 ? base : `${base}-${count + 1}`;
    slugCount.set(base, count + 1);
    if (p.id === praticienId) {
      console.log(`\nSlug généré : "${slug}"`);
      const doc = await prisma.doctor.findUnique({ where: { slug }, select: { id: true, nom: true, prenom: true } });
      console.log(`Médecin en base :`, doc);
      doctorNewId = doc?.id ?? null;
    }
  }

  if (!doctorNewId) { console.log("Médecin non trouvé en base."); return; }

  // 4. Avis en base pour ce médecin
  const existing = await prisma.review.findMany({
    where: { doctorId: doctorNewId },
    include: { patient: { select: { name: true, email: true } } },
  });
  console.log(`\nAvis en base (${existing.length}) :`);
  existing.forEach(r => console.log(
    `  ${r.createdAt.toISOString().slice(0,10)} ${r.rating}/5 patient="${r.patient.name}" "${(r.comment??"").slice(0,60)}"`
  ));

  // 5. Vérifier pourquoi l'avis manquant n'a pas été importé
  console.log(`\nVérification des avis du dump :`);
  const patients = parseTableRobust(sql, "patients");
  const patientMap = new Map(patients.map(p => [p.id, p]));
  for (const r of avis) {
    const patient = patientMap.get(r.id_patient ?? "");
    console.log(`  id_patient=${r.id_patient} → dans dump: ${patient ? `${patient.prenom} ${patient.nom} <${patient.email}>` : "ABSENT du dump"}`);
    if (patient?.email) {
      const user = await prisma.user.findUnique({ where: { email: patient.email }, select: { id: true, name: true, role: true } });
      console.log(`    → en base PostgreSQL: ${user ? `id=${user.id} name="${user.name}" role=${user.role}` : "ABSENT"}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
