import { writeFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";

/**
 * Génère le SQL de MEP prod des CONTENUS non encore déployés — les deux sessions.
 *
 * ── PÉRIMÈTRE, ET COMMENT IL A ÉTÉ ÉTABLI ─────────────────────────────────
 * Aucun accès à la base de prod pour diffiéer : le périmètre a été déterminé en
 * datant les écritures de la base locale depuis le dernier déploiement.
 *
 *  Session 1 (1er → 3 août) — `glossary_terms` : 69 lignes ont reçu leur champ
 *    `sources` (cf. scripts/seed-glossary-sources.ts). C'est le seul contenu de
 *    cette session en base : les silos Outils, clusters de vie, référentiel de
 *    prix, remboursement des médicaments et index alphabétique des villes sont
 *    du contenu EN CODE (lib/*.ts) → ils partent avec le déploiement, sans SQL.
 *    `posts` (211) et `questions` (430) apparaissaient aussi modifiées, mais
 *    uniquement par leur compteur de vues (browsing local) : rien à déployer.
 *    `contact_requests` et `phone_clicks` (3 + 3) sont des données de trafic
 *    local, volontairement exclues.
 *
 *  Session 2 (3 → 4 août) — 7 articles de blog (5 dentaires en cocon, 2 piliers
 *    dermato) avec traduction arabe, le maillage retour de 11 fiches, et le
 *    compte de rédaction dédié qui porte la signature de relecture.
 *
 * ── CHOIX DE PORTABILITÉ (les ids diffèrent entre dev et prod) ─────────────
 *  · `categoryId`, `authorId`, `reviewedById` : résolus par SOUS-REQUÊTE
 *    (slug de catégorie, admin actif, email de la rédaction) — jamais l'id local.
 *  · `pillarId` : sous-requête sur le slug du pilier, d'où l'ordre des INSERT.
 *  · `id` : le cuid local est réutilisé, ce qui aligne dev et prod. Sur une ligne
 *    déjà présente, ON CONFLICT laisse l'id de prod intact.
 *
 * ── SÛRETÉ ────────────────────────────────────────────────────────────────
 *  · rejouable : ON CONFLICT (slug / email) DO UPDATE, sans doublon ;
 *  · `publishedAt` et `arReviewedAt` en COALESCE → ne réinitialisent jamais une
 *    date déjà posée en prod ; `views`, `createdAt`, `featured` jamais touchés ;
 *  · `relatedSlugs` en APPEND des seules valeurs manquantes ;
 *  · garde-fous en tête et contrôles avant COMMIT : la transaction échoue plutôt
 *    que de laisser la prod à moitié migrée.
 *
 *   npx tsx --env-file=.env scripts/export-mep-contenus-sql.ts
 *   → prisma/manual-migrations/20260804_contenus_glossaire_blog.sql
 * ════════════════════════════════════════════════════════════════════════════
 */

const OUT = "prisma/manual-migrations/20260804_contenus_glossaire_blog.sql";

const q = (v: string | null | undefined) => (v == null ? "NULL" : `'${v.replace(/'/g, "''")}'`);
const num = (v: number | null | undefined) => (v == null ? "NULL" : String(v));

const PILLAR = "mal-de-dents-rage-de-dents-maroc";
const SLUGS = [
  PILLAR,
  "abces-dentaire-maroc",
  "dent-de-sagesse-extraction-maroc",
  "parodontite-dechaussement-dents-maroc",
  "carie-dentaire-maroc",
  "chute-de-cheveux-maroc",
  "acne-maroc",
];
const REVIEWER_EMAIL = "redaction@santeaumaroc.com";

const ADMIN = `(SELECT id FROM users WHERE role = 'ADMIN' AND "isActive" = true ORDER BY "createdAt" LIMIT 1)`;
const REVIEWER = `(SELECT id FROM users WHERE email = ${q(REVIEWER_EMAIL)})`;
const CATEGORY = (slug: string) => `(SELECT id FROM post_categories WHERE slug = ${q(slug)})`;
const POST_ID = (slug: string) => `(SELECT id FROM posts WHERE slug = ${q(slug)})`;

async function main() {
  // ── 0. Compte de rédaction ────────────────────────────────────────────────
  const reviewer = await prisma.user.findUnique({
    where: { email: REVIEWER_EMAIL },
    select: { id: true, name: true, role: true, jobTitle: true, credentials: true, bio: true, password: true },
  });
  if (!reviewer) throw new Error(`Compte ${REVIEWER_EMAIL} absent en local : lancer scripts/seed-editorial-reviewer.cjs`);

  const accountSql = [
    `-- Compte de rédaction : identité de SIGNATURE, pas un accès. « isActive » et`,
    `-- « emailVerified » à false bloquent la connexion (features/auth/actions.ts),`,
    `-- et le mot de passe est le hash d'un secret aléatoire jamais conservé.`,
    `INSERT INTO users ("id", "email", "password", "name", "role", "jobTitle", "credentials", "bio", "isActive", "emailVerified", "updatedAt")`,
    `VALUES (${q(reviewer.id)}, ${q(REVIEWER_EMAIL)}, ${q(reviewer.password)}, ${q(reviewer.name)}, ${q(reviewer.role)},`,
    `        ${q(reviewer.jobTitle)}, ${q(reviewer.credentials)}, ${q(reviewer.bio)}, false, false, now())`,
    `ON CONFLICT (email) DO UPDATE SET`,
    `  "name" = EXCLUDED."name", "role" = EXCLUDED."role", "jobTitle" = EXCLUDED."jobTitle",`,
    `  "credentials" = EXCLUDED."credentials", "bio" = EXCLUDED."bio", "updatedAt" = now();`,
    `-- « password » volontairement absent du DO UPDATE : ne jamais réécrire un secret existant.`,
    ``,
  ];

  // ── 1. Articles ───────────────────────────────────────────────────────────
  const posts = await prisma.post.findMany({ where: { slug: { in: SLUGS } }, include: { category: { select: { slug: true } } } });
  if (posts.length !== SLUGS.length) {
    throw new Error(`Articles absents en local : ${SLUGS.filter((s) => !posts.some((p) => p.slug === s)).join(", ")}`);
  }
  const ordered = SLUGS.map((s) => posts.find((p) => p.slug === s)!);
  const notAr = ordered.filter((p) => !p.contentAr || !p.arReviewedAt).map((p) => p.slug);
  if (notAr.length) throw new Error(`Traduction AR absente ou non relue : ${notAr.join(", ")}`);

  const cols = [
    "id", "title", "slug", "excerpt", "content", "coverImage", "coverAlt",
    "categoryId", "authorId", "reviewedById", "reviewedAt", "status", "publishedAt",
    "readingTime", "metaTitle", "metaDesc", "keyTakeaways", "faqJson", "sources",
    "aboutEntity", "pillarId", "titleAr", "excerptAr", "contentAr", "metaTitleAr",
    "metaDescAr", "keyTakeawaysAr", "faqJsonAr", "arReviewedAt", "updatedAt",
  ];
  // Non réécrits sur une ligne déjà en prod : identité, auteur, et les dates dont
  // la valeur de prod fait foi (traitées en COALESCE juste après).
  const frozen = ["id", "slug", "authorId", "publishedAt", "arReviewedAt", "updatedAt"];

  const inserts = ordered.map((p) => {
    const vals = [
      q(p.id), q(p.title), q(p.slug), q(p.excerpt), q(p.content), q(p.coverImage), q(p.coverAlt),
      CATEGORY(p.category.slug), ADMIN, REVIEWER, "now()", q(p.status), "now()",
      num(p.readingTime), q(p.metaTitle), q(p.metaDesc), q(p.keyTakeaways), q(p.faqJson), q(p.sources),
      q(p.aboutEntity), p.pillarId ? POST_ID(PILLAR) : "NULL", q(p.titleAr), q(p.excerptAr), q(p.contentAr),
      q(p.metaTitleAr), q(p.metaDescAr), q(p.keyTakeawaysAr), q(p.faqJsonAr), "now()", "now()",
    ];
    return [
      `-- ${p.slug}${p.pillarId ? "  (satellite du pilier)" : "  (pilier)"}`,
      `INSERT INTO posts (${cols.map((c) => `"${c}"`).join(", ")})`,
      `VALUES (${vals.join(", ")})`,
      `ON CONFLICT (slug) DO UPDATE SET`,
      `  ${cols.filter((c) => !frozen.includes(c)).map((c) => `"${c}" = EXCLUDED."${c}"`).join(",\n  ")},`,
      `  "publishedAt" = COALESCE(posts."publishedAt", EXCLUDED."publishedAt"),`,
      `  "arReviewedAt" = COALESCE(posts."arReviewedAt", EXCLUDED."arReviewedAt"),`,
      `  "updatedAt" = now();`,
      ``,
    ].join("\n");
  });

  // ── 2. Maillage retour fiche → blog ───────────────────────────────────────
  const topics = await prisma.healthTopic.findMany({
    where: { relatedSlugs: { hasSome: SLUGS } },
    select: { slug: true, kind: true, relatedSlugs: true },
    orderBy: { slug: "asc" },
  });
  const links = topics.map((t) => {
    const arr = `ARRAY[${t.relatedSlugs.filter((s) => SLUGS.includes(s)).map(q).join(", ")}]::text[]`;
    return (
      `UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(${arr}) AS s ` +
      `WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = ${q(t.slug)} AND kind = ${q(t.kind)};`
    );
  });

  // ── 3. Sources du glossaire (session 1) ───────────────────────────────────
  const glossary = await prisma.glossaryTerm.findMany({
    where: { sources: { not: null } },
    select: { slug: true, sources: true },
    orderBy: { slug: "asc" },
  });
  const gloLines = glossary.map(
    (g) => `UPDATE glossary_terms SET sources = ${q(g.sources)}, "updatedAt" = now() WHERE slug = ${q(g.slug)};`,
  );

  const words = ordered.reduce((n, p) => n + p.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length, 0);
  const sql = [
    `-- ════════════════════════════════════════════════════════════════════════`,
    `-- MEP CONTENUS — sessions du 1er au 4 août 2026`,
    `--`,
    `--   · glossaire  : sources sur ${glossary.length} termes (session 1)`,
    `--   · blog       : ${ordered.length} articles, ${words} mots FR + traduction arabe relue`,
    `--   · maillage   : ${links.length} fiches maladies/symptômes → articles piliers`,
    `--   · compte     : rédaction médicale (signature de relecture, sans accès)`,
    `--`,
    `-- Généré par scripts/export-mep-contenus-sql.ts`,
    `--`,
    `-- PRÉREQUIS : déployer aussi les 7 fichiers public/blog-covers/post-*.jpg,`,
    `-- sinon les couvertures référencées ici renvoient 404.`,
    `--`,
    `-- HORS PÉRIMÈTRE, volontairement : les silos Outils, clusters de vie,`,
    `-- référentiel de prix, remboursement des médicaments et index des villes sont`,
    `-- du contenu EN CODE — ils partent avec le déploiement, sans SQL. Les tables`,
    `-- posts/questions portaient aussi des écritures de session 1, mais uniquement`,
    `-- sur leur compteur de vues (browsing local) : rien à déployer.`,
    `--`,
    `-- SÛRETÉ : rejouable · COALESCE sur publishedAt/arReviewedAt · views, createdAt`,
    `-- et featured jamais touchés · relatedSlugs en append · contrôles avant COMMIT.`,
    `-- ════════════════════════════════════════════════════════════════════════`,
    ``,
    `BEGIN;`,
    ``,
    `-- ─── 0. Compte de rédaction (doit précéder les articles) ───`,
    ...accountSql,
    `-- ─── Garde-fous de contexte ───`,
    `DO $$`,
    `BEGIN`,
    `  IF ${ADMIN} IS NULL THEN`,
    `    RAISE EXCEPTION 'Aucun utilisateur ADMIN actif : impossible de fixer authorId';`,
    `  END IF;`,
    `  IF ${REVIEWER} IS NULL THEN`,
    `    RAISE EXCEPTION 'Compte de rédaction ${REVIEWER_EMAIL} absent : insertion en section 0 échouée';`,
    `  END IF;`,
    `  IF ${CATEGORY("symptomes")} IS NULL OR ${CATEGORY("maladies-traitements")} IS NULL THEN`,
    `    RAISE EXCEPTION 'Catégories blog « symptomes » et/ou « maladies-traitements » absentes';`,
    `  END IF;`,
    `END $$;`,
    ``,
    `-- ─── 1. Articles (pilier d'abord : les satellites résolvent pillarId par slug) ───`,
    ``,
    ...inserts,
    `-- ─── 2. Maillage retour fiches → articles piliers ───`,
    ...links,
    ``,
    `-- ─── 3. Sources du glossaire (session 1) ───`,
    ...gloLines,
    ``,
    `-- ─── 4. Contrôles avant COMMIT ───`,
    `DO $$`,
    `DECLARE n_posts int; n_ar int; n_signes int; n_glo int;`,
    `BEGIN`,
    `  SELECT count(*) INTO n_posts FROM posts WHERE slug IN (${SLUGS.map(q).join(", ")});`,
    `  SELECT count(*) INTO n_ar FROM posts WHERE slug IN (${SLUGS.map(q).join(", ")})`,
    `    AND "contentAr" IS NOT NULL AND "arReviewedAt" IS NOT NULL;`,
    `  SELECT count(*) INTO n_signes FROM posts p JOIN users u ON u.id = p."reviewedById"`,
    `    WHERE p.slug IN (${SLUGS.map(q).join(", ")}) AND u.email = ${q(REVIEWER_EMAIL)};`,
    `  SELECT count(*) INTO n_glo FROM glossary_terms WHERE sources IS NOT NULL;`,
    `  IF n_posts <> ${SLUGS.length} THEN RAISE EXCEPTION 'Attendu ${SLUGS.length} articles, trouvé %', n_posts; END IF;`,
    `  IF n_ar <> ${SLUGS.length} THEN RAISE EXCEPTION 'Arabe absent ou non relu sur % article(s)', ${SLUGS.length} - n_ar; END IF;`,
    `  IF n_signes <> ${SLUGS.length} THEN RAISE EXCEPTION 'Signature de relecture incorrecte sur % article(s)', ${SLUGS.length} - n_signes; END IF;`,
    `  IF n_glo < ${glossary.length} THEN RAISE EXCEPTION 'Sources glossaire : attendu au moins ${glossary.length}, trouvé %', n_glo; END IF;`,
    `  RAISE NOTICE 'OK : % articles (arabe relu et signé), % termes de glossaire sourcés', n_posts, n_glo;`,
    `END $$;`,
    ``,
    `COMMIT;`,
    ``,
    `-- APRÈS LA MEP : purger le cache ISR des pages touchées, ou attendre la`,
    `-- revalidation (revalidate = 3600 sur /blog/[slug] et /glossaire/[slug]).`,
    ``,
  ].join("\n");

  writeFileSync(OUT, sql, "utf8");
  console.log(`✓ SQL écrit : ${OUT}`);
  console.log(`  1 compte · ${ordered.length} articles (AR relu) · ${links.length} maillages · ${glossary.length} termes sourcés · ${Math.round(sql.length / 1024)} Ko`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
