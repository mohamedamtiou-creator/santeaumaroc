import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminListFooter } from "../_components/AdminListFooter";
import { parsePage, buildPageUrl } from "@/lib/pagination";
import { EDITORIAL_LABELS, EDITORIAL_STATUS, type EditorialStatus } from "@/lib/contributor";
import { AdminArticleActions } from "@/components/admin/AdminArticleActions";

const toneCls: Record<string, string> = {
  grey: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-secondary-50 text-secondary-700",
  rose: "bg-red-50 text-red-700",
};

const FILTERS = [
  { key: "SUBMITTED", label: "Soumis" },
  { key: "IN_REVIEW", label: "En révision" },
  { key: "CHANGES_REQUESTED", label: "Corrections" },
  { key: "APPROVED", label: "Approuvés" },
  { key: "PUBLISHED", label: "Publiés" },
  { key: "ALL", label: "Tous" },
] as const;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const statut = FILTERS.some((f) => f.key === sp.statut) ? sp.statut! : "SUBMITTED";
  const { page, skip, take } = parsePage(sp.page);

  // Les contributions sont les Post dont le workflow éditorial est actif
  // (exclut les articles blog admin historiques restés en DRAFT sans soumission).
  const where =
    statut === "ALL"
      ? { editorialStatus: { not: EDITORIAL_STATUS.DRAFT } }
      : { editorialStatus: statut };

  const [rows, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip,
      take,
      select: {
        id: true, title: true, slug: true, editorialStatus: true, qualityScore: true, submittedAt: true,
        author: { select: { name: true, authorSlug: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const buildUrl = buildPageUrl("/admin/articles", { statut, page: String(page) });

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Articles (contributions)" subtitle="File de relecture médicale des articles soumis par les auteurs." />

      <nav className="flex flex-wrap gap-1.5" aria-label="Filtrer par statut">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/articles?statut=${f.key}`}
            className={`text-sm px-3 py-1.5 rounded-lg border ${statut === f.key ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">Titre</th>
                <th className="px-5 py-3 font-semibold">Auteur</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Aucun article dans cette file.</td></tr>
              ) : (
                rows.map((p) => {
                  const meta = EDITORIAL_LABELS[p.editorialStatus as EditorialStatus] ?? EDITORIAL_LABELS.DRAFT;
                  return (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="px-5 py-3">
                        <Link href={`/admin/articles/${p.id}/reviser`} className="font-medium text-slate-900 hover:text-primary-700" dir="auto">{p.title || "Sans titre"}</Link>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {p.author.authorSlug ? (
                          <Link href={`/auteur/${p.author.authorSlug}`} className="hover:text-primary-700">{p.author.name}</Link>
                        ) : p.author.name}
                      </td>
                      <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${toneCls[meta.tone]}`}>{meta.label}</span></td>
                      <td className="px-5 py-3 tabular-nums text-slate-600">{p.qualityScore != null ? `${p.qualityScore}/100` : "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/articles/${p.id}/reviser`} className="text-primary-700 font-medium hover:underline">Ouvrir</Link>
                          <AdminArticleActions postId={p.id} status={p.editorialStatus} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <AdminListFooter page={page} total={total} buildUrl={buildUrl} noun="articles" />
      </div>
    </div>
  );
}
