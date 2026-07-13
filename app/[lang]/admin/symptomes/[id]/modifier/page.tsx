import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HealthTopicEditor } from "../../_components/HealthTopicEditor";

export const metadata: Metadata = { title: "Modifier le symptôme — Admin SantéauMaroc" };

type Params = Promise<{ id: string }>;

export default async function ModifierSymptomePage({ params }: { params: Params }) {
  const { id } = await params;

  const [topic, specialties] = await Promise.all([
    prisma.healthTopic.findUnique({
      where: { id },
      select: {
        id: true, kind: true, term: true, slug: true, shortAnswer: true,
        causes: true, redFlags: true, whenToConsult: true, faqJson: true,
        synonyms: true, specialtyId: true, relatedSlugs: true, glossarySlugs: true,
        sources: true, termAr: true, shortAnswerAr: true, causesAr: true,
        redFlagsAr: true, whenToConsultAr: true, faqJsonAr: true, sourcesAr: true,
        status: true, reviewedAt: true, arReviewedAt: true,
      },
    }),
    prisma.specialty.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!topic) notFound();

  const topicData = {
    ...topic,
    reviewedAt: topic.reviewedAt ? topic.reviewedAt.toISOString() : null,
    arReviewedAt: topic.arReviewedAt ? topic.arReviewedAt.toISOString() : null,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Modifier le symptôme</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">/symptomes/{topic.slug}</p>
      </div>
      <HealthTopicEditor specialties={specialties} topic={topicData} />
    </div>
  );
}
