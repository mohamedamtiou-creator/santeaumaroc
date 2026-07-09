import type { MetadataRoute } from "next";

// Manifest PWA — couleurs et icônes alignées sur la charte (primary #2563eb).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SantéauMaroc — Annuaire médical marocain",
    short_name: "SantéauMaroc",
    description:
      "Trouvez médecins, spécialistes, cliniques, pharmacies et laboratoires partout au Maroc. Prise de rendez-vous en ligne.",
    lang: "fr",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      { src: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
