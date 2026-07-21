"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createTreatment, updateTreatment } from "@/features/treatment/actions";

export type SpecialtyOption = { id: string; name: string };

export type TreatmentData = {
  id:              string;
  name:            string;
  slug:            string;
  category:        string;
  shortAnswer:     string;
  options:         string;
  duration:        string | null;
  sideEffects:     string | null;
  redFlags:        string | null;
  whenToConsult:   string | null;
  faqJson:         string | null;
  synonyms:        string[];
  specialtyId:     string | null;
  relatedSlugs:    string[];
  glossarySlugs:   string[];
  sources:         string | null;
  nameAr:          string | null;
  shortAnswerAr:   string | null;
  optionsAr:       string | null;
  durationAr:      string | null;
  sideEffectsAr:   string | null;
  redFlagsAr:      string | null;
  whenToConsultAr: string | null;
  faqJsonAr:       string | null;
  sourcesAr:       string | null;
  status:          string;
  reviewedAt:      string | null;
  arReviewedAt:    string | null;
};

const CATEGORIES = [
  { value: "medicamenteux", label: "Médicamenteux" },
  { value: "chirurgical", label: "Chirurgical" },
  { value: "fonctionnel", label: "Fonctionnel / rééducation" },
  { value: "hygiene-de-vie", label: "Hygiène de vie" },
  { value: "general", label: "Général" },
];

function toSlug(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}
function pretty(raw: string | null): string {
  if (!raw) return "";
  try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return raw; }
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow";
const labelCls = "block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

export function TreatmentEditor({ specialties, treatment }: { specialties: SpecialtyOption[]; treatment?: TreatmentData }) {
  const isEdit = !!treatment;
  const [pending, start] = useTransition();

  const [name,          setName]          = useState(treatment?.name          ?? "");
  const [slug,          setSlug]          = useState(treatment?.slug          ?? "");
  const [category,      setCategory]      = useState(treatment?.category      ?? "medicamenteux");
  const [shortAnswer,   setShortAnswer]   = useState(treatment?.shortAnswer   ?? "");
  const [options,       setOptions]       = useState(treatment?.options       ?? "");
  const [duration,      setDuration]      = useState(treatment?.duration      ?? "");
  const [sideEffects,   setSideEffects]   = useState(treatment?.sideEffects   ?? "");
  const [redFlags,      setRedFlags]      = useState(treatment?.redFlags      ?? "");
  const [whenToConsult, setWhenToConsult] = useState(treatment?.whenToConsult ?? "");
  const [faqJson,       setFaqJson]       = useState(() => pretty(treatment?.faqJson ?? null));
  const [synonyms,      setSynonyms]      = useState((treatment?.synonyms      ?? []).join(", "));
  const [specialtyId,   setSpecialtyId]   = useState(treatment?.specialtyId   ?? "");
  const [relatedSlugs,  setRelatedSlugs]  = useState((treatment?.relatedSlugs  ?? []).join(", "));
  const [glossarySlugs, setGlossarySlugs] = useState((treatment?.glossarySlugs ?? []).join(", "));
  const [sources,       setSources]       = useState(() => pretty(treatment?.sources ?? null));

  const [nameAr,          setNameAr]          = useState(treatment?.nameAr          ?? "");
  const [shortAnswerAr,   setShortAnswerAr]   = useState(treatment?.shortAnswerAr   ?? "");
  const [optionsAr,       setOptionsAr]       = useState(treatment?.optionsAr       ?? "");
  const [durationAr,      setDurationAr]      = useState(treatment?.durationAr      ?? "");
  const [sideEffectsAr,   setSideEffectsAr]   = useState(treatment?.sideEffectsAr   ?? "");
  const [redFlagsAr,      setRedFlagsAr]      = useState(treatment?.redFlagsAr      ?? "");
  const [whenToConsultAr, setWhenToConsultAr] = useState(treatment?.whenToConsultAr ?? "");
  const [faqJsonAr,       setFaqJsonAr]       = useState(() => pretty(treatment?.faqJsonAr ?? null));
  const [sourcesAr,       setSourcesAr]       = useState(() => pretty(treatment?.sourcesAr ?? null));

  const [status,           setStatus]           = useState(treatment?.status ?? "PUBLISHED");
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
    fd.set("options",       options);
    fd.set("duration",      duration.trim());
    fd.set("sideEffects",   sideEffects);
    fd.set("redFlags",      redFlags);
    fd.set("whenToConsult", whenToConsult.trim());
    fd.set("faqJson",       faqJson);
    fd.set("synonyms",      synonyms);
    fd.set("specialtyId",   specialtyId);
    fd.set("relatedSlugs",  relatedSlugs);
    fd.set("glossarySlugs", glossarySlugs);
    fd.set("sources",       sources);
    fd.set("nameAr",          nameAr.trim());
    fd.set("shortAnswerAr",   shortAnswerAr.trim());
    fd.set("optionsAr",       optionsAr);
    fd.set("durationAr",      durationAr.trim());
    fd.set("sideEffectsAr",   sideEffectsAr);
    fd.set("redFlagsAr",      redFlagsAr);
    fd.set("whenToConsultAr", whenToConsultAr.trim());
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
        if (isEdit) await updateTreatment(treatment.id, fd);
        else await createTreatment(fd);
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
            <label className={labelCls}>Spécialité concernée</label>
            <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} className={inputCls}>
              <option value="">— Aucune —</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Nom * <span className="normal-case font-normal text-slate-500">(ex. « Traitement de l'eczéma »)</span></label>
          <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Nom du traitement" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Slug URL</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap font-mono">/traitements/</span>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="traitement-eczema" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Synonymes <span className="normal-case font-normal text-slate-500">(séparés par des virgules)</span></label>
          <input type="text" value={synonyms} onChange={(e) => setSynonyms(e.target.value)} placeholder="Dermatite atopique" className={inputCls} />
        </div>
      </div>

      {/* ── Contenu FR ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Contenu (français)</h2>
        <div>
          <label className={labelCls}>Réponse courte * <span className="normal-case font-normal text-slate-500">(« en bref », 40-70 mots, extractible par les IA)</span></label>
          <textarea value={shortAnswer} onChange={(e) => setShortAnswer(e.target.value)} rows={3} placeholder="Résumé du traitement." className={`${inputCls} resize-y`} />
        </div>
        <div>
          <label className={labelCls}>Options de traitement <span className="normal-case font-normal text-slate-500">(1 par ligne)</span></label>
          <textarea value={options} onChange={(e) => setOptions(e.target.value)} rows={4} placeholder={"Option 1\nOption 2"} className={`${inputCls} resize-y`} />
        </div>
        <div>
          <label className={labelCls}>Durée et suivi <span className="normal-case font-normal text-slate-500">(paragraphe)</span></label>
          <textarea value={duration} onChange={(e) => setDuration(e.target.value)} rows={3} className={`${inputCls} resize-y`} />
        </div>
        <div>
          <label className={labelCls}>Effets indésirables / précautions <span className="normal-case font-normal text-slate-500">(1 par ligne)</span></label>
          <textarea value={sideEffects} onChange={(e) => setSideEffects(e.target.value)} rows={3} placeholder={"Effet 1\nEffet 2"} className={`${inputCls} resize-y`} />
        </div>
        <div>
          <label className={labelCls}>Signes d'alerte <span className="normal-case font-normal text-slate-500">(quand consulter en urgence — 1 par ligne)</span></label>
          <textarea value={redFlags} onChange={(e) => setRedFlags(e.target.value)} rows={3} placeholder={"Signe d'alerte 1\nSigne d'alerte 2"} className={`${inputCls} resize-y`} />
        </div>
        <div>
          <label className={labelCls}>Quand consulter <span className="normal-case font-normal text-slate-500">(paragraphe, hors urgence)</span></label>
          <textarea value={whenToConsult} onChange={(e) => setWhenToConsult(e.target.value)} rows={3} className={`${inputCls} resize-y`} />
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
            <input type="text" value={relatedSlugs} onChange={(e) => setRelatedSlugs(e.target.value)} placeholder="eczema-causes, dermatite-atopique" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Termes de glossaire liés <span className="normal-case font-normal text-slate-500">(slugs, virgules)</span></label>
            <input type="text" value={glossarySlugs} onChange={(e) => setGlossarySlugs(e.target.value)} placeholder="dermocorticoide, emollient" className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── Sources ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Sources / références médicales</h2>
          <p className="text-xs text-slate-500 mt-1">E-E-A-T + attribution IA. JSON : <code>{`[{ "label": "…", "url": "https://…", "publisher"?: "OMS", "year"?: "2024" }]`}</code></p>
        </div>
        <textarea value={sources} onChange={(e) => setSources(e.target.value)} rows={5} placeholder={`[\n  { "label": "HAS — Dermatite atopique", "url": "https://www.has-sante.fr/…", "publisher": "HAS" }\n]`} className={`${inputCls} resize-y font-mono text-xs`} />
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
            <div><label className={labelCls}>Options (AR) <span className="normal-case font-normal text-slate-500">(1 par ligne)</span></label><textarea dir="rtl" value={optionsAr} onChange={(e) => setOptionsAr(e.target.value)} rows={4} className={`${inputCls} resize-y`} /></div>
            <div><label className={labelCls}>Durée et suivi (AR)</label><textarea dir="rtl" value={durationAr} onChange={(e) => setDurationAr(e.target.value)} rows={3} className={`${inputCls} resize-y`} /></div>
            <div><label className={labelCls}>Effets indésirables (AR) <span className="normal-case font-normal text-slate-500">(1 par ligne)</span></label><textarea dir="rtl" value={sideEffectsAr} onChange={(e) => setSideEffectsAr(e.target.value)} rows={3} className={`${inputCls} resize-y`} /></div>
            <div><label className={labelCls}>Signes d'alerte (AR) <span className="normal-case font-normal text-slate-500">(1 par ligne)</span></label><textarea dir="rtl" value={redFlagsAr} onChange={(e) => setRedFlagsAr(e.target.value)} rows={3} className={`${inputCls} resize-y`} /></div>
            <div><label className={labelCls}>Quand consulter (AR)</label><textarea dir="rtl" value={whenToConsultAr} onChange={(e) => setWhenToConsultAr(e.target.value)} rows={3} className={`${inputCls} resize-y`} /></div>
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
          <span className="text-sm font-medium text-slate-700">Marquer comme relu (FR) aujourd'hui — autorise l'indexation{treatment?.reviewedAt && <span className="text-xs text-slate-400 font-normal"> (déjà relu)</span>}</span>
        </label>
        {treatment?.reviewedAt && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={unmarkReviewed} onChange={(e) => { setUnmarkReviewed(e.target.checked); if (e.target.checked) setMarkReviewed(false); }} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm font-medium text-red-700">Retirer la relecture (FR) — <span className="font-normal text-red-500/80">repasse en <code>noindex</code></span></span>
          </label>
        )}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={markArReviewed} onChange={(e) => { setMarkArReviewed(e.target.checked); if (e.target.checked) setUnmarkArReviewed(false); }} className="w-4 h-4 rounded border-slate-300 text-secondary-600 focus:ring-secondary-500" />
          <span className="text-sm font-medium text-slate-700">Marquer comme relu (AR) aujourd'hui — autorise l'affichage arabe{treatment?.arReviewedAt && <span className="text-xs text-slate-400 font-normal"> (déjà relu)</span>}</span>
        </label>
        {treatment?.arReviewedAt && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={unmarkArReviewed} onChange={(e) => { setUnmarkArReviewed(e.target.checked); if (e.target.checked) setMarkArReviewed(false); }} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm font-medium text-red-700">Retirer la relecture (AR) — <span className="font-normal text-red-500/80">repli FR (arabe en <code>noindex</code>)</span></span>
          </label>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/traitements" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">← Retour à la liste</Link>
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
