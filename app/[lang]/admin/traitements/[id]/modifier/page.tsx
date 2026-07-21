import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TreatmentEditor } from "../../_components/TreatmentEditor";

export const metadata: Metadata = { title: "Modifier le traitement — Admin SantéauMaroc" };

type Params = Promise<{ id: string }>;

export default async function ModifierTraitementPage({ params }: { params: Params }) {
  const { id } = await params;

  const [treatment, specialties] = await Promise.all([
    prisma.treatment.findUnique({
      where: { id },
      select: {
        id: true, name: true, slug: true, category: true, shortAnswer: true,
        options: true, duration: true, sideEffects: true, redFlags: true, whenToConsult: true,
        faqJson: true, synonyms: true, specialtyId: true, relatedSlugs: true, glossarySlugs: true, sources: true,
        nameAr: true, shortAnswerAr: true, optionsAr: true, durationAr: true, sideEffectsAr: true,
        redFlagsAr: true, whenToConsultAr: true, faqJsonAr: true, sourcesAr: true,
        status: true, reviewedAt: true, arReviewedAt: true,
      },
    }),
    prisma.specialty.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!treatment) notFound();

  const treatmentData = {
    ...treatment,
    reviewedAt: treatment.reviewedAt ? treatment.reviewedAt.toISOString() : null,
    arReviewedAt: treatment.arReviewedAt ? treatment.arReviewedAt.toISOString() : null,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Modifier le traitement</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">/traitements/{treatment.slug}</p>
      </div>
      <TreatmentEditor specialties={specialties} treatment={treatmentData} />
    </div>
  );
}
