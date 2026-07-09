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
  const rows: string[]=[];let d=0,inS=false,esc=false,start=-1;
  for(let i=0;i<v.length;i++){const ch=v[i];if(esc){esc=false;continue;}if(ch==="\\"){esc=true;continue;}if(ch==="'"&&!inS){inS=true;continue;}if(ch==="'"&&inS){inS=false;continue;}if(inS)continue;if(ch==="("){if(d===0)start=i+1;d++;}else if(ch===")"){d--;if(d===0&&start>=0){rows.push(v.slice(start,i));start=-1;}}}
  return rows;
}
function parseValues(row: string): (string|null)[] {
  const vals:(string|null)[]=[];let i=0;
  while(i<row.length){while(i<row.length&&/\s/.test(row[i]))i++;if(i>=row.length)break;if(row.slice(i,i+4).toUpperCase()==="NULL"){vals.push(null);i+=4;}else if(row[i]==="'"){i++;let s="";while(i<row.length){if(row[i]==="\\"&&i+1<row.length){const n=row[i+1];s+=n==="n"?"\n":n==="r"?"\r":n==="t"?"\t":n;i+=2;}else if(row[i]==="'"&&row[i+1]==="'"){s+="'";i+=2;}else if(row[i]==="'"){i++;break;}else{s+=row[i];i++;}}vals.push(s);}else{let n="";while(i<row.length&&row[i]!==","&&!/\s/.test(row[i])){n+=row[i];i++;}vals.push(n||null);}while(i<row.length&&(row[i]===","||/\s/.test(row[i])))i++;}
  return vals;
}
function findInsertEnd(sql:string,from:number):number{let inS=false,esc=false,d=0;for(let i=from;i<sql.length;i++){const ch=sql[i];if(esc){esc=false;continue;}if(ch==="\\"){esc=true;continue;}if(ch==="'"&&!inS){inS=true;continue;}if(ch==="'"&&inS){inS=false;continue;}if(inS)continue;if(ch==="("){d++;continue;}if(ch===")"){d--;continue;}if(ch===";"&&d===0)return i;}return sql.length;}
function parseTableRobust(sql:string,table:string):Record<string,string|null>[]{
  const results:Record<string,string|null>[]=[];const marker=`INSERT INTO \`${table}\``;let from=0;
  while(true){const pos=sql.indexOf(marker,from);if(pos===-1)break;const co=sql.indexOf("(",pos),cc=sql.indexOf(")",pos);const cols=sql.slice(co+1,cc).split(",").map(c=>c.trim().replace(/`/g,""));const vp=sql.indexOf("VALUES",cc);if(vp===-1)break;const vs=vp+6,ie=findInsertEnd(sql,vs);for(const row of splitRows(sql.slice(vs,ie))){const v=parseValues(row);if(v.length!==cols.length)continue;const o:Record<string,string|null>={};cols.forEach((c,i)=>{o[c]=v[i];});results.push(o);}from=ie+1;}
  return results;
}
function slugify(t:string):string{return t.toString().normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");}

async function main() {
  const sql = fs.readFileSync(DUMP_PATH, "utf8");

  // ── 1. État actuel en base ─────────────────────────────────────
  const [dbReviews, dbMedReviews, dbEtabReviews] = await Promise.all([
    prisma.review.count(),
    prisma.medicationReview.count(),
    prisma.establishmentReview.count(),
  ]);
  console.log("=== Base PostgreSQL ===");
  console.log(`  review (médecins)      : ${dbReviews}`);
  console.log(`  medicationReview       : ${dbMedReviews}`);
  console.log(`  establishmentReview    : ${dbEtabReviews}`);

  // ── 2. Dump : compter les lignes par table ─────────────────────
  console.log("\n=== Dump MySQL ===");
  const recomm     = parseTableRobust(sql, "recommandations");
  const medAvis    = parseTableRobust(sql, "medicaments_avis");
  const etabAvis   = parseTableRobust(sql, "etablissements_avis");

  const recommActif  = recomm.filter(r => r.statut !== "0").length;
  const medActif     = medAvis.filter(r => r.statut === "1").length;
  const etabActif    = etabAvis.filter(r => r.statut !== "0").length;

  console.log(`  recommandations        : ${recomm.length} total, ${recommActif} actifs`);
  console.log(`  medicaments_avis       : ${medAvis.length} total, ${medActif} actifs`);
  console.log(`  etablissements_avis    : ${etabAvis.length} total, ${etabActif} actifs`);

  // ── 3. medicaments_avis : colonnes + exemples ──────────────────
  if (medAvis.length > 0) {
    console.log("\n=== medicaments_avis ===");
    console.log("  Colonnes :", Object.keys(medAvis[0]).join(", "));
    console.log("  Exemples :");
    medAvis.slice(0, 4).forEach(r =>
      console.log(`    id=${r.id} med=${r.id_medicament} patient=${r.id_patient} note=${r.note} statut=${r.statut} date=${r.date_creation}`)
    );
  }

  // ── 4. Médecins : 30 non matchés → pourquoi ? ─────────────────
  console.log("\n=== Médecins sans match (échantillon) ===");
  const praticiens = parseTableRobust(sql, "praticiens");
  const slugCount = new Map<string, number>();
  const slugToOldId = new Map<string, string>();
  for (const p of praticiens) {
    const base = slugify(`${(p.prenom??"")} ${(p.nom??"")}`);
    const count = slugCount.get(base) ?? 0;
    const slug = count === 0 ? base : `${base}-${count+1}`;
    slugCount.set(base, count+1);
    slugToOldId.set(slug, p.id!);
  }
  const allDoctors = await prisma.doctor.findMany({ select: { id: true, slug: true }, where: { userId: null } });
  const doctorSlugToId = new Map(allDoctors.map(d => [d.slug, d.id]));
  const doctorIdMap = new Map<string, string>();
  for (const [slug, oldId] of slugToOldId) {
    const newId = doctorSlugToId.get(slug);
    if (newId) doctorIdMap.set(oldId, newId);
  }

  // Trouver les recommandations actives dont le médecin n'est pas matchable
  const unmatched = recomm.filter(r => r.statut !== "0" && !doctorIdMap.has(r.id_praticien ?? ""));
  const unmatchedIds = [...new Set(unmatched.map(r => r.id_praticien))];
  console.log(`  ${unmatchedIds.length} id_praticien sans match :`);

  for (const oldId of unmatchedIds.slice(0, 15)) {
    const prat = praticiens.find(p => p.id === oldId);
    const base = slugify(`${(prat?.prenom??"")} ${(prat?.nom??"")}`);
    // Chercher en base par nom
    const inDb = await prisma.doctor.findFirst({
      where: { OR: [
        { nom: { contains: prat?.nom ?? "", mode: "insensitive" } },
        { slug: { contains: base.split("-")[0] } },
      ]},
      select: { id: true, slug: true, nom: true, prenom: true },
    });
    console.log(`    id=${oldId} → "${prat?.prenom} ${prat?.nom}" slug_généré="${base}"`);
    console.log(`      en base: ${inDb ? `slug="${inDb.slug}" nom="${inDb.prenom} ${inDb.nom}"` : "INTROUVABLE"}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
