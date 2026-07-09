/**
 * Reseed correctif : réaffecte les réponses Q/R signées par un médecin dont la
 * spécialité est cliniquement INVRAISEMBLABLE pour la question (ex. un
 * néphrologue répondant à une douleur au genou). Casse le pilier E-E-A-T de
 * l'espace Q/R (cf. audit 6 juil. 2026).
 *
 * Règle de vraisemblance — une réponse est acceptable si le répondeur est :
 *   1. de la spécialité EXACTE de la question, OU
 *   2. médecin généraliste (répond légitimement à tout), OU
 *   3. d'une spécialité cliniquement ADJACENTE (table PLAUSIBLE ci-dessous).
 * Sinon, la réponse est réaffectée à un médecin vérifié/actif, en préférant :
 *   spécialité de la question → adjacente → médecine générale (repli sûr).
 *
 * Idempotent. Dry-run par défaut ; passer `--apply` pour écrire.
 *   npx tsx --env-file=.env scripts/reseed-qa-answer-doctors.ts
 *   npx tsx --env-file=.env scripts/reseed-qa-answer-doctors.ts --apply
 */
import { prisma } from "../lib/prisma";
import { recomputeAnswerScore } from "../lib/qa";

const APPLY = process.argv.includes("--apply");
const GENERALIST = "Médecine générale";
const POOL_SIZE = 60; // médecins candidats récupérés par spécialité (rotation)

// Adjacence clinique : spécialités jugées plausibles pour répondre à une
// question d'une spécialité donnée (au-delà du match exact + généraliste).
// Sert À LA FOIS au test de vraisemblance et au choix de la cible de repli.
// Clé = nom exact de la spécialité de la question. Extensible sans risque.
const PLAUSIBLE: Record<string, string[]> = {
  "Médecine générale": ["Médecine interne", "Rhumatologie", "Traumatologie orthopédie"],
  "Andrologie": ["Urologie et chirurgie urologique"],
  "Tabacologie": ["Pneumo-phtisiologie", "Psychiatrie"],
  "Addictologie clinique": ["Psychiatrie"],
  "Rhumatologie": ["Traumatologie orthopédie", "Médecine interne"],
  "Traumatologie orthopédie": ["Rhumatologie"],
  "Endocrinologie et maladies métaboliques": ["Médecine interne", "Nutrition"],
  "Nutrition": ["Endocrinologie et maladies métaboliques"],
};

type Cand = { id: string; slug: string | null; specialtyName: string };

// Cache des pools de candidats par spécialité (nom → liste ordonnée).
const poolCache = new Map<string, Cand[]>();

async function poolFor(specialtyName: string): Promise<Cand[]> {
  const cached = poolCache.get(specialtyName);
  if (cached) return cached;
  const docs = await prisma.doctor.findMany({
    where: {
      isActive: true,
      isVerified: true,
      isBlacklisted: false,
      slug: { not: null },
      specialty: { name: specialtyName },
    },
    // Déterministe : meilleurs d'abord, départage par id.
    orderBy: [{ averageRating: "desc" }, { id: "asc" }],
    take: POOL_SIZE,
    select: { id: true, slug: true, specialty: { select: { name: true } } },
  });
  const pool = docs.map((d) => ({ id: d.id, slug: d.slug, specialtyName: d.specialty.name }));
  poolCache.set(specialtyName, pool);
  return pool;
}

function isPlausible(qSpec: string | null, dSpec: string): boolean {
  if (!qSpec) return dSpec === GENERALIST; // question sans spécialité → seul le généraliste est « sûr »
  if (dSpec === qSpec) return true;
  if (dSpec === GENERALIST) return true;
  return (PLAUSIBLE[qSpec] ?? []).includes(dSpec);
}

// Cible de repli : spécialité de la question → adjacentes → médecine générale.
async function pickTarget(qSpec: string | null, exclude: Set<string>): Promise<Cand | null> {
  const order = [
    ...(qSpec ? [qSpec] : []),
    ...(qSpec ? PLAUSIBLE[qSpec] ?? [] : []),
    GENERALIST,
  ];
  for (const specName of order) {
    const pool = await poolFor(specName);
    const pick = pool.find((c) => !exclude.has(c.id));
    if (pick) return pick;
  }
  return null;
}

async function main() {
  const questions = await prisma.question.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true, slug: true, title: true,
      specialty: { select: { name: true } },
      answers: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "asc" },
        select: { id: true, doctorId: true, doctor: { select: { slug: true, specialty: { select: { name: true } } } } },
      },
    },
  });

  let planned = 0;
  let applied = 0;
  const skippedNoTarget: string[] = [];

  for (const q of questions) {
    const qSpec = q.specialty?.name ?? null;
    // Médecins déjà retenus (réponses plausibles) → éviter les doublons intra-question.
    const used = new Set<string>();
    for (const a of q.answers) {
      if (isPlausible(qSpec, a.doctor.specialty.name)) used.add(a.doctorId);
    }

    for (const a of q.answers) {
      const dSpec = a.doctor.specialty.name;
      if (isPlausible(qSpec, dSpec)) continue;

      const target = await pickTarget(qSpec, used);
      if (!target) {
        skippedNoTarget.push(`${q.slug} (${qSpec ?? "sans spécialité"})`);
        continue;
      }
      used.add(target.id);
      planned++;
      console.log(
        `${APPLY ? "→" : "·"} "${q.title}"\n` +
          `    question: ${qSpec ?? "(aucune)"}\n` +
          `    AVANT : ${a.doctor.slug} [${dSpec}]  →  APRÈS : ${target.slug} [${target.specialtyName}]`,
      );

      if (APPLY) {
        await prisma.answer.update({ where: { id: a.id }, data: { doctorId: target.id } });
        await recomputeAnswerScore(a.id);
        applied++;
      }
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Réponses invraisemblables détectées : ${planned}`);
  if (APPLY) console.log(`Réponses réaffectées (écrites)      : ${applied}`);
  else console.log(`Mode DRY-RUN — relancer avec --apply pour écrire.`);
  if (skippedNoTarget.length) {
    console.log(`\n⚠ Aucun médecin cible trouvé pour : ${skippedNoTarget.join(", ")}`);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
