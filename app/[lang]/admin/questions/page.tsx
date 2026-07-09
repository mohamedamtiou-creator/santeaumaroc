import type { Metadata } from "next";
import Link from "next/link";
import { getModerationData, rejectQuestionForm, resolveReportForm, mergeQuestionForm } from "@/features/qa/admin-actions";
import { publishQuestion } from "@/features/qa/actions";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { AdminListFooter } from "../_components/AdminListFooter";
import { parsePage, buildPageUrl } from "@/lib/pagination";

export const metadata: Metadata = { title: "Modération Questions/Réponses — Admin" };

function fmt(d: Date) {
  return new Intl.DateTimeFormat("fr-MA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const { page, take } = parsePage(pageParam);
  const { pending, pendingTotal, openReports, recent, counts, aiByQuestion } = await getModerationData({ page, perPage: take });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const buildUrl = buildPageUrl("/admin/questions", {});

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <AdminPageHeader title="Modération Questions / Réponses" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "À modérer", value: pendingTotal, cls: "bg-amber-50 text-amber-700 border-amber-100" },
          { label: "Signalements", value: openReports.length, cls: "bg-red-50 text-red-600 border-red-100" },
          { label: "Publiées", value: countMap["PUBLISHED"] ?? 0, cls: "bg-secondary-50 text-secondary-700 border-secondary-100" },
          { label: "Rejetées", value: countMap["REJECTED"] ?? 0, cls: "bg-slate-50 text-slate-600 border-slate-100" },
        ].map((s) => (
          <div key={s.label} className={`card p-5 border ${s.cls}`}>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* File de modération */}
      <section>
        <h2 className="font-bold text-slate-900 mb-3">À modérer ({pendingTotal})</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune question en attente.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map((q) => (
              <div key={q.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-900">{q.title}</h3>
                  {q.urgencyLevel === "URGENT" && (
                    <span className="shrink-0 rounded-full bg-red-100 text-red-700 px-2.5 py-1 text-xs font-bold">URGENCE</span>
                  )}
                </div>
                {q.body && <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{q.body}</p>}
                <p className="text-xs text-slate-400 mt-2">
                  {q.askedBy?.name} · {q.askedBy?.email} · {q.specialty?.name ?? "—"} · {fmt(q.createdAt)}
                </p>

                {q.moderationNote && (
                  <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{q.moderationNote}</p>
                )}

                {/* Suggestions IA */}
                {(() => {
                  const ai = aiByQuestion[q.id] as
                    | { correctedTitle?: string; suggestedTags?: string[]; suggestedSpecialtySlug?: string | null; duplicateSlugs?: string[]; danger?: boolean }
                    | undefined;
                  if (!ai) return null;
                  const dupes = Array.isArray(ai.duplicateSlugs) ? ai.duplicateSlugs : [];
                  return (
                    <div className="mt-3 rounded-lg border border-primary-100 bg-primary-50/50 px-3 py-2 text-xs text-slate-600">
                      <p className="font-semibold text-primary-700 mb-1">Assistance IA</p>
                      {ai.correctedTitle && ai.correctedTitle !== q.title && (
                        <p>Titre suggéré : <span className="text-slate-800">« {ai.correctedTitle} »</span></p>
                      )}
                      {Array.isArray(ai.suggestedTags) && ai.suggestedTags.length > 0 && (
                        <p>Tags : {ai.suggestedTags.join(", ")}</p>
                      )}
                      {ai.suggestedSpecialtySlug && <p>Spécialité : {ai.suggestedSpecialtySlug}</p>}
                      {dupes.length > 0 && (
                        <form action={mergeQuestionForm} className="mt-2 flex flex-wrap items-center gap-2">
                          <input type="hidden" name="sourceId" value={q.id} />
                          <span>Doublon possible :</span>
                          <select name="targetSlug" className="input-field text-xs py-1">
                            {dupes.map((d: string) => (<option key={d} value={d}>{d}</option>))}
                          </select>
                          <button type="submit" className="text-primary-700 font-semibold hover:text-primary-800">Fusionner →</button>
                        </form>
                      )}
                    </div>
                  );
                })()}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <form action={publishQuestion.bind(null, q.id)}>
                    <button type="submit" className="btn-secondary text-sm py-2 px-4">Publier</button>
                  </form>
                  <form action={rejectQuestionForm} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={q.id} />
                    <input name="note" placeholder="Motif (optionnel)" className="input-field text-sm py-1.5 w-48" />
                    <button type="submit" className="text-sm font-semibold text-red-600 hover:text-red-700">Rejeter</button>
                  </form>
                  <Link href={`/admin/questions/${q.id}`} className="text-sm text-slate-500 hover:text-slate-700">Éditer</Link>
                  <form action={mergeQuestionForm} className="flex items-center gap-2">
                    <input type="hidden" name="sourceId" value={q.id} />
                    <input name="targetSlug" placeholder="slug cible (fusion)" className="input-field text-sm py-1.5 w-44" />
                    <button type="submit" className="text-sm text-slate-500 hover:text-slate-700">Fusionner</button>
                  </form>
                </div>
              </div>
            ))}
            {pendingTotal > take && (
              <div className="card p-0 overflow-hidden">
                <AdminListFooter page={page} total={pendingTotal} buildUrl={buildUrl} noun="questions à modérer" />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Signalements */}
      <section>
        <h2 className="font-bold text-slate-900 mb-3">Signalements ouverts ({openReports.length})</h2>
        {openReports.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun signalement en attente.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {openReports.map((r) => (
              <div key={r.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">{r.reason}</span>
                  <span className="text-slate-400"> · {r.targetType} </span>
                  {r.targetType === "ANSWER" || r.targetType === "QUESTION" ? (
                    <span className="text-slate-400">#{r.targetId.slice(0, 8)}</span>
                  ) : null}
                  {r.detail && <p className="text-slate-600 mt-1">{r.detail}</p>}
                  <p className="text-xs text-slate-400 mt-1">{fmt(r.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={resolveReportForm}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="DISMISSED" />
                    <button type="submit" className="text-sm text-slate-500 hover:text-slate-700">Ignorer</button>
                  </form>
                  <form action={resolveReportForm}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="REVIEWED" />
                    <button type="submit" className="btn-outline text-sm py-1.5 px-3">Traité</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Publiées récentes */}
      <section>
        <h2 className="font-bold text-slate-900 mb-3">Publiées récemment</h2>
        <div className="flex flex-col gap-2">
          {recent.map((q) => (
            <Link key={q.id} href={`/questions/${q.slug}`} className="text-sm text-slate-600 hover:text-primary-700 flex items-center justify-between gap-3 py-1">
              <span className="truncate">{q.title}</span>
              <span className="text-xs text-slate-400 whitespace-nowrap">{q.answersCount} rép.</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
