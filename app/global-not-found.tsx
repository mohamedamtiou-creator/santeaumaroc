// 404 global — rendu pour toute URL ne correspondant à AUCUNE route.
//
// Contrairement à `[lang]/(site)/not-found.tsx` (qui n'attrape que les
// `notFound()` levés DANS une route existante, avec le chrome du site), ce
// fichier est résolu au niveau routage : Next contourne le rendu normal des
// layouts. Il DOIT donc être un document HTML complet et importer lui-même ses
// styles/polices. Nécessaire ici car le layout racine repose sur un segment
// dynamique de tête (`app/[lang]/layout.tsx`) → impossible de composer un 404
// cohérent via layout + not-found (cf. docs Next : globalNotFound).
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { dirOf, type Locale } from "@/lib/i18n";
import NotFoundView from "@/components/error/NotFoundView";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "optional" });
// Cairo = auto-hébergée via globals.css (cf app/[lang]/layout.tsx), préchargée en AR.

export const metadata: Metadata = {
  title: "Page introuvable — SantéauMaroc",
  // Ce document contourne le layout `[lang]` (rendu autonome), il n'hérite donc
  // pas de ses `icons` → on redéclare le favicon ici, sinon la 404 globale n'en a pas.
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

async function detectLocale(): Promise<Locale> {
  try {
    const h = await headers();
    const path = h.get("x-pathname") ?? "";
    if (path === "/ar" || path.startsWith("/ar/")) return "ar";
  } catch {
    // headers() indisponible dans ce contexte → repli FR
  }
  return "fr";
}

export default async function GlobalNotFound() {
  const locale = await detectLocale();
  return (
    <html lang={locale} dir={dirOf(locale)} className={inter.variable}>
      <body className="bg-slate-50 text-slate-800">
        {locale === "ar" && (
          <link rel="preload" href="/fonts/cairo-arabic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        )}
        <main id="main-content" className="flex min-h-screen flex-col items-center justify-center">
          <NotFoundView locale={locale} />
        </main>
      </body>
    </html>
  );
}
