"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createTerm, updateTerm } from "@/features/glossary/actions";
import { GLOSSARY_CATEGORIES } from "@/lib/glossary";

export type SpecialtyOption = { id: string; name: string };

export type TermData = {
  id:           string;
  term:         string;
  slug:         string;
  definition:   string;
  category:     string;
  synonyms:     string[];
  specialtyId:  string | null;
  relatedSlug:  string | null;
  sources:      string | null;
  termAr:       string | null;
  definitionAr: string | null;
  sourcesAr:    string | null;
  status:       string;
  reviewedAt:   string | null;
  arReviewedAt: string | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  symptome:   "Symptôme",
  maladie:    "Maladie",
  examen:     "Examen",
  traitement: "Traitement",
  anatomie:   "Anatomie",
  general:    "Général",
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

/** Réindente un JSON de sources pour la saisie (repli : texte brut). */
function prettyJson(raw: string | null): string {
  if (!raw) return "";
  try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return raw; }
}

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("fr-MA", { dateStyle: "medium" }).format(new Date(iso));
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow";
const labelCls = "block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

export function GlossaryEditor({ specialties, term: t }: { specialties: SpecialtyOption[]; term?: TermData }) {
  const isEdit = !!t;
  const [pending, start] = useTransition();
  const [term,        setTerm]        = useState(t?.term        ?? "");
  const [slug,        setSlug]        = useState(t?.slug        ?? "");
  const [definition,  setDefinition]  = useState(t?.definition  ?? "");
  const [category,    setCategory]    = useState(t?.category    ?? "general");
  const [synonyms,    setSynonyms]    = useState((t?.synonyms ?? []).join(", "));
  const [specialtyId, setSpecialtyId] = useState(t?.specialtyId ?? "");
  const [relatedSlug, setRelatedSlug] = useState(t?.relatedSlug ?? "");
  const [sources,     setSources]     = useState(() => prettyJson(t?.sources ?? null));
  const [termAr,       setTermAr]       = useState(t?.termAr       ?? "");
  const [definitionAr, setDefinitionAr] = useState(t?.definitionAr ?? "");
  const [sourcesAr,    setSourcesAr]    = useState(() => prettyJson(t?.sourcesAr ?? null));
  const [markReviewed,   setMarkReviewed]   = useState(false);
  const [markArReviewed, setMarkArReviewed] = useState(false);
  const [unmarkReviewed,   setUnmarkReviewed]   = useState(false);
  const [unmarkArReviewed, setUnmarkArReviewed] = useState(false);
  const [arOpen,      setArOpen]      = useState(false);
  const [error,       setError]       = useState("");

  function handleTermChange(val: string) {
    setTerm(val);
    if (!isEdit) setSlug(toSlug(val));
  }

  function handleSave(publish: boolean) {
    setError("");
    if (!term.trim())       { setError("Le terme est obligatoire.");      return; }
    if (!slug.trim())       { setError("Le slug est obligatoire.");       return; }
    if (!definition.trim()) { setError("La définition est obligatoire."); return; }

    const fd = new FormData();
    fd.set("term",        term.trim());
    fd.set("slug",        slug.trim());
    fd.set("definition",  definition.trim());
    fd.set("category",    category);
    fd.set("synonyms",    synonyms);
    fd.set("specialtyId", specialtyId);
    fd.set("relatedSlug", relatedSlug.trim());
    fd.set("sources",     sources);
    fd.set("termAr",       termAr.trim());
    fd.set("definitionAr", definitionAr.trim());
    fd.set("sourcesAr",    sourcesAr);
    fd.set("status",       publish ? "PUBLISHED" : "DRAFT");
    fd.set("markReviewed",   String(markReviewed));
    fd.set("markArReviewed", String(markArReviewed));
    fd.set("unmarkReviewed",   String(unmarkReviewed));
    fd.set("unmarkArReviewed", String(unmarkArReviewed));

    start(async () => {
      try {
        if (isEdit) await updateTerm(t.id, fd);
        else        await createTerm(fd);
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
          <label className={labelCls}>Terme *</label>
          <input type="text" value={term} onChange={(e) => handleTermChange(e.target.value)}
            placeholder="Ex. : Hypertension artérielle" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Slug URL</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap font-mono">/glossaire/</span>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="hypertension-arterielle" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Catégorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {GLOSSARY_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c] ?? c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Spécialité <span className="normal-case font-normal text-slate-500">(maillage)</span></label>
            <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} className={inputCls}>
              <option value="">— Aucune —</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Article pilier lié <span className="normal-case font-normal text-slate-500">(slug blog)</span></label>
            <input type="text" value={relatedSlug} onChange={(e) => setRelatedSlug(e.target.value)}
              placeholder="ex. : hypertension-guide-complet" className={inputCls} />
            <p className="text-xs text-slate-500 mt-1">Slug d&apos;un article blog pilier (maillage interne). Optionnel.</p>
          </div>
          <div>
            <label className={labelCls}>Synonymes <span className="normal-case font-normal text-slate-500">(séparés par des virgules)</span></label>
            <input type="text" value={synonyms} onChange={(e) => setSynonyms(e.target.value)}
              placeholder="tension, HTA" className={inputCls} />
            <p className="text-xs text-slate-500 mt-1">« aussi appelé » + aide à la recherche.</p>
          </div>
        </div>
      </div>

      {/* ── Définition ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Définition</h2>
          <p className="text-xs text-slate-500 mt-1">Courte et factuelle (40-70 mots) — format extractible par les moteurs IA.</p>
        </div>
        <textarea value={definition} onChange={(e) => setDefinition(e.target.value)} rows={5}
          placeholder="Définition claire et concise du terme…" className={`${inputCls} resize-y`} />
      </div>

      {/* ── Sources ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Sources / références (E-E-A-T)</h2>
          <p className="text-xs text-slate-500 mt-1">{`JSON : [{ "label": "OMS — Hypertension", "url": "https://…", "publisher": "OMS", "year": "2024" }]`}</p>
        </div>
        <textarea value={sources} onChange={(e) => setSources(e.target.value)} rows={6}
          placeholder={`[\n  { "label": "OMS — Hypertension", "url": "https://www.who.int/…", "publisher": "OMS", "year": "2024" }\n]`}
          className={`${inputCls} resize-y font-mono text-xs`} />
      </div>

      {/* ── Version arabe ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button type="button" onClick={() => setArOpen(!arOpen)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          <span>Version arabe (العربية)</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-slate-500 transition-transform ${arOpen ? "rotate-180" : ""}`} aria-hidden="true" strokeLinecap="round">
            <path d="m4 6 4 4 4-4"/>
          </svg>
        </button>
        {arOpen && (
          <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500">La version arabe n&apos;est servie/indexée qu&apos;une fois « Relu (AR) » validé ci-dessous. Repli FR sinon.</p>
            <div>
              <label className={labelCls}>Terme (AR)</label>
              <input type="text" dir="rtl" value={termAr} onChange={(e) => setTermAr(e.target.value)}
                placeholder="ارتفاع ضغط الدم" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Définition (AR)</label>
              <textarea dir="rtl" value={definitionAr} onChange={(e) => setDefinitionAr(e.target.value)} rows={5}
                className={`${inputCls} resize-y`} />
            </div>
            <div>
              <label className={labelCls}>Sources (AR) <span className="normal-case font-normal text-slate-500">(mêmes URLs, labels traduits)</span></label>
              <textarea value={sourcesAr} onChange={(e) => setSourcesAr(e.target.value)} rows={5}
                className={`${inputCls} resize-y font-mono text-xs`} />
            </div>
          </div>
        )}
      </div>

      {/* ── Relecture (YMYL) ─────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Relecture médicale &amp; indexation</h2>
          <p className="text-xs text-slate-500 mt-1">Tant que non relue, la page reste <code>noindex</code> et hors sitemap.</p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={markReviewed} onChange={(e) => { setMarkReviewed(e.target.checked); if (e.target.checked) setUnmarkReviewed(false); }}
            className="w-4 h-4 rounded border-slate-300 text-secondary-600 focus:ring-secondary-500" />
          <span className="text-sm font-medium text-slate-700">
            Marquer relu (FR) — autorise l&apos;indexation
            {t?.reviewedAt && <span className="text-xs text-slate-400 font-normal"> (relu le {fmtDate(t.reviewedAt)})</span>}
          </span>
        </label>

        {t?.reviewedAt && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={unmarkReviewed} onChange={(e) => { setUnmarkReviewed(e.target.checked); if (e.target.checked) setMarkReviewed(false); }}
              className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm font-medium text-red-700">
              Retirer la relecture (FR) — <span className="font-normal text-red-500/80">repasse en <code>noindex</code></span>
            </span>
          </label>
        )}

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={markArReviewed} onChange={(e) => { setMarkArReviewed(e.target.checked); if (e.target.checked) setUnmarkArReviewed(false); }}
            className="w-4 h-4 rounded border-slate-300 text-secondary-600 focus:ring-secondary-500" />
          <span className="text-sm font-medium text-slate-700">
            Marquer relu (AR) — autorise l&apos;affichage arabe
            {t?.arReviewedAt && <span className="text-xs text-slate-400 font-normal"> (relu le {fmtDate(t.arReviewedAt)})</span>}
          </span>
        </label>

        {t?.arReviewedAt && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={unmarkArReviewed} onChange={(e) => { setUnmarkArReviewed(e.target.checked); if (e.target.checked) setMarkArReviewed(false); }}
              className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm font-medium text-red-700">
              Retirer la relecture (AR) — <span className="font-normal text-red-500/80">repli FR (arabe en <code>noindex</code>)</span>
            </span>
          </label>
        )}
      </div>

      {/* ── Actions ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/glossaire" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
          ← Retour à la liste
        </Link>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => handleSave(false)} disabled={pending}
            className="px-5 py-2.5 text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl disabled:opacity-50 transition-colors">
            {pending ? "Sauvegarde…" : "Brouillon"}
          </button>
          <button type="button" onClick={() => handleSave(true)} disabled={pending}
            className="px-5 py-2.5 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm">
            {pending ? "…" : isEdit ? "Mettre à jour" : "Publier le terme"}
          </button>
        </div>
      </div>
    </div>
  );
}
