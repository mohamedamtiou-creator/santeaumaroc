import { NextResponse } from "next/server";
import { getVilleDoctors } from "@/lib/ville-doctors";
import { PRATICIENS_PAGE_SIZE } from "@/lib/praticiens-query";

// Résultats filtrés/paginés du listing d'une ville (JSON), consommés côté client
// par VilleResults → permet à /villes/[slug] de rester STATIQUE. Cachés 1 h.
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const { doctors, total } = await getVilleDoctors(
    slug,
    (searchParams.get("specialite") ?? "").trim(),
    Math.max(1, Number(searchParams.get("page")) || 1),
  );
  const totalPages = Math.ceil(total / PRATICIENS_PAGE_SIZE);
  return NextResponse.json(
    { doctors, total, totalPages },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } },
  );
}
