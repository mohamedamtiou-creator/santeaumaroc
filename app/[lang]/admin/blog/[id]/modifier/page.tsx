import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "../../_components/PostEditor";

export const metadata: Metadata = { title: "Modifier l'article — Admin SantéauMaroc" };

type Params = Promise<{ id: string }>;

export default async function ModifierArticlePage({ params }: { params: Params }) {
  const { id } = await params;

  const [post, categories, pillars] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      select: {
        id: true, title: true, slug: true, excerpt: true, content: true,
        coverImage: true, coverAlt: true, categoryId: true, metaTitle: true, metaDesc: true,
        featured: true, status: true, keyTakeaways: true, faqJson: true,
        aboutEntity: true, pillarId: true, reviewedAt: true,
      },
    }),
    prisma.postCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.post.findMany({
      where: { id: { not: id } },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  if (!post) notFound();

  const postData = { ...post, reviewedAt: post.reviewedAt ? post.reviewedAt.toISOString() : null };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Modifier l'article</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">/blog/{post.slug}</p>
      </div>
      <PostEditor categories={categories} pillars={pillars} post={postData} />
    </div>
  );
}
