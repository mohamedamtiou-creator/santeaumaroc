import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { editQuestionForm, editAnswerArForm } from "@/features/qa/admin-actions";
import { formatDoctorName } from "@/lib/utils";

export const metadata: Metadata = { title: "Éditer une question — Admin" };

type Params = Promise<{ id: string }>;

export default async function EditQuestionPage({ params }: { params: Params }) {
  // Garde admin (les actions revérifient, mais on protège aussi l'accès page).
  const session = await verifySession();
  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (me?.role !== "ADMIN") notFound();

  const { id } = await params;
  const [q, specialties, revisions] = await Promise.all([
    prisma.question.findUnique({
      where: { id },
      select: {
        id: true, title: true, body: true, specialtyId: true, aiSummary: true,
        metaTitle: true, metaDesc: true, tags: true,
        titleAr: true, bodyAr: true, aiSummaryAr: true, metaTitleAr: true, metaDescAr: true,
        arReviewedAt: true,
        answers: {
          where: { status: "PUBLISHED" },
          orderBy: { score: "desc" },
          select: {
            id: true, body: true, bodyAr: true, arReviewedAt: true, isAccepted: true,
            doctor: { select: { civilite: true, prenom: true, nom: true } },
          },
        },
      },
    }),
    prisma.specialty.findMany({ select: { id: true, name: true }, orderBy: { order: "asc" } }),
    prisma.qaRevision.findMany({
      where: { entityType: "QUESTION", entityId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, previousTitle: true, previousBody: true, createdAt: true },
    }),
  ]);
  if (!q) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/questions" className="text-sm text-slate-500 hover:text-slate-700">← Retour à la modération</Link>
      <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-5">Éditer la question</h1>

      <form action={editQuestionForm} className="flex flex-col gap-4 card p-5">
        <input type="hidden" name="id" value={q.id} />

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">Titre</span>
          <input name="title" defaultValue={q.title} required minLength={10} maxLength={200} className="input-field" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">Contexte</span>
          <textarea name="body" defaultValue={q.body ?? ""} rows={4} className="input-field text-sm" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">Spécialité</span>
          <select name="specialtyId" defaultValue={q.specialtyId ?? ""} className="input-field">
            <option value="">—</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">L&apos;essentiel (résumé AI Overviews)</span>
          <textarea name="aiSummary" defaultValue={q.aiSummary ?? ""} rows={3} className="input-field text-sm" />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-700">Meta title</span>
            <input name="metaTitle" defaultValue={q.metaTitle ?? ""} maxLength={70} className="input-field text-sm" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-700">Tags (séparés par des virgules)</span>
            <input name="tags" defaultValue={q.tags.join(", ")} className="input-field text-sm" />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">Meta description</span>
          <textarea name="metaDesc" defaultValue={q.metaDesc ?? ""} rows={2} maxLength={170} className="input-field text-sm" />
        </label>

        {/* ── Version arabe ── */}
        <fieldset className="border-t border-slate-100 pt-4 mt-1">
          <legend className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
            <span aria-hidden="true">🇲🇦</span> Version arabe (العربية)
            {q.arReviewedAt ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-200">relue — servie</span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">non relue — repli FR</span>
            )}
          </legend>

          <div className="flex flex-col gap-4" dir="rtl">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-slate-700" dir="ltr">Titre (AR)</span>
              <input name="titleAr" defaultValue={q.titleAr ?? ""} maxLength={200} className="input-field" placeholder="عنوان السؤال" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-slate-700" dir="ltr">Contexte (AR)</span>
              <textarea name="bodyAr" defaultValue={q.bodyAr ?? ""} rows={4} className="input-field text-sm" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-slate-700" dir="ltr">L&apos;essentiel (AR)</span>
              <textarea name="aiSummaryAr" defaultValue={q.aiSummaryAr ?? ""} rows={3} className="input-field text-sm" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-slate-700" dir="ltr">Meta title (AR)</span>
                <input name="metaTitleAr" defaultValue={q.metaTitleAr ?? ""} maxLength={70} className="input-field text-sm" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-slate-700" dir="ltr">Meta description (AR)</span>
                <input name="metaDescAr" defaultValue={q.metaDescAr ?? ""} maxLength={170} className="input-field text-sm" />
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none mt-3">
            <input type="checkbox" name="markArReviewed" value="true" className="w-4 h-4 rounded border-slate-300 text-secondary-600 focus:ring-secondary-500" />
            <span className="text-sm font-medium text-slate-700">
              Version arabe relue → autoriser l’affichage/indexation en arabe
              {q.arReviewedAt && (
                <span className="text-xs text-slate-400 font-normal"> (déjà relue le {new Intl.DateTimeFormat("fr-MA", { dateStyle: "medium" }).format(q.arReviewedAt)})</span>
              )}
            </span>
          </label>

          {q.arReviewedAt && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none mt-2">
              <input type="checkbox" name="unmarkArReviewed" value="true" className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
              <span className="text-sm font-medium text-red-700">
                Retirer la relecture arabe <span className="font-normal text-red-500/80">(repli FR, l’arabe repasse en noindex)</span>
              </span>
            </label>
          )}
        </fieldset>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary text-sm py-2.5 px-6">Enregistrer</button>
        </div>
      </form>

      {q.answers.length > 0 && (
        <section className="mt-8">
          <h2 className="font-bold text-slate-900 mb-1">Réponses — traduction arabe ({q.answers.length})</h2>
          <p className="text-sm text-slate-500 mb-3">La traduction AR n’est servie que si « relue » est coché. Sinon, repli sur le français.</p>
          <ul className="flex flex-col gap-4">
            {q.answers.map((a) => (
              <li key={a.id} className="card p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {formatDoctorName(a.doctor)}
                    {a.isAccepted && <span className="ms-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-200">Meilleure réponse</span>}
                  </p>
                  {a.arReviewedAt ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-200">AR relue</span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">AR non relue</span>
                  )}
                </div>

                <div className="text-sm text-slate-600 mb-3 rounded-lg bg-slate-50 border border-slate-100 p-3 max-h-40 overflow-auto [&_p]:mb-2 [&_li]:ms-4 [&_li]:list-disc"
                  dangerouslySetInnerHTML={{ __html: a.body }} />

                <form action={editAnswerArForm} className="flex flex-col gap-2.5">
                  <input type="hidden" name="id" value={a.id} />
                  <label className="flex flex-col gap-1.5" dir="rtl">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide" dir="ltr">Réponse traduite (AR) — HTML</span>
                    <textarea name="bodyAr" defaultValue={a.bodyAr ?? ""} rows={5} className="input-field text-sm font-mono" />
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" name="markArReviewed" value="true" className="w-4 h-4 rounded border-slate-300 text-secondary-600 focus:ring-secondary-500" />
                        <span className="text-sm text-slate-700">Marquer la traduction AR comme relue</span>
                      </label>
                      {a.arReviewedAt && (
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input type="checkbox" name="unmarkArReviewed" value="true" className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                          <span className="text-sm text-red-700">Retirer la relecture AR <span className="text-red-500/80">(repli FR)</span></span>
                        </label>
                      )}
                    </div>
                    <button type="submit" className="btn-secondary text-sm py-2 px-4">Enregistrer l’AR</button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {revisions.length > 0 && (
        <section className="mt-8">
          <h2 className="font-bold text-slate-900 mb-3">Historique des modifications ({revisions.length})</h2>
          <ul className="flex flex-col gap-3">
            {revisions.map((r) => (
              <li key={r.id} className="card p-4 text-sm">
                <p className="text-xs text-slate-400 mb-1">
                  {new Intl.DateTimeFormat("fr-MA", { dateStyle: "medium", timeStyle: "short" }).format(r.createdAt)}
                </p>
                {r.previousTitle && <p className="text-slate-700"><span className="text-slate-400">Titre :</span> {r.previousTitle}</p>}
                {r.previousBody && <p className="text-slate-600 mt-1 whitespace-pre-wrap line-clamp-4">{r.previousBody}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
