/**
 * Vérifie les sources candidates du glossaire AVANT toute écriture en base.
 *
 * Pour chaque candidat : requête HTTP réelle, redirections suivies, statut 200
 * exigé, ET présence du mot-clé attendu dans la page — ce dernier test écarte les
 * « soft 404 » qui répondent 200 avec une page d'erreur. Une source qui échoue
 * n'est pas retenue : mieux vaut pas de lien qu'un lien mort sur du contenu santé.
 *
 *   npx tsx scripts/verify-glossary-sources.ts            # vérifie tout
 *   npx tsx scripts/verify-glossary-sources.ts --json     # sortie exploitable
 */
import { SOURCE_CANDIDATES, type SourceCandidate } from "@/scripts/data/glossary-source-candidates";

type Verdict = {
  candidate: SourceCandidate;
  status: number | string;
  keywordFound: boolean;
  finalUrl?: string;
};

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

async function check(candidate: SourceCandidate): Promise<Verdict> {
  try {
    const res = await fetch(candidate.url, {
      redirect: "follow",
      headers: {
        // Certains sites institutionnels renvoient 403 aux clients sans en-têtes.
        "User-Agent": "Mozilla/5.0 (compatible; SanteauMarocSourceCheck/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9",
      },
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return { candidate, status: res.status, keywordFound: false, finalUrl: res.url };
    const html = await res.text();
    return {
      candidate,
      status: res.status,
      keywordFound: norm(html).includes(norm(candidate.expect)),
      finalUrl: res.url,
    };
  } catch (e) {
    return { candidate, status: e instanceof Error ? e.name : "ERREUR", keywordFound: false };
  }
}

/** Concurrence bornée : on interroge des sites tiers, sans les marteler. */
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

async function main() {
  const asJson = process.argv.includes("--json");
  const verdicts = await mapLimit(SOURCE_CANDIDATES, 6, check);

  const passed = verdicts.filter((v) => v.status === 200 && v.keywordFound);
  const wrongPage = verdicts.filter((v) => v.status === 200 && !v.keywordFound);
  const failed = verdicts.filter((v) => v.status !== 200);

  if (asJson) {
    const bySlug: Record<string, { label: string; url: string; publisher: string }[]> = {};
    for (const v of passed) {
      (bySlug[v.candidate.slug] ??= []).push({
        label: v.candidate.label,
        url: v.finalUrl ?? v.candidate.url,
        publisher: v.candidate.publisher,
      });
    }
    console.log(JSON.stringify(bySlug, null, 2));
    return;
  }

  console.log(`── VÉRIFIÉES (${passed.length}/${verdicts.length}) ─────────────────────────`);
  for (const v of passed) console.log(`  ok   ${v.candidate.slug.padEnd(26)} ${v.candidate.publisher.padEnd(16)} ${v.candidate.url}`);

  console.log(`\n── 200 MAIS MOT-CLÉ ABSENT — page probablement générique (${wrongPage.length}) ──`);
  for (const v of wrongPage) console.log(`  ?    ${v.candidate.slug.padEnd(26)} attendu « ${v.candidate.expect} » · ${v.candidate.url}`);

  console.log(`\n── INJOIGNABLES (${failed.length}) ───────────────────────────────`);
  for (const v of failed) console.log(`  ✗ ${String(v.status).padEnd(6)} ${v.candidate.slug.padEnd(26)} ${v.candidate.url}`);

  const slugsCovered = new Set(passed.map((v) => v.candidate.slug));
  const slugsAttempted = new Set(SOURCE_CANDIDATES.map((c) => c.slug));
  const uncovered = [...slugsAttempted].filter((s) => !slugsCovered.has(s)).sort();
  console.log(`\n── BILAN ─────────────────────────────────────────────────`);
  console.log(`termes couverts par au moins une source vérifiée : ${slugsCovered.size}/${slugsAttempted.size}`);
  if (uncovered.length) console.log(`sans source vérifiée → second passage nécessaire : ${uncovered.join(", ")}`);
}

main();
