import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HealthTopicEditor } from "../_components/HealthTopicEditor";

export const metadata: Metadata = { title: "Nouveau symptôme — Admin SantéauMaroc" };

export default async function NouveauSymptomePage() {
  const specialties = await prisma.specialty.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Nouveau symptôme</h1>
        <p className="text-sm text-slate-500 mt-0.5">Créez un hub santé (réponse courte, causes, signes d’alerte).</p>
      </div>
      <HealthTopicEditor specialties={specialties} />
    </div>
  );
}
