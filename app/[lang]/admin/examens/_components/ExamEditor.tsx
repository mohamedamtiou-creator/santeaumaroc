"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createExam, updateExam } from "@/features/medical-exam/actions";

export type SpecialtyOption = { id: string; name: string };

export type ExamData = {
  id:              string;
  name:            string;
  slug:            string;
  category:        string;
  shortAnswer:     string;
  indications:     string;
  procedure:       string;
  preparation:     string | null;
  precautions:     string | null;
  durationMin:     number | null;
  priceMin:        number | null;
  priceMax:        number | null;
  reimbursement:   string | null;
  faqJson:         string | null;
  synonyms:        string[];
  specialtyId:     string | null;
  relatedSlugs:    string[];
  glossarySlugs:   string[];
  sources:         string | null;
  nameAr:          string | null;
  shortAnswerAr:   string | null;
  indicationsAr:   string | null;
  procedureAr:     string | null;
  preparationAr:   string | null;
  precautionsAr:   string | null;
  reimbursementAr: string | null;
  faqJsonAr:       string | null;
  sourcesAr:       string | null;
  status:          string;
  reviewedAt:      string | null;
  arReviewedAt:    string | null;
};

const CATEGORIES = [
  { value: "imagerie", label: "Imagerie" },
  { value: "biologie", label: "Biologie" },
  { value: "exploration", label: "Exploration fonctionnelle" },
  { value: "anatomopathologie", label: "Anatomopathologie" },
  { value: "general", label: "Général" },
];

function toSlug(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}
function pretty(raw: string | null): string {
  if (!raw) return "";
  try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return raw; }
}
function numStr(n: number | null): string { return n === null || n === undefined ? "" : String(n); }

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow";
const labelCls = "block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

export function ExamEditor({ specialties, exam }: { specialties: SpecialtyOption[]; exam?: ExamData }) {
  const isEdit = !!exam;
  const [pending, start] = useTransition();

  const [name,          setName]          = useState(exam?.name          ?? "");
  const [slug,          setSlug]          = useState(exam?.slug          ?? "");
  const [category,      setCategory]      = useState(exam?.category      ?? "imagerie");
  const [shortAnswer,   setShortAnswer]   = useState(exam?.shortAnswer   ?? "");
  const [indications,   setIndications]   = useState(exam?.indications   ?? "");
  const [procedure,     setProcedure]     = useState(exam?.procedure     ?? "");
  const [preparation,   setPreparation]   = useState(exam?.preparation   ?? "");
  const [precautions,   setPrecautions]   = useState(exam?.precautions   ?? "");
  const [durationMin,   setDurationMin]   = useState(numStr(exam?.durationMin ?? null));
  const [priceMin,      setPriceMin]      = useState(numStr(exam?.priceMin ?? null));
  const [priceMax,      setPriceMax]      = useState(numStr(exam?.priceMax ?? null));
  const [reimbursement, setReimbursement] = useState(exam?.reimbursement ?? "");
  const [faqJson,       setFaqJson]       = useState(() => pretty(exam?.faqJson ?? null));
  const [synonyms,      setSynonyms]      = useState((exam?.synonyms      ?? []).join(", "));
  const [specialtyId,   setSpecialtyId]   = useState(exam?.specialtyId   ?? "");
  const [relatedSlugs,  setRelatedSlugs]  = useState((exam?.relatedSlugs  ?? []).join(", "));
  const [glossarySlugs, setGlossarySlugs] = useState((exam?.glossarySlugs ?? []).join(", "));
  const [sources,       setSources]       = useState(() => pretty(exam?.sources ?? null));

  const [nameAr,          setNameAr]          = useState(exam?.nameAr          ?? "");
  const [shortAnswerAr,   setShortAnswerAr]   = useState(exam?.shortAnswerAr   ?? "");
  const [indicationsAr,   setIndicationsAr]   = useState(exam?.indicationsAr   ?? "");
  const [procedureAr,     setProcedureAr]     = useState(exam?.procedureAr     ?? "");
  const [preparationAr,   setPreparationAr]   = useState(exam?.preparationAr   ?? "");
  const [precautionsAr,   setPrecautionsAr]   = useState(exam?.precautionsAr   ?? "");
  const [reimbursementAr, setReimbursementAr] = useState(exam?.reimbursementAr ?? "");
  const [faqJsonAr,       setFaqJsonAr]       = useState(() => pretty(exam?.faqJsonAr ?? null));
  const [sourcesAr,       setSourcesAr]       = useState(() => pretty(exam?.sourcesAr ?? null));

  const [status,           setStatus]           = useState(exam?.status ?? "PUBLISHED");
  const [markReviewed,     setMarkReviewed]     = useState(false);
  const [markArReviewed,   setMarkArReviewed]   = useState(false);
  const [unmarkReviewed,   setUnmarkReviewed]   = useState(false);
  const [unmarkArReviewed, setUnmarkArReviewed] = useState(false);
  const [arOpen,           setArOpen]           = useState(false);
  const [error,            setError]            = useState("");

  function handleNameChange(val: string) {
    setName(val);
    if (!isEdit) setSlug(toSlug(val));
  }

  function handleSave(publish: boolean) {
    setError("");
    if (!name.trim())        { setError("Le nom (FR) est obligatoire.");         return; }
    if (!slug.trim())        { setError("Le slug est obligatoire.");             return; }
    if (!shortAnswer.trim()) { setError("La réponse courte est obligatoire.");   return; }

    const fd = new FormData();
    fd.set("name",          name.trim());
    fd.set("slug",          slug.trim());
    fd.set("category",      category);
    fd.set("shortAnswer",   shortAnswer.trim());
    fd.set("indications",   indications);
    fd.set("procedure",     procedure);
    fd.set("preparation",   preparation.trim());
    fd.set("precautions",   precautions);
    fd.set("durationMin",   durationMin.trim());
    fd.set("priceMin",      priceMin.trim());
    fd.set("priceMax",      priceMax.trim());
    fd.set("reimbursement", reimbursement.trim());
    fd.set("faqJson",       faqJson);
    fd.set("synonyms",      synonyms);
    fd.set("specialtyId",   specialtyId);
    fd.set("relatedSlugs",  relatedSlugs);
    fd.set("glossarySlugs", glossarySlugs);
    fd.set("sources",       sources);
    fd.set("nameAr",          nameAr.trim());
    fd.set("shortAnswerAr",   shortAnswerAr.trim());
    fd.set("indicationsAr",   indicationsAr);
    fd.set("procedureAr",     procedureAr);
    fd.set("preparationAr",   preparationAr.trim());
    fd.set("precautionsAr",   precautionsAr);
    fd.set("reimbursementAr", reimbursementAr.trim());
    fd.set("faqJsonAr",       faqJsonAr);
    fd.set("sourcesAr",       sourcesAr);
    fd.set("status",           status);
    fd.set("markReviewed",     String(markReviewed));
    fd.set("markArReviewed",   String(markArReviewed));
    fd.set("unmarkReviewed",   String(unmarkReviewed));
    fd.set("unmarkArReviewed", String(unmarkArReviewed));
    fd.set("publish",          String(publish));

    start(async () => {
      try {
        if (isEdit) await updateExam(exam.id, fd);
        else await createExam(fd);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* ── Infos générales ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Informations générales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Catégorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Spécialité (prescriptrice / réalisatrice)</label>
            <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} className={inputCls}>
              <option value="">— Aucune —</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Nom * <span className="normal-case font-normal text-slate-500">(ex. « IRM »)</span></label>
          <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Nom de l'examen" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Slug URL</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap font-mono">/examens/</span>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="irm" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Synonymes <span className="normal-case font-normal text-slate-500">(séparés par des virgules)</span></label>
          <input type="text" value={synonyms} onChange={(e) => setSynonyms(e.target.value)} placeholder="Résonance magnétique, IRM" className={inputCls} />
        </div>
      </div>

      {/* ── Infos pratiques ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Durée, prix & remboursement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Durée (min)</label>
            <input type="number" min="0" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} placeholder="30" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Prix min (MAD)</label>
            <input type="number" min="0" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="1500" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Prix max (MAD)</label>
            <input type="number" min="0" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="4000" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Remboursement <span className="normal-case font-normal text-slate-500">(AMO/CNSS)</span></label>
          <input type="text" value={reimbursement} onChange={(e) => setReimbursement(e.target.value)} placeholder="Prise en charge partielle sur prescription" className={inputCls} />
        </div>
      </div>

      {/* ── Contenu FR ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Contenu (français)</h2>
        <div>
          <label className={labelCls}>Réponse courte * <span className="normal-case font-normal text-slate-500">(« c'est quoi », 40-70 mots, extractible par les IA)</span></label>
          <textarea value={shortAnswer} onChange={(e) => setShortAnswer(e.target.value)} rows={3} placeholder="Description concise de l'examen." className={`${inputCls} resize-y`} />
        </div>
        <div>
          <label className={labelCls}>Indications <span className="normal-case font-normal text-slate-500">(pourquoi cet examen — 1 par ligne)</span></label>
          <textarea value={indications} onChange={(e) => setIndications(e.target.value)} rows={4} placeholder={"Indication 1\nIndication 2"} className={`${inputCls} resize-y`} />
        </div>
        <div>
          <label className={labelCls}>Déroulé <span className="normal-case font-normal text-slate-500">(comment ça se passe — 1 par ligne)</span></label>
          <textarea value={procedure} onChange={(e) => setProcedure(e.target.value)} rows={4} placeholder={"Étape 1\nÉtape 2"} className={`${inputCls} resize-y`} />
        </div>
        <div>
          <label className={labelCls}>Préparation <span className="normal-case font-normal text-slate-500">(paragraphe)</span></label>
          <textarea value={preparation} onChange={(e) => setPreparation(e.target.value)} rows={3} placeholder="À jeun ? Consignes préalables ?" className={`${inputCls} resize-y`} />
        </div>
        <div>
          <label className={labelCls}>Précautions / contre-indications <span className="normal-case font-normal text-slate-500">(1 par ligne)</span></label>
          <textarea value={precautions} onChange={(e) => setPrecautions(e.target.value)} rows={3} placeholder={"Contre-indication 1\nContre-indication 2"} className={`${inputCls} resize-y`} />
        </div>
        <div>
          <label className={labelCls}>FAQ <span className="normal-case font-normal text-slate-500">{`(JSON : [{ "q": "…", "a": "…" }])`}</span></label>
          <textarea value={faqJson} onChange={(e) => setFaqJson(e.target.value)} rows={6} placeholder={`[\n  { "q": "Question ?", "a": "Réponse." }\n]`} className={`${inputCls} resize-y font-mono text-xs`} />
        </div>
      </div>

      {/* ── Maillage ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Maillage interne</h2>
          <p className="text-xs text-slate-500 mt-1">Slugs d'articles piliers et de termes de glossaire liés (anti-cannibalisation).</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Articles blog liés <span className="normal-case font-normal text-slate-500">(slugs, virgules)</span></label>
            <input type="text" value={relatedSlugs} onChange={(e) => setRelatedSlugs(e.target.value)} placeholder="irm-cerveau, quand-faire-une-irm" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Termes de glossaire liés <span className="normal-case font-normal text-slate-500">(slugs, virgules)</span></label>
            <input type="text" value={glossarySlugs} onChange={(e) => setGlossarySlugs(e.target.value)} placeholder="produit-de-contraste" className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── Sources ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Sources / références médicales</h2>
          <p className="text-xs text-slate-500 mt-1">E-E-A-T + attribution IA. JSON : <code>{`[{ "label": "…", "url": "https://…", "publisher"?: "OMS", "year"?: "2024" }]`}</code></p>
        </div>
        <textarea value={sources} onChange={(e) => setSources(e.target.value)} rows={5} placeholder={`[\n  { "label": "OMS — Imagerie médicale", "url": "https://www.who.int/…", "publisher": "OMS" }\n]`} className={`${inputCls} resize-y font-mono text-xs`} />
      </div>

      {/* ── Version arabe ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button type="button" onClick={() => setArOpen(!arOpen)} className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          <span>Version arabe (العربية)</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-slate-500 transition-transform ${arOpen ? "rotate-180" : ""}`} aria-hidden="true" strokeLinecap="round"><path d="m4 6 4 4 4-4"/></svg>
        </button>
        {arOpen && (
          <div className="px-6 pb-6 space-y-5 border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500">Servie et indexée uniquement une fois « relu (AR) » coché. Repli sur le français sinon.</p>
            <div><label className={labelCls}>Nom (AR)</label><input type="text" dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Réponse courte (AR)</label><textarea dir="rtl" value={shortAnswerAr} onChange={(e) => setShortAnswerAr(e.target.value)} rows={3} className={`${inputCls} resize-y`} /></div>
            <div><label className={labelCls}>Indications (AR) <span className="normal-case font-normal text-slate-500">(1 par ligne)</span></label><textarea dir="rtl" value={indicationsAr} onChange={(e) => setIndicationsAr(e.target.value)} rows={4} className={`${inputCls} resize-y`} /></div>
            <div><label className={labelCls}>Déroulé (AR) <span className="normal-case font-normal text-slate-500">(1 par ligne)</span></label><textarea dir="rtl" value={procedureAr} onChange={(e) => setProcedureAr(e.target.value)} rows={4} className={`${inputCls} resize-y`} /></div>
            <div><label className={labelCls}>Préparation (AR)</label><textarea dir="rtl" value={preparationAr} onChange={(e) => setPreparationAr(e.target.value)} rows={3} className={`${inputCls} resize-y`} /></div>
            <div><label className={labelCls}>Précautions (AR) <span className="normal-case font-normal text-slate-500">(1 par ligne)</span></label><textarea dir="rtl" value={precautionsAr} onChange={(e) => setPrecautionsAr(e.target.value)} rows={3} className={`${inputCls} resize-y`} /></div>
            <div><label className={labelCls}>Remboursement (AR)</label><input type="text" dir="rtl" value={reimbursementAr} onChange={(e) => setReimbursementAr(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>FAQ (AR) <span className="normal-case font-normal text-slate-500">(JSON [{`{ "q", "a" }`}])</span></label><textarea dir="rtl" value={faqJsonAr} onChange={(e) => setFaqJsonAr(e.target.value)} rows={5} className={`${inputCls} resize-y font-mono text-xs`} /></div>
            <div><label className={labelCls}>Sources (AR)</label><textarea dir="rtl" value={sourcesAr} onChange={(e) => setSourcesAr(e.target.value)} rows={4} className={`${inputCls} resize-y font-mono text-xs`} /></div>
          </div>
        )}
      </div>

      {/* ── Relecture & statut ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Relecture (YMYL) & statut</h2>
        <div>
          <label className={labelCls}>Statut</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="PUBLISHED">Publié</option>
            <option value="DRAFT">Brouillon</option>
          </select>
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={markReviewed} onChange={(e) => { setMarkReviewed(e.target.checked); if (e.target.checked) setUnmarkReviewed(false); }} className="w-4 h-4 rounded border-slate-300 text-secondary-600 focus:ring-secondary-500" />
          <span className="text-sm font-medium text-slate-700">Marquer comme relu (FR) aujourd'hui — autorise l'indexation{exam?.reviewedAt && <span className="text-xs text-slate-400 font-normal"> (déjà relu)</span>}</span>
        </label>
        {exam?.reviewedAt && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={unmarkReviewed} onChange={(e) => { setUnmarkReviewed(e.target.checked); if (e.target.checked) setMarkReviewed(false); }} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm font-medium text-red-700">Retirer la relecture (FR) — <span className="font-normal text-red-500/80">repasse en <code>noindex</code></span></span>
          </label>
        )}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={markArReviewed} onChange={(e) => { setMarkArReviewed(e.target.checked); if (e.target.checked) setUnmarkArReviewed(false); }} className="w-4 h-4 rounded border-slate-300 text-secondary-600 focus:ring-secondary-500" />
          <span className="text-sm font-medium text-slate-700">Marquer comme relu (AR) aujourd'hui — autorise l'affichage arabe{exam?.arReviewedAt && <span className="text-xs text-slate-400 font-normal"> (déjà relu)</span>}</span>
        </label>
        {exam?.arReviewedAt && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={unmarkArReviewed} onChange={(e) => { setUnmarkArReviewed(e.target.checked); if (e.target.checked) setMarkArReviewed(false); }} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm font-medium text-red-700">Retirer la relecture (AR) — <span className="font-normal text-red-500/80">repli FR (arabe en <code>noindex</code>)</span></span>
          </label>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/examens" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">← Retour à la liste</Link>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => handleSave(false)} disabled={pending} className="px-5 py-2.5 text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl disabled:opacity-50 transition-colors">
            {pending ? "Sauvegarde…" : "Brouillon"}
          </button>
          <button type="button" onClick={() => handleSave(true)} disabled={pending} className="px-5 py-2.5 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm">
            {pending ? "…" : isEdit ? "Mettre à jour" : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
}
