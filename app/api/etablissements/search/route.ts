import { NextResponse } from "next/server";
import { getEstablishments, ESTAB_PAGE_SIZE } from "@/lib/establishments-query";

// Résultats filtrés/paginés des établissements (recherche `q`, ville), consommés
// côté client par EstablishmentResults → permet aux pages /cliniques /pharmacies
// /laboratoires de rester STATIQUES. `types` = liste séparée par des virgules.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const types = (searchParams.get("types") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (types.length === 0) {
    return NextResponse.json({ establishments: [], total: 0, totalPages: 0 });
  }
  const { establishments, total } = await getEstablishments(
    types,
    (searchParams.get("ville") ?? "").trim(),
    (searchParams.get("q") ?? "").trim(),
    Math.max(1, Number(searchParams.get("page")) || 1),
  );
  const totalPages = Math.ceil(total / ESTAB_PAGE_SIZE);
  return NextResponse.json(
    { establishments, total, totalPages },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } },
  );
}
