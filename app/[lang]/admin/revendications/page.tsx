import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminListFooter } from "../_components/AdminListFooter";
import { parsePage, buildPageUrl } from "@/lib/pagination";
import { SortableTh, parseDir, type SortDir } from "../_components/SortHeader";

export const metadata: Metadata = { title: "Revendications — Admin SantéauMaroc" };

type SortKey = "date" | "statut";
const SORTS: Record<SortKey, (dir: SortDir) => Prisma.DoctorClaimOrderByWithRelationInput[]> = {
  date:   (dir) => [{ createdAt: dir }],
  statut: (dir) => [{ status: dir }, { createdAt: "desc" }],
};
const DEFAULT_ORDER: Prisma.DoctorClaimOrderByWithRelationInput[] = [{ status: "asc" }, { createdAt: "desc" }];

const STATUS_CFG = {
  PENDING:  { label: "En attente",  cls: "bg-amber-50 border-amber-200 text-amber-700",        dot: "bg-amber-400"       },
  APPROVED: { label: "Approuvée",   cls: "bg-secondary-50 border-secondary-200 text-secondary-700", dot: "bg-secondary-500" },
  REJECTED: { label: "Refusée",     cls: "bg-red-50 border-red-200 text-red-600",               dot: "bg-red-400"         },
} as const;

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(d));
}

export default async function AdminRevendicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; page?: string; tri?: string; dir?: string }>;
}) {
  const { statut, page: pageParam, tri: triParam, dir: dirParam } = await searchParams;
  const { page, skip, take } = parsePage(pageParam);
  const tri: SortKey | undefined = triParam && triParam in SORTS ? (triParam as SortKey) : undefined;
  const dir = parseDir(dirParam);
  const orderBy = tri ? SORTS[tri](dir) : DEFAULT_ORDER;

  const statusFilter =
    statut === "approuvees" ? "APPROVED" :
    statut === "refusees"   ? "REJECTED"  :
    statut === "attente"    ? "PENDING"   :
    undefined;

  const where = statusFilter ? { status: statusFilter } : undefined;

  const [claims, filteredTotal, pendingCount, totalCount] = await Promise.all([
    prisma.doctorClaim.findMany({
      where,
      include: {
        doctor: {
          select: {
            id: true, nom: true, prenom: true, civilite: true, slug: true, userId: true,
            specialty: { select: { name: true } },
            city:      { select: { name: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.doctorClaim.count({ where }),
    prisma.doctorClaim.count({ where: { status: "PENDING" } }),
    prisma.doctorClaim.count(),
  ]);

  const buildUrl = buildPageUrl("/admin/revendications", { statut, tri, dir });

  const FILTERS = [
    { key: undefined,     label: "Toutes",       count: totalCount,   href: "/admin/revendications"                   },
    { key: "attente",     label: "En attente",   count: pendingCount, href: "/admin/revendications?statut=attente"    },
    { key: "approuvees",  label: "Approuvées",   count: undefined,    href: "/admin/revendications?statut=approuvees" },
    { key: "refusees",    label: "Refusées",     count: undefined,    href: "/admin/revendications?statut=refusees"   },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <AdminPageHeader
        title="Revendications de fiches"
        subtitle="Demandes de prise de contrôle de fiches médecin non revendiquées."
      />

      {/* Alerte en attente */}
      {pendingCount > 0 && !statut && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5"
              className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="7"/><path d="M8 5v4M8 11h.01"/>
            </svg>
          </div>
          <p className="text-sm text-amber-800 font-medium flex-1">
            <span className="font-bold">{pendingCount}</span> demande{pendingCount > 1 ? "s" : ""} en attente d&apos;examen
          </p>
          <Link href="/admin/revendications?statut=attente"
            className="text-xs font-bold text-amber-700 border border-amber-300 bg-white px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors shrink-0">
            Traiter →
          </Link>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (!statut && !f.key) || statut === f.key;
          return (
            <Link key={f.label} href={f.href}
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                active
                  ? "bg-primary-600 border-primary-600 text-white"
                  : f.key === "attente" && (f.count ?? 0) > 0
                  ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}>
              {f.label}
              {f.count !== undefined && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  active
                    ? "bg-white/25"
                    : f.key === "attente" && f.count > 0
                    ? "bg-amber-200 text-amber-800"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {f.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Liste */}
      <div className="card overflow-hidden p-0">
        {claims.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">Aucune revendication trouvée.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-start px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Fiche médecin</th>
                  <th className="text-start px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Demandeur</th>
                  <SortableTh col="date" label="Date" basePath="/admin/revendications" tri={tri} dir={dir} params={{ statut }}
                    className="text-start px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell" />
                  <SortableTh col="statut" label="Statut" basePath="/admin/revendications" tri={tri} dir={dir} params={{ statut }}
                    className="text-start px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider" />
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((claim) => {
                  const doc      = claim.doctor;
                  const doctorName = [doc.civilite, doc.prenom, doc.nom].filter(Boolean).join(" ") || "—";
                  const initials   = [doc.prenom?.[0], doc.nom?.[0]].filter(Boolean).join("").toUpperCase() || "?";
                  const cfg        = STATUS_CFG[claim.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.PENDING;
                  const isUnclaimed = !doc.userId;

                  return (
                    <tr key={claim.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Médecin */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-slate-900 truncate block">{doctorName}</span>
                            <span className="text-slate-500 text-xs truncate block">
                              {doc.specialty?.name ?? "—"} · {doc.city?.name ?? "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      {/* Demandeur */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="font-medium text-slate-800 block truncate max-w-[160px]">
                          {claim.user?.name ?? "—"}
                        </span>
                        <span className="text-slate-500 text-xs truncate block max-w-[160px]">
                          {claim.user?.email ?? "—"}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-500 text-xs">
                        {formatDate(claim.createdAt)}
                      </td>
                      {/* Statut */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
                            {cfg.label}
                          </span>
                          {isUnclaimed && claim.status === "PENDING" && (
                            <span className="inline-flex items-center text-xs font-medium text-slate-500 gap-1">
                              <span className="w-1 h-1 rounded-full bg-slate-400" aria-hidden="true" />
                              Fiche libre
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Action */}
                      <td className="px-4 py-3.5 text-end">
                        <Link href={`/admin/revendications/${claim.id}`}
                          className="text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline whitespace-nowrap group-hover:text-primary-700">
                          Examiner →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filteredTotal > 0 && (
          <AdminListFooter page={page} total={filteredTotal} buildUrl={buildUrl} noun="revendications" />
        )}
      </div>
    </div>
  );
}
