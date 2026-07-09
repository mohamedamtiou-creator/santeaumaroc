"use client";

import { useState, useTransition } from "react";
import { submitSupportTicket, type TicketResult } from "@/features/support/actions";
import type { Dictionary } from "@/lib/i18n";

type SupportT = Dictionary["support"];

// Métadonnées visuelles par catégorie — libellé + description viennent du dictionnaire.
const CATEGORY_META = [
  { value: "compte",      bg: "bg-primary-50",   border: "border-primary-400",   color: "text-primary-600",   d: "M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" },
  { value: "rdv",         bg: "bg-secondary-50", border: "border-secondary-400", color: "text-secondary-600", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" },
  { value: "fiche",       bg: "bg-violet-50",    border: "border-violet-400",    color: "text-violet-600",    d: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" },
  { value: "technique",   bg: "bg-amber-50",     border: "border-amber-400",     color: "text-amber-600",     d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" },
  { value: "signalement", bg: "bg-rose-50",      border: "border-rose-400",      color: "text-rose-500",      d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" },
  { value: "autre",       bg: "bg-slate-100",    border: "border-slate-400",     color: "text-slate-600",     d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
] as const;

function SuccessCard({ ticketId, onReset, t }: { ticketId: string; onReset: () => void; t: SupportT }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-16 h-16 bg-secondary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
          className="w-8 h-8 text-secondary-600" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{t.success.title}</h3>
      <p className="text-sm text-slate-500 mb-5">{t.success.text}</p>
      <div className="inline-flex flex-col items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 mb-7">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.success.reference}</span>
        <span className="font-mono font-bold text-slate-900 text-base" dir="ltr">#{ticketId.slice(0, 8).toUpperCase()}</span>
      </div>
      <p className="text-sm text-slate-500 mb-4">{t.success.emailSent}</p>
      <button
        onClick={onReset}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
      >
        {t.success.another}
      </button>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition";
const errorCls = "mt-1.5 text-xs text-red-500";

export function SupportForm({
  defaultPhone,
  t,
}: {
  defaultPhone?: string | null;
  t: SupportT;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult]         = useState<TicketResult | null>(null);
  const [category, setCategory]     = useState("");
  const [priority, setPriority]     = useState("normal");

  if (result?.ticketId) {
    return <SuccessCard ticketId={result.ticketId} onReset={() => setResult(null)} t={t} />;
  }

  const fe = result?.fieldErrors ?? {};

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("category", category);
    fd.set("priority", priority);
    startTransition(async () => {
      const r = await submitSupportTicket(fd);
      setResult(r);
      if (r.ticketId) window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* Erreur globale */}
      {result?.error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      )}

      {/* Catégorie */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-slate-800 mb-2.5">
          {t.form.categoryLabel} <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CATEGORY_META.map((cat) => {
            const selected = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-3 rounded-xl border-2 text-start transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                  selected
                    ? `${cat.border} ${cat.bg}`
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg mb-2 flex items-center justify-center ${selected ? cat.bg : "bg-slate-50"}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                    className={`w-4 h-4 ${selected ? cat.color : "text-slate-500"}`}
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={cat.d} />
                  </svg>
                </div>
                <p className={`text-xs font-semibold leading-tight ${selected ? "text-slate-900" : "text-slate-700"}`}>
                  {t.categories[cat.value]}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{t.categoryDescs[cat.value]}</p>
              </button>
            );
          })}
        </div>
        {fe.category && <p className={errorCls}>{fe.category}</p>}
      </div>

      {/* Sujet */}
      <div className="mb-4">
        <label htmlFor="subject" className="block text-sm font-semibold text-slate-800 mb-1.5">
          {t.form.subjectLabel} <span className="text-red-400">*</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          maxLength={120}
          placeholder={t.form.subjectPlaceholder}
          className={inputCls}
        />
        {fe.subject && <p className={errorCls}>{fe.subject}</p>}
      </div>

      {/* Message */}
      <div className="mb-4">
        <label htmlFor="message" className="block text-sm font-semibold text-slate-800 mb-1.5">
          {t.form.messageLabel} <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder={t.form.messagePlaceholder}
          className={`${inputCls} resize-none`}
        />
        {fe.message && <p className={errorCls}>{fe.message}</p>}
      </div>

      {/* Priorité */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">{t.form.priorityLabel}</label>
        <div className="flex gap-2.5">
          {[
            { value: "normal", label: t.form.priorityNormal,
              cls: "border-primary-400 bg-primary-50 text-primary-700",
              idle: "border-slate-200 text-slate-600 hover:border-slate-300" },
            { value: "urgent", label: t.form.priorityUrgent,
              cls: "border-rose-400 bg-rose-50 text-rose-700",
              idle: "border-slate-200 text-slate-600 hover:border-slate-300" },
          ].map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                priority === p.value ? p.cls : p.idle
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Téléphone optionnel */}
      <div className="mb-6">
        <label htmlFor="phone" className="block text-sm font-semibold text-slate-800 mb-1.5">
          {t.form.phoneLabel} <span className="text-slate-500 font-normal">{t.form.phoneOptional}</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          dir="ltr"
          defaultValue={defaultPhone ?? ""}
          placeholder={t.form.phonePlaceholder}
          className={inputCls}
        />
        <p className="mt-1 text-xs text-slate-500">{t.form.phoneHint}</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isPending ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4 animate-spin" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
            </svg>
            {t.form.submitting}
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4 h-4 rtl:-scale-x-100" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            {t.form.submit}
          </>
        )}
      </button>
    </form>
  );
}
