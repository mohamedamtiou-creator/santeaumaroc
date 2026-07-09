"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "../_actions";
import { SUBJECTS } from "../_constants";
import type { Dictionary } from "@/lib/i18n";

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  // id + role=alert : le message est relié au champ via aria-describedby et
  // annoncé par les lecteurs d'écran dès son apparition (WCAG 3.3.1 / 4.1.3).
  return <p id={id} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">{msg}</p>;
}

/** Attributs a11y à épandre sur un champ selon la présence d'erreur. */
function errAttrs(id: string, hasError: boolean) {
  return hasError
    ? { "aria-invalid": true as const, "aria-describedby": id }
    : {};
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5"
      className="w-14 h-14 text-secondary-500" aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="20" className="stroke-secondary-100" strokeWidth="4" />
      <circle cx="24" cy="24" r="20" stroke="#059669" strokeWidth="4" strokeDasharray="125" strokeDashoffset="0" />
      <path d="M15 24l7 7 11-13" stroke="#059669" strokeWidth="3"/>
    </svg>
  );
}

function SendIcon({ spinning }: { spinning: boolean }) {
  if (spinning) {
    return (
      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10l14-7-7 14V10H3z"/>
    </svg>
  );
}

const initial: ContactState = {};

type Props = {
  t: Dictionary["contact"]["form"];
  /** Libellés traduits des sujets — même ordre que SUBJECTS (valeur envoyée = FR). */
  subjects: readonly string[];
};

export function ContactForm({ t, subjects }: Props) {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.success) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-4 gap-4">
        <CheckCircleIcon />
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{t.successTitle}</h3>
          <p className="text-slate-500 text-sm max-w-xs">
            {t.successText}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
        >
          {t.another}
        </button>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5">

      {state.serverError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-red-500" aria-hidden="true">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 11.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm.75-3.5a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 1.5 0v4z"/>
          </svg>
          {state.serverError}
        </div>
      )}

      {/* Honeypot anti-spam (invisible) */}
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off"
        className="absolute w-px h-px opacity-0 pointer-events-none" aria-hidden="true" />

      {/* Nom + E-mail */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
            {t.name} <span className="text-red-500">*</span>
          </label>
          <input
            id="name" name="name" type="text" autoComplete="name" required
            placeholder={t.namePh}
            {...errAttrs("name-error", !!state.errors?.name)}
            className={`input-field h-11 ${state.errors?.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          />
          <FieldError id="name-error" msg={state.errors?.name} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
            {t.email} <span className="text-red-500">*</span>
          </label>
          <input
            id="email" name="email" type="email" autoComplete="email" required
            placeholder={t.emailPh}
            {...errAttrs("email-error", !!state.errors?.email)}
            className={`input-field h-11 ${state.errors?.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          />
          <FieldError id="email-error" msg={state.errors?.email} />
        </div>
      </div>

      {/* Téléphone + Sujet */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
            {t.phone}
            <span className="ms-1.5 text-xs text-slate-500 font-normal">{t.phoneOptional}</span>
          </label>
          <input
            id="phone" name="phone" type="tel" autoComplete="tel"
            placeholder={t.phonePh}
            className="input-field h-11"
            dir="ltr"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1.5">
            {t.subject} <span className="text-red-500">*</span>
          </label>
          <select
            id="subject" name="subject" required defaultValue=""
            {...errAttrs("subject-error", !!state.errors?.subject)}
            className={`input-field h-11 ${state.errors?.subject ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          >
            <option value="" disabled>{t.subjectPlaceholder}</option>
            {/* value = valeur FR (validée/stockée côté serveur) ; libellé = traduit */}
            {SUBJECTS.map((s, i) => (
              <option key={s} value={s}>{subjects[i] ?? s}</option>
            ))}
          </select>
          <FieldError id="subject-error" msg={state.errors?.subject} />
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.message} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message" name="message" required rows={5}
          placeholder={t.messagePh}
          {...errAttrs("message-error", !!state.errors?.message)}
          className={`input-field resize-none py-3 ${state.errors?.message ? "border-red-400 focus-visible:ring-red-400" : ""}`}
        />
        <FieldError id="message-error" msg={state.errors?.message} />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-xs text-slate-500">
          <span className="text-red-500">*</span> {t.required}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary px-6 py-2.5 text-sm min-w-[10rem]"
        >
          <SendIcon spinning={pending} />
          {pending ? t.sending : t.submit}
        </button>
      </div>
    </form>
  );
}
