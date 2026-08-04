import type { Metadata } from "next";
import { clusterMetadata, ClusterRoute } from "@/components/clusters/clusterRoute";

/**
 * Dossier « parcours de vie » — la logique vit dans
 * `components/clusters/LifeClusterPage`, partagée par les quatre hubs.
 */
const SLUG = "grossesse" as const;

export const revalidate = 3600;

export const generateMetadata = ({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> =>
  clusterMetadata(SLUG, params);

export default function Page({ params }: { params: Promise<{ lang: string }> }) {
  return <ClusterRoute slug={SLUG} params={params} />;
}
