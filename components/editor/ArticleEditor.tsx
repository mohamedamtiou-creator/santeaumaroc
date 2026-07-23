"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/blog/TiptapEditor";
import { saveArticleDraft, submitArticle, type ArticleState } from "@/features/articles/actions";
import { EVIDENCE_LEVELS } from "@/lib/contributor";
import { espaceContent } from "@/lib/espace-content";
import type { Locale } from "@/lib/i18n";

type Category = { id: string; name: string };
type SourceRow = { label: string; url: string; publisher: string; year: string };
type FaqRow = { q: string; a: string };

export type EditorPost = {
  id: string;
  title: string; excerpt: string; content: string;
  coverImage: string | null; coverAlt: string | null; categoryId: string;
  metaTitle: string | null; metaDesc: string | null; keyTakeaways: string | null;
  faqJson: string | null; sources: string | null; aboutEntity: string | null;
  bibliography: string | null; conflictOfInterest: string | null; evidenceLevel: string | null;
  editorialStatus: string;
  titleAr: string | null; excerptAr: string | null; contentAr: string | null;
  metaTitleAr: string | null; metaDescAr: string | null; keyTakeawaysAr: string | null;
  faqJsonAr: string | null; sourcesAr: string | null;
};

const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none";
const labelCls = "block text-sm font-medium text-slate-700 mb-1";

function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
}
function parseSources(json: string | null): SourceRow[] {
  if (!json) return [];
  try { const a = JSON.parse(json); return Array.isArray(a) ? a.map((x) => ({ label: String(x.label ?? ""), url: String(x.url ?? ""), publisher: String(x.publisher ?? ""), year: String(x.year ?? "") })) : []; } catch { return []; }
}
function parseFaq(json: string | null): FaqRow[] {
  if (!json) return [];
  try { const a = JSON.parse(json); return Array.isArray(a) ? a.map((x) => ({ q: String(x.q ?? ""), a: String(x.a ?? "") })) : []; } catch { return []; }
}
function serializeSources(rows: SourceRow[]): string {
  const clean = rows.filter((r) => r.label.trim() && r.url.trim()).map((r) => ({ label: r.label.trim(), url: r.url.trim(), ...(r.publisher.trim() ? { publisher: r.publisher.trim() } : {}), ...(r.year.trim() ? { year: r.year.trim() } : {}) }));
  return clean.length ? JSON.stringify(clean) : "";
}
function serializeFaq(rows: FaqRow[]): string {
  const clean = rows.filter((r) => r.q.trim() && r.a.trim()).map((r) => ({ q: r.q.trim(), a: r.a.trim() }));
  return clean.length ? JSON.stringify(clean) : "";
}
function CheckDot({ ok }: { ok: boolean }) {
  return ok ? (
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-secondary-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3.5 3.5L13 5" /></svg>
  ) : (
    <span className="w-4 h-4 shrink-0 mt-0.5 rounded-full border-2 border-slate-300" aria-hidden="true" />
  );
}

export function ArticleEditor({ post, categories, canSubmit, locale = "fr" }: { post?: EditorPost; categories: Category[]; canSubmit: boolean; locale?: Locale }) {
  const t = espaceContent(locale).editor;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<"fr" | "ar">("fr");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(post?.id ?? null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const [f, setF] = useState({
    title: post?.title ?? "", excerpt: post?.excerpt ?? "", content: post?.content ?? "",
    coverImage: post?.coverImage ?? "", coverAlt: post?.coverAlt ?? "", categoryId: post?.categoryId ?? categories[0]?.id ?? "",
    metaTitle: post?.metaTitle ?? "", metaDesc: post?.metaDesc ?? "", keyTakeaways: post?.keyTakeaways ?? "",
    aboutEntity: post?.aboutEntity ?? "", bibliography: post?.bibliography ?? "",
    conflictOfInterest: post?.conflictOfInterest ?? "", evidenceLevel: post?.evidenceLevel ?? "",
    titleAr: post?.titleAr ?? "", excerptAr: post?.excerptAr ?? "", contentAr: post?.contentAr ?? "",
    metaTitleAr: post?.metaTitleAr ?? "", metaDescAr: post?.metaDescAr ?? "", keyTakeawaysAr: post?.keyTakeawaysAr ?? "",
    faqJsonAr: post?.faqJsonAr ?? "", sourcesAr: post?.sourcesAr ?? "",
  });
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const [sources, setSources] = useState<SourceRow[]>(parseSources(post?.sources ?? null));
  const [faq, setFaq] = useState<FaqRow[]>(parseFaq(post?.faqJson ?? null));

  const words = wordCount(f.content);
  const validSources = sources.filter((s) => s.label.trim() && s.url.trim()).length;
  const blockers = [
    { key: "title", ok: !!f.title.trim() && !!f.excerpt.trim(), label: t.bTitle },
    { key: "words", ok: words >= 300, label: t.bWords.replace("{n}", String(words)) },
    { key: "sources", ok: validSources >= 2, label: t.bSources.replace("{n}", String(validSources)) },
    { key: "conflict", ok: !!f.conflictOfInterest.trim(), label: t.bConflict },
  ];
  const suggestions = [
    { key: "h2", ok: /<h2[\s>]/i.test(f.content), label: t.sH2 },
    { key: "faq", ok: faq.some((x) => x.q.trim() && x.a.trim()), label: t.sFaq },
    { key: "meta", ok: !!f.metaTitle.trim() && !!f.metaDesc.trim(), label: t.sMeta },
    { key: "cover", ok: !f.coverImage || !!f.coverAlt.trim(), label: t.sAlt },
  ];
  const blockersLeft = blockers.filter((b) => !b.ok).length;
  const ready = blockersLeft === 0;

  function buildFormData(): FormData {
    const fd = new FormData();
    if (savedId) fd.set("id", savedId);
    for (const [k, v] of Object.entries(f)) fd.set(k, v);
    fd.set("sources", serializeSources(sources));
    fd.set("faqJson", serializeFaq(faq));
    return fd;
  }

  async function uploadCover(file: File) {
    setError(null); setUploading(true);
    try {
      const fd = new FormData(); fd.set("file", file);
      const res = await fetch("/api/upload/article-media", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t.errUpload);
      setF((s) => ({ ...s, coverImage: json.url }));
    } catch (e) { setError(e instanceof Error ? e.message : t.errUpload); } finally { setUploading(false); }
  }

  const autosave = useCallback(async () => {
    if (!savedId || pending || !f.title.trim()) return;
    setSaveStatus("saving");
    try { const res = await saveArticleDraft(undefined, buildFormData()); setSaveStatus(res?.errors ? "idle" : "saved"); } catch { setSaveStatus("idle"); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedId, pending, f, sources, faq]);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    if (!savedId) return;
    const timer = setTimeout(() => { void autosave(); }, 2500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, sources, faq]);

  function handleSave(alsoSubmit: boolean) {
    setError(null);
    startTransition(async () => {
      let res: ArticleState;
      try { res = await saveArticleDraft(undefined, buildFormData()); }
      catch { setError(t.errSave); return; }
      if (res?.errors) { setError(Object.values(res.errors).join(" ")); return; }
      const id = res?.id;
      if (!id) return;
      const wasNew = !savedId;
      setSavedId(id); setSaveStatus("saved");
      if (alsoSubmit) {
        let sres: ArticleState;
        try { sres = await submitArticle(id); }
        catch { setError(t.errSubmit); return; }
        if (sres?.errors) { setError(sres.errors.quality ?? sres.errors.form ?? t.errSubmitGeneric); return; }
        router.push("/espace-auteur/articles"); router.refresh(); return;
      }
      if (wasNew) { router.replace(`/espace-auteur/articles/${id}`); router.refresh(); }
    });
  }

  const saveLabel = saveStatus === "saving" ? t.saving : saveStatus === "saved" ? t.saved : savedId ? "" : t.notSaved;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 pb-24 lg:pb-6">
      <div className="space-y-6 min-w-0">
        {error && <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">{error}</div>}

        <div className="flex gap-1 border-b border-slate-200">
          <button type="button" onClick={() => setTab("fr")} aria-pressed={tab === "fr"} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === "fr" ? "border-primary-600 text-primary-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>{t.tabFr}</button>
          <button type="button" onClick={() => setTab("ar")} aria-pressed={tab === "ar"} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === "ar" ? "border-primary-600 text-primary-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>{t.tabAr}</button>
        </div>

        {tab === "fr" ? (
          <section className="card p-5 space-y-5">
            <div><label className={labelCls} htmlFor="title">{t.title} <span className="text-red-500">*</span></label><input id="title" className={field} value={f.title} onChange={(e) => set("title")(e.target.value)} placeholder={t.titlePh} /></div>
            <div><label className={labelCls} htmlFor="excerpt">{t.excerpt} <span className="text-red-500">*</span> <span className="text-slate-400 font-normal">{t.excerptHint}</span></label><textarea id="excerpt" rows={2} className={field} value={f.excerpt} onChange={(e) => set("excerpt")(e.target.value)} /></div>
            <div>
              <label className={labelCls}>{t.content} <span className="text-red-500">*</span></label>
              <TiptapEditor content={f.content} onChange={set("content")} />
              <p className="text-xs text-slate-400 mt-1 tabular-nums">{t.wordsHint.replace("{n}", String(words))}</p>
            </div>
            <div><label className={labelCls} htmlFor="keyTakeaways">{t.keyTakeaways}</label><textarea id="keyTakeaways" rows={3} className={field} value={f.keyTakeaways} onChange={(e) => set("keyTakeaways")(e.target.value)} /></div>
          </section>
        ) : (
          <section className="card p-5 space-y-5" dir="rtl">
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">{t.arNotice}</p>
            <div><label className={labelCls} htmlFor="titleAr">العنوان</label><input id="titleAr" className={field} value={f.titleAr} onChange={(e) => set("titleAr")(e.target.value)} /></div>
            <div><label className={labelCls} htmlFor="excerptAr">الملخّص</label><textarea id="excerptAr" rows={2} className={field} value={f.excerptAr} onChange={(e) => set("excerptAr")(e.target.value)} /></div>
            <div><label className={labelCls}>المحتوى</label><TiptapEditor content={f.contentAr} onChange={set("contentAr")} /></div>
          </section>
        )}

        <section className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900">{t.sourcesTitle} <span className="text-red-500">*</span></h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${validSources >= 2 ? "bg-secondary-50 text-secondary-700" : "bg-amber-50 text-amber-700"}`}>{t.sourcesMin.replace("{n}", String(validSources))}</span>
          </div>
          <p className="text-sm text-slate-500 mb-4">{t.sourcesHelp}</p>
          <div className="space-y-3">
            {sources.map((s, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex gap-2">
                  <input aria-label={`${t.sourcesTitle} ${i + 1}`} className={field} placeholder={t.sourceLabelPh} value={s.label} onChange={(e) => setSources((p) => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  <button type="button" onClick={() => setSources((p) => p.filter((_, j) => j !== i))} aria-label={t.removeSource} className="shrink-0 px-2.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">✕</button>
                </div>
                <input aria-label="URL" className={field} placeholder={t.sourceUrlPh} value={s.url} onChange={(e) => setSources((p) => p.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                <div className="grid grid-cols-2 gap-2">
                  <input className={field} placeholder={t.sourcePublisherPh} value={s.publisher} onChange={(e) => setSources((p) => p.map((x, j) => j === i ? { ...x, publisher: e.target.value } : x))} />
                  <input className={field} placeholder={t.sourceYearPh} value={s.year} onChange={(e) => setSources((p) => p.map((x, j) => j === i ? { ...x, year: e.target.value } : x))} />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setSources((p) => [...p, { label: "", url: "", publisher: "", year: "" }])} className="mt-3 text-sm font-semibold text-primary-700 hover:text-primary-800">{t.addSource}</button>
        </section>

        <section className="card p-5">
          <h3 className="font-bold text-slate-900 mb-1">{t.faqTitle} <span className="text-slate-400 font-normal text-sm">{t.optional}</span></h3>
          <p className="text-sm text-slate-500 mb-4">{t.faqHelp}</p>
          <div className="space-y-3">
            {faq.map((x, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex gap-2">
                  <input aria-label={`${t.questionPh} ${i + 1}`} className={field} placeholder={t.questionPh} value={x.q} onChange={(e) => setFaq((p) => p.map((y, j) => j === i ? { ...y, q: e.target.value } : y))} />
                  <button type="button" onClick={() => setFaq((p) => p.filter((_, j) => j !== i))} aria-label={t.removeFaq} className="shrink-0 px-2.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">✕</button>
                </div>
                <textarea aria-label={`${t.answerPh} ${i + 1}`} rows={2} className={field} placeholder={t.answerPh} value={x.a} onChange={(e) => setFaq((p) => p.map((y, j) => j === i ? { ...y, a: e.target.value } : y))} />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setFaq((p) => [...p, { q: "", a: "" }])} className="mt-3 text-sm font-semibold text-primary-700 hover:text-primary-800">{t.addFaq}</button>
        </section>

        <section className="card p-5 grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls} htmlFor="categoryId">{t.category} <span className="text-red-500">*</span></label>
            <select id="categoryId" className={field} value={f.categoryId} onChange={(e) => set("categoryId")(e.target.value)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </div>
          <div>
            <label className={labelCls} htmlFor="evidenceLevel">{t.evidence}</label>
            <select id="evidenceLevel" className={field} value={f.evidenceLevel} onChange={(e) => set("evidenceLevel")(e.target.value)}>
              <option value="">—</option>
              {EVIDENCE_LEVELS.map((e) => <option key={e.key} value={e.key}>{locale === "ar" ? e.labelAr : e.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="conflictOfInterest">{t.conflict} <span className="text-red-500">*</span></label>
            <textarea id="conflictOfInterest" rows={2} className={field} value={f.conflictOfInterest} onChange={(e) => set("conflictOfInterest")(e.target.value)} placeholder={t.conflictPh} />
          </div>
        </section>

        <section className="card p-5">
          <label className={labelCls}>{t.cover}</label>
          <div className="flex items-center gap-3">
            {f.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.coverImage} alt={t.cover} className="h-14 w-20 rounded-lg object-cover border border-slate-200 shrink-0" />
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadCover(file); }} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-primary-700 file:font-medium hover:file:bg-primary-100 disabled:opacity-50" />
          </div>
          {uploading && <p className="text-xs text-slate-400 mt-1">{t.uploading}</p>}
          {f.coverImage && (
            <div className="mt-3">
              <label className={labelCls} htmlFor="coverAlt">{t.alt} <span className="text-slate-400 font-normal">{t.altHint}</span></label>
              <input id="coverAlt" className={field} value={f.coverAlt} onChange={(e) => set("coverAlt")(e.target.value)} placeholder={t.altPh} />
            </div>
          )}
        </section>

        <section className="card p-0 overflow-hidden">
          <button type="button" onClick={() => setShowAdvanced((v) => !v)} aria-expanded={showAdvanced} className="w-full flex items-center justify-between px-5 py-4 text-start">
            <span className="font-bold text-slate-900">{t.advanced}</span>
            <span className={`text-primary-600 text-xl transition-transform ${showAdvanced ? "rotate-45" : ""}`} aria-hidden="true">+</span>
          </button>
          {showAdvanced && (
            <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
              <div><label className={labelCls} htmlFor="metaTitle">{t.metaTitle}</label><input id="metaTitle" className={field} value={f.metaTitle} onChange={(e) => set("metaTitle")(e.target.value)} placeholder={t.metaTitleHint} /></div>
              <div><label className={labelCls} htmlFor="metaDesc">{t.metaDesc}</label><textarea id="metaDesc" rows={2} className={field} value={f.metaDesc} onChange={(e) => set("metaDesc")(e.target.value)} /></div>
              <div><label className={labelCls} htmlFor="aboutEntity">{t.aboutEntity}</label><input id="aboutEntity" className={field} value={f.aboutEntity} onChange={(e) => set("aboutEntity")(e.target.value)} placeholder={t.aboutPh} /></div>
              <div><label className={labelCls} htmlFor="bibliography">{t.biblio}</label><textarea id="bibliography" rows={2} className={field} value={f.bibliography} onChange={(e) => set("bibliography")(e.target.value)} /></div>
            </div>
          )}
        </section>
      </div>

      {/* Sidebar readiness (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 space-y-4">
          <div className={`card p-5 ${ready ? "border-secondary-200" : ""}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${ready ? "bg-secondary-100 text-secondary-700" : "bg-amber-100 text-amber-700"}`}>{ready ? "✓" : blockersLeft}</span>
              <h3 className="font-bold text-slate-900">{ready ? t.readyTitle : t.notReadyTitle}</h3>
            </div>
            <ul className="space-y-2 list-none m-0 p-0">
              {blockers.map((b) => <li key={b.key} className="flex items-start gap-2 text-sm"><CheckDot ok={b.ok} /><span className={b.ok ? "text-slate-500" : "text-slate-800 font-medium"}>{b.label}</span></li>)}
            </ul>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-4 mb-2">{t.recommended}</p>
            <ul className="space-y-2 list-none m-0 p-0">
              {suggestions.map((b) => <li key={b.key} className="flex items-start gap-2 text-sm"><CheckDot ok={b.ok} /><span className="text-slate-500">{b.label}</span></li>)}
            </ul>
          </div>
          <div className="card p-4 space-y-2">
            <button type="button" onClick={() => handleSave(false)} disabled={pending} className="btn-outline w-full justify-center px-5 py-2.5 text-sm disabled:opacity-50">{t.saveDraft}</button>
            <button type="button" onClick={() => handleSave(true)} disabled={pending || !canSubmit || !ready} className="btn-primary w-full justify-center px-5 py-2.5 text-sm disabled:opacity-50" title={!canSubmit ? t.needVerif : !ready ? t.needComplete : undefined}>{t.submit}</button>
            {saveLabel && <p className="text-xs text-slate-400 text-center" aria-live="polite">{saveLabel}</p>}
            {!canSubmit && <p className="text-xs text-amber-700 text-center">{t.verifyToSubmit}</p>}
          </div>
        </div>
      </aside>

      {/* Barre sticky mobile */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 safe-area-bottom">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ready ? "bg-secondary-50 text-secondary-700" : "bg-amber-50 text-amber-700"}`}>{ready ? t.mReady : t.mLeft.replace("{n}", String(blockersLeft))}</span>
          {saveLabel && <span className="text-xs text-slate-400" aria-live="polite">{saveLabel}</span>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => handleSave(false)} disabled={pending} className="btn-outline flex-1 justify-center py-2.5 text-sm disabled:opacity-50">{t.saveDraft}</button>
          <button type="button" onClick={() => handleSave(true)} disabled={pending || !canSubmit || !ready} className="btn-primary flex-1 justify-center py-2.5 text-sm disabled:opacity-50">{t.submit}</button>
        </div>
      </div>
    </div>
  );
}
