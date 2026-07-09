import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { editQuestionForm } from "@/features/qa/admin-actions";

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
      select: { id: true, title: true, body: true, specialtyId: true, aiSummary: true, metaTitle: true, metaDesc: true, tags: true },
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

        <div className="flex justify-end">
          <button type="submit" className="btn-primary text-sm py-2.5 px-6">Enregistrer</button>
        </div>
      </form>

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
