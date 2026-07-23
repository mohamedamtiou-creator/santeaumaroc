import { getContributorUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { toLocale } from "@/lib/i18n";
import { espaceContent } from "@/lib/espace-content";
import { isVerifiedAuthor } from "@/lib/contributor";
import { ArticleEditor } from "@/components/editor/ArticleEditor";

export default async function NewArticlePage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const user = await getContributorUser();
  const categories = await prisma.postCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  const canSubmit = isVerifiedAuthor(user.authorStatus) || user.role === "ADMIN";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900" dir="auto">{espaceContent(locale).nav.newArticle}</h2>
      <ArticleEditor categories={categories} canSubmit={canSubmit} locale={locale} />
    </div>
  );
}
