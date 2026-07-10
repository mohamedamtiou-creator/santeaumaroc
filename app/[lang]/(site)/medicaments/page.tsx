import { Suspense } from "react";
import type { Metadata } from "next";
import { Pagination } from "@/components/ui/Pagination";
import { MedicationCard } from "@/components/medicaments/MedicationCard";
import { MedicationResults } from "@/components/medicaments/MedicationResults";
import { MedicationFilterBar } from "@/components/medicaments/MedicationFilterBar";
import { getMedications, getMedicationFormes, MEDICATIONS_PAGE_SIZE as PAGE_SIZE } from "@/lib/medications-query";
import { toLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/hreflang";

type Params = Promise<{ lang: string }>;

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Médicaments au Maroc — Prix, dosage et remboursement",
    description:
      "Base de données officielle des médicaments autorisés au Maroc. Prix public, taux de remboursement, dosage et avis patients.",
    alternates: localizedAlternates("/medicaments", locale),
    openGraph: {
      title: "Médicaments au Maroc — Prix et remboursement",
      description: "Base de données officielle des médicaments autorisés au Maroc.",
      url: "/medicaments",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Médicaments au Maroc — SantéauMaroc",
      description: "Base de données officielle des médicaments autorisés au Maroc.",
    },
  };
}

/* ── Page STATIQUE ────────────────────────────────────────
   Le serveur ne lit plus searchParams : la vue canonique (page 1, sans
   recherche/forme) est pré-rendue = shell SEO. Recherche `q` / forme / pagination
   basculent côté client (MedicationResults → /api/medicaments/search), noindex. */
export default async function MedicamentsPage() {
  const [{ medications, total }, formes] = await Promise.all([
    getMedications("", "", 1),
    getMedicationFormes(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const buildUrl = (p: number) => `/medicaments${p > 1 ? `?page=${p}` : ""}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "name": "Médicaments autorisés au Maroc",
        "description": `Base de données des médicaments autorisés au Maroc. ${total.toLocaleString("fr")} médicaments référencés avec prix, dosage et taux de remboursement.`,
        "url": `${BASE}/medicaments`,
        "numberOfItems": total,
        "itemListElement": medications.map((m, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": m.nom,
          "url": `${BASE}/medicaments/${m.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Médicaments", "item": `${BASE}/medicaments` },
        ],
      },
    ],
  };

  // Vue canonique (page 1, sans filtre) : grille + pagination. Rendue côté serveur
  // (fallback <Suspense> = HTML prérendu, indexable) et affichée sans filtre actif.
  const canonicalGrid = medications.length === 0 ? (
    <div className="empty-state">
      <p className="font-semibold text-slate-700 text-base">Aucun médicament dans la base.</p>
    </div>
  ) : (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {medications.map((m) => <MedicationCard key={m.id} m={m} />)}
      </div>
      <Pagination page={1} totalPages={totalPages} buildUrl={buildUrl} />
    </>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="page-outer">

        {/* ── En-tête ─────────────────────────────────────── */}
        <header className="mb-8">
          <p className="section-eyebrow mb-1.5">Base médicamenteuse</p>
          <h1 className="section-title">Médicaments</h1>
          <p className="mt-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{total.toLocaleString("fr")}</span>
            {" "}médicament{total !== 1 ? "s" : ""} dans notre base de données
          </p>
          <div className="mt-4 h-px"
            style={{ background: "linear-gradient(90deg, #bfdbfe 0%, #a7f3d0 60%, transparent 100%)" }} />
        </header>

        {/* ── Recherche + filtres + résultats — client. <Suspense> requis
            (useSearchParams) ; fallback = vue canonique SSR (SEO). ── */}
        <Suspense fallback={<><MedicationFilterBar q="" forme="" formes={formes} />{canonicalGrid}</>}>
          <MedicationResults formes={formes}>
            {canonicalGrid}
          </MedicationResults>
        </Suspense>
      </div>
    </>
  );
}
