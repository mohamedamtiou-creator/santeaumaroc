import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TreatmentEditor } from "../_components/TreatmentEditor";

export const metadata: Metadata = { title: "Nouveau traitement — Admin SantéauMaroc" };

export default async function NouveauTraitementPage() {
  const specialties = await prisma.specialty.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Nouveau traitement</h1>
        <p className="text-sm text-slate-500 mt-0.5">Créez une fiche traitement (en bref, options, durée, effets).</p>
      </div>
      <TreatmentEditor specialties={specialties} />
    </div>
  );
}
