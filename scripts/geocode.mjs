// Géocodage batch résumable des villes, établissements et fiches praticiens.
//
// Alimente les champs latitude/longitude (schema geo / SEO local). Idempotent :
// ne traite que les lignes SANS coordonnées, donc relançable sans doublon.
//
// Fournisseur par défaut : Nominatim (OpenStreetMap) — gratuit, sans clé, mais
// limité à 1 req/s (usage policy). Pour un gros volume (≥ ~20 k fiches),
// préférer un fournisseur dédié via GEOCODER_BASE (format compatible Nominatim).
//
// Usage :
//   node scripts/geocode.mjs cities              # géocode les villes (priorité)
//   node scripts/geocode.mjs establishments 500  # 500 établissements max
//   node scripts/geocode.mjs doctors 1000        # 1000 fiches max
//
// Env :
//   GEOCODER_BASE     URL de base (def. https://nominatim.openstreetmap.org/search)
//   GEOCODE_CONTACT   e-mail de contact pour le User-Agent (requis par Nominatim)
//   GEOCODE_DELAY_MS  délai entre requêtes (def. 1100)

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma v7 : driver adapter obligatoire (cf. lib/prisma.ts).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter, log: ["error"] });

const BASE = process.env.GEOCODER_BASE ?? "https://nominatim.openstreetmap.org/search";
const CONTACT = process.env.GEOCODE_CONTACT ?? "contact@santeaumaroc.com";
const DELAY_MS = Number(process.env.GEOCODE_DELAY_MS ?? 1100);
const UA = `SanteauMaroc-geocoder/1.0 (${CONTACT})`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(query) {
  const url = `${BASE}?format=json&limit=1&countrycodes=ma&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "fr" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const { lat, lon } = data[0];
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

async function runCities() {
  const cities = await prisma.city.findMany({
    where: { OR: [{ latitude: null }, { longitude: null }] },
    select: { id: true, name: true },
    orderBy: { order: "asc" },
  });
  console.log(`Villes à géocoder : ${cities.length}`);
  let ok = 0, miss = 0;
  for (const c of cities) {
    try {
      const g = await geocode(`${c.name}, Maroc`);
      if (g) { await prisma.city.update({ where: { id: c.id }, data: g }); ok++; }
      else { miss++; console.warn(`  ✕ introuvable : ${c.name}`); }
    } catch (e) { miss++; console.warn(`  ✕ erreur ${c.name} : ${e.message}`); }
    await sleep(DELAY_MS);
  }
  console.log(`Villes : ${ok} géocodées, ${miss} échecs.`);
}

// Géocodage PRÉCIS (Nominatim) : cible les établissements sans coordonnées OU
// avec un repli ville approximatif (geoApprox), pour les affiner. Succès →
// coordonnées exactes + geoApprox=false.
async function runEstablishments(limit) {
  const rows = await prisma.establishment.findMany({
    where: { isActive: true, OR: [{ latitude: null }, { longitude: null }, { geoApprox: true }] },
    select: { id: true, nom: true, adresse: true, city: { select: { name: true } } },
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
  console.log(`Établissements à géocoder finement (lot) : ${rows.length}`);
  let ok = 0, miss = 0;
  for (const e of rows) {
    const q = [e.adresse, e.city?.name, "Maroc"].filter(Boolean).join(", ");
    try {
      const g = await geocode(q);
      if (g) { await prisma.establishment.update({ where: { id: e.id }, data: { ...g, geoApprox: false } }); ok++; }
      else { miss++; }
    } catch (err) { miss++; console.warn(`  ✕ ${e.nom} : ${err.message}`); }
    await sleep(DELAY_MS);
  }
  console.log(`Établissements (précis) : ${ok} géocodés, ${miss} échecs.`);
}

// Repli CENTROÏDE VILLE : attribue instantanément aux établissements sans
// coordonnées celles de leur ville (déjà géocodée), marquées geoApprox=true.
// Aucun appel externe. Un passage `establishments` précis les affinera ensuite.
async function runEstablishmentsCity() {
  const cities = await prisma.city.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    select: { id: true, name: true, latitude: true, longitude: true },
  });
  console.log(`Villes géocodées disponibles pour le repli : ${cities.length}`);
  let total = 0;
  for (const c of cities) {
    const r = await prisma.establishment.updateMany({
      where: { isActive: true, cityId: c.id, latitude: null },
      data: { latitude: c.latitude, longitude: c.longitude, geoApprox: true },
    });
    total += r.count;
  }
  console.log(`Repli ville appliqué : ${total} établissements (approximatifs).`);
}

async function runDoctors(limit) {
  const rows = await prisma.doctor.findMany({
    where: { isActive: true, OR: [{ latitude: null }, { longitude: null }] },
    select: { id: true, adresse: true, city: { select: { name: true } } },
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
  console.log(`Fiches à géocoder (lot) : ${rows.length}`);
  let ok = 0, miss = 0;
  for (const d of rows) {
    const q = [d.adresse, d.city?.name, "Maroc"].filter(Boolean).join(", ");
    try {
      const g = await geocode(q);
      if (g) { await prisma.doctor.update({ where: { id: d.id }, data: g }); ok++; }
      else { miss++; }
    } catch (err) { miss++; console.warn(`  ✕ ${err.message}`); }
    await sleep(DELAY_MS);
  }
  console.log(`Fiches : ${ok} géocodées, ${miss} échecs.`);
}

const mode = process.argv[2] ?? "cities";
const limit = Number(process.argv[3] ?? 200);

const run = mode === "cities" ? runCities()
  : mode === "establishments" ? runEstablishments(limit)
  : mode === "establishments-city" ? runEstablishmentsCity()
  : mode === "doctors" ? runDoctors(limit)
  : Promise.reject(new Error(`Mode inconnu : ${mode}`));

run
  .catch((e) => { console.error("FATAL:", e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
