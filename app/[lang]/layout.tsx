import type { Metadata, Viewport } from "next";
import { Inter, Cairo } from "next/font/google";
import "@/app/globals.css";
import { notFound } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { getDictionary, dirOf, isLocale, LOCALES, type Locale } from "@/lib/i18n";
import { LocaleProvider } from "@/components/i18n/LocaleLink";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "optional",
});

// Police arabe dédiée : Inter ne contient aucun glyphe arabe. Sans elle, tout
// le texte arabe tombe sur la police système (Tahoma/Geeza Pro/Noto Naskh selon
// l'OS) — rendu incohérent et souvent peu lisible. Cairo = police arabe web
// moderne, très lisible. `display: "optional"` (jamais de swap tardif → CLS 0).
const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "optional",
  // `preload: false` : la @font-face reste déclarée (l'arabe s'affiche toujours,
  // y compris un mot arabe isolé sur une page FR), mais on n'injecte plus le
  // <link rel="preload"> systématique. Ce layout [lang] est commun à FR et AR ;
  // sans ça, Cairo (~40 KB woff2, glyphes arabes) était préchargée sur TOUTES les
  // pages FR — pur poids réseau gaspillé sur le chemin critique mobile. Le
  // navigateur ne télécharge Cairo que si un glyphe arabe est réellement rendu.
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

// Locale portée par l'URL (segment [lang]) → chaque variante est pré-rendue.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "fr";
  return {
    title: {
      default: "SantéauMaroc — Trouvez votre médecin au Maroc",
      template: "%s | SantéauMaroc",
    },
    description:
      "Annuaire médical marocain. Trouvez des médecins, spécialistes et établissements de santé près de chez vous. Prenez rendez-vous en ligne.",
    metadataBase: new URL(APP_URL),
    authors: [{ name: "SantéauMaroc", url: APP_URL }],
    creator: "SantéauMaroc",
    publisher: "SantéauMaroc",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      ],
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
    openGraph: {
      title: "SantéauMaroc — Trouvez votre médecin au Maroc",
      description:
        "Annuaire médical marocain. Médecins, spécialistes et établissements de santé partout au Maroc.",
      siteName: "SantéauMaroc",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
      alternateLocale: locale === "ar" ? "fr_MA" : "ar_MA",
      type: "website",
      url: APP_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: "SantéauMaroc — Trouvez votre médecin au Maroc",
      description:
        "Annuaire médical marocain. Médecins, spécialistes et établissements de santé partout au Maroc.",
      site: "@santeaumaroc",
      creator: "@santeaumaroc",
    },
    category: "health",
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      className={`${inter.variable} ${cairo.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[9999] focus:bg-white focus:text-primary-700 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-semibold"
        >
          {dict.common.skipToContent}
        </a>
        <LocaleProvider locale={locale}>
          <ToastProvider>{children}</ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
