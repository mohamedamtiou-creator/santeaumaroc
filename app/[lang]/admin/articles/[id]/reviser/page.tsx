import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../../../_components/AdminPageHeader";
import { EDITORIAL_LABELS, evidenceLabel, type EditorialStatus } from "@/lib/contributor";
import { ReviewDecision } from "@/components/admin/ReviewDecision";

type QualityReport = {
  wordCount?: number;
  sources?: number;
  blockers?: string[];
  warnings?: string[];
};

export default async function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true, title: true, slug: true, excerpt: true, content: true, editorialStatus: true,
      qualityScore: true, qualityReport: true, evidenceLevel: true, conflictOfInterest: true,
      sources: true, bibliography: true, submittedAt: true,
      author: { select: { name: true, authorSlug: true, jobTitle: true, orderName: true } },
      reviewedBy: { select: { name: true } },
      editorialEvents: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, action: true, note: true, createdAt: true, actor: { select: { name: true } } },
      },
    },
  });
  if (!post) notFound();

  const meta = EDITORIAL_LABELS[post.editorialStatus as EditorialStatus] ?? EDITORIAL_LABELS.DRAFT;
  const report = (post.qualityReport ?? null) as QualityReport | null;
  const sources: { label: string; url: string; publisher?: string; year?: string }[] = (() => {
    try { return post.sources ? JSON.parse(post.sources) : []; } catch { return []; }
  })();

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Relecture"
        title={post.title || "Sans titre"}
        subtitle={<>Par {post.author.name}{post.author.jobTitle ? ` · ${post.author.jobTitle}` : ""}{post.author.orderName ? ` · ${post.author.orderName}` : ""}</>}
        actions={<Link href="/admin/articles" className="btn-outline px-4 py-2 text-sm">← File</Link>}
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Contenu de l'article */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600`}>{meta.label}</span>
              {post.evidenceLevel && <span className="text-xs text-slate-500">Preuve : {evidenceLabel(post.evidenceLevel)}</span>}
            </div>
            <p className="text-slate-600 italic mb-4" dir="auto">{post.excerpt}</p>
            <div className="blog-prose max-w-none" dir="auto" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {sources.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-2">Sources ({sources.length})</h3>
              <ul className="space-y-1.5 text-sm list-none m-0 p-0">
                {sources.map((s, i) => (
                  <li key={i}>
                    <a href={s.url} target="_blank" rel="noopener nofollow" className="text-primary-700 hover:underline break-words">{s.label}</a>
                    {s.publisher && <span className="text-slate-400"> — {s.publisher}{s.year ? ` (${s.year})` : ""}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-2">Déclaration de conflit d’intérêt</h3>
            <p className="text-sm text-slate-600" dir="auto">{post.conflictOfInterest || "— (non renseignée)"}</p>
          </div>
        </div>

        {/* Colonne latérale : décision + qualité + historique */}
        <div className="space-y-5">
          <ReviewDecision postId={post.id} status={post.editorialStatus} />

          {report && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-2">Contrôle qualité {post.qualityScore != null && <span className="text-slate-400 font-normal">— {post.qualityScore}/100</span>}</h3>
              <p className="text-sm text-slate-500 mb-2 tabular-nums">{report.wordCount ?? "?"} mots · {report.sources ?? 0} sources</p>
              {report.warnings && report.warnings.length > 0 && (
                <ul className="text-xs text-amber-700 list-disc pl-4 space-y-0.5">
                  {report.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              )}
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-3">Historique éditorial</h3>
            <ol className="space-y-3 list-none m-0 p-0">
              {post.editorialEvents.map((e) => (
                <li key={e.id} className="text-sm border-s-2 border-slate-100 ps-3">
                  <p className="font-medium text-slate-700">{e.action}</p>
                  {e.note && <p className="text-slate-500 whitespace-pre-line">{e.note}</p>}
                  <p className="text-xs text-slate-400 tabular-nums">{e.actor?.name ?? "Système"} · {e.createdAt.toLocaleDateString("fr-FR")}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
