import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

// Chemins privés / non-indexables — partagés par tous les agents.
const DISALLOW = [
  "/admin/",
  "/tableau-de-bord/",
  "/praticien/",
  "/auth/",
  "/api/",
  "/questions/poser", // tunnel de saisie (noindex) — le contenu Q/R reste crawlable
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      // Crawlers IA explicitement autorisés (objectif LLM SEO / AI Overviews) :
      // le contenu Questions/Réponses devient citable par les moteurs génératifs.
      { userAgent: "GPTBot", allow: "/", disallow: DISALLOW },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: DISALLOW },
      { userAgent: "ChatGPT-User", allow: "/", disallow: DISALLOW },
      { userAgent: "PerplexityBot", allow: "/", disallow: DISALLOW },
      { userAgent: "Google-Extended", allow: "/", disallow: DISALLOW },
      { userAgent: "Applebot-Extended", allow: "/", disallow: DISALLOW },
      { userAgent: "ClaudeBot", allow: "/", disallow: DISALLOW },
      { userAgent: "CCBot", allow: "/", disallow: DISALLOW }, // Common Crawl — corpus d'entraînement de nombreux LLM
      { userAgent: "Bytespider", allow: "/", disallow: DISALLOW },
    ],
    // Sitemap segmenté (generateSitemaps) : Next sert chaque segment à
    // /sitemap/<id>.xml et ne crée pas d'index racine — on déclare donc les
    // segments un par un ici (le champ `sitemap` accepte un tableau, mécanisme
    // de découverte standard pour les sitemaps multiples).
    sitemap: [
      `${BASE}/sitemap/core.xml`,
      `${BASE}/sitemap/doctors.xml`,
      `${BASE}/sitemap/combos.xml`,
      `${BASE}/sitemap/content.xml`,
    ],
  };
}
