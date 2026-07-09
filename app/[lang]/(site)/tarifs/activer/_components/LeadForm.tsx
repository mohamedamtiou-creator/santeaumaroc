"use client";

import { useState, useTransition } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { submitSubscriptionLead, type LeadResult } from "@/features/subscription/actions";
import type { Dictionary } from "@/lib/i18n";

type LeadT = Dictionary["tarifs"]["lead"];

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-600" role="alert">{msg}</p>;
}

function SuccessCard({ t, planLabel, leadId }: { t: LeadT; planLabel: string; leadId: string }) {
  return (
    <div className="card p-8 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary-50 flex items-center justify-center mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-8 h-8 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{t.successTitle}</h2>
      <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
        {t.successText.replace("{plan}", planLabel)}
      </p>
      <div className="mt-5 inline-flex flex-col items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-6 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.successRef}</span>
        <span className="font-mono font-bold text-slate-900 text-base" dir="ltr">#{leadId.slice(0, 8).toUpperCase()}</span>
      </div>
      <p className="text-xs text-slate-500 mt-4">{t.successHint}</p>
      <Link href="/tarifs" className="btn-outline mt-6 px-6 py-2.5 text-sm">{t.successBack}</Link>
    </div>
  );
}

export function LeadForm({
  plan,
  billing,
  defaults,
  t,
}: {
  plan: "PRO" | "CABINET";
  billing: "MONTHLY" | "ANNUAL" | null;
  defaults?: { name?: string; email?: string; phone?: string };
  t: LeadT;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<LeadResult | null>(null);

  const planLabel = plan === "PRO" ? t.planPro : t.planCabinet;

  if (result?.leadId) return <SuccessCard t={t} planLabel={planLabel} leadId={result.leadId} />;

  const fe = result?.fieldErrors ?? {};

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("plan", plan);
    if (billing) fd.set("billing", billing);
    startTransition(async () => {
      const r = await submitSubscriptionLead(fd);
      setResult(r);
      if (r.leadId) window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card p-5 sm:p-6 flex flex-col gap-4">

      {result?.error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700" role="alert">
          {result.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-semibold text-slate-800">{t.nameLabel} <span className="text-red-400">*</span></label>
        <input id="name" name="name" type="text" autoComplete="name" defaultValue={defaults?.name ?? ""}
          placeholder={t.namePlaceholder} className={`input-field ${fe.name ? "border-red-300" : ""}`} />
        <FieldError msg={fe.name} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-slate-800">{t.emailLabel} <span className="text-red-400">*</span></label>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" dir="ltr" defaultValue={defaults?.email ?? ""}
            placeholder={t.emailPlaceholder} className={`input-field ${fe.email ? "border-red-300" : ""}`} />
          <FieldError msg={fe.email} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-semibold text-slate-800">{t.phoneLabel} <span className="text-red-400">*</span></label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" defaultValue={defaults?.phone ?? ""}
            placeholder={t.phonePlaceholder} className={`input-field ${fe.phone ? "border-red-300" : ""}`} />
          <FieldError msg={fe.phone} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-sm font-semibold text-slate-800">{t.cityLabel} <span className="font-normal text-slate-400">· {t.optional}</span></label>
          <input id="city" name="city" type="text" autoComplete="address-level2" placeholder={t.cityPlaceholder} className="input-field" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="specialty" className="text-sm font-semibold text-slate-800">{t.specialtyLabel} <span className="font-normal text-slate-400">· {t.optional}</span></label>
          <input id="specialty" name="specialty" type="text" placeholder={t.specialtyPlaceholder} className="input-field" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-semibold text-slate-800">{t.messageLabel} <span className="font-normal text-slate-400">· {t.optional}</span></label>
        <textarea id="message" name="message" rows={3} maxLength={500} placeholder={t.messagePlaceholder} className="input-field resize-none" />
      </div>

      <button type="submit" disabled={pending} className="btn-secondary w-full justify-center py-3.5 text-[15px] font-semibold">
        {pending ? (
          <>
            <svg className="animate-spin w-4 h-4 me-2" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t.submitting}
          </>
        ) : t.submit}
      </button>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
        {[t.reassure1, t.reassure2, t.reassure3].map((r) => (
          <span key={r} className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-secondary-500 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3.5 3.5 6.5-7" /></svg>
            {r}
          </span>
        ))}
      </div>
    </form>
  );
}
