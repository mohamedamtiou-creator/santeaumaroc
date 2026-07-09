import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

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

function parseTable(sql: string, table: string): Record<string, string | null>[] {
  const results: Record<string, string | null>[] = [];
  const blockRe = new RegExp(`INSERT INTO \`${table}\`\\s*\\(([^)]+)\\)\\s*VALUES\\s*([\\s\\S]*?);`, "gi");
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(sql)) !== null) {
    const cols = m[1].split(",").map(c => c.trim().replace(/`/g, ""));
    for (const row of splitRows(m[2])) {
      const vals = parseValues(row);
      if (vals.length !== cols.length) continue;
      const obj: Record<string, string | null> = {};
      cols.forEach((col, i) => { obj[col] = vals[i]; });
      results.push(obj);
    }
  }
  return results;
}

function slugify(text: string): string {
  return text.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
}

async function main() {
  console.log("Lecture du dump MySQL…");
  const sql = fs.readFileSync(DUMP_PATH, "utf8");

  // ── 1. Trouver l'hôpital dans le dump ──────────────────────
  const etabRows = parseTable(sql, "etablissements");
  const hopital = etabRows.find(r =>
    normalize(r.nom ?? "") === "hopital prive de marrakech"
  );

  if (!hopital) {
    console.error("Hôpital introuvable dans le dump !");
    return;
  }
  console.log("Trouvé dans le dump :", hopital);

  // ── 2. Trouver la ville Marrakech en base ───────────────────
  const city = await prisma.city.findFirst({
    where: { name: { contains: "Marrakech", mode: "insensitive" } },
    select: { id: true, name: true, slug: true },
  });
  if (!city) { console.error("Ville Marrakech introuvable en base"); return; }
  console.log("Ville :", city.name, city.id);

  // ── 3. Créer ou réactiver l'établissement ──────────────────
  const slug = "hopital-prive-de-marrakech";
  const existing = await prisma.establishment.findUnique({ where: { slug } });

  let estabId: string;
  if (existing) {
    await prisma.establishment.update({
      where: { slug },
      data: { type: "clinique", isActive: true },
    });
    estabId = existing.id;
    console.log("Établissement réactivé et reclassé en clinique.");
  } else {
    const created = await prisma.establishment.create({
      data: {
        nom:       "HOPITAL PRIVE DE MARRAKECH",
        slug,
        type:      "clinique",
        adresse:   hopital.adresse ?? "Marrakech",
        phone:     hopital.telephone ?? null,
        email:     hopital.email ?? null,
        website:   hopital.site ?? null,
        cityId:    city.id,
        isActive:  true,
        isVerified: false,
      },
    });
    estabId = created.id;
    console.log("Établissement créé avec id :", estabId);
  }

  // ── 4. Importer les 4 avis ──────────────────────────────────
  const avisRows = parseTable(sql, "etablissements_avis");
  const patientRows = parseTable(sql, "patients");
  const patientMap = new Map<string, string>();
  for (const p of patientRows) {
    if (!p.id) continue;
    const name = [(p.prenom ?? "").trim(), (p.nom ?? "").trim()].filter(Boolean).join(" ");
    patientMap.set(p.id, name || "Anonyme");
  }

  const toCreate = avisRows
    .filter(r => r.statut !== "0" && normalize(
      etabRows.find(e => e.id === r.id_etablissement)?.nom ?? ""
    ) === "hopital prive de marrakech")
    .map(r => {
      const note = parseInt(r.note ?? "0");
      return {
        establishmentId: estabId,
        auteur: patientMap.get(r.id_patient ?? "") ?? "Anonyme",
        note,
        commentaire: (r.avis ?? "").trim() || null,
        isPublic: true,
      };
    })
    .filter(r => r.note >= 1 && r.note <= 5);

  console.log(`\n${toCreate.length} avis à importer :`);
  toCreate.forEach(r => console.log(`  ${r.auteur} — ${r.note}/5  "${r.commentaire ?? ""}"`));

  if (toCreate.length > 0) {
    await prisma.establishmentReview.createMany({ data: toCreate, skipDuplicates: false });

    // Recalculer la moyenne
    const agg = await prisma.establishmentReview.aggregate({
      where: { establishmentId: estabId },
      _avg: { note: true },
      _count: { note: true },
    });
    if (agg._avg.note !== null) {
      await prisma.establishment.update({
        where: { id: estabId },
        data: { averageRating: Math.round(agg._avg.note * 10) / 10 },
      });
      console.log(`\n✓ Note moyenne : ${agg._avg.note.toFixed(1)}/5 (${agg._count.note} avis)`);
    }
  }

  console.log("\n✓ Terminé.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
