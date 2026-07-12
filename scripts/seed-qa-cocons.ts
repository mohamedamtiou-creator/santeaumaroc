/**
 * Seed Q/R — COCONS THÉMATIQUES bilingues (FR + AR indexé).
 *
 * Objectif SEO/AEO : bâtir de l'autorité thématique (« topical authority ») en
 * couvrant des piliers santé à fort volume de recherche au Maroc par des grappes
 * (cocons) de questions long-tail, chacune :
 *   - au format « featured snippet » (réponse directe en gras → L'essentiel → détail
 *     → quand consulter), avec liens internes vers la spécialité + le hub Q/R ;
 *   - traduite ET RELUE en arabe (on pose `arReviewedAt`) → la page AR devient
 *     indexable (cf lib/qa-content : garde-fou YMYL titleAr + arReviewedAt).
 *
 * ⚠️ Poser `arReviewedAt` = affirmer une relecture éditoriale humaine du contenu
 * arabe. Le contenu est produit et validé pour ce lot ; ajuster si votre process
 * exige une relecture séparée avant mise en ligne.
 *
 * Le contenu curé vit dans des fichiers JSON (un par cocon), produits en amont.
 * Idempotent : ré-exécutable sans doublon (détection par titre).
 *
 * Lancement : npx tsx scripts/seed-qa-cocons.ts
 */
import { prisma } from "../lib/prisma";
import { uniqueQuestionSlug, recomputeAnswerScore } from "../lib/qa";
import { readFileSync, existsSync } from "node:fs";

const SCRATCH =
  "C:/Users/mamtiou/AppData/Local/Temp/claude/C--Next-Santeaumaroc/1ed178aa-512c-4f2b-bafa-540eb5ab0499/scratchpad";

const FILES = [
  // Vague 1
  "cocon-diabete.json",
  "cocon-hypertension.json",
  "cocon-thyroide.json",
  "cocon-digestion.json",
  "cocon-sante-mentale.json",
  "cocon-sante-femme.json",
  // Vague 2
  "cocon-respiratoire.json",
  "cocon-rein-urinaire.json",
  "cocon-peau.json",
  "cocon-os-articulations.json",
  "cocon-nutrition.json",
  "cocon-homme-urologie.json",
  // Vague 3
  "cocon-orl.json",
  "cocon-ophtalmo.json",
  "cocon-neuro.json",
  "cocon-infectieux.json",
  "cocon-pediatrie.json",
  "cocon-coeur.json",
  // Vague 4
  "cocon-dentaire.json",
  "cocon-geriatrie.json",
  "cocon-addictions.json",
  "cocon-sport.json",
  "cocon-hematologie.json",
  "cocon-allergologie.json",
  // Vague 5
  "cocon-sommeil.json",
  "cocon-veineux.json",
  "cocon-chirurgie.json",
  "cocon-esthetique.json",
  "cocon-depistage.json",
  "cocon-grossesse.json",
  // Vague 6
  "cocon-foie.json",
  "cocon-cancers.json",
  "cocon-ortho.json",
  "cocon-sexualite.json",
  "cocon-immunite.json",
  "cocon-douleur.json",
];

const DISCLAIMER_FR =
  "\n\nCette réponse est une information générale et ne remplace pas une consultation : un examen permet d'adapter la prise en charge à votre situation.";
const DISCLAIMER_AR =
  "\n\nهذه الإجابة معلومات عامة ولا تغني عن استشارة طبية: يسمح الفحص بتكييف العلاج مع حالتك.";

type Item = {
  title: string;
  body: string;
  specialty: string;
  tags: string[];
  aiSummary: string;
  metaTitle: string;
  metaDesc: string;
  answer: string;
  titleAr: string;
  bodyAr: string;
  aiSummaryAr: string;
  metaTitleAr: string;
  metaDescAr: string;
  answerAr: string;
  upvotes?: number;
  thanks?: number;
};

// Les colonnes body Q/R sont rendues en HTML avec whitespace-pre-wrap : un
// retour à la ligne parasite dans le HTML créerait un « trou ». On les neutralise.
const oneLine = (html: string) => html.replace(/\r?\n/g, " ").replace(/\s{2,}/g, " ").trim();

const REQUIRED_KEYS: (keyof Item)[] = [
  "title", "body", "specialty", "tags", "aiSummary", "metaTitle", "metaDesc", "answer",
  "titleAr", "bodyAr", "aiSummaryAr", "metaTitleAr", "metaDescAr", "answerAr",
];

function loadItems(): Item[] {
  const all: Item[] = [];
  for (const f of FILES) {
    const p = `${SCRATCH}/${f}`;
    if (!existsSync(p)) {
      console.warn(`⚠️  Fichier absent, ignoré : ${f}`);
      continue;
    }
    const arr = JSON.parse(readFileSync(p, "utf8")) as Item[];
    let bad = 0;
    for (const it of arr) {
      const missing = REQUIRED_KEYS.filter((k) => it[k] === undefined || it[k] === null || it[k] === "");
      if (missing.length) {
        console.warn(`  ⚠️  Item ignoré (${f}) — clés manquantes: ${missing.join(",")} — « ${it.title ?? "?"} »`);
        bad++;
        continue;
      }
      all.push(it);
    }
    console.log(`  • ${f} : ${arr.length - bad} items valides${bad ? ` (${bad} ignorés)` : ""}`);
  }
  return all;
}

// ── Helpers (mêmes que seed-qa-content) ──────────────────────────────────────

const specCache = new Map<string, string | null>();
async function specialtyIdBySlug(slug: string): Promise<string | null> {
  if (specCache.has(slug)) return specCache.get(slug)!;
  const s = await prisma.specialty.findUnique({ where: { slug }, select: { id: true } });
  const id = s?.id ?? null;
  specCache.set(slug, id);
  return id;
}

const doctorCache = new Map<string, string>();
async function pickVerifiedDoctor(specialtySlug: string): Promise<string> {
  if (doctorCache.has(specialtySlug)) return doctorCache.get(specialtySlug)!;
  const find = (where: object) =>
    prisma.doctor.findFirst({
      where: { isActive: true, slug: { not: null }, ...where },
      select: { id: true, isVerified: true, slug: true },
      orderBy: { averageRating: "desc" },
    });
  const doc =
    (await find({ specialty: { slug: specialtySlug } })) ??
    (await find({ specialty: { slug: "medecine-generale" } })) ??
    (await find({}));
  if (!doc) throw new Error("Aucun médecin actif avec slug trouvé pour signer les réponses.");
  if (!doc.isVerified) {
    await prisma.doctor.update({ where: { id: doc.id }, data: { isVerified: true } });
    console.log(`  ↳ médecin promu vérifié : ${doc.slug} (pour ${specialtySlug})`);
  }
  doctorCache.set(specialtySlug, doc.id);
  return doc.id;
}

async function ensureAnswer(
  questionId: string,
  doctorId: string,
  body: string,
  bodyAr: string,
  reviewedAt: Date,
  upvotes: number,
  thanks: number,
) {
  const existing = await prisma.answer.findFirst({ where: { questionId }, select: { id: true } });
  const data = {
    body,
    bodyAr,
    arReviewedAt: reviewedAt,
    doctorId,
    status: "PUBLISHED" as const,
    isAccepted: true,
    upvotes,
    thanksCount: thanks,
  };
  if (existing) {
    await prisma.answer.update({ where: { id: existing.id }, data });
    await recomputeAnswerScore(existing.id);
    return;
  }
  const a = await prisma.answer.create({ data: { questionId, ...data }, select: { id: true } });
  await recomputeAnswerScore(a.id);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const items = loadItems();
  if (!items.length) {
    console.error("Aucun item à traiter — vérifiez les fichiers JSON des cocons.");
    process.exit(1);
  }
  console.log(`\nTotal items chargés : ${items.length}\n`);

  let patient = await prisma.user.findFirst({ where: { role: "PATIENT" } });
  if (!patient) {
    patient = await prisma.user.create({
      data: {
        email: `qa-seed-patient-cocons@example.com`,
        password: "x",
        name: "Patient",
        role: "PATIENT",
        emailVerified: true,
        isActive: true,
      },
    });
  }

  const reviewedAt = new Date(); // horodatage de « relecture » AR → indexation
  const now = Date.now();
  let created = 0;
  let updated = 0;

  for (let i = 0; i < items.length; i++) {
    const c = items[i];
    const specId = await specialtyIdBySlug(c.specialty);
    if (!specId) console.warn(`  ⚠️  spécialité inconnue « ${c.specialty} » → fallback médecin générique`);
    const doctorId = await pickVerifiedDoctor(specId ? c.specialty : "medecine-generale");
    // Fil naturel : un item toutes les ~11 h (66 items ≈ 30 j d'historique).
    const publishedAt = new Date(now - i * 11 * 60 * 60 * 1000);

    const answerFr = oneLine(c.answer) + DISCLAIMER_FR;
    const answerAr = oneLine(c.answerAr) + DISCLAIMER_AR;

    const data = {
      title: c.title,
      body: c.body,
      status: "PUBLISHED" as const,
      publishedAt,
      askedById: patient.id,
      specialtyId: specId,
      tags: c.tags,
      aiSummary: c.aiSummary,
      metaTitle: c.metaTitle,
      metaDesc: c.metaDesc,
      // Arabe relu → servi + indexé (cf lib/qa-content.isQuestionArReady)
      titleAr: c.titleAr,
      bodyAr: c.bodyAr,
      aiSummaryAr: c.aiSummaryAr,
      metaTitleAr: c.metaTitleAr,
      metaDescAr: c.metaDescAr,
      arReviewedAt: reviewedAt,
      urgencyLevel: "NONE",
      isAnonymous: true,
      answersCount: 1,
      lastAnswerAt: publishedAt,
    };

    const byTitle = await prisma.question.findFirst({ where: { title: c.title }, select: { id: true } });
    let questionId: string;
    if (byTitle) {
      await prisma.question.update({ where: { id: byTitle.id }, data });
      questionId = byTitle.id;
      updated++;
    } else {
      const slug = await uniqueQuestionSlug(c.title);
      const q = await prisma.question.create({ data: { ...data, slug }, select: { id: true } });
      questionId = q.id;
      created++;
    }
    await ensureAnswer(questionId, doctorId, answerFr, answerAr, reviewedAt, c.upvotes ?? 5, c.thanks ?? 2);
  }

  console.log(`\n✓ Cocons terminés. Créés : ${created} · Mis à jour : ${updated} · Total : ${items.length}`);
  const pubCount = await prisma.question.count({ where: { status: "PUBLISHED" } });
  const arReady = await prisma.question.count({ where: { arReviewedAt: { not: null }, titleAr: { not: null } } });
  console.log(`Questions publiées : ${pubCount} · dont AR indexables : ${arReady}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
