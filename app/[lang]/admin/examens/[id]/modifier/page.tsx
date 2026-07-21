import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExamEditor } from "../../_components/ExamEditor";

export const metadata: Metadata = { title: "Modifier l'examen — Admin SantéauMaroc" };

type Params = Promise<{ id: string }>;

export default async function ModifierExamenPage({ params }: { params: Params }) {
  const { id } = await params;

  const [exam, specialties] = await Promise.all([
    prisma.medicalExam.findUnique({
      where: { id },
      select: {
        id: true, name: true, slug: true, category: true, shortAnswer: true,
        indications: true, procedure: true, preparation: true, precautions: true,
        durationMin: true, priceMin: true, priceMax: true, reimbursement: true,
        faqJson: true, synonyms: true, specialtyId: true, relatedSlugs: true, glossarySlugs: true, sources: true,
        nameAr: true, shortAnswerAr: true, indicationsAr: true, procedureAr: true, preparationAr: true,
        precautionsAr: true, reimbursementAr: true, faqJsonAr: true, sourcesAr: true,
        status: true, reviewedAt: true, arReviewedAt: true,
      },
    }),
    prisma.specialty.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!exam) notFound();

  const examData = {
    ...exam,
    reviewedAt: exam.reviewedAt ? exam.reviewedAt.toISOString() : null,
    arReviewedAt: exam.arReviewedAt ? exam.arReviewedAt.toISOString() : null,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Modifier l'examen</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">/examens/{exam.slug}</p>
      </div>
      <ExamEditor specialties={specialties} exam={examData} />
    </div>
  );
}
