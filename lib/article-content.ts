import "server-only";

/**
 * Normaliseurs de contenu d'article, partagés par le blog admin
 * (features/blog/actions.ts) et la plateforme contributive
 * (features/articles/actions.ts). Source unique pour éviter la dérive de
 * validation entre les deux points d'entrée d'écriture d'un `Post`.
 */

/** Temps de lecture en minutes (≈ 200 mots/min), planché à 1. */
export function calcReadingTime(html: string): number {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = plain.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** « À retenir » : 1 point par ligne, puces retirées ; vide → null. */
export function normTakeaways(raw: string): string | null {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
  return lines.length ? lines.join("\n") : null;
}

/** Valide la FAQ JSON [{q,a}] ; vide → null ; format invalide → throw. */
export function normFaq(raw: string, label = "FAQ"): string | null {
  const s = raw.trim();
  if (!s) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    throw new Error(`${label} : JSON invalide. Format attendu : [{ "q": "…", "a": "…" }]`);
  }
  if (!Array.isArray(parsed) || !parsed.every((x) => x && typeof x.q === "string" && typeof x.a === "string")) {
    throw new Error(`${label} : chaque entrée doit contenir « q » et « a » (texte).`);
  }
  return JSON.stringify(parsed.map((x) => ({ q: x.q.trim(), a: x.a.trim() })));
}

/** Valide les sources JSON [{label,url,publisher?,year?}] ; vide → null ; invalide → throw. */
export function normSources(raw: string, label = "Sources"): string | null {
  const s = raw.trim();
  if (!s) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    throw new Error(`${label} : JSON invalide. Format attendu : [{ "label": "…", "url": "https://…" }]`);
  }
  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (x) => x && typeof x.label === "string" && x.label.trim() && typeof x.url === "string" && x.url.trim(),
    )
  ) {
    throw new Error(`${label} : chaque entrée doit contenir « label » et « url » (texte non vide).`);
  }
  return JSON.stringify(
    parsed.map((x) => ({
      label: x.label.trim(),
      url: x.url.trim(),
      ...(typeof x.publisher === "string" && x.publisher.trim() ? { publisher: x.publisher.trim() } : {}),
      ...(x.year != null && String(x.year).trim() ? { year: String(x.year).trim() } : {}),
    })),
  );
}

/** Champ texte optionnel : trim, vide → null. */
export function orNull(raw: unknown): string | null {
  const s = ((raw ?? "") as string).trim();
  return s || null;
}

/** Compte les sources valides (0 si vide/invalide). Sert au contrôle qualité. */
export function countSources(rawJson: string | null | undefined): number {
  if (!rawJson) return 0;
  try {
    const parsed = JSON.parse(rawJson);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}
