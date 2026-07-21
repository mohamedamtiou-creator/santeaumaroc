import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ExamEditor } from "../_components/ExamEditor";

export const metadata: Metadata = { title: "Nouvel examen — Admin SantéauMaroc" };

export default async function NouvelExamenPage() {
  const specialties = await prisma.specialty.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Nouvel examen</h1>
        <p className="text-sm text-slate-500 mt-0.5">Créez une fiche examen (c'est quoi, indications, déroulé, prix).</p>
      </div>
      <ExamEditor specialties={specialties} />
    </div>
  );
}
