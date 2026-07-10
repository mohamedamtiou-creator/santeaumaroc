import { prisma } from "@/lib/prisma";
import { cachedQuery, decToNum } from "@/lib/cache";

export const MEDICATIONS_PAGE_SIZE = 30;

export type FormeFilter = { query: string; label: string };

export const MEDICATION_FORMES: FormeFilter[] = [
  { query: "comprim", label: "Comprimé"     },
  { query: "gelule",  label: "Gélule"       },
  { query: "sirop",   label: "Sirop"        },
  { query: "inject",  label: "Injectable"   },
  { query: "pommade", label: "Pommade"      },
  { query: "supposi", label: "Suppositoire" },
  { query: "goutte",  label: "Gouttes"      },
];

export type MedicationCardDTO = {
  id: string;
  slug: string | null;
  nom: string;
  dci: string | null;
  forme: string | null;
  dosage: string | null;
  uniteDosage: string | null;
  princepsGenerique: string | null;
  avg: number;
  reviewsCount: number;
};

export type MedicationsResult = { medications: MedicationCardDTO[]; total: number };

function sanitize(s: string | null | undefined): string {
  if (s == null) return "";
  return s.replace(/[\r\n\t\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, " ").trim();
}

/**
 * Liste médicaments (filtre forme / recherche `q`, paginée), cache durable 1 h.
 * Source UNIQUE partagée par la vue canonique SSR ET la route API client
 * /api/medicaments/search. La note est agrégée en `avg`/`reviewsCount` (JSON-safe).
 */
export function getMedications(q: string, forme: string, page: number): Promise<MedicationsResult> {
  const query = (q ?? "").trim();
  const f = (forme ?? "").trim();
  const p = Math.max(1, page || 1);
  const key = `medications:${query}:${f}:${p}`;

  return cachedQuery(key, 3600, async () => {
    const where = {
      isActive: true,
      ...(f ? { forme: { contains: f, mode: "insensitive" as const } } : {}),
      ...(query ? {
        OR: [
          { nom: { contains: query, mode: "insensitive" as const } },
          { dci: { contains: query, mode: "insensitive" as const } },
        ],
      } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.medication.findMany({
        where,
        select: {
          id: true, slug: true, nom: true, dci: true, forme: true,
          dosage: true, uniteDosage: true, princepsGenerique: true,
          reviews: { select: { note: true }, where: { isPublic: true } },
        },
        orderBy: [{ reviews: { _count: "desc" } }, { nom: "asc" }],
        take: MEDICATIONS_PAGE_SIZE,
        skip: (p - 1) * MEDICATIONS_PAGE_SIZE,
      }),
      prisma.medication.count({ where }),
    ]);
    const medications: MedicationCardDTO[] = rows.map((m) => ({
      id: m.id,
      slug: m.slug,
      nom: sanitize(m.nom),
      dci: sanitize(m.dci) || null,
      forme: sanitize(m.forme) || null,
      dosage: sanitize(m.dosage) || null,
      uniteDosage: sanitize(m.uniteDosage) || null,
      princepsGenerique: m.princepsGenerique,
      avg: m.reviews.length > 0 ? m.reviews.reduce((s, r) => s + r.note, 0) / m.reviews.length : 0,
      reviewsCount: m.reviews.length,
    }));
    return { medications, total };
  });
}

/**
 * Détail d'un médicament (fiche + avis publics + compteur), cache DURABLE 1 h.
 * Source UNIQUE partagée par `generateMetadata` ET le rendu → une requête DB par
 * slug/heure au lieu de deux à chaque requête (page dynamique).
 *
 * ⚠️ Les prix `ppv`/`ph`/`prixBR` sont des `Prisma.Decimal` → convertis en
 * `number | null` via {@link decToNum} AVANT le cache (le Data Cache sérialise en
 * JSON : un Decimal désérialisé perd son prototype et `.toFixed()` planterait).
 * Les usages page passent tous par `Number(...)` → compatibles avec `number`.
 */
export function getMedicationDetail(slug: string) {
  return cachedQuery(`medication:${slug}`, 3600, async () => {
    const m = await prisma.medication.findUnique({
      where: { slug },
      include: {
        reviews: { where: { isPublic: true }, orderBy: { createdAt: "desc" }, take: 100 },
        _count:  { select: { reviews: true } },
      },
    });
    if (!m) return null;
    return { ...m, ppv: decToNum(m.ppv), ph: decToNum(m.ph), prixBR: decToNum(m.prixBR) };
  });
}

/** Formes triées par nombre de médicaments (pour les chips de filtre), cachées 1 h. */
export function getMedicationFormes(): Promise<FormeFilter[]> {
  return cachedQuery("medications:formes", 3600, async () => {
    const counts = await Promise.all(
      MEDICATION_FORMES.map(async (f) => ({
        ...f,
        count: await prisma.medication.count({
          where: { isActive: true, forme: { contains: f.query, mode: "insensitive" } },
        }),
      })),
    );
    return counts.sort((a, b) => b.count - a.count).map(({ query, label }) => ({ query, label }));
  });
}
