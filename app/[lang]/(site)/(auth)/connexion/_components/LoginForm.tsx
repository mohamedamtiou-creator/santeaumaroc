"use client";

import { useActionState, useState } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { login } from "@/features/auth/actions";
import type { Dictionary } from "@/lib/i18n";

function EyeOpenIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10s3.2-6 8-6 8 6 8 6-3.2 6-8 6-8-6-8-6z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10s3.2-6 8-6 8 6 8 6-3.2 6-8 6-8-6-8-6z" />
      <circle cx="10" cy="10" r="2.5" />
      <path d="M3 3l14 14" />
    </svg>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5" role="alert">
      <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 shrink-0" aria-hidden="true">
        <circle cx="6" cy="6" r="5.5" />
        <path d="M6 4v2.5M6 8h.01" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
      {message}
    </p>
  );
}

type Props = {
  callbackUrl?: string;
  t: Dictionary["auth"]["login"]["form"];
};

export function LoginForm({ callbackUrl, t}: Props) {
  const [state, action, pending] = useActionState(login, undefined);
  const [fields, setFields] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  function update(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  const inscriptionParams = callbackUrl
    ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "";

  return (
    <form action={action} className="space-y-4">

      {/* callbackUrl caché */}
      {callbackUrl && (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      )}

      {/* Global error */}
      {state?.message && (
        <div
          className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex flex-col gap-2"
          role="alert"
        >
          <span className="flex items-start gap-2.5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 5.5v3M8 10.5h.01" />
            </svg>
            {state.message}
          </span>
          {state.code === "UNVERIFIED" && (
            <Link
              href={`/auth/verification-envoyee${fields.email ? `?email=${encodeURIComponent(fields.email)}` : ""}`}
              className="ms-6 font-semibold text-red-800 underline underline-offset-2 hover:text-red-900 w-fit"
            >
              {t.resendVerification}
            </Link>
          )}
        </div>
      )}

      {/* Bannière redirect contexte */}
      {callbackUrl && (
        <div className="flex items-start gap-2.5 p-3 bg-primary-50 border border-primary-100 rounded-xl text-xs text-primary-700">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
            className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="7"/><path d="M8 5v4M8 11h.01"/>
          </svg>
          <span>{t.contextBanner}</span>
        </div>
      )}

      {/* E-mail */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={fields.email}
          onChange={update("email")}
          placeholder={t.emailPlaceholder}
          className={`input-field h-11 ${state?.errors?.email ? "border-red-300 focus:ring-red-400" : ""}`}
        />
        <FieldError message={state?.errors?.email?.[0]} />
      </div>

      {/* Mot de passe */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            {t.password}
          </label>
          <Link
            href="/auth/mot-de-passe-oublie"
            className="text-xs text-secondary-600 hover:text-secondary-700 hover:underline font-medium"
            tabIndex={0}
          >
            {t.forgot}
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            value={fields.password}
            onChange={update("password")}
            placeholder={t.passwordPlaceholder}
            className={`input-field h-11 pe-10 ${state?.errors?.password ? "border-red-300 focus:ring-red-400" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1 rounded"
            aria-label={showPw ? t.hidePassword : t.showPassword}
          >
            {showPw ? <EyeOffIcon /> : <EyeOpenIcon />}
          </button>
        </div>
        <FieldError message={state?.errors?.password?.[0]} />
      </div>

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full py-3 text-base"
        >
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              {t.submitting}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {t.submit}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          )}
        </button>
      </div>

      {/* Inscription */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-center text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">
          {t.noAccount}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/inscription${inscriptionParams}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-3 rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 transition-colors"
          >
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="4.5" r="2.5" />
              <path d="M1.5 12.5c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" />
            </svg>
            {t.patient}
          </Link>
          <Link
            href={`/inscription-praticien${inscriptionParams}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-3 rounded-lg border border-secondary-200 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300 transition-colors"
          >
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="4.5" r="2.5" />
              <path d="M1.5 12.5c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" />
              <path d="M10 8v3M8.5 9.5h3" />
            </svg>
            {t.praticien}
          </Link>
        </div>
      </div>

    </form>
  );
}
