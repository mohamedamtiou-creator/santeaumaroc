/**
 * Backfill unique de Doctor.reviewsCount (colonne dénormalisée) à partir du
 * nombre réel d'avis. À lancer UNE FOIS après le `prisma db push` qui ajoute la
 * colonne. Ensuite, features/reviews/actions.ts maintient la valeur en continu
 * (create/update d'avis). Aucune suppression d'avis au runtime → pas d'autre
 * point de sync.
 *
 *   npx tsx --env-file=.env scripts/backfill-reviews-count.ts
 */
import { prisma } from "../lib/prisma";

async function main() {
  // Un seul UPDATE agrégé (≪ boucle sur 20k médecins). Ne touche que les lignes
  // qui diffèrent (idempotent). Les médecins sans avis restent à 0 (défaut colonne).
  const affected = await prisma.$executeRaw`
    UPDATE "doctors" AS d
    SET "reviewsCount" = sub.c
    FROM (
      SELECT "doctorId", COUNT(*)::int AS c
      FROM "reviews"
      GROUP BY "doctorId"
    ) AS sub
    WHERE d.id = sub."doctorId" AND d."reviewsCount" <> sub.c
  `;
  console.log(`✓ reviewsCount backfillé — ${affected} médecin(s) mis à jour.`);

  // Contrôle : cohérence reviewsCount vs comptage réel sur le top 3.
  const top = await prisma.doctor.findMany({
    where:   { reviewsCount: { gt: 0 } },
    orderBy: { reviewsCount: "desc" },
    take:    3,
    select:  { nom: true, prenom: true, reviewsCount: true, _count: { select: { reviews: true } } },
  });
  for (const d of top) {
    const ok = d.reviewsCount === d._count.reviews ? "✓" : "✗ INCOHÉRENT";
    console.log(`  ${ok} ${d.prenom ?? ""} ${d.nom ?? ""} → reviewsCount=${d.reviewsCount}, réel=${d._count.reviews}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
