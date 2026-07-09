import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { isLocale, type Locale } from "@/lib/i18n";

// Chrome public (marketing + espaces connectés). Le backoffice /admin vit hors
// de ce groupe et fournit son propre habillage. La locale provient du segment
// [lang] (statique) — plus aucune lecture cookie/header dans le tronc de rendu.
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar locale={locale} />
      {/* min-h réservée = viewport − navbar (h-16) : pendant le streaming
          progressif, le footer (haut) démarre sous la ligne de flottaison →
          CLS desktop 0. */}
      <main id="main-content" className="flex-1 min-h-[calc(100svh-4rem)]">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
