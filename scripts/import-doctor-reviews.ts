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

function slugify(text: string): string {
  return text.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Lecture du dump MySQL…");
  const sql = fs.readFileSync(DUMP_PATH, "utf8");

  // ── 1. Recommandations ───────────────────────────────────────
  const recommRows = parseTableRobust(sql, "recommandations");
  console.log(`  recommandations : ${recommRows.length} lignes`);

  // ── 2. doctorIdMap : old_praticien_id → new Doctor.id ────────
  // Reconstruire les slugs exactement comme le seed l'a fait
  const praticienRows = parseTableRobust(sql, "praticiens");
  console.log(`  praticiens dans le dump : ${praticienRows.length}`);

  const doctorSlugCount = new Map<string, number>();
  const slugToOldId     = new Map<string, string>(); // slug → old mysql id

  for (const r of praticienRows) {
    const nom    = (r.nom    ?? "").trim();
    const prenom = (r.prenom ?? "").trim();
    const fullName = [prenom, nom].filter(Boolean).join(" ") || "Docteur";
    let baseSlug = slugify(fullName);
    if (!baseSlug) baseSlug = "docteur";
    const count = doctorSlugCount.get(baseSlug) ?? 0;
    const slug  = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
    doctorSlugCount.set(baseSlug, count + 1);
    slugToOldId.set(slug, r.id!);
  }

  // Requêter tous les médecins en base et construire la map
  const allDoctors = await prisma.doctor.findMany({
    select: { id: true, slug: true },
    where: { userId: null },
  });
  const doctorIdMap = new Map<string, string>(); // old_id → new Doctor.id
  for (const d of allDoctors) {
    if (d.slug && slugToOldId.has(d.slug)) {
      doctorIdMap.set(slugToOldId.get(d.slug)!, d.id);
    }
  }
  console.log(`  doctorIdMap : ${doctorIdMap.size} entrées`);

  // ── 2b. Créer les médecins manquants ─────────────────────────
  // Praticiens référencés dans des avis actifs mais absents de PostgreSQL
  const neededDoctorIds = new Set(
    recommRows
      .filter(r => r.statut !== "0" && !doctorIdMap.has(r.id_praticien ?? ""))
      .map(r => r.id_praticien)
      .filter((id): id is string => !!id)
  );

  if (neededDoctorIds.size > 0) {
    console.log(`  ${neededDoctorIds.size} médecins manquants à créer…`);

    // Rebuilding specialtyIdMap and cityIdMap
    const specialtyRows  = parseTableRobust(sql, "specialites");
    const cityRows       = parseTableRobust(sql, "villes");

    const spSlugCount = new Map<string, number>();
    const spSlugToOld = new Map<string, string>();
    for (const r of specialtyRows) {
      const name = (r.nom ?? "").trim(); if (!name) continue;
      const base = slugify(name);
      const cnt = spSlugCount.get(base) ?? 0;
      const slug = cnt === 0 ? base : `${base}-${cnt + 1}`;
      spSlugCount.set(base, cnt + 1);
      spSlugToOld.set(slug, r.id!);
    }
    const allSpecialties = await prisma.specialty.findMany({ select: { id: true, slug: true } });
    const spNewIdMap = new Map<string, string>(); // old_id → new Specialty.id
    for (const s of allSpecialties) {
      if (s.slug && spSlugToOld.has(s.slug)) spNewIdMap.set(spSlugToOld.get(s.slug)!, s.id);
    }

    const ciSlugCount = new Map<string, number>();
    const ciSlugToOld = new Map<string, string>();
    for (const r of cityRows.filter(r => r.statut !== "-1")) {
      const name = (r.nom ?? "").trim(); if (!name) continue;
      const base = slugify(name);
      const cnt = ciSlugCount.get(base) ?? 0;
      const slug = cnt === 0 ? base : `${base}-${cnt + 1}`;
      ciSlugCount.set(base, cnt + 1);
      ciSlugToOld.set(slug, r.id!);
    }
    const allCities = await prisma.city.findMany({ select: { id: true, slug: true } });
    const ciNewIdMap = new Map<string, string>(); // old_id → new City.id
    for (const c of allCities) {
      if (c.slug && ciSlugToOld.has(c.slug)) ciNewIdMap.set(ciSlugToOld.get(c.slug)!, c.id);
    }

    const fallbackSpecialty = (await prisma.specialty.findFirst({ select: { id: true } }))?.id;
    const fallbackCity      = (await prisma.city.findFirst({ select: { id: true } }))?.id;
    const CIVILITES: Record<string, string> = { "1": "Dr", "2": "Pr" };

    let created = 0;
    for (const oldId of neededDoctorIds) {
      const p = praticienRows.find(r => r.id === oldId);
      if (!p) continue;

      const specialtyId = spNewIdMap.get(p.id_specialite ?? "") ?? fallbackSpecialty;
      const cityId      = ciNewIdMap.get(p.id_ville ?? "")      ?? fallbackCity;
      if (!specialtyId || !cityId) continue;

      const nom    = (p.nom    ?? "").trim();
      const prenom = (p.prenom ?? "").trim();
      const base   = slugify([prenom, nom].filter(Boolean).join(" ") || "docteur");
      const slug   = slugToOldId.get(base) === oldId ? base
        : [...slugToOldId.entries()].find(([, id]) => id === oldId)?.[0] ?? base;

      try {
        const doc = await prisma.doctor.upsert({
          where: { slug },
          create: {
            slug, specialtyId, cityId,
            nom:      nom  || null,
            prenom:   prenom || null,
            civilite: CIVILITES[p.id_civilite ?? ""] ?? null,
            adresse:  (p.adresse ?? "").trim() || "Non renseignée",
            phone:    ((p.telephone ?? "").trim() || (p.mobile ?? "").trim()) as string,
            isActive: p.statut !== "0",
            isVerified: false,
          },
          update: {},
          select: { id: true },
        });
        doctorIdMap.set(oldId, doc.id);
        created++;
      } catch {
        // Slug conflict — skip
      }
    }
    console.log(`  ${created} médecins créés, doctorIdMap now: ${doctorIdMap.size} entrées`);
  }

  // ── 3. patientIdMap : old_patient_id → new User.id ──────────
  const patientRows = parseTableRobust(sql, "patients");
  // Index du dump : old_id → données patient
  const patientDumpMap = new Map(
    patientRows.filter(p => p.id && p.email).map(p => [p.id!, p])
  );

  // IDs des patients référencés dans des avis actifs vers des médecins connus
  const neededPatientIds = new Set(
    recommRows
      .filter(r => r.statut !== "0" && doctorIdMap.has(r.id_praticien ?? ""))
      .map(r => r.id_patient)
      .filter((id): id is string => !!id)
  );

  // Charger tous les users PATIENT existants
  const allUsers = await prisma.user.findMany({
    where: { role: "PATIENT" },
    select: { id: true, email: true },
  });
  const emailToUserId = new Map<string, string>();
  for (const u of allUsers) emailToUserId.set(u.email.toLowerCase(), u.id);

  // Créer les patients manquants (présents dans le dump, absents de PostgreSQL)
  let patientsCreated = 0;
  for (const oldId of neededPatientIds) {
    const p = patientDumpMap.get(oldId);
    if (!p?.email) continue;
    const email = p.email.trim().toLowerCase();
    if (emailToUserId.has(email)) continue;

    const name = [(p.prenom ?? "").trim(), (p.nom ?? "").trim()].filter(Boolean).join(" ") || "Patient";
    try {
      const created = await prisma.user.create({
        data: {
          email:          p.email.trim(),
          name,
          password:       "__IMPORTED_HISTORICAL__",
          role:           "PATIENT",
          isActive:       false,
          emailVerified:  false,
        },
        select: { id: true, email: true },
      });
      emailToUserId.set(email, created.id);
      patientsCreated++;
    } catch {
      // Conflit email — ignorer
    }
  }
  if (patientsCreated > 0) console.log(`  ${patientsCreated} patients manquants créés en base`);

  const patientIdMap = new Map<string, string>(); // old_id → new User.id
  for (const p of patientRows) {
    if (!p.id || !p.email) continue;
    const userId = emailToUserId.get(p.email.trim().toLowerCase());
    if (userId) patientIdMap.set(p.id, userId);
  }
  console.log(`  patientIdMap : ${patientIdMap.size} entrées`);

  // ── 4. Construire les avis ────────────────────────────────────
  let skippedInactive = 0, skippedNoDoctor = 0, skippedNoPatient = 0, skippedBadNote = 0;
  const toCreate: {
    doctorId: string; patientId: string; rating: number;
    comment: string | null; isPublic: boolean; createdAt?: Date;
  }[] = [];

  for (const r of recommRows) {
    if (r.statut === "0") { skippedInactive++; continue; }

    const doctorId  = doctorIdMap.get(r.id_praticien ?? "");
    const patientId = patientIdMap.get(r.id_patient  ?? "");

    if (!doctorId)  { skippedNoDoctor++;  continue; }
    if (!patientId) { skippedNoPatient++; continue; }

    const rating = parseInt(r.note ?? "0");
    if (rating < 1 || rating > 5) { skippedBadNote++; continue; }

    const dateCreation = r.date_creation
      ? new Date(r.date_creation.replace(" ", "T") + "Z")
      : null;

    toCreate.push({
      doctorId,
      patientId,
      rating,
      comment:   (r.recommandation ?? "").trim() || null,
      isPublic:  true,
      ...(dateCreation && !isNaN(dateCreation.getTime()) ? { createdAt: dateCreation } : {}),
    });
  }

  // Dédupliquer (1 avis par couple patient-médecin, garder le plus récent)
  const uniqueMap = new Map<string, typeof toCreate[0]>();
  for (const r of toCreate) {
    const key = `${r.patientId}|${r.doctorId}`;
    const existing = uniqueMap.get(key);
    if (!existing || (r.createdAt && (!existing.createdAt || r.createdAt > existing.createdAt))) {
      uniqueMap.set(key, r);
    }
  }
  const deduped = [...uniqueMap.values()];

  console.log(`\n  À importer       : ${deduped.length} (après dédup: ${toCreate.length - deduped.length} doublons supprimés)`);
  console.log(`  Inactifs         : ${skippedInactive}`);
  console.log(`  Sans médecin     : ${skippedNoDoctor}`);
  console.log(`  Sans patient     : ${skippedNoPatient}`);
  console.log(`  Note invalide    : ${skippedBadNote}`);

  if (deduped.length === 0) { console.log("\nAucun avis à importer."); return; }

  // ── 5. Supprimer les anciens avis (dates incorrectes) ─────────
  const existingCount = await prisma.review.count();
  console.log(`\n  Avis déjà en base : ${existingCount} (seront remplacés)`);
  if (existingCount > 0) {
    await prisma.review.deleteMany({});
    // Remettre averageRating + reviewsCount à 0 pour tous les médecins
    await prisma.doctor.updateMany({ where: { OR: [{ averageRating: { gt: 0 } }, { reviewsCount: { gt: 0 } }] }, data: { averageRating: 0, reviewsCount: 0 } });
    console.log("  Anciens avis supprimés, moyennes remises à 0.");
  }

  // ── 6. Insertion ──────────────────────────────────────────────
  const result = await prisma.review.createMany({ data: deduped, skipDuplicates: false });
  console.log(`\n✓ ${result.count} avis médecins importés.`);

  // ── 7. Recalculer averageRating ───────────────────────────────
  console.log("Recalcul des notes moyennes…");
  const doctorIds = [...new Set(deduped.map(r => r.doctorId))];
  let updated = 0;
  for (const id of doctorIds) {
    const agg = await prisma.review.aggregate({
      where: { doctorId: id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    if (agg._avg.rating !== null) {
      await prisma.doctor.update({
        where: { id },
        data: { averageRating: Math.round(agg._avg.rating * 10) / 10, reviewsCount: agg._count.rating },
      });
      updated++;
    }
  }
  console.log(`✓ ${updated} notes moyennes médecins recalculées.`);

  // ── 8. Résumé ─────────────────────────────────────────────────
  const totals = await prisma.review.groupBy({
    by: ["doctorId"],
    _count: { id: true },
    _avg: { rating: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });
  const topDoctors = await prisma.doctor.findMany({
    where: { id: { in: totals.map(t => t.doctorId) } },
    select: { id: true, nom: true, prenom: true, averageRating: true, _count: { select: { reviews: true } } },
  });
  console.log("\nTop 5 médecins avec le plus d'avis :");
  topDoctors.forEach(d =>
    console.log(`  Dr. ${d.prenom ?? ""} ${d.nom ?? ""} — ${d.averageRating}/5 (${d._count.reviews} avis)`)
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
