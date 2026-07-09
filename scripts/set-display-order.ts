/**
 * Set display order for specialties and cities in dropdown lists.
 * Run ONCE after applying migration 20260613120000_add_display_order:
 *
 *   npx prisma migrate deploy   (or prisma db push)
 *   npx tsx scripts/set-display-order.ts
 *
 * Items not listed here keep order = 999 and appear alphabetically after the featured ones.
 * To reorder, edit the arrays below and re-run the script.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

// ── Villes prioritaires (par importance médicale au Maroc) ──────────────────

const CITY_PRIORITIES: Record<string, number> = {
  "Casablanca":    1,
  "Rabat":         2,
  "Fès":           3,
  "Marrakech":     4,
  "Tanger":        5,
  "Agadir":        6,
  "Meknès":        7,
  "Oujda":         8,
  "Kénitra":       9,
  "Tétouan":      10,
  "Laâyoune":     11,
  "Béni Mellal":  12,
  "El Jadida":    13,
  "Nador":        14,
  "Settat":       15,
  "Safi":         16,
  "Mohammedia":   17,
  "Khouribga":    18,
  "Dakhla":       19,
  "Ifrane":       20,
};

// ── Spécialités prioritaires (par fréquence de consultation) ────────────────

const SPECIALTY_PRIORITIES: Record<string, number> = {
  "Médecine générale":                        1,
  "Pédiatrie":                                2,
  "Gynéco-obstétrique":                       3,
  "Gynéco-obstétrique et sexologie":          3,
  "Cardiologie":                              4,
  "Traumatologie orthopédie":                 5,
  "Ophtalmologie":                            6,
  "Dermatologie":                             7,
  "Oto-rhino-laryngologie":                   8,
  "Neurologie":                               9,
  "Gastro-entérologie":                      10,
  "Psychiatrie":                             11,
  "Endocrinologie et maladies métaboliques": 12,
  "Chirurgie générale":                      13,
  "Radiologie":                              14,
  "Urologie et chirurgie urologique":        15,
  "Rhumatologie":                            16,
  "Pneumo-phtisiologie":                     17,
  "Néphrologie":                             18,
  "Médecine interne":                        19,
  "Anesthésie-réanimation":                  20,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.trim().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function findPriority(
  name: string,
  priorities: Record<string, number>,
): number {
  // Exact match first
  if (name in priorities) return priorities[name];
  // Case-insensitive / accent-insensitive fallback
  const norm = normalize(name);
  for (const [key, order] of Object.entries(priorities)) {
    if (normalize(key) === norm) return order;
  }
  return 999;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Setting display order for cities…");

  const cities = await prisma.city.findMany({ select: { id: true, name: true } });
  let citiesUpdated = 0;

  for (const city of cities) {
    const order = findPriority(city.name, CITY_PRIORITIES);
    if (order !== 999) {
      await prisma.city.update({ where: { id: city.id }, data: { order } });
      console.log(`  ✓ ${city.name} → ${order}`);
      citiesUpdated++;
    }
  }
  console.log(`  ${citiesUpdated} villes mises à jour, ${cities.length - citiesUpdated} à 999.\n`);

  console.log("Setting display order for specialties…");

  const specialties = await prisma.specialty.findMany({ select: { id: true, name: true } });
  let specUpdated = 0;

  for (const spec of specialties) {
    const order = findPriority(spec.name, SPECIALTY_PRIORITIES);
    if (order !== 999) {
      await prisma.specialty.update({ where: { id: spec.id }, data: { order } });
      console.log(`  ✓ ${spec.name} → ${order}`);
      specUpdated++;
    }
  }
  console.log(`  ${specUpdated} spécialités mises à jour, ${specialties.length - specUpdated} à 999.\n`);

  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
