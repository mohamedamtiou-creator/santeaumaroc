import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlossaryEditor } from "../../_components/GlossaryEditor";

export const metadata: Metadata = { title: "Modifier le terme — Admin SantéauMaroc" };

type Params = Promise<{ id: string }>;

export default async function ModifierTermePage({ params }: { params: Params }) {
  const { id } = await params;

  const [term, specialties] = await Promise.all([
    prisma.glossaryTerm.findUnique({
      where: { id },
      select: {
        id: true, term: true, slug: true, definition: true, category: true,
        synonyms: true, specialtyId: true, relatedSlug: true, sources: true,
        termAr: true, definitionAr: true, sourcesAr: true, status: true,
        reviewedAt: true, arReviewedAt: true,
      },
    }),
    prisma.specialty.findMany({ select: { id: true, name: true }, orderBy: { order: "asc" } }),
  ]);

  if (!term) notFound();

  const termData = {
    ...term,
    reviewedAt:   term.reviewedAt ? term.reviewedAt.toISOString() : null,
    arReviewedAt: term.arReviewedAt ? term.arReviewedAt.toISOString() : null,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Modifier le terme</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">/glossaire/{term.slug}</p>
      </div>
      <GlossaryEditor specialties={specialties} term={termData} />
    </div>
  );
}
