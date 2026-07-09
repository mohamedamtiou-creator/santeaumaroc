import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminListFooter } from "../_components/AdminListFooter";
import { parsePage, buildPageUrl } from "@/lib/pagination";
import { SortableTh, parseDir, type SortDir } from "../_components/SortHeader";

export const metadata: Metadata = { title: "Praticiens — Admin SantéauMaroc" };

/* ── Tri par colonne ────────────────────────────────────── */
type SortKey = "nom" | "specialite" | "statut";

const SORTS: Record<SortKey, (dir: SortDir) => Prisma.DoctorOrderByWithRelationInput[]> = {
  nom:        (dir) => [{ nom: dir }, { prenom: dir }],
  specialite: (dir) => [{ specialty: { name: dir } }, { city: { name: dir } }],
  // asc = non vérifié / inactif d'abord ; desc = vérifié + actif d'abord
  statut:     (dir) => [{ isVerified: dir }, { isActive: dir }],
};

// Ordre par défaut : files prioritaires d'abord (demandes en attente, etc.).
const DEFAULT_ORDER: Prisma.DoctorOrderByWithRelationInput[] = [
  { claims: { _count: "desc" } },
  { isVerified: "asc" },
  { isActive: "asc" },
  { createdAt: "desc" },
];

/* ── Statut combiné ─────────────────────────────────────── */
function getDoctorStatus(isVerified: boolean, isActive: boolean, claimStatus?: string) {
  if (isVerified  &&  isActive) return { label: "Vérifié",            cls: "bg-secondary-50 border-secondary-200 text-secondary-700", dot: "bg-secondary-500" };
  if (isVerified  && !isActive) return { label: "Vérifié · Suspendu", cls: "bg-amber-50 border-amber-200 text-amber-700",             dot: "bg-amber-400"     };
  if (!isVerified &&  isActive) return { label: "Actif",              cls: "bg-primary-50 border-primary-200 text-primary-700",       dot: "bg-primary-500"   };
  if (claimStatus === "PENDING")  return { label: "En attente",        cls: "bg-amber-50 border-amber-200 text-amber-700",             dot: "bg-amber-400"     };
  if (claimStatus === "REJECTED") return { label: "Refusé",            cls: "bg-red-50 border-red-200 text-red-600",                   dot: "bg-red-400"       };
  return                                  { label: "Inactif",           cls: "bg-slate-50 border-slate-200 text-slate-500",             dot: "bg-slate-300"     };
}

export default async function AdminPraticiensPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string; q?: string; page?: string; tri?: string; dir?: string }>;
}) {
  const { filtre, q, page: pageParam, tri: triParam, dir: dirParam } = await searchParams;
  const { page, skip, take } = parsePage(pageParam);

  const tri: SortKey | undefined = triParam && triParam in SORTS ? (triParam as SortKey) : undefined;
  const dir: SortDir = parseDir(dirParam);
  const orderBy = tri ? SORTS[tri](dir) : DEFAULT_ORDER;

  const where = {
    ...(filtre === "en-attente"  && { claims: { some: { status: "PENDING" } } }),
    ...(filtre === "actifs"      && { isActive: true }),
    ...(filtre === "verifies"    && { isVerified: true }),
    ...(filtre === "inactifs"    && { isActive: false }),
    ...(q && {
      OR: [
        { nom:    { contains: q, mode: "insensitive" as const } },
        { prenom: { contains: q, mode: "insensitive" as const } },
        { user:   { email: { contains: q, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [doctors, filteredTotal, total, pendingCount] = await Promise.all([
    prisma.doctor.findMany({
      where,
      include: {
        user:      { select: { email: true } },
        specialty: { select: { name: true } },
        city:      { select: { name: true } },
        claims:    { orderBy: { updatedAt: "desc" }, take: 1, select: { status: true } },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.doctor.count({ where }),
    prisma.doctor.count(),
    prisma.doctorClaim.count({ where: { status: "PENDING" } }),
  ]);

  const buildUrl = buildPageUrl("/admin/praticiens", { filtre, q, tri, dir });

  const FILTERS = [
    { key: undefined,      label: "Tous",         count: total },
    { key: "en-attente",   label: "En attente",   count: pendingCount },
    { key: "actifs",       label: "Actifs",        count: undefined },
    { key: "verifies",     label: "Vérifiés",      count: undefined },
    { key: "inactifs",     label: "Désactivés",    count: undefined },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <AdminPageHeader title="Praticiens" subtitle={`${total} fiche${total > 1 ? "s" : ""} au total`} />

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filtre === f.key || (!filtre && !f.key);
            const href = f.key
              ? `/admin/praticiens?filtre=${f.key}${q ? `&q=${q}` : ""}`
              : `/admin/praticiens${q ? `?q=${q}` : ""}`;
            const isPendingFilter = f.key === "en-attente";
            return (
              <Link key={f.label} href={href}
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-primary-600 border-primary-600 text-white"
                    : isPendingFilter && (f.count ?? 0) > 0
                    ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {f.label}
                {f.count !== undefined && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    active ? "bg-white/25" : isPendingFilter && f.count > 0 ? "bg-amber-200 text-amber-800" : "bg-slate-100 text-slate-500"
                  }`}>
                    {f.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        <form method="GET" action="/admin/praticiens" className="flex gap-2">
          {filtre && <input type="hidden" name="filtre" value={filtre} />}
          <input name="q" type="search" defaultValue={q ?? ""} placeholder="Nom, prénom ou e-mail…"
            className="input-field text-sm w-56 py-1.5" />
        </form>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && !filtre && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="7"/><path d="M8 5v4M8 11h.01"/>
            </svg>
          </div>
          <p className="text-sm text-amber-800 font-medium flex-1">
            <span className="font-bold">{pendingCount}</span> demande{pendingCount > 1 ? "s" : ""} de vérification en attente d&apos;examen
          </p>
          <Link href="/admin/praticiens?filtre=en-attente"
            className="text-xs font-bold text-amber-700 border border-amber-300 bg-white px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors shrink-0">
            Traiter →
          </Link>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {[
          { dot: "bg-secondary-500", label: "Vérifié + actif" },
          { dot: "bg-primary-500",   label: "Actif sans badge" },
          { dot: "bg-amber-400",     label: "En attente / Suspendu" },
          { dot: "bg-red-400",       label: "Refusé" },
          { dot: "bg-slate-300",     label: "Inactif" },
        ].map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${s.dot}`} aria-hidden="true" />
            {s.label}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {doctors.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">Aucun praticien trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <SortableTh col="nom" label="Praticien" basePath="/admin/praticiens" tri={tri} dir={dir} params={{ filtre, q }}
                    className="text-start px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider" />
                  <SortableTh col="specialite" label="Spécialité · Ville" basePath="/admin/praticiens" tri={tri} dir={dir} params={{ filtre, q }}
                    className="text-start px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell" />
                  <SortableTh col="statut" label="Statut" basePath="/admin/praticiens" tri={tri} dir={dir} params={{ filtre, q }}
                    className="text-start px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider" />
                  <th className="px-4 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => {
                  const fullName   = [doc.civilite, doc.prenom, doc.nom].filter(Boolean).join(" ") || "—";
                  const initials   = [doc.prenom?.[0], doc.nom?.[0]].filter(Boolean).join("").toUpperCase() || "?";
                  const claimStatus = doc.claims[0]?.status;
                  const status     = getDoctorStatus(doc.isVerified, doc.isActive, claimStatus);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 relative ${
                            doc.isVerified ? "bg-secondary-100 text-secondary-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            {initials}
                            {doc.isVerified && (
                              <span className="absolute -bottom-0.5 -end-0.5 w-3.5 h-3.5 rounded-full bg-secondary-500 border-2 border-white flex items-center justify-center">
                                <svg viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5" className="w-2 h-2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1.5 4l2 2 3-3"/>
                                </svg>
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-slate-900 truncate block">{fullName}</span>
                            <span className="text-slate-500 text-xs truncate block">{doc.user?.email ?? "—"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell text-slate-600 text-sm">
                        {doc.specialty?.name ?? "—"}<span className="text-slate-500"> · {doc.city?.name ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-end">
                        <Link href={`/admin/praticiens/${doc.id}`}
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
          <AdminListFooter page={page} total={filteredTotal} buildUrl={buildUrl} noun="praticiens" />
        )}
      </div>
    </div>
  );
}
