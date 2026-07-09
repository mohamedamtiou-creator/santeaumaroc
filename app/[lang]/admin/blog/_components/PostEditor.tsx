"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createPost, updatePost } from "@/features/blog/actions";

const TiptapEditor = dynamic(
  () => import("@/components/blog/TiptapEditor").then((m) => m.TiptapEditor),
  { ssr: false, loading: () => <div className="border border-slate-200 rounded-xl animate-pulse bg-slate-50 h-64" /> }
);

export type Category = { id: string; name: string; color: string };
export type PillarOption = { id: string; title: string };

export type PostData = {
  id:           string;
  title:        string;
  slug:         string;
  excerpt:      string;
  content:      string;
  coverImage:   string | null;
  coverAlt:     string | null;
  categoryId:   string;
  metaTitle:    string | null;
  metaDesc:     string | null;
  featured:     boolean;
  status:       string;
  keyTakeaways: string | null;
  faqJson:      string | null;
  aboutEntity:  string | null;
  pillarId:     string | null;
  reviewedAt:   string | null;
};

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow";
const labelCls = "block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

export function PostEditor({ categories, pillars = [], post }: { categories: Category[]; pillars?: PillarOption[]; post?: PostData }) {
  const isEdit = !!post;
  const [pending, start] = useTransition();
  const [title,      setTitle]      = useState(post?.title      ?? "");
  const [slug,       setSlug]       = useState(post?.slug       ?? "");
  const [excerpt,    setExcerpt]    = useState(post?.excerpt     ?? "");
  const [content,    setContent]    = useState(post?.content     ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage  ?? "");
  const [coverAlt,   setCoverAlt]   = useState(post?.coverAlt    ?? "");
  const [categoryId, setCategoryId] = useState(post?.categoryId  ?? (categories[0]?.id ?? ""));
  const [metaTitle,  setMetaTitle]  = useState(post?.metaTitle   ?? "");
  const [metaDesc,   setMetaDesc]   = useState(post?.metaDesc    ?? "");
  const [featured,   setFeatured]   = useState(post?.featured    ?? false);
  const [takeaways,  setTakeaways]  = useState(post?.keyTakeaways ?? "");
  const [faq,        setFaq]        = useState(() => {
    if (!post?.faqJson) return "";
    try { return JSON.stringify(JSON.parse(post.faqJson), null, 2); } catch { return post.faqJson; }
  });
  const [aboutEntity, setAboutEntity] = useState(post?.aboutEntity ?? "");
  const [pillarId,   setPillarId]   = useState(post?.pillarId    ?? "");
  const [markReviewed, setMarkReviewed] = useState(false);
  const [seoOpen,    setSeoOpen]    = useState(false);
  const [error,      setError]      = useState("");

  // Un article ne peut pas être son propre pilier.
  const pillarChoices = pillars.filter((p) => p.id !== post?.id);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!isEdit) setSlug(toSlug(val));
  }

  async function handleSave(publish: boolean) {
    setError("");
    if (!title.trim())    { setError("Le titre est obligatoire.");    return; }
    if (!slug.trim())     { setError("Le slug est obligatoire.");     return; }
    if (!categoryId)      { setError("Choisissez une catégorie.");    return; }
    if (!excerpt.trim())  { setError("L'extrait est obligatoire.");   return; }
    if (!content.trim() || content === "<p></p>") { setError("Le contenu est obligatoire."); return; }

    const fd = new FormData();
    fd.set("title",      title.trim());
    fd.set("slug",       slug.trim());
    fd.set("excerpt",    excerpt.trim());
    fd.set("content",    content);
    fd.set("coverImage", coverImage.trim());
    fd.set("coverAlt",   coverAlt.trim());
    fd.set("categoryId", categoryId);
    fd.set("metaTitle",  metaTitle.trim());
    fd.set("metaDesc",   metaDesc.trim());
    fd.set("featured",   String(featured));
    fd.set("keyTakeaways", takeaways);
    fd.set("faqJson",      faq);
    fd.set("aboutEntity",  aboutEntity.trim());
    fd.set("pillarId",     pillarId);
    fd.set("markReviewed", String(markReviewed));
    fd.set("publish",    String(publish));

    start(async () => {
      try {
        if (isEdit) {
          await updatePost(post.id, fd);
        } else {
          await createPost(fd);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* ── Infos générales ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Informations générales</h2>

        <div>
          <label className={labelCls}>Titre *</label>
          <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Titre de l'article" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Slug URL</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap font-mono">/blog/</span>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="slug-de-larticle" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Catégorie *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
              <option value="">— Choisir —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Image de couverture (URL)</label>
            <input type="url" value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Texte alternatif de l’image <span className="normal-case font-normal text-slate-500">(SEO/accessibilité — décrire l’image, pas le titre)</span></label>
          <input type="text" value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} maxLength={160}
            placeholder="Ex. : Lecteur de glycémie et stylo autopiqueur pour dépister le diabète" className={inputCls} />
          <p className="text-xs text-slate-500 mt-1">Repli sur le titre si vide. {coverAlt.length} / 160 caractères</p>
        </div>

        <div>
          <label className={labelCls}>Extrait * <span className="normal-case font-normal text-slate-500">(affiché dans les listes)</span></label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3}
            placeholder="Court résumé de l'article (1-2 phrases)" className={`${inputCls} resize-none`} />
          <p className="text-xs text-slate-500 mt-1">{excerpt.length} / 300 caractères</p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
          <span className="text-sm font-medium text-slate-700">Mettre cet article en avant (featured)</span>
        </label>
      </div>

      {/* ── Éditeur contenu ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Contenu de l’article</h2>
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      {/* ── GEO / E-E-A-T ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Optimisation IA (GEO) & relecture médicale</h2>
          <p className="text-xs text-slate-500 mt-1">Améliore les chances d’être cité par Google AI Overview, ChatGPT, Gemini et Perplexity.</p>
        </div>

        <div>
          <label className={labelCls}>À retenir <span className="normal-case font-normal text-slate-500">(1 point clé par ligne)</span></label>
          <textarea value={takeaways} onChange={(e) => setTakeaways(e.target.value)} rows={4}
            placeholder={"Point clé 1\nPoint clé 2\nPoint clé 3"} className={`${inputCls} resize-y font-normal`} />
        </div>

        <div>
          <label className={labelCls}>FAQ <span className="normal-case font-normal text-slate-500">{`(JSON : [{ "q": "Question ?", "a": "Réponse." }])`}</span></label>
          <textarea value={faq} onChange={(e) => setFaq(e.target.value)} rows={6}
            placeholder={`[\n  { "q": "Question ?", "a": "Réponse." }\n]`} className={`${inputCls} resize-y font-mono text-xs`} />
          <p className="text-xs text-slate-500 mt-1">Affichée en accordéon + balisée en FAQPage (rich result Google).</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Entité médicale <span className="normal-case font-normal text-slate-500">(pour le balisage <code>about</code>)</span></label>
            <input type="text" value={aboutEntity} onChange={(e) => setAboutEntity(e.target.value)}
              placeholder="Ex. : Diabète de type 2" className={inputCls} />
            <p className="text-xs text-slate-500 mt-1">Sujet réel de l&apos;article (≠ titre). Balisé <code>MedicalCondition</code>. Repli : le titre.</p>
          </div>
          <div>
            <label className={labelCls}>Pilier du cocon <span className="normal-case font-normal text-slate-500">(guide parent)</span></label>
            <select value={pillarId} onChange={(e) => setPillarId(e.target.value)} className={inputCls}>
              <option value="">— Aucun (article autonome ou pilier) —</option>
              {pillarChoices.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-1">Rattache ce satellite à son guide. Laisser vide pour un pilier.</p>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={markReviewed} onChange={(e) => setMarkReviewed(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-secondary-600 focus:ring-secondary-500" />
          <span className="text-sm font-medium text-slate-700">
            Marquer comme vérifié médicalement aujourd&apos;hui
            {post?.reviewedAt && (
              <span className="text-xs text-slate-400 font-normal"> (dernière vérif. enregistrée)</span>
            )}
          </span>
        </label>
      </div>

      {/* ── SEO ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setSeoOpen(!seoOpen)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-slate-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6.5" cy="6.5" r="4"/><path d="m14 14-3-3"/>
            </svg>
            SEO avancé (optionnel)
          </span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-slate-500 transition-transform ${seoOpen ? "rotate-180" : ""}`} aria-hidden="true" strokeLinecap="round">
            <path d="m4 6 4 4 4-4"/>
          </svg>
        </button>
        {seoOpen && (
          <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-5">
            <div>
              <label className={labelCls}>Meta titre <span className="normal-case font-normal text-slate-500">(par défaut : titre de l’article)</span></label>
              <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || "Meta titre…"} className={inputCls} />
              <p className="text-xs text-slate-500 mt-1">{(metaTitle || title).length} / 60 caractères</p>
            </div>
            <div>
              <label className={labelCls}>Meta description <span className="normal-case font-normal text-slate-500">(par défaut : extrait)</span></label>
              <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2}
                placeholder={excerpt || "Meta description…"} className={`${inputCls} resize-none`} />
              <p className="text-xs text-slate-500 mt-1">{(metaDesc || excerpt).length} / 160 caractères</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/blog" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
          ← Retour à la liste
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button" onClick={() => handleSave(false)} disabled={pending}
            className="px-5 py-2.5 text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl disabled:opacity-50 transition-colors"
          >
            {pending ? "Sauvegarde…" : "Brouillon"}
          </button>
          <button
            type="button" onClick={() => handleSave(true)} disabled={pending}
            className="px-5 py-2.5 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm"
          >
            {pending ? "…" : isEdit ? "Mettre à jour" : "Publier l'article"}
          </button>
        </div>
      </div>
    </div>
  );
}
