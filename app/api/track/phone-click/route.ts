import { prisma } from "@/lib/prisma";

// Enregistre un clic sur le lien `tel:` d'une fiche praticien.
// — Endpoint public, non authentifié : appelé en fire-and-forget (navigator.sendBeacon)
//   au moment où le patient tape le numéro. On ne renvoie jamais d'erreur au client.
// — Best-effort : un doctorId invalide viole la FK → on avale l'erreur silencieusement.
//   Le bruit (bots, double-clics) est toléré ; l'usage est un KPI de tendance, pas une facture.
export const dynamic = "force-dynamic";

const SOURCES = new Set(["profile", "listing", "card"]);

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { doctorId?: unknown; source?: unknown }
      | null;

    const doctorId = typeof body?.doctorId === "string" ? body.doctorId : null;
    const source =
      typeof body?.source === "string" && SOURCES.has(body.source) ? body.source : "profile";

    if (doctorId) {
      // .catch : si le médecin n'existe pas (FK) ou toute autre erreur DB, on ignore.
      await prisma.phoneClick.create({ data: { doctorId, source } }).catch(() => {});
    }
  } catch {
    // fire-and-forget : jamais d'erreur remontée
  }
  // 204 No Content — le client n'attend pas de réponse.
  return new Response(null, { status: 204 });
}
