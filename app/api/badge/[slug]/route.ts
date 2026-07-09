import { prisma } from "@/lib/prisma";

// Le badge n'est servi que pour un praticien VÉRIFIÉ et actif : seul un médecin
// contrôlé peut l'afficher (le badge est un signal de confiance, pas un simple
// visuel). Mis en cache agressivement (contenu stable).
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const doctor = await prisma.doctor.findUnique({
    where: { slug },
    select: { isVerified: true, isActive: true },
  });

  if (!doctor || !doctor.isVerified || !doctor.isActive) {
    return new Response("Badge indisponible", { status: 404 });
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="56" viewBox="0 0 220 56" role="img" aria-label="Praticien vérifié sur SantéauMaroc">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2563eb"/>
      <stop offset="1" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="219" height="55" rx="11" fill="#ffffff" stroke="#e2e8f0"/>
  <rect x="0.5" y="0.5" width="219" height="4" rx="2" fill="url(#g)"/>
  <circle cx="34" cy="30" r="15" fill="url(#g)"/>
  <path d="M27 30.5l4.5 4.5L42 25" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="60" y="27" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#0f172a">Praticien vérifié</text>
  <text x="60" y="43" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="600" fill="#2563eb">santeaumaroc.com</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
