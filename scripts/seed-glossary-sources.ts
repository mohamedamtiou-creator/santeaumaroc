/**
 * Renseigne le champ `sources` des termes de glossaire qui n'en ont aucune.
 *
 * GARDE-FOUS, dans cet ordre :
 *  1. chaque URL est RE-VÉRIFIÉE en direct au moment de l'exécution (statut 200
 *     + mot-clé attendu présent) — aucune source non vérifiée n'atteint la base ;
 *  2. seuls les termes dont `sources` est vide sont touchés : les 10 sources
 *     éditoriales existantes ne sont jamais écrasées ;
 *  3. deux sources maximum par terme, l'OMS d'abord (convention du site) ;
 *  4. SIMULATION par défaut. L'écriture exige `--write` explicitement.
 *
 *   npx tsx --env-file=.env scripts/seed-glossary-sources.ts            # simulation
 *   npx tsx --env-file=.env scripts/seed-glossary-sources.ts --write    # écriture
 */
import { prisma } from "@/lib/prisma";
import { SOURCE_CANDIDATES, type SourceCandidate } from "@/scripts/data/glossary-source-candidates";

const WRITE = process.argv.includes("--write");
const MAX_PER_TERM = 2;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

async function verify(c: SourceCandidate): Promise<{ ok: boolean; url: string }> {
  try {
    const res = await fetch(c.url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SanteauMarocSourceCheck/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9",
      },
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return { ok: false, url: c.url };
    const html = await res.text();
    return { ok: norm(html).includes(norm(c.expect)), url: res.url };
  } catch {
    return { ok: false, url: c.url };
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

const hasSources = (raw: string | null) => {
  if (!raw) return false;
  try {
    const a = JSON.parse(raw);
    return Array.isArray(a) && a.length > 0;
  } catch {
    return false;
  }
};

async function main() {
  const terms = await prisma.glossaryTerm.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, term: true, sources: true },
  });
  const empty = new Set(terms.filter((t) => !hasSources(t.sources)).map((t) => t.slug));
  const known = new Set(terms.map((t) => t.slug));

  // On ne vérifie que ce qui pourrait réellement servir.
  const useful = SOURCE_CANDIDATES.filter((c) => known.has(c.slug) && empty.has(c.slug));
  console.log(`termes sans source : ${empty.size} · candidats à vérifier : ${useful.length}`);

  const results = await mapLimit(useful, 6, async (c) => ({ c, v: await verify(c) }));

  const bySlug = new Map<string, { label: string; url: string; publisher: string }[]>();
  for (const { c, v } of results) {
    if (!v.ok) continue;
    const list = bySlug.get(c.slug) ?? [];
    if (list.length >= MAX_PER_TERM) continue;
    // L'OMS en premier : c'est la convention des 10 termes déjà sourcés.
    const entry = { label: c.label, url: v.url, publisher: c.publisher };
    if (c.publisher === "OMS") list.unshift(entry);
    else list.push(entry);
    bySlug.set(c.slug, list.slice(0, MAX_PER_TERM));
  }

  const labels = new Map(terms.map((t) => [t.slug, t.term] as const));
  console.log(`\n${WRITE ? "── ÉCRITURE ──" : "── SIMULATION (aucune écriture) ──"}`);
  for (const [slug, sources] of [...bySlug].sort()) {
    console.log(`\n${labels.get(slug)} (${slug})`);
    for (const s of sources) console.log(`   + ${s.publisher.padEnd(14)} ${s.url}`);
    if (WRITE) {
      await prisma.glossaryTerm.update({
        where: { slug },
        data: { sources: JSON.stringify(sources) },
      });
    }
  }

  const stillEmpty = [...empty].filter((s) => !bySlug.has(s)).sort();
  console.log(`\n── BILAN ──`);
  console.log(`termes sourcés par ce lot : ${bySlug.size}`);
  console.log(`termes encore sans source : ${stillEmpty.length}${stillEmpty.length ? ` → ${stillEmpty.join(", ")}` : ""}`);
  if (!WRITE) console.log(`\nRien n'a été écrit. Relancer avec --write pour appliquer.`);
}

main().finally(() => prisma.$disconnect());
