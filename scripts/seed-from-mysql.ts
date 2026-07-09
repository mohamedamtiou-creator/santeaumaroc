/**
 * Import data from the old Santeaumaroc MySQL dump into PostgreSQL via Prisma.
 * Run: npx tsx scripts/seed-from-mysql.ts
 *
 * Imports: specialties → cities → doctors → establishments → medications
 *        → patients(users) → reviews → contacts
 *        → medication reviews → establishment reviews → working hours
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ── Slug helper ──────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── SQL parser ───────────────────────────────────────────────────────────────

/**
 * Extract all INSERT rows for a given table.
 * Returns an array of objects keyed by column name.
 */
function parseTable(sql: string, table: string): Record<string, string | null>[] {
  const results: Record<string, string | null>[] = [];

  // Match all INSERT INTO `table` blocks (may span multiple lines)
  const blockRe = new RegExp(
    `INSERT INTO \`${table}\`\\s*\\(([^)]+)\\)\\s*VALUES\\s*([\\s\\S]*?);`,
    "gi"
  );

  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = blockRe.exec(sql)) !== null) {
    const colsPart = blockMatch[1];
    const valuesPart = blockMatch[2];

    // Parse column names (strip backticks)
    const cols = colsPart
      .split(",")
      .map((c) => c.trim().replace(/`/g, ""));

    // Parse individual rows — split on ),( boundaries
    const rows = splitRows(valuesPart);

    for (const row of rows) {
      const values = parseValues(row);
      if (values.length !== cols.length) continue;
      const obj: Record<string, string | null> = {};
      cols.forEach((col, i) => {
        obj[col] = values[i];
      });
      results.push(obj);
    }
  }

  return results;
}

/**
 * Split the VALUES section into individual row strings.
 * Handles commas inside quoted strings.
 */
function splitRows(valuesPart: string): string[] {
  const rows: string[] = [];
  let depth = 0;
  let inStr = false;
  let escape = false;
  let start = -1;

  for (let i = 0; i < valuesPart.length; i++) {
    const ch = valuesPart[i];

    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }

    if (ch === "'" && !inStr) { inStr = true; continue; }
    if (ch === "'" && inStr) { inStr = false; continue; }
    if (inStr) continue;

    if (ch === "(") {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (ch === ")") {
      depth--;
      if (depth === 0 && start >= 0) {
        rows.push(valuesPart.slice(start, i));
        start = -1;
      }
    }
  }

  return rows;
}

/**
 * Parse a comma-separated values string into an array of strings/nulls.
 * Handles: NULL, 'string with \'escapes\'', numbers.
 */
function parseValues(row: string): (string | null)[] {
  const values: (string | null)[] = [];
  let i = 0;

  while (i < row.length) {
    // Skip whitespace
    while (i < row.length && /\s/.test(row[i])) i++;
    if (i >= row.length) break;

    if (row.slice(i, i + 4).toUpperCase() === "NULL") {
      values.push(null);
      i += 4;
    } else if (row[i] === "'") {
      // Parse quoted string
      i++; // skip opening quote
      let str = "";
      while (i < row.length) {
        if (row[i] === "\\" && i + 1 < row.length) {
          const next = row[i + 1];
          if (next === "n") str += "\n";
          else if (next === "r") str += "\r";
          else if (next === "t") str += "\t";
          else str += next;
          i += 2;
        } else if (row[i] === "'" && row[i + 1] === "'") {
          str += "'";
          i += 2;
        } else if (row[i] === "'") {
          i++; // skip closing quote
          break;
        } else {
          str += row[i];
          i++;
        }
      }
      values.push(str);
    } else {
      // Number or unquoted value
      let num = "";
      while (i < row.length && row[i] !== "," && !/\s/.test(row[i])) {
        num += row[i];
        i++;
      }
      values.push(num === "" ? null : num);
    }

    // Skip comma
    while (i < row.length && /\s/.test(row[i])) i++;
    if (i < row.length && row[i] === ",") i++;
  }

  return values;
}

// ── Civilité mapping ─────────────────────────────────────────────────────────

const CIVILITES: Record<string, string> = {
  "1": "Dr",
  "2": "Pr",
  "3": "M.",
  "4": "Mme",
  "5": "Mlle",
};

// ── Establishment type mapping ────────────────────────────────────────────────

const ETAB_TYPES: Record<string, string> = {
  "1": "clinique",
  "2": "hôpital",
  "3": "établissement pharmaceutique",
  "4": "pharmacie",
  "5": "laboratoire",
};

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Clearing existing seed data…");
  // Delete in FK-safe order (appointments kept for real users, PATIENT users are imported)
  await prisma.review.deleteMany();
  await prisma.medicationReview.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.establishmentReview.deleteMany();
  await prisma.establishment.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.doctorAbsence.deleteMany({ where: { doctor: { userId: null } } });
  await prisma.appointment.deleteMany({ where: { patient: { role: "PATIENT" } } });
  await prisma.user.deleteMany({ where: { role: "PATIENT" } });
  await prisma.doctor.deleteMany({ where: { userId: null } });
  await prisma.city.deleteMany();
  await prisma.specialty.deleteMany();
  console.log("  Done.\n");

  const dumpPath = path.resolve(
    "C:/Next/Santeaumaroc_old/santeaum_sam.sql"
  );

  console.log("Reading SQL dump…");
  const sql = fs.readFileSync(dumpPath, "utf8");
  console.log(`  File size: ${(sql.length / 1024 / 1024).toFixed(1)} MB`);

  // ── 1. Specialties ──────────────────────────────────────────────────────────
  console.log("\n[1/6] Importing specialties…");
  const specialitesRows = parseTable(sql, "specialites");
  console.log(`  Found ${specialitesRows.length} rows`);

  // id → new cuid (via specialty.id)
  const specialtyIdMap = new Map<string, string>();

  // Build slug counter for dedup
  const specialtySlugCount = new Map<string, number>();

  const specialtiesData = specialitesRows
    .filter((r) => r.statut !== "-1") // skip disabled
    .map((r) => {
      const name = (r.nom ?? "").trim();
      if (!name) return null;
      let slug = slugify(name);
      const count = specialtySlugCount.get(slug) ?? 0;
      if (count > 0) slug = `${slug}-${count}`;
      specialtySlugCount.set(slug, count + 1);
      return { oldId: r.id!, name, slug };
    })
    .filter(Boolean) as { oldId: string; name: string; slug: string }[];

  let specialtyOk = 0;
  for (const s of specialtiesData) {
    const created = await prisma.specialty.upsert({
      where: { slug: s.slug },
      create: { name: s.name, slug: s.slug },
      update: {},
      select: { id: true },
    });
    specialtyIdMap.set(s.oldId, created.id);
    specialtyOk++;
  }
  console.log(`  Imported ${specialtyOk} specialties`);

  // ── 2. Cities ───────────────────────────────────────────────────────────────
  console.log("\n[2/6] Importing cities…");
  const villesRows = parseTable(sql, "villes");
  console.log(`  Found ${villesRows.length} rows`);

  const cityIdMap = new Map<string, string>();
  const citySlugCount = new Map<string, number>();

  const citiesData = villesRows
    .filter((r) => r.statut !== "-1")
    .map((r) => {
      const name = (r.nom ?? "").trim();
      if (!name) return null;
      let slug = slugify(name);
      const count = citySlugCount.get(slug) ?? 0;
      if (count > 0) slug = `${slug}-${count}`;
      citySlugCount.set(slug, count + 1);
      return { oldId: r.id!, name, slug };
    })
    .filter(Boolean) as { oldId: string; name: string; slug: string }[];

  // Deduplicate by name (MySQL dump may contain the same city multiple times)
  const seenCityNames = new Map<string, string>(); // name → new id

  let cityOk = 0;
  for (const c of citiesData) {
    const normalizedName = c.name.trim();
    if (seenCityNames.has(normalizedName)) {
      cityIdMap.set(c.oldId, seenCityNames.get(normalizedName)!);
      continue;
    }
    const created = await prisma.city.upsert({
      where: { name: normalizedName },
      create: { name: normalizedName, slug: c.slug },
      update: {},
      select: { id: true },
    });
    seenCityNames.set(normalizedName, created.id);
    cityIdMap.set(c.oldId, created.id);
    cityOk++;
  }
  console.log(`  Imported ${cityOk} cities`);

  // Fallback specialty and city for records with unmapped IDs
  let fallbackSpecialtyId: string | null = null;
  let fallbackCityId: string | null = null;

  const firstSpecialty = await prisma.specialty.findFirst({ select: { id: true } });
  const firstCity = await prisma.city.findFirst({ select: { id: true } });
  fallbackSpecialtyId = firstSpecialty?.id ?? null;
  fallbackCityId = firstCity?.id ?? null;

  // ── 3. Doctors ──────────────────────────────────────────────────────────────
  console.log("\n[3/6] Importing doctors…");
  const praticienRows = parseTable(sql, "praticiens");
  console.log(`  Found ${praticienRows.length} rows`);

  const doctorSlugCount = new Map<string, number>();
  const slugToOldDoctorId = new Map<string, string>(); // slug → old mysql id

  let doctorOk = 0;
  let doctorSkipped = 0;
  const BATCH = 200;

  for (let i = 0; i < praticienRows.length; i += BATCH) {
    const batch = praticienRows.slice(i, i + BATCH);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toCreate: any[] = [];

    for (const r of batch) {
      const specialtyId =
        specialtyIdMap.get(r.id_specialite ?? "") ?? fallbackSpecialtyId;
      const cityId =
        cityIdMap.get(r.id_ville ?? "") ?? fallbackCityId;

      if (!specialtyId || !cityId) {
        doctorSkipped++;
        continue;
      }

      const nom = (r.nom ?? "").trim();
      const prenom = (r.prenom ?? "").trim();
      const fullName = [prenom, nom].filter(Boolean).join(" ") || "Docteur";

      let baseSlug = slugify(fullName);
      if (!baseSlug) baseSlug = "docteur";
      const count = doctorSlugCount.get(baseSlug) ?? 0;
      const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
      doctorSlugCount.set(baseSlug, count + 1);

      const phone =
        (r.telephone ?? "").trim() ||
        (r.mobile ?? "").trim() ||
        "";

      slugToOldDoctorId.set(slug, r.id!);
      toCreate.push({
        specialtyId,
        cityId,
        slug,
        nom: nom || null,
        prenom: prenom || null,
        civilite: CIVILITES[r.id_civilite ?? ""] ?? null,
        adresse: (r.adresse ?? "").trim() || "Non renseignée",
        phone,
        description: (r.commentaire ?? "").trim() || null,
        isActive: r.statut !== "0",
        isVerified: false,
      });
    }

    if (toCreate.length > 0) {
      await prisma.doctor.createMany({ data: toCreate, skipDuplicates: true });
      doctorOk += toCreate.length;
    }

    if ((i / BATCH) % 10 === 0) {
      process.stdout.write(`  ${doctorOk} doctors imported…\r`);
    }
  }
  console.log(`\n  Imported ${doctorOk} doctors, skipped ${doctorSkipped}`);

  // Build doctorIdMap: old mysql id → new cuid
  const doctorIdMap = new Map<string, string>();
  const allDoctors = await prisma.doctor.findMany({ select: { id: true, slug: true }, where: { userId: null } });
  for (const d of allDoctors) {
    if (d.slug && slugToOldDoctorId.has(d.slug)) {
      doctorIdMap.set(slugToOldDoctorId.get(d.slug)!, d.id);
    }
  }
  console.log(`  Built doctorIdMap: ${doctorIdMap.size} entries`);

  // ── 4. Establishments ────────────────────────────────────────────────────────
  console.log("\n[4/6] Importing establishments…");
  const etabRows = parseTable(sql, "etablissements");
  console.log(`  Found ${etabRows.length} rows`);

  const etabSlugCount = new Map<string, number>();
  let etabOk = 0;

  for (let i = 0; i < etabRows.length; i += BATCH) {
    const batch = etabRows.slice(i, i + BATCH);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toCreate: any[] = [];

    for (const r of batch) {
      const cityId =
        cityIdMap.get(r.id_ville ?? "") ?? fallbackCityId;
      if (!cityId) continue;

      const nom = (r.nom ?? "").trim() || "Établissement";
      let baseSlug = slugify(nom);
      if (!baseSlug) baseSlug = "etablissement";
      const count = etabSlugCount.get(baseSlug) ?? 0;
      const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
      etabSlugCount.set(baseSlug, count + 1);

      const phone =
        (r.telephone1 ?? "").trim() ||
        (r.telephone2 ?? "").trim() ||
        null;

      toCreate.push({
        nom,
        slug,
        type: ETAB_TYPES[r.id_categorie ?? ""] ?? null,
        adresse: (r.adresse ?? "").trim() || "Non renseignée",
        phone,
        email: (r.email ?? "").trim() || null,
        website: (r.siteweb ?? "").trim() || null,
        description: (r.description ?? "").trim() || null,
        cityId,
        isActive: r.statut !== "0",
      });
    }

    if (toCreate.length > 0) {
      await prisma.establishment.createMany({ data: toCreate, skipDuplicates: true });
      etabOk += toCreate.length;
    }
  }
  console.log(`  Imported ${etabOk} establishments`);

  // ── 5. Medications ───────────────────────────────────────────────────────────
  console.log("\n[5/6] Importing medications…");
  const medRows = parseTable(sql, "medicaments");
  console.log(`  Found ${medRows.length} rows`);

  const medSlugCount = new Map<string, number>();
  let medOk = 0;

  for (let i = 0; i < medRows.length; i += BATCH) {
    const batch = medRows.slice(i, i + BATCH);
    const toCreate: Parameters<typeof prisma.medication.create>[0]["data"][] = [];

    for (const r of batch) {
      const nom = (r.nom ?? "").trim();
      if (!nom) continue;

      let baseSlug = slugify(nom);
      if (!baseSlug) continue;
      const count = medSlugCount.get(baseSlug) ?? 0;
      const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
      medSlugCount.set(baseSlug, count + 1);

      const dci = (r.dci1 ?? "").trim() || null;
      const forme = (r.forme ?? "").trim() || null;

      toCreate.push({
        nom,
        slug,
        dci,
        forme,
        isActive: r.statut !== "0",
      });
    }

    if (toCreate.length > 0) {
      await prisma.medication.createMany({ data: toCreate, skipDuplicates: true });
      medOk += toCreate.length;
    }
  }
  console.log(`  Imported ${medOk} medications`);

  // ── 6. Patients → User ───────────────────────────────────────────────────────
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  console.log("\n[6/11] Importing patients → users…");
  const patientRows = parseTable(sql, "patients");
  console.log(`  Found ${patientRows.length} rows`);

  const patientIdMap = new Map<string, string>(); // old int id → new User.id
  const seenPatientEmails = new Map<string, string>(); // email → new User.id
  let patientOk = 0, patientSkipped = 0;

  for (let i = 0; i < patientRows.length; i += BATCH) {
    const batch = patientRows.slice(i, i + BATCH);
    const toCreate: any[] = [];

    for (const r of batch) {
      if (r.statut === "-1") { patientSkipped++; continue; }

      const email = (r.email ?? "").trim().toLowerCase();
      if (!email || !emailRe.test(email)) { patientSkipped++; continue; }

      // Deduplicate by email within this import
      if (seenPatientEmails.has(email)) {
        patientIdMap.set(r.id!, seenPatientEmails.get(email)!);
        continue;
      }

      const nom = (r.nom ?? "").trim();
      const prenom = (r.prenom ?? "").trim();
      const name = [prenom, nom].filter(Boolean).join(" ") || "Patient";

      toCreate.push({
        email,
        password: "IMPORTED_NO_PASSWORD",
        name,
        phone: (r.numero_telephone ?? "").trim() || null,
        role: "PATIENT",
        isActive: r.statut === "1",
        emailVerified: false,
        avatar: null,
        _oldId: r.id!,
      });
      seenPatientEmails.set(email, "PENDING");
    }

    // Insert users and collect new IDs
    for (const u of toCreate) {
      const oldId = u._oldId;
      delete u._oldId;
      try {
        const created = await prisma.user.upsert({
          where: { email: u.email },
          create: u,
          update: {},
          select: { id: true },
        });
        patientIdMap.set(oldId, created.id);
        seenPatientEmails.set(u.email, created.id);
        patientOk++;
      } catch {
        patientSkipped++;
      }
    }

    if ((i / BATCH) % 10 === 0) {
      process.stdout.write(`  ${patientOk} patients imported…\r`);
    }
  }
  console.log(`\n  Imported ${patientOk} patients, skipped ${patientSkipped}`);

  // ── 7. Recommandations → Review ──────────────────────────────────────────────
  console.log("\n[7/11] Importing reviews (recommandations)…");
  const recommRows = parseTable(sql, "recommandations");
  console.log(`  Found ${recommRows.length} rows`);

  let reviewOk = 0, reviewSkipped = 0;
  for (const r of recommRows) {
    const doctorId = doctorIdMap.get(r.id_praticien ?? "");
    const patientId = patientIdMap.get(r.id_patient ?? "");
    if (!doctorId || !patientId) { reviewSkipped++; continue; }

    const rating = parseInt(r.note ?? "0");
    if (rating < 1 || rating > 5) { reviewSkipped++; continue; }

    try {
      await prisma.review.upsert({
        where: { patientId_doctorId: { patientId, doctorId } },
        create: {
          patientId,
          doctorId,
          rating,
          comment: (r.recommandation ?? "").trim() || null,
          isPublic: r.statut === "1",
        },
        update: {},
      });
      reviewOk++;
    } catch {
      reviewSkipped++;
    }
  }
  console.log(`  Imported ${reviewOk} reviews, skipped ${reviewSkipped}`);

  // Update doctor averageRating from imported reviews
  const doctorIdsWithReviews = [...new Set(recommRows
    .filter(r => doctorIdMap.has(r.id_praticien ?? ""))
    .map(r => doctorIdMap.get(r.id_praticien!)!)
  )];
  for (const dId of doctorIdsWithReviews) {
    const agg = await prisma.review.aggregate({
      where: { doctorId: dId },
      _avg: { rating: true },
    });
    if (agg._avg.rating !== null) {
      await prisma.doctor.update({
        where: { id: dId },
        data: { averageRating: agg._avg.rating },
      });
    }
  }

  // ── 8. Contacts → ContactRequest ─────────────────────────────────────────────
  const OBJETS: Record<string, string> = {
    "1": "Besoin d'assistance",
    "2": "Partenariat / Marketing",
    "3": "Relation presse",
    "4": "Publicité",
    "5": "Suggestions / Boite à idées",
    "6": "Modération",
    "7": "Bug / Problème technique",
    "8": "Modification de coordonnées dans l'annuaire",
    "9": "Suppression de coordonnées dans l'annuaire",
    "10": "Modération",
    "11": "Autre",
  };

  console.log("\n[8/11] Importing contact requests…");
  const contactRows = parseTable(sql, "contacts");
  console.log(`  Found ${contactRows.length} rows`);

  let contactOk = 0;
  const contactsToCreate: any[] = [];
  for (const r of contactRows) {
    const email = (r.email ?? "").trim();
    if (!email) continue;
    const nom = [r.prenom, r.nom].filter(Boolean).map(s => s!.trim()).join(" ") || "Inconnu";
    contactsToCreate.push({
      name: nom,
      email,
      phone: (r.telephone ?? "").trim() || null,
      subject: OBJETS[r.id_objet ?? ""] ?? "Autre",
      message: (r.message ?? "").trim() || "—",
    });
  }
  if (contactsToCreate.length > 0) {
    await prisma.contactRequest.createMany({ data: contactsToCreate, skipDuplicates: false });
    contactOk = contactsToCreate.length;
  }
  console.log(`  Imported ${contactOk} contact requests`);

  // ── 9. Médicaments avis → MedicationReview ───────────────────────────────────
  console.log("\n[9/11] Importing medication reviews…");
  const medAvisRows = parseTable(sql, "medicaments_avis");
  console.log(`  Found ${medAvisRows.length} rows`);

  // Build medication old-id → new id map
  const medRows2 = parseTable(sql, "medicaments");
  const medSlugCount2 = new Map<string, number>();
  const medOldIdToNewId = new Map<string, string>();
  for (const r of medRows2) {
    const nom = (r.nom ?? "").trim();
    if (!nom) continue;
    let baseSlug = slugify(nom);
    if (!baseSlug) continue;
    const count = medSlugCount2.get(baseSlug) ?? 0;
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
    medSlugCount2.set(baseSlug, count + 1);
    try {
      const med = await prisma.medication.findUnique({ where: { slug }, select: { id: true } });
      if (med) medOldIdToNewId.set(r.id!, med.id);
    } catch { /* skip */ }
  }

  let medReviewOk = 0;
  const medAvisToCreate: any[] = [];
  for (const r of medAvisRows) {
    if (r.statut === "0") continue;
    const medicationId = medOldIdToNewId.get(r.id_medicament ?? "");
    if (!medicationId) continue;
    const note = parseInt(r.note ?? "0");
    if (note < 1 || note > 5) continue;

    // Get patient name for auteur field
    const patient = patientRows.find(p => p.id === r.id_patient);
    const auteur = patient
      ? [(patient.prenom ?? "").trim(), (patient.nom ?? "").trim()].filter(Boolean).join(" ") || "Anonyme"
      : "Anonyme";

    medAvisToCreate.push({
      medicationId,
      auteur,
      note,
      commentaire: (r.avis ?? "").trim() || null,
      isPublic: r.statut === "1",
    });
  }
  if (medAvisToCreate.length > 0) {
    await prisma.medicationReview.createMany({ data: medAvisToCreate, skipDuplicates: false });
    medReviewOk = medAvisToCreate.length;
  }
  console.log(`  Imported ${medReviewOk} medication reviews`);

  // ── 10. Établissements avis → EstablishmentReview ────────────────────────────
  console.log("\n[10/11] Importing establishment reviews…");
  const etabAvisRows = parseTable(sql, "etablissements_avis");
  console.log(`  Found ${etabAvisRows.length} rows`);

  // Build establishment old-id → new id map
  const etabRows2 = parseTable(sql, "etablissements");
  const etabSlugCount2 = new Map<string, number>();
  const etabOldIdToNewId = new Map<string, string>();
  for (const r of etabRows2) {
    const nom = (r.nom ?? "").trim() || "Établissement";
    let baseSlug = slugify(nom);
    if (!baseSlug) baseSlug = "etablissement";
    const count = etabSlugCount2.get(baseSlug) ?? 0;
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
    etabSlugCount2.set(baseSlug, count + 1);
    try {
      const etab = await prisma.establishment.findUnique({ where: { slug }, select: { id: true } });
      if (etab) etabOldIdToNewId.set(r.id!, etab.id);
    } catch { /* skip */ }
  }

  let etabReviewOk = 0;
  const etabAvisToCreate: any[] = [];
  for (const r of etabAvisRows) {
    if (r.statut === "0") continue;
    const establishmentId = etabOldIdToNewId.get(r.id_etablissement ?? "");
    if (!establishmentId) continue;
    const note = parseInt(r.note ?? "0");
    if (note < 1 || note > 5) continue;

    const patient = patientRows.find(p => p.id === r.id_patient);
    const auteur = patient
      ? [(patient.prenom ?? "").trim(), (patient.nom ?? "").trim()].filter(Boolean).join(" ") || "Anonyme"
      : "Anonyme";

    etabAvisToCreate.push({
      establishmentId,
      auteur,
      note,
      commentaire: (r.avis ?? "").trim() || null,
      isPublic: r.statut === "1",
    });
  }
  if (etabAvisToCreate.length > 0) {
    await prisma.establishmentReview.createMany({ data: etabAvisToCreate, skipDuplicates: false });
    etabReviewOk = etabAvisToCreate.length;
  }
  console.log(`  Imported ${etabReviewOk} establishment reviews`);

  // ── 11. Agendas + Créneaux → WorkingHours ────────────────────────────────────
  console.log("\n[11/11] Importing working hours (agendas + creneaux)…");
  const creneauxRows = parseTable(sql, "creneaux");
  const agendaRows = parseTable(sql, "agendas");
  console.log(`  Found ${agendaRows.length} agendas, ${creneauxRows.length} creneaux`);

  // Build créneau map: id → { startTime, endTime }
  const creneauMap = new Map<string, { start: string; end: string }>();
  for (const c of creneauxRows) {
    const hd = parseInt(c.hdebut ?? "8");
    const md = parseInt(c.mdebut ?? "0");
    const hf = parseInt(c.hfin ?? "8");
    const mf = parseInt(c.mfin ?? "30");
    const start = `${String(hd).padStart(2, "0")}:${String(md).padStart(2, "0")}`;
    const end = `${String(hf).padStart(2, "0")}:${String(mf).padStart(2, "0")}`;
    creneauMap.set(c.id!, { start, end });
  }

  // For each doctor, collect per-dayOfWeek → {minStart, maxEnd}
  // dayOfWeek: 0=Sunday, 1=Monday, ..., 6=Saturday
  type DayHours = { start: string; end: string };
  const doctorDayMap = new Map<string, Map<number, DayHours>>();

  for (const a of agendaRows) {
    if (a.id_agenda_statut === "0") continue; // skip inactive

    const newDoctorId = doctorIdMap.get(a.id_praticien ?? "");
    if (!newDoctorId) continue;

    const creneau = creneauMap.get(a.id_creneau ?? "");
    if (!creneau) continue;

    // jour is a date string like '2022-09-02'
    const jourDate = new Date(a.jour ?? "");
    if (isNaN(jourDate.getTime())) continue;
    const dayOfWeek = jourDate.getDay(); // 0=Sun, 6=Sat

    if (!doctorDayMap.has(newDoctorId)) {
      doctorDayMap.set(newDoctorId, new Map());
    }
    const dayMap = doctorDayMap.get(newDoctorId)!;
    const existing = dayMap.get(dayOfWeek);
    if (!existing) {
      dayMap.set(dayOfWeek, { start: creneau.start, end: creneau.end });
    } else {
      // Expand time range: keep earliest start and latest end
      if (creneau.start < existing.start) existing.start = creneau.start;
      if (creneau.end > existing.end) existing.end = creneau.end;
    }
  }

  let whOk = 0;
  for (const [dId, dayMap] of doctorDayMap) {
    for (const [dayOfWeek, hours] of dayMap) {
      try {
        await prisma.workingHours.upsert({
          where: { doctorId_dayOfWeek: { doctorId: dId, dayOfWeek } },
          create: { doctorId: dId, dayOfWeek, startTime: hours.start, endTime: hours.end },
          update: { startTime: hours.start, endTime: hours.end },
        });
        whOk++;
      } catch { /* skip */ }
    }
  }
  console.log(`  Imported ${whOk} working hours entries`);

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log("\n✓ Import complete!");
  console.log(`  Specialties         : ${await prisma.specialty.count()}`);
  console.log(`  Cities              : ${await prisma.city.count()}`);
  console.log(`  Doctors             : ${await prisma.doctor.count()}`);
  console.log(`  Establishments      : ${await prisma.establishment.count()}`);
  console.log(`  Medications         : ${await prisma.medication.count()}`);
  console.log(`  Users (patients)    : ${await prisma.user.count({ where: { role: "PATIENT" } })}`);
  console.log(`  Reviews             : ${await prisma.review.count()}`);
  console.log(`  Contact requests    : ${await prisma.contactRequest.count()}`);
  console.log(`  Medication reviews  : ${await prisma.medicationReview.count()}`);
  console.log(`  Establishment reviews: ${await prisma.establishmentReview.count()}`);
  console.log(`  Working hours       : ${await prisma.workingHours.count()}`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
