import { NextResponse } from "next/server";
import { getFiltersData } from "@/lib/praticiens-query";

/**
 * Listes de filtres (97 spécialités, 247 villes) servies à la demande.
 *
 * POURQUOI une route plutôt que des props — rendues dans le HTML, ces listes
 * coûtaient 344 `<option>` (17 % de TOUS les nœuds de /praticiens) et 17,7 KB ;
 * passées en props à SearchFilters, elles pesaient 15,5 KB de plus dans le
 * payload RSC. Or l'écrasante majorité des visiteurs ne déroule jamais un filtre.
 * Le combobox ne les charge donc qu'au premier focus.
 *
 * Référentiel pur : il ne bouge qu'à l'import de données. D'où un s-maxage long
 * et un SWR d'une semaine — en pratique la réponse est toujours servie par le CDN,
 * et la latence perçue à l'ouverture du filtre est celle d'un cache edge.
 */
export async function GET() {
  const { specialties, cities } = await getFiltersData();
  return NextResponse.json(
    { specialties, cities },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
