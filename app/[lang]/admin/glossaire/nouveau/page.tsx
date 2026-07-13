import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { GlossaryEditor } from "../_components/GlossaryEditor";

export const metadata: Metadata = { title: "Nouveau terme — Admin SantéauMaroc" };

export default async function NouveauTermePage() {
  const specialties = await prisma.specialty.findMany({
    select: { id: true, name: true },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Nouveau terme de glossaire</h1>
        <p className="text-sm text-slate-500 mt-0.5">Définition courte et factuelle, optimisée pour les moteurs IA</p>
      </div>
      <GlossaryEditor specialties={specialties} />
    </div>
  );
}
