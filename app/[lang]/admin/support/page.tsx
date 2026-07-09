import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminListFooter } from "../_components/AdminListFooter";
import { parsePage, buildPageUrl } from "@/lib/pagination";
import { SortableTh, parseDir, type SortDir } from "../_components/SortHeader";

export const metadata: Metadata = { title: "Support — Admin SantéauMaroc" };

type SortKey = "categorie" | "date" | "statut";
const SORTS: Record<SortKey, (dir: SortDir) => Prisma.SupportTicketOrderByWithRelationInput[]> = {
  categorie: (dir) => [{ category: dir }, { createdAt: "desc" }],
  date:      (dir) => [{ createdAt: dir }],
  statut:    (dir) => [{ status: dir }, { createdAt: "desc" }],
};
const DEFAULT_ORDER: Prisma.SupportTicketOrderByWithRelationInput[] = [{ priority: "desc" }, { createdAt: "desc" }];

const STATUS_CFG = {
  open:        { label: "Ouverte",   cls: "bg-amber-50 border-amber-200 text-amber-700",                 dot: "bg-amber-400"       },
  in_progress: { label: "En cours",  cls: "bg-primary-50 border-primary-200 text-primary-700",           dot: "bg-primary-500"     },
  resolved:    { label: "Résolue",   cls: "bg-secondary-50 border-secondary-200 text-secondary-700",     dot: "bg-secondary-500"   },
  closed:      { label: "Fermée",    cls: "bg-slate-50 border-slate-200 text-slate-600",                  dot: "bg-slate-400"       },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  compte:      "Compte",
  rdv:         "RDV",
  fiche:       "Fiche",
  technique:   "Technique",
  signalement: "Signalement",
  autre:       "Autre",
};

const ROLE_CFG: Record<string, { label: string; cls: string }> = {
  PATIENT: { label: "Patient",    cls: "bg-primary-50 text-primary-700"   },
  DOCTOR:  { label: "Praticien",  cls: "bg-secondary-50 text-secondary-700" },
  ADMIN:   { label: "Admin",      cls: "bg-slate-100 text-slate-600"      },
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(d));
}

type SearchParams = Promise<{ statut?: string; page?: string; tri?: string; dir?: string }>;

export default async function AdminSupportPage({ searchParams }: { searchParams: SearchParams }) {
  const { statut, page: pageParam, tri: triParam, dir: dirParam } = await searchParams;
  const { page, skip, take } = parsePage(pageParam);
  const tri: SortKey | undefined = triParam && triParam in SORTS ? (triParam as SortKey) : undefined;
  const dir = parseDir(dirParam);
  const orderBy = tri ? SORTS[tri](dir) : DEFAULT_ORDER;

  const statusFilter =
    statut === "ouvertes"     ? "open"        :
    statut === "en-cours"     ? "in_progress" :
    statut === "resolues"     ? "resolved"    :
    statut === "fermees"      ? "closed"      :
    undefined;

  const where = statusFilter ? { status: statusFilter } : undefined;

  const [tickets, filteredTotal, openCount, totalCount] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.count({ where: { status: "open" } }),
    prisma.supportTicket.count(),
  ]);

  const buildUrl = buildPageUrl("/admin/support", { statut, tri, dir });

  const FILTERS = [
    { label: "Toutes", value: undefined,       href: "/admin/support"              },
    { label: "Ouvertes",  value: "open",       href: "/admin/support?statut=ouvertes"  },
    { label: "En cours",  value: "in_progress",href: "/admin/support?statut=en-cours"  },
    { label: "Résolues",  value: "resolved",   href: "/admin/support?statut=resolues"  },
    { label: "Fermées",   value: "closed",     href: "/admin/support?statut=fermees"   },
  ];

  return (
    <div className="max-w-5xl">

      {/* En-tête */}
      <div className="mb-6">
        <AdminPageHeader
          title="Support"
          subtitle={`${totalCount} demande${totalCount !== 1 ? "s" : ""} · ${openCount} ouverte${openCount !== 1 ? "s" : ""}`}
        />
      </div>

      {/* Alerte tickets ouverts */}
      {openCount > 0 && !statusFilter && (
        <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd"/>
          </svg>
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{openCount} demande{openCount !== 1 ? "s" : ""} ouverte{openCount !== 1 ? "s" : ""}</span>
            {" "}en attente de traitement.
          </p>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {FILTERS.map((f) => {
          const active = f.value === statusFilter;
          return (
            <Link
              key={f.href}
              href={f.href}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                active
                  ? "bg-primary-600 border-primary-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Tableau */}
      {tickets.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-6 h-6 text-slate-300" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-600">Aucune demande</p>
          <p className="text-sm text-slate-500">Aucune demande ne correspond à ce filtre.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-start px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Utilisateur</th>
                  <SortableTh col="categorie" label="Catégorie" basePath="/admin/support" tri={tri} dir={dir} params={{ statut }}
                    className="text-start px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" />
                  <th className="text-start px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Sujet</th>
                  <SortableTh col="date" label="Date" basePath="/admin/support" tri={tri} dir={dir} params={{ statut }}
                    className="text-start px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" />
                  <SortableTh col="statut" label="Statut" basePath="/admin/support" tri={tri} dir={dir} params={{ statut }}
                    className="text-start px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tickets.map((t) => {
                  const status = STATUS_CFG[t.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.open;
                  const role   = ROLE_CFG[t.user.role] ?? ROLE_CFG.PATIENT;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                            {t.user.name.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate max-w-[130px]">{t.user.name}</p>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${role.cls}`}>
                              {role.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {CATEGORY_LABELS[t.category] ?? t.category}
                        </span>
                        {t.priority === "urgent" && (
                          <span className="ms-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            !!
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="text-slate-700 truncate">{t.subject}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${status.cls}`}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/support/${t.id}`}
                          className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-0.5"
                        >
                          Voir
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                            className="w-3 h-3" aria-hidden="true">
                            <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <AdminListFooter page={page} total={filteredTotal} buildUrl={buildUrl} noun="demandes" />
        </div>
      )}
    </div>
  );
}
