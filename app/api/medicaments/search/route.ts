import { NextResponse } from "next/server";
import { getMedications, MEDICATIONS_PAGE_SIZE } from "@/lib/medications-query";

// Résultats filtrés/paginés des médicaments (recherche `q`, forme), consommés
// côté client par MedicationResults → permet à /medicaments de rester STATIQUE.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const { medications, total } = await getMedications(
    (searchParams.get("q") ?? "").trim(),
    (searchParams.get("forme") ?? "").trim(),
    Math.max(1, Number(searchParams.get("page")) || 1),
  );
  const totalPages = Math.ceil(total / MEDICATIONS_PAGE_SIZE);
  return NextResponse.json(
    { medications, total, totalPages },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } },
  );
}
