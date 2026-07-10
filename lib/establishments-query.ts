import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/cache";

export const ESTAB_PAGE_SIZE = 20;

export type EstablishmentCardDTO = {
  id: string;
  slug: string | null;
  nom: string;
  type: string | null;
  adresse: string | null;
  isVerified: boolean;
  averageRating: number;
  city: { name: string; slug: string };
  _count: { reviews: number };
};

export type EstablishmentsResult = { establishments: EstablishmentCardDTO[]; total: number };

// Retire les caractères de contrôle (newlines/tabs) : un \n littéral dans un chunk
// RSC/JSON casse la balise <script> qui l'enrobe.
function sanitize(s: string | null | undefined): string {
  if (s == null) return "";
  return s.replace(/[\r\n\t\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, " ").trim();
}

/**
 * Liste d'établissements (filtre ville / recherche `q`, paginée), mise en cache
 * durable 1 h. Source UNIQUE partagée par la vue canonique SSR ET la route API
 * client /api/etablissements/search → statique + filtres client cohérents.
 */
export function getEstablishments(types: string[], ville: string, q: string, page: number): Promise<EstablishmentsResult> {
  const p = Math.max(1, page || 1);
  const v = (ville ?? "").trim();
  const query = (q ?? "").trim();
  const key = `establishments:${types.join(",")}:${v}:${query}:${p}`;

  return cachedQuery(key, 3600, async () => {
    const where = {
      isActive: true,
      type: { in: types },
      ...(v ? { city: { slug: v } } : {}),
      ...(query ? {
        OR: [
          { nom:     { contains: query, mode: "insensitive" as const } },
          { adresse: { contains: query, mode: "insensitive" as const } },
        ],
      } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.establishment.findMany({
        where,
        include: {
          city:   { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: [{ isVerified: "desc" }, { averageRating: "desc" }, { nom: "asc" }],
        take: ESTAB_PAGE_SIZE,
        skip: (p - 1) * ESTAB_PAGE_SIZE,
      }),
      prisma.establishment.count({ where }),
    ]);
    const establishments: EstablishmentCardDTO[] = rows.map((e) => ({
      id: e.id,
      slug: e.slug,
      nom: sanitize(e.nom),
      type: e.type,
      adresse: sanitize(e.adresse) || null,
      isVerified: e.isVerified,
      averageRating: e.averageRating,
      city: { name: sanitize(e.city.name) || e.city.name, slug: e.city.slug },
      _count: { reviews: e._count.reviews },
    }));
    return { establishments, total };
  });
}

/** Villes pour le sélecteur de filtre (triées par nb d'établissements), cachées 1 h. */
export function getEstablishmentCities(): Promise<{ slug: string; name: string }[]> {
  return cachedQuery("establishments:cities", 3600, async () => {
    const cities = await prisma.city.findMany({
      select: { slug: true, name: true },
      orderBy: { establishments: { _count: "desc" } },
    });
    return cities.map((c) => ({ slug: c.slug, name: sanitize(c.name) || c.name }));
  });
}
