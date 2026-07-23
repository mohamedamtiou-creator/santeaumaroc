import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminListFooter } from "../_components/AdminListFooter";
import { parsePage, buildPageUrl } from "@/lib/pagination";
import { professionLabel } from "@/lib/contributor";
import { AuthorVerifyActions } from "@/components/admin/AuthorVerifyActions";

const FILTERS = [
  { key: "PENDING", label: "À vérifier" },
  { key: "VERIFIED", label: "Vérifiés" },
  { key: "UNVERIFIED", label: "Non vérifiés" },
  { key: "SUSPENDED", label: "Suspendus" },
] as const;

const KIND_LABELS: Record<string, string> = {
  ORDRE: "Ordre", DIPLOME: "Diplôme", CARTE_PRO: "Carte pro", RC: "RC", STATUTS: "Statuts", AUTRE: "Autre",
};

export default async function AdminAuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const statut = FILTERS.some((f) => f.key === sp.statut) ? sp.statut! : "PENDING";
  const { page, skip, take } = parsePage(sp.page);
  const where = { authorStatus: statut, professionKind: { not: null } };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      select: {
        id: true, name: true, email: true, authorSlug: true, professionKind: true, authorStatus: true,
        orderName: true, registrationNumber: true,
        authorSpecialty: { select: { name: true } },
        licenses: { where: { status: "PENDING" }, select: { id: true, kind: true, documentUrl: true, documentName: true, ordreNumber: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const buildUrl = buildPageUrl("/admin/auteurs", { statut, page: String(page) });

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Auteurs" subtitle="Vérification de l'identité professionnelle des contributeurs." />

      <nav className="flex flex-wrap gap-1.5" aria-label="Filtrer par statut">
        {FILTERS.map((f) => (
          <Link key={f.key} href={`/admin/auteurs?statut=${f.key}`} className={`text-sm px-3 py-1.5 rounded-lg border ${statut === f.key ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {f.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-10 text-center text-slate-400">Aucun auteur dans cette catégorie.</div>
      ) : (
        <ul className="space-y-3 list-none m-0 p-0">
          {rows.map((u) => (
            <li key={u.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {u.authorSlug ? <Link href={`/auteur/${u.authorSlug}`} className="hover:text-primary-700">{u.name}</Link> : u.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {[professionLabel(u.professionKind), u.authorSpecialty?.name].filter(Boolean).join(" · ")} · {u.email}
                  </p>
                  {(u.orderName || u.registrationNumber) && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {u.orderName}{u.registrationNumber ? ` · n° ${u.registrationNumber}` : ""}
                    </p>
                  )}
                  {u.licenses.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {u.licenses.map((l) => (
                        l.documentUrl ? (
                          <a key={l.id} href={l.documentUrl} target="_blank" rel="noopener" className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
                            {KIND_LABELS[l.kind] ?? l.kind} ↗
                          </a>
                        ) : (
                          <span key={l.id} className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                            {KIND_LABELS[l.kind] ?? l.kind}{l.ordreNumber ? ` : ${l.ordreNumber}` : ""}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
                {statut === "PENDING" && (
                  <div className="shrink-0">
                    <AuthorVerifyActions userId={u.id} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <AdminListFooter page={page} total={total} buildUrl={buildUrl} noun="auteurs" />
      </div>
    </div>
  );
}
