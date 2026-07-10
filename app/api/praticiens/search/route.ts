import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";
import { getCachedDoctors, PRATICIENS_PAGE_SIZE } from "@/lib/praticiens-query";

// Résultats filtrés/paginés du listing praticiens (JSON), consommés côté client
// par PraticiensResults. Permet à la page /praticiens de rester STATIQUE (le
// serveur ne lit plus searchParams) : seuls les filtres déclenchent cet appel.
// Données déjà mises en cache 5 min (getCachedDoctors) → même bénéfice de charge.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q          = (searchParams.get("q") ?? "").trim();
  const specialite = (searchParams.get("specialite") ?? "").trim();
  const villeRaw   = (searchParams.get("ville") ?? "").trim();
  const ville      = villeRaw ? slugify(villeRaw) : "";
  const page       = Math.max(1, Number(searchParams.get("page")) || 1);

  const { doctors, total } = await getCachedDoctors(q, specialite, ville, page);
  const totalPages = Math.ceil(total / PRATICIENS_PAGE_SIZE);

  return NextResponse.json(
    { doctors, total, totalPages, page },
    // Réponse cacheable côté CDN aussi (mêmes filtres → même liste 5 min).
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
