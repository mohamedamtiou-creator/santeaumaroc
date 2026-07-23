import { notFound } from "next/navigation";
import { getContributorUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { toLocale } from "@/lib/i18n";
import { isVerifiedAuthor, EDITORIAL_LABELS, type EditorialStatus } from "@/lib/contributor";
import { ArticleEditor, type EditorPost } from "@/components/editor/ArticleEditor";

const EDITABLE = ["DRAFT", "CHANGES_REQUESTED"];

export default async function EditArticlePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const locale = toLocale(lang);
  const isAr = locale === "ar";
  const user = await getContributorUser();

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true, authorId: true, title: true, excerpt: true, content: true, coverImage: true, coverAlt: true,
      categoryId: true, metaTitle: true, metaDesc: true, keyTakeaways: true, faqJson: true, sources: true,
      aboutEntity: true, bibliography: true, conflictOfInterest: true, evidenceLevel: true, editorialStatus: true,
      titleAr: true, excerptAr: true, contentAr: true, metaTitleAr: true, metaDescAr: true,
      keyTakeawaysAr: true, faqJsonAr: true, sourcesAr: true,
      editorialEvents: { where: { action: "CHANGES_REQUESTED" }, orderBy: { createdAt: "desc" }, take: 1, select: { note: true, createdAt: true } },
    },
  });

  if (!post || post.authorId !== user.id) notFound();

  const categories = await prisma.postCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  const canSubmit = isVerifiedAuthor(user.authorStatus) || user.role === "ADMIN";
  const editable = EDITABLE.includes(post.editorialStatus);
  const meta = EDITORIAL_LABELS[post.editorialStatus as EditorialStatus] ?? EDITORIAL_LABELS.DRAFT;
  const metaLabel = isAr ? meta.labelAr ?? meta.label : meta.label;
  const lastChange = post.editorialEvents[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900" dir="auto">{isAr ? "تعديل المقال" : "Modifier l’article"}</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{metaLabel}</span>
      </div>

      {post.editorialStatus === "CHANGES_REQUESTED" && lastChange?.note && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3">
          <p className="font-semibold mb-1" dir="auto">{isAr ? "تعديلات مطلوبة من المراجع :" : "Corrections demandées par le relecteur :"}</p>
          <p className="whitespace-pre-line" dir="auto">{lastChange.note}</p>
        </div>
      )}

      {editable ? (
        <ArticleEditor post={post as unknown as EditorPost} categories={categories} canSubmit={canSubmit} locale={locale} />
      ) : (
        <div className="card p-6 text-slate-600 text-sm" dir="auto">
          {isAr
            ? `هذا المقال «${metaLabel}» ولم يعد قابلاً للتعديل مباشرةً. سيصبح قابلاً للتعديل إذا طلب المراجع تصحيحات.`
            : `Cet article est « ${metaLabel.toLowerCase()} » et ne peut plus être modifié directement. Il redeviendra modifiable si le relecteur demande des corrections.`}
        </div>
      )}
    </div>
  );
}
