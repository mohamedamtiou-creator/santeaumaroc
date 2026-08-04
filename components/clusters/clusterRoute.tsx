import type { Metadata } from "next";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";
import type { ClusterSlug } from "@/lib/life-clusters";
import { getClusterContent } from "@/lib/life-clusters-content";
import { CLUSTERS_AR_REVIEWED } from "@/lib/life-clusters-content-ar";
import { LifeClusterPage } from "@/components/clusters/LifeClusterPage";

/**
 * Plomberie partagée des quatre routes de dossiers. Chaque `page.tsx` ne déclare
 * que son slug : métadonnées, verrou d'indexation arabe et rendu sont ici, donc
 * identiques d'un dossier à l'autre par construction.
 */

/** L'arabe n'est ni annoncé ni indexé avant relecture humaine (verrou YMYL). */
const AR_READY = CLUSTERS_AR_REVIEWED !== null;

export async function clusterMetadata(
  slug: ClusterSlug,
  params: Promise<{ lang: string }>,
): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const content = getClusterContent(slug, locale);
  const path = `/${slug}`;
  const indexable = locale !== "ar" || AR_READY;

  return {
    title: content.metaTitle,
    description: content.metaDesc,
    alternates: AR_READY ? localizedAlternates(path, locale) : frenchOnlyAlternates(path),
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title: content.metaTitle,
      description: content.metaDesc,
      url: path,
      type: "website",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
    twitter: { card: "summary", title: content.metaTitle, description: content.metaDesc },
  };
}

export async function ClusterRoute({
  slug,
  params,
}: {
  slug: ClusterSlug;
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  return <LifeClusterPage slug={slug} locale={locale} />;
}
