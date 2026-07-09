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
import { Inter, Cairo } from "next/font/google";
import "@/app/globals.css";
import { dirOf, type Locale } from "@/lib/i18n";
import NotFoundView from "@/components/error/NotFoundView";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "optional" });
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-arabic", display: "optional" });

export const metadata: Metadata = {
  title: "Page introuvable — SantéauMaroc",
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
    <html lang={locale} dir={dirOf(locale)} className={`${inter.variable} ${cairo.variable}`}>
      <body className="bg-slate-50 text-slate-800">
        <main id="main-content" className="flex min-h-screen flex-col items-center justify-center">
          <NotFoundView locale={locale} />
        </main>
      </body>
    </html>
  );
}
