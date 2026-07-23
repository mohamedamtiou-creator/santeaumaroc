import { redirect } from "next/navigation";
import { connection } from "next/server";
import { verifySession } from "@/lib/dal";
import { toLocale, localeHref } from "@/lib/i18n";
import { canReview } from "@/lib/contributor";

/**
 * Hub de redirection « Mon espace » — aiguille l'utilisateur connecté vers son
 * espace selon son RÔLE PRIMAIRE. Permet au chrome (navbar/footer) de rester
 * statique : il pointe vers cette URL stable et NE lit aucun cookie ; c'est ici,
 * dans une route dynamique, que la vraie session est résolue.
 *
 * Cas « médecin + auteur » : le rôle reste DOCTOR → espace praticien. L'accès à
 * l'espace auteur se fait par le lien croisé du tableau de bord praticien.
 */
export const dynamic = "force-dynamic";

export default async function MonEspacePage({ params }: { params: Promise<{ lang: string }> }) {
  // Exclut explicitement la route du prérendu / route cache : la redirection est
  // TOUJOURS recalculée à la requête (même en accès direct / bookmark), jamais servie
  // depuis un cache statique. Ceinture-bretelles avec `dynamic = "force-dynamic"`.
  await connection();
  const locale = toLocale((await params).lang);
  const session = await verifySession(); // redirige vers /connexion si non connecté

  let target = "/tableau-de-bord"; // patient par défaut
  if (session.role === "ADMIN") target = "/admin";
  else if (canReview(session.role)) target = "/admin/articles"; // EDITOR (relecteur médical)
  else if (session.role === "DOCTOR") target = "/praticien/tableau-de-bord";
  else if (session.role === "CONTRIBUTOR") target = "/espace-auteur";

  redirect(localeHref(locale, target));
}
