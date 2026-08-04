/**
 * Contrôle des dossiers « parcours de vie » sur une instance qui tourne.
 *
 * Vérifie les deux règles de conception des hubs :
 *  1. densité — chaque dossier relie au moins 12 contenus déjà publiés ;
 *  2. anti-cannibalisation — le hub n'affiche QUE des intitulés, jamais le texte
 *     des fiches qu'il agrège (sinon il se met en concurrence avec elles).
 *
 *   npx tsx --env-file=.env scripts/check-clusters.ts [http://localhost:3000]
 */
import { prisma } from "@/lib/prisma";
import { CLUSTER_SLUGS, CLUSTERS } from "@/lib/life-clusters";
import { getClusterContent } from "@/lib/life-clusters-content";

const BASE = process.argv[2] ?? "http://localhost:3000";
const MIN_CONTENT = 12;

let fails = 0;
const ok = (name: string, cond: boolean, detail?: unknown) => {
  if (!cond) { fails++; console.log(`  ÉCHEC ${name}`, detail ?? ""); } else console.log(`  ok    ${name}`);
};

/** Décode le minimum d'entités HTML pour comparer du texte rendu à du texte base. */
const unescape = (s: string) =>
  s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
   .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;|&#160;/g, " ");

/** Empreinte textuelle : une tranche assez longue pour être improbable par hasard. */
const fingerprint = (s: string) => unescape(s).replace(/\s+/g, " ").trim().slice(0, 60);

async function main() {
  const slugsOf = (cluster: (typeof CLUSTERS)[keyof typeof CLUSTERS], kind: string) =>
    cluster.sections.flatMap((s) => s.items.filter((i) => i.kind === kind).map((i) => i.slug));

  for (const slug of CLUSTER_SLUGS) {
    const cluster = CLUSTERS[slug];
    const content = getClusterContent(slug, "fr");
    console.log(`\n/${slug} — ${content.name}`);

    const res = await fetch(`${BASE}/${slug}`);
    ok("page servie en 200", res.status === 200, res.status);
    const html = unescape(await res.text());

    // 1 — densité réelle annoncée par la page
    const count = Number(/([0-9]+) contenus reliés/.exec(html)?.[1] ?? "0");
    ok(`≥ ${MIN_CONTENT} contenus reliés (${count})`, count >= MIN_CONTENT, count);

    // 2 — chaque section déclarée est titrée (ou absente si vidée, jamais orpheline)
    const rendered = Object.values(content.sections).filter((s) => html.includes(s.title)).length;
    ok(`sections rendues : ${rendered}/${Object.keys(content.sections).length}`, rendered > 0);

    // 3 — anti-cannibalisation : aucun texte de fiche, d'examen ou de guide repris
    const [topics, exams, posts] = await Promise.all([
      prisma.healthTopic.findMany({
        where: { slug: { in: slugsOf(cluster, "topic") }, status: "PUBLISHED" },
        select: { slug: true, term: true, shortAnswer: true },
      }),
      prisma.medicalExam.findMany({
        where: { slug: { in: slugsOf(cluster, "exam") }, status: "PUBLISHED" },
        select: { slug: true, name: true, shortAnswer: true },
      }),
      prisma.post.findMany({
        where: { slug: { in: slugsOf(cluster, "post") }, status: "PUBLISHED" },
        select: { slug: true, title: true, excerpt: true },
      }),
    ]);

    const leaks: string[] = [];
    for (const t of topics) if (html.includes(fingerprint(t.shortAnswer))) leaks.push(`fiche ${t.slug}`);
    for (const e of exams) if (html.includes(fingerprint(e.shortAnswer))) leaks.push(`examen ${e.slug}`);
    for (const p of posts) if (html.includes(fingerprint(p.excerpt))) leaks.push(`guide ${p.slug}`);
    ok("aucun texte de fiche recopié sur le hub", leaks.length === 0, leaks);

    // 4 — les intitulés agrégés sont bien présents, donc cliquables
    const missing = topics.filter((t) => !html.includes(t.term)).map((t) => t.slug);
    ok(`intitulés des ${topics.length} fiches présents`, missing.length === 0, missing);

    // 5 — le hub envoie vers la conversion (spécialité) et vers ses voisins
    ok("lien spécialité principale", html.includes(`/specialites/${cluster.specialtySlugs[0]}`));
    ok("maillage horizontal entre dossiers", cluster.siblingSlugs.every((s) => html.includes(`href="/${s}"`)));
  }

  console.log(fails === 0 ? "\nTOUS LES CONTRÔLES PASSENT" : `\n${fails} ÉCHEC(S)`);
  process.exit(fails === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
