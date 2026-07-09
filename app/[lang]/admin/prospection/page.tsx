import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminListFooter } from "../_components/AdminListFooter";
import { parsePage, buildPageUrl } from "@/lib/pagination";
import { SortableTh, parseDir, type SortDir } from "../_components/SortHeader";

export const metadata: Metadata = { title: "Prospection — Admin SantéauMaroc" };

type SortKey = "rdv" | "avis" | "note";
const SORTS: Record<SortKey, (dir: SortDir) => Prisma.DoctorOrderByWithRelationInput[]> = {
  rdv:  (dir) => [{ appointments: { _count: dir } }, { reviews: { _count: "desc" } }],
  avis: (dir) => [{ reviews: { _count: dir } }, { appointments: { _count: "desc" } }],
  note: (dir) => [{ averageRating: dir }],
};
const DEFAULT_ORDER: Prisma.DoctorOrderByWithRelationInput[] = [
  { appointments: { _count: "desc" } },
  { reviews: { _count: "desc" } },
];

export default async function AdminProspectionPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tri?: string; dir?: string }>;
}) {
  const { page: pageParam, tri: triParam, dir: dirParam } = await searchParams;
  const { page, skip, take } = parsePage(pageParam);
  const tri: SortKey | undefined = triParam && triParam in SORTS ? (triParam as SortKey) : undefined;
  const dir = parseDir(dirParam);
  const orderBy = tri ? SORTS[tri](dir) : DEFAULT_ORDER;

  const [targets, totalUnclaimed, activeTotal, withActivity] = await Promise.all([
    prisma.doctor.findMany({
      where: { userId: null, isActive: true },
      select: {
        id: true, slug: true, civilite: true, nom: true, prenom: true, phone: true,
        averageRating: true,
        specialty: { select: { name: true } },
        city:      { select: { name: true } },
        _count:    { select: { appointments: true, reviews: true } },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.doctor.count({ where: { userId: null, isActive: true } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.doctor.count({
      where: {
        userId: null,
        isActive: true,
        OR: [{ appointments: { some: {} } }, { reviews: { some: {} } }],
      },
    }),
  ]);

  const buildUrl = buildPageUrl("/admin/prospection", { tri, dir });

  const sharePct = activeTotal > 0 ? Math.round((totalUnclaimed / activeTotal) * 100) : 0;

  const STATS = [
    { label: "Fiches non revendiquées", value: totalUnclaimed.toLocaleString("fr-MA") },
    { label: "Part des fiches actives", value: `${sharePct}%` },
    { label: "Avec activité (RDV/avis)", value: withActivity.toLocaleString("fr-MA"), hint: "cibles prioritaires" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* En-tête */}
      <AdminPageHeader
        title="Prospection — fiches à revendiquer"
        subtitle="Médecins non rattachés à un compte, triés par activité. Les fiches qui reçoivent déjà des rendez-vous ou des avis sont les meilleures cibles d'appel : le médecin a tout intérêt à reprendre la main."
      />

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1.5">{s.label}</p>
            {s.hint && <p className="text-[11px] font-medium text-secondary-600 mt-0.5">{s.hint}</p>}
          </div>
        ))}
      </div>

      {/* Liste des cibles */}
      {targets.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary-50 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.6" className="w-7 h-7" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" />
            </svg>
          </div>
          <h2 className="font-semibold text-slate-700">Toutes les fiches actives sont revendiquées</h2>
          <p className="text-sm text-slate-500 mt-1">Rien à prospecter pour le moment.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 680 }}>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600 text-xs">Praticien</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-xs">Téléphone</th>
                  <SortableTh col="rdv" label="RDV" basePath="/admin/prospection" tri={tri} dir={dir}
                    className="px-4 py-3 font-semibold text-slate-600 text-xs text-end" />
                  <SortableTh col="avis" label="Avis" basePath="/admin/prospection" tri={tri} dir={dir}
                    className="px-4 py-3 font-semibold text-slate-600 text-xs text-end" />
                  <SortableTh col="note" label="Note" basePath="/admin/prospection" tri={tri} dir={dir}
                    className="px-4 py-3 font-semibold text-slate-600 text-xs text-end" />
                  <th className="px-4 py-3 font-semibold text-slate-600 text-xs text-end">Fiche</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((d) => {
                  const name = [d.civilite, d.prenom, d.nom].filter(Boolean).join(" ") || "—";
                  const priority = d._count.appointments > 0 || d._count.reviews > 0;
                  return (
                    <tr key={d.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {priority && (
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 shrink-0" title="Cible prioritaire" aria-label="Cible prioritaire" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 leading-tight truncate">{name}</p>
                            <p className="text-xs text-slate-500 truncate">{d.specialty.name} · {d.city.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {d.phone ? (
                          <a href={`tel:${d.phone}`} className="text-primary-700 hover:text-primary-800 font-medium tabular-nums">
                            <bdi dir="ltr">{d.phone}</bdi>
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-end tabular-nums text-slate-700">{d._count.appointments}</td>
                      <td className="px-4 py-3 text-end tabular-nums text-slate-700">{d._count.reviews}</td>
                      <td className="px-4 py-3 text-end tabular-nums text-slate-700">
                        {d.averageRating > 0 ? d.averageRating.toFixed(1) : "—"}
                      </td>
                      <td className="px-4 py-3 text-end">
                        {d.slug ? (
                          <Link href={`/praticiens/${d.slug}`} target="_blank" className="text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap">
                            Ouvrir ↗
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <AdminListFooter page={page} total={totalUnclaimed} buildUrl={buildUrl} noun="fiches non revendiquées" />
        </div>
      )}
    </div>
  );
}
