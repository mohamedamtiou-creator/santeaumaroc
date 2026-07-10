import { NextResponse } from "next/server";
import { getSpecialtyDoctors } from "@/lib/specialite-doctors";
import { PRATICIENS_PAGE_SIZE } from "@/lib/praticiens-query";

// Résultats filtrés/tri/paginés du listing d'une spécialité (JSON), consommés
// côté client par SpecialtyResults → permet à /specialites/[slug] de rester
// STATIQUE (le serveur ne lit plus searchParams). Données cachées 1 h.
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const { doctors, total } = await getSpecialtyDoctors(slug, {
    ville:  (searchParams.get("ville")  ?? "").trim(),
    tri:    (searchParams.get("tri")    ?? "").trim(),
    dispo:  (searchParams.get("dispo")  ?? "").trim(),
    conv:   (searchParams.get("conv")   ?? "").trim(),
    langue: (searchParams.get("langue") ?? "").trim(),
    q:      (searchParams.get("q")      ?? "").trim(),
    page:   Math.max(1, Number(searchParams.get("page")) || 1),
  });
  const totalPages = Math.ceil(total / PRATICIENS_PAGE_SIZE);
  return NextResponse.json(
    { doctors, total, totalPages },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } },
  );
}
