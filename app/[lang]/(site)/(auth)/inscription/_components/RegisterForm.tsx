"use client";

import { useActionState, useState } from "react";
import { register } from "@/features/auth/actions";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useEmailAvailability } from "@/components/auth/useEmailAvailability";
import type { Dictionary } from "@/lib/i18n";

type FormT = Dictionary["inscription"]["patient"]["form"];

function getStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length === 0) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

const STRENGTH_BAR_COLORS = ["", "bg-red-400", "bg-amber-400", "bg-secondary-500"];
const STRENGTH_TEXT_COLORS = ["", "text-red-600", "text-amber-600", "text-secondary-600"];

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

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5" role="alert">
      <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 shrink-0" aria-hidden="true">
        <circle cx="6" cy="6" r="5.5" />
        <path d="M6 4v2.5M6 8h.01" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
      {message}
    </p>
  );
}

/** Attributs a11y à épandre sur un champ selon la présence d'erreur. */
function errAttrs(id: string, hasError: boolean) {
  return hasError
    ? { "aria-invalid": true as const, "aria-describedby": id }
    : {};
}

export function RegisterForm({ t}: { t: FormT }) {
  const [state, action, pending] = useActionState(register, undefined);
  const [fields, setFields] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const email = useEmailAvailability();

  const strength = getStrength(fields.password);
  const strengthLabels = ["", t.weak, t.medium, t.strong];
  const emailTaken = email.status === "taken";

  function update(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  return (
    <form action={action} className="space-y-4">

      {/* Global error banner */}
      {state?.message && (
        <div
          className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5"
          role="alert"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 5.5v3M8 10.5h.01" />
          </svg>
          {state.message}
        </div>
      )}

      {/* Nom complet */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={fields.name}
          onChange={update("name")}
          placeholder={t.namePlaceholder}
          {...errAttrs("name-error", !!state?.errors?.name)}
          className={`input-field h-11 ${state?.errors?.name ? "border-red-300 focus:ring-red-400" : ""}`}
        />
        <FieldError id="name-error" message={state?.errors?.name?.[0]} />
      </div>

      {/* E-mail */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.email}
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={fields.email}
            onChange={(e) => { update("email")(e); email.reset(); }}
            onBlur={(e) => email.check(e.target.value)}
            placeholder={t.emailPlaceholder}
            aria-invalid={emailTaken || !!state?.errors?.email}
            {...(emailTaken || state?.errors?.email ? { "aria-describedby": "email-error" } : {})}
            className={`input-field h-11 pe-10 ${
              emailTaken || state?.errors?.email
                ? "border-red-300 focus:ring-red-400"
                : email.status === "available"
                ? "border-secondary-400"
                : ""
            }`}
          />
          <span className="absolute end-3 top-1/2 -translate-y-1/2" aria-hidden="true">
            {email.status === "checking" && (
              <svg className="animate-spin w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {email.status === "available" && (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-secondary-500" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8.5l3 3 7-7" />
              </svg>
            )}
          </span>
        </div>
        {emailTaken ? (
          <p id="email-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5" role="alert">
            <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 shrink-0" aria-hidden="true">
              <circle cx="6" cy="6" r="5.5" />
              <path d="M6 4v2.5M6 8h.01" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
            {t.emailTaken}{" "}
            <LocaleLink href="/connexion" className="font-semibold underline">{t.login}</LocaleLink>
          </p>
        ) : (
          <FieldError id="email-error" message={state?.errors?.email?.[0]} />
        )}
      </div>

      {/* Téléphone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.phone}
          <span className="ms-1.5 text-xs text-slate-500 font-normal">{t.optional}</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={fields.phone}
          onChange={update("phone")}
          inputMode="tel"
          className="input-field h-11"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          {t.phoneHint}
        </p>
      </div>

      {/* Mot de passe */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.password}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            value={fields.password}
            onChange={update("password")}
            placeholder={t.passwordPlaceholder}
            {...errAttrs("password-error", !!state?.errors?.password)}
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

        {/* Strength indicator */}
        {fields.password.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                    strength >= i ? STRENGTH_BAR_COLORS[strength] : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${STRENGTH_TEXT_COLORS[strength]}`}>
              {strengthLabels[strength]}
            </p>
          </div>
        )}

        {state?.errors?.password && (
          <ul id="password-error" className="mt-1.5 space-y-0.5">
            {state.errors.password.map((e) => (
              <li key={e}>
                <FieldError message={e} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={pending || emailTaken}
          className="btn-secondary w-full py-3 text-base"
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

      {/* Trust */}
      <div className="flex items-center justify-center gap-4 pt-1">
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="8" height="6" rx="1" />
            <path d="M4 5V3.5a2 2 0 1 1 4 0V5" />
          </svg>
          {t.trustSecure}
        </span>
        <span className="text-slate-200">·</span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 1a4 4 0 0 1 4 4c0 3-2.5 5.5-4 6-1.5-.5-4-3-4-6a4 4 0 0 1 4-4z" />
            <path d="M4 5.5l1.5 1.5 2.5-2.5" />
          </svg>
          {t.trustFree}
        </span>
      </div>

      <p className="text-xs text-slate-500 text-center leading-relaxed">
        {t.termsPre}{" "}
        <LocaleLink href="/conditions-utilisation" className="text-secondary-600 hover:underline">
          {t.termsLink}
        </LocaleLink>
        .
      </p>
    </form>
  );
}
