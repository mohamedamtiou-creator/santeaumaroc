/**
 * Backfill de gouvernance « L'essentiel » (cf. lib/qa-summary + audit 6 juil.).
 * Aligne les données existantes sur l'invariant : un résumé n'existe que s'il
 * dérive d'une réponse ACCEPTÉE publiée.
 *
 *  - question avec aiSummary + réponse acceptée publiée → trace la provenance
 *    (aiSummarySourceAnswerId + aiSummaryAt) si absente ;
 *  - question avec aiSummary MAIS sans réponse acceptée publiée → orpheline :
 *    on efface le résumé (repli sûr).
 *
 * Idempotent. Dry-run par défaut ; `--apply` pour écrire.
 *   npx tsx --env-file=.env scripts/backfill-qa-summary-source.ts
 *   npx tsx --env-file=.env scripts/backfill-qa-summary-source.ts --apply
 */
import { prisma } from "../lib/prisma";

const APPLY = process.argv.includes("--apply");

async function main() {
  const questions = await prisma.question.findMany({
    where: { aiSummary: { not: null } },
    select: {
      id: true, slug: true, aiSummarySourceAnswerId: true, aiSummaryAt: true,
      lastAnswerAt: true, publishedAt: true, createdAt: true,
      answers: {
        where: { status: "PUBLISHED", isAccepted: true },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { id: true },
      },
    },
  });

  let stamped = 0;
  let cleared = 0;
  let alreadyOk = 0;

  for (const q of questions) {
    const accepted = q.answers[0] ?? null;

    if (!accepted) {
      // Orpheline : résumé sans réponse acceptée publiée → effacer.
      cleared++;
      console.log(`✗ orphelin → efface : ${q.slug}`);
      if (APPLY) {
        await prisma.question.update({
          where: { id: q.id },
          data: { aiSummary: null, aiSummaryAr: null, aiSummarySourceAnswerId: null, aiSummaryAt: null },
        });
      }
      continue;
    }

    if (q.aiSummarySourceAnswerId === accepted.id && q.aiSummaryAt) {
      alreadyOk++;
      continue;
    }

    // Trace la provenance sur la réponse acceptée.
    stamped++;
    console.log(`→ trace source : ${q.slug}  (answer ${accepted.id})`);
    if (APPLY) {
      await prisma.question.update({
        where: { id: q.id },
        data: {
          aiSummarySourceAnswerId: accepted.id,
          aiSummaryAt: q.aiSummaryAt ?? q.lastAnswerAt ?? q.publishedAt ?? q.createdAt,
        },
      });
    }
  }

  console.log(`\n${"─".repeat(56)}`);
  console.log(`Questions avec résumé      : ${questions.length}`);
  console.log(`  déjà conformes           : ${alreadyOk}`);
  console.log(`  provenance tracée        : ${stamped}`);
  console.log(`  orphelins effacés        : ${cleared}`);
  if (!APPLY) console.log(`\nMode DRY-RUN — relancer avec --apply pour écrire.`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
