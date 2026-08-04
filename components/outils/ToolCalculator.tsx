"use client";

import { useId, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { TOOLS, runTool, type Severity, type ToolResult, type ToolSlug } from "@/lib/health-tools";

/**
 * Îlot client unique du cluster `/outils` — un seul composant sert les six
 * calculateurs, piloté par le registre `TOOLS`.
 *
 * Choix de conception :
 *  - Le calcul est PUREMENT local (aucune requête réseau, rien n'est stocké) :
 *    des données de santé n'ont aucune raison de quitter le navigateur.
 *  - Tout le contenu indexable (interprétation, table de référence, FAQ, sources)
 *    est rendu par le serveur en dehors de cet îlot : la page reste utile et
 *    référençable sans JavaScript.
 *  - Aucune dépendance : champs natifs, donc clavier, saisie mobile, lecteurs
 *    d'écran et RTL fonctionnent sans réimplémentation.
 */

export type ToolCalculatorLabels = {
  formTitle: string;
  submit: string;
  reset: string;
  resultTitle: string;
  resultEmpty: string;
  privacyNote: string;
  errorSummary: string;
  emergencyTitle: string;
  selectPlaceholder: string;
  resultLabel: string;
  /** required · range · coherence · futureDate · tooOld */
  errors: Record<string, string>;
  units: Record<string, string>;
  severity: Record<string, string>;
  fields: Record<string, { label: string; hint?: string }>;
  options: Record<string, string>;
  categories: Record<string, { label: string; advice: string }>;
  detailLabels: Record<string, string>;
  notes: Record<string, string>;
  /** En-têtes des résultats tabulaires, par clé de colonne. */
  columns?: Record<string, string>;
};

/** Classes complètes (jamais concaténées) pour rester détectables par Tailwind. */
const SEVERITY_STYLES: Record<Severity, { chip: string; card: string; value: string }> = {
  good: {
    chip: "bg-secondary-100 text-secondary-800 ring-secondary-300",
    card: "border-secondary-200 bg-secondary-50/50",
    value: "text-secondary-800",
  },
  watch: {
    chip: "bg-accent-100 text-accent-800 ring-accent-300",
    card: "border-accent-200 bg-accent-50/60",
    value: "text-accent-800",
  },
  warn: {
    chip: "bg-terra-100 text-terra-700 ring-terra-200",
    card: "border-terra-200 bg-terra-50/70",
    value: "text-terra-700",
  },
  alert: {
    chip: "bg-rose-100 text-rose-800 ring-rose-300",
    card: "border-rose-200 bg-rose-50/70",
    value: "text-rose-800",
  },
};

function initialValues(slug: ToolSlug): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of TOOLS[slug].fields) out[f.name] = f.defaultValue ?? "";
  return out;
}

export function ToolCalculator({
  slug,
  locale,
  t,
}: {
  slug: ToolSlug;
  locale: Locale;
  t: ToolCalculatorLabels;
}) {
  const def = TOOLS[slug];
  const baseId = useId();
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(slug));
  const [result, setResult] = useState<ToolResult | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const errors = result && !result.ok ? result.errors : {};

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = runTool(slug, values, locale);
    setResult(next);
    // Le résultat comme les erreurs apparaissent hors du flux de tabulation :
    // on y amène le focus pour que la réponse soit annoncée et atteignable.
    requestAnimationFrame(() => {
      if (next.ok) resultRef.current?.focus();
      else errorRef.current?.focus();
    });
  }

  function onReset() {
    setValues(initialValues(slug));
    setResult(null);
  }

  const errorList = Object.entries(errors);

  return (
    <div className="grid lg:grid-cols-2 gap-4 lg:gap-5 items-start">
      {/* ══ Saisie ══ */}
      <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            {t.formTitle}
          </legend>

          {/* Récapitulatif d'erreurs — cible du focus, annoncé par les lecteurs d'écran */}
          {errorList.length > 0 && (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <p className="text-sm font-semibold text-rose-800">{t.errorSummary}</p>
              <ul className="mt-1.5 space-y-1">
                {errorList.map(([name, key]) => (
                  <li key={name} className="text-sm text-rose-700">
                    <a href={`#${baseId}-${name}`} className="underline decoration-rose-300 hover:decoration-rose-600">
                      {t.fields[name]?.label ?? name}
                    </a>
                    {" — "}
                    {t.errors[key] ?? key}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3.5">
            {def.fields.map((f) => {
              const id = `${baseId}-${f.name}`;
              const label = t.fields[f.name]?.label ?? f.name;
              const hint = t.fields[f.name]?.hint;
              const err = errors[f.name];
              const describedBy = [hint ? `${id}-hint` : null, err ? `${id}-err` : null]
                .filter(Boolean)
                .join(" ");

              return (
                <div key={f.name} className={f.wide ? "sm:col-span-2" : undefined}>
                  <label htmlFor={id} className="block text-sm font-semibold text-slate-800 mb-1.5" dir="auto">
                    {label}
                  </label>

                  {f.kind === "select" ? (
                    <select
                      id={id}
                      name={f.name}
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      aria-invalid={err ? true : undefined}
                      aria-describedby={describedBy || undefined}
                      dir="auto"
                      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        err ? "border-rose-400" : "border-slate-300"
                      }`}
                    >
                      <option value="">{t.selectPlaceholder}</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {t.options[o] ?? o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      <input
                        id={id}
                        name={f.name}
                        type={f.kind === "date" ? "date" : "number"}
                        inputMode={f.kind === "date" ? undefined : "decimal"}
                        min={f.min}
                        max={f.max}
                        step={f.step}
                        value={values[f.name] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                        aria-invalid={err ? true : undefined}
                        aria-describedby={describedBy || undefined}
                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          f.unit ? "pe-14" : ""
                        } ${err ? "border-rose-400" : "border-slate-300"}`}
                      />
                      {f.unit && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs font-medium text-slate-400"
                        >
                          {t.units[f.unit] ?? f.unit}
                        </span>
                      )}
                    </div>
                  )}

                  {hint && (
                    <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500 leading-relaxed" dir="auto">
                      {hint}
                    </p>
                  )}
                  {err && (
                    <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-rose-700" dir="auto">
                      {t.errors[err] ?? err}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary">
              {t.submit}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 3 5 5-5 5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {t.reset}
            </button>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0 mt-0.5 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1.5 2.5 3.8v3.4c0 3.2 2.3 5.4 5.5 6.3 3.2-.9 5.5-3.1 5.5-6.3V3.8L8 1.5z" />
            </svg>
            {t.privacyNote}
          </p>
        </fieldset>
      </form>

      {/* ══ Résultat ══ */}
      <div
        ref={resultRef}
        tabIndex={-1}
        aria-live="polite"
        aria-atomic="true"
        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{t.resultTitle}</p>

        {!result || !result.ok ? (
          <p className="text-sm text-slate-500 leading-relaxed" dir="auto">
            {t.resultEmpty}
          </p>
        ) : (
          <ResultCard outcome={result.outcome} t={t} />
        )}
      </div>
    </div>
  );
}

function ResultCard({
  outcome,
  t,
}: {
  outcome: Extract<ToolResult, { ok: true }>["outcome"];
  t: ToolCalculatorLabels;
}) {
  const style = SEVERITY_STYLES[outcome.severity];
  const category = t.categories[outcome.categoryKey];
  const unit = outcome.unit ? t.units[outcome.unit] : undefined;

  return (
    <div dir="auto">
      <div className={`rounded-xl border p-4 ${style.card}`}>
        <p className="text-sm font-medium text-slate-500">{t.resultLabel}</p>
        <p className={`mt-0.5 text-3xl font-extrabold tracking-tight tabular-nums ${style.value}`}>
          {outcome.value}
          {unit && <span className="ms-1.5 text-base font-bold opacity-70">{unit}</span>}
        </p>
        {category && (
          <p className="mt-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${style.chip}`}>
              {category.label}
            </span>
            <span className="ms-2 text-xs font-medium text-slate-500">{t.severity[outcome.severity]}</span>
          </p>
        )}
      </div>

      {category && <p className="mt-4 text-[15px] text-slate-700 leading-relaxed">{category.advice}</p>}

      {/* Résultat tabulaire (planning) — la ligne mise en avant est le prochain
          jalon, celle que le visiteur est venu chercher. */}
      {outcome.rows && outcome.rows.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm border-collapse">
            {outcome.columns && (
              <thead>
                <tr className="bg-slate-50">
                  {outcome.columns.map((c) => (
                    <th key={c} scope="col" className="text-start px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                      {t.columns?.[c] ?? c}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {outcome.rows.map((r, i) => (
                <tr
                  key={i}
                  className={`border-t border-slate-100 ${r.emphasis ? "bg-primary-50/60" : ""}`}
                >
                  {r.cells.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-3 py-2.5 align-top ${j === 0 ? "whitespace-nowrap font-semibold text-slate-900" : "text-slate-600 leading-snug"} ${r.emphasis ? "text-primary-900" : ""} ${r.severity === "watch" && !r.emphasis ? "opacity-60" : ""}`}
                    >
                      {cell || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {outcome.details && outcome.details.length > 0 && (
        <dl className="mt-4 divide-y divide-slate-200 border-t border-slate-200">
          {outcome.details.map((d) => (
            <div key={d.key} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5">
              <dt className="text-sm text-slate-600">{t.detailLabels[d.key] ?? d.key}</dt>
              <dd className="text-sm font-bold text-slate-900 tabular-nums">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {outcome.emergency && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-2.5">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 6v5M10 14h.01M8.6 2.9 1.7 15a1.6 1.6 0 0 0 1.4 2.4h13.8a1.6 1.6 0 0 0 1.4-2.4L11.4 2.9a1.6 1.6 0 0 0-2.8 0z" />
          </svg>
          <p className="text-sm font-semibold text-rose-800">{t.emergencyTitle}</p>
        </div>
      )}

      {outcome.noteKeys && outcome.noteKeys.length > 0 && (
        <ul className="mt-4 space-y-2">
          {outcome.noteKeys.map((k) => (
            <li key={k} className="flex gap-2.5 text-xs text-slate-500 leading-relaxed">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 5.5h.01M8 7.5v3.5" />
              </svg>
              <span>{t.notes[k] ?? k}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
