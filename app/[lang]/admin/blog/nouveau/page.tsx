import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "../_components/PostEditor";

export const metadata: Metadata = { title: "Nouvel article — Admin SantéauMaroc" };

export default async function NouvelArticlePage() {
  const [categories, pillars] = await Promise.all([
    prisma.postCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.post.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Nouvel article</h1>
        <p className="text-sm text-slate-500 mt-0.5">Rédigez et publiez un article santé</p>
      </div>
      <PostEditor categories={categories} pillars={pillars} />
    </div>
  );
}
