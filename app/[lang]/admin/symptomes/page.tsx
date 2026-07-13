import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteBtn } from "./_components/HealthTopicActions";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminListFooter } from "../_components/AdminListFooter";
import { parsePage, buildPageUrl } from "@/lib/pagination";
import { SortableTh, parseDir, type SortDir } from "../_components/SortHeader";

export const metadata: Metadata = { title: "Symptômes — Admin SantéauMaroc" };

type SortKey = "terme" | "statut" | "date";
const SORTS: Record<SortKey, (dir: SortDir) => Prisma.HealthTopicOrderByWithRelationInput[]> = {
  terme:  (dir) => [{ term: dir }],
  statut: (dir) => [{ status: dir }, { updatedAt: "desc" }],
  date:   (dir) => [{ updatedAt: dir }],
};
const DEFAULT_ORDER: Prisma.HealthTopicOrderByWithRelationInput[] = [{ updatedAt: "desc" }];

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-secondary-50 border-secondary-200 text-secondary-700",
  DRAFT:     "bg-slate-100 border-slate-200 text-slate-500",
};
const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Publié",
  DRAFT:     "Brouillon",
};
const KIND_LABEL: Record<string, string> = {
  SYMPTOM: "Symptôme",
  DISEASE: "Maladie",
};

export default async function AdminSymptomesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tri?: string; dir?: string }>;
}) {
  const { page: pageParam, tri: triParam, dir: dirParam } = await searchParams;
  const { page, skip, take } = parsePage(pageParam);
  const tri: SortKey | undefined = triParam && triParam in SORTS ? (triParam as SortKey) : undefined;
  const dir = parseDir(dirParam);
  const orderBy = tri ? SORTS[tri](dir) : DEFAULT_ORDER;

  const [topics, totalCount] = await Promise.all([
    prisma.healthTopic.findMany({
      orderBy,
      skip,
      take,
      select: {
        id: true, term: true, slug: true, kind: true, status: true,
        reviewedAt: true, arReviewedAt: true, updatedAt: true,
      },
    }),
    prisma.healthTopic.count(),
  ]);

  const buildUrl = buildPageUrl("/admin/symptomes", { tri, dir });

  const newBtn = (
    <Link
      href="/admin/symptomes/nouveau"
      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-sm"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true" strokeLinecap="round">
        <path d="M8 2v12M2 8h12"/>
      </svg>
      Nouveau symptôme
    </Link>
  );

  return (
    <div>
      <div className="mb-6">
        <AdminPageHeader
          title="Symptômes (hubs santé)"
          subtitle={`${totalCount} hub${totalCount !== 1 ? "s" : ""} au total`}
          actions={newBtn}
        />
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 mb-4">Aucun symptôme pour l’instant.</p>
          <Link href="/admin/symptomes/nouveau" className="text-primary-600 underline text-sm">Créer le premier hub</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <SortableTh col="terme" label="Symptôme" basePath="/admin/symptomes" tri={tri} dir={dir}
                  className="text-start px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide" />
                <th className="text-start px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Type</th>
                <th className="text-start px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Relecture</th>
                <SortableTh col="statut" label="Statut" basePath="/admin/symptomes" tri={tri} dir={dir}
                  className="text-start px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell" />
                <SortableTh col="date" label="Date" basePath="/admin/symptomes" tri={tri} dir={dir}
                  className="text-start px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell" />
                <th className="px-4 py-3" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topics.map((t) => {
                const statusCls = STATUS_STYLE[t.status] ?? STATUS_STYLE.DRAFT;
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 line-clamp-1 group-hover:text-primary-700 transition-colors">{t.term}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">/symptomes/{t.slug}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs text-slate-600">{KIND_LABEL[t.kind] ?? t.kind}</span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded border ${t.reviewedAt ? "bg-secondary-50 border-secondary-200 text-secondary-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                          FR {t.reviewedAt ? "✓" : "—"}
                        </span>
                        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded border ${t.arReviewedAt ? "bg-secondary-50 border-secondary-200 text-secondary-700" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
                          AR {t.arReviewedAt ? "✓" : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCls}`}>
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-xs text-slate-500">{fmtDate(t.updatedAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/symptomes/${t.slug}`} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Voir le hub"
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9"/><path d="M10 2h4v4"/><path d="m14 2-7 7"/>
                          </svg>
                        </a>
                        <Link
                          href={`/admin/symptomes/${t.id}/modifier`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Modifier"
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11.5 2.5a2.121 2.121 0 1 1 3 3L5 15H1v-4L11.5 2.5z"/>
                          </svg>
                        </Link>
                        <DeleteBtn id={t.id} term={t.term} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <AdminListFooter page={page} total={totalCount} buildUrl={buildUrl} noun="symptômes" />
        </div>
      )}
    </div>
  );
}
