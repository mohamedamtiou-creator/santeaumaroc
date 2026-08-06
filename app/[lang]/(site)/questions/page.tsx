import { Suspense } from "react";
import type { Metadata } from "next";
import { frenchOnlyAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { QaHome } from "@/components/qa/QaHome";
import { QuestionsResults } from "@/components/qa/QuestionsResults";

// 3600 et non 300 : la publication d'une question appelle déjà
// `revalidatePath("/questions")` (features/qa/actions.ts), donc l'index reste à
// jour sans que la TTL ait à faire le travail.
export const revalidate = 86400; // TTL.DIRECTORY

type Params = Promise<{ lang: string }>;

// Page STATIQUE : le serveur ne lit plus searchParams. La vue canonique est la
// home éditoriale Q/R (QaHome), pré-rendue = shell SEO. La recherche/filtres/tri
// sont gérés côté client (QuestionsResults → server action loadMoreQuestions),
// vues noindex. Contenu Q/R français uniquement (AR servi en noindex).
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  const locale = toLocale(lang);
  const t = getDictionary(locale).qa;
  const noindex = locale === "ar";
  return {
    title: t.metaListTitle,
    description: t.metaListDesc,
    alternates: frenchOnlyAlternates("/questions"),
    ...(noindex && { robots: { index: false, follow: true } }),
    openGraph: { title: t.metaListTitle, description: t.metaListDesc, url: "/questions", type: "website" },
  };
}

export default async function QuestionsPage({ params }: { params: Params }) {
  const { lang } = await params;
  const locale = toLocale(lang);
  const t = getDictionary(locale).qa;

  // Vue canonique (home éditoriale) rendue côté serveur : contenu du shell
  // statique (fallback <Suspense> = HTML prérendu, indexable) ET contenu affiché
  // tant qu'aucune recherche/filtre n'est actif.
  const base = <QaHome locale={locale} />;

  return (
    <Suspense fallback={base}>
      <QuestionsResults locale={locale} t={t}>
        {base}
      </QuestionsResults>
    </Suspense>
  );
}
