"use client";

import { useActionState, useState } from "react";
import { registerDoctor, type DoctorRegisterState } from "../_actions";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { GroupedSelect } from "@/components/ui/GroupedSelect";
import { useEmailAvailability } from "@/components/auth/useEmailAvailability";
import type { Dictionary } from "@/lib/i18n";

type FormT = Dictionary["inscription"]["praticien"]["form"];

const CIVILITES = ["Dr", "Pr", "M.", "Mme"];

/** Champs validés à l'étape 1 (identité & exercice). */
const STEP1_KEYS = ["prenom", "nom", "specialtyId", "cityId"] as const;

type Props = {
  specialties: { id: string; name: string; order: number }[];
  cities:      { id: string; name: string; order: number }[];
  callbackUrl?: string;
  t: FormT;
};

/* ── Helpers ─────────────────────────────────────────────── */

function FieldError({ id, msg }: { id?: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
      <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 shrink-0" aria-hidden="true">
        <circle cx="6" cy="6" r="5.5"/>
        <path d="M6 4v2.5M6 8h.01" stroke="white" strokeWidth="1.25" strokeLinecap="round"/>
      </svg>
      {msg}
    </p>
  );
}

/** Attributs a11y à épandre sur un champ selon la présence d'erreur. */
function errAttrs(id: string, hasError: boolean) {
  return hasError
    ? { "aria-invalid": true as const, "aria-describedby": id }
    : {};
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
    </label>
  );
}

function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10s3.2-6 8-6 8 6 8 6-3.2 6-8 6-8-6-8-6z" />
      <circle cx="10" cy="10" r="2.5" />
      {off && <path d="M3 3l14 14" />}
    </svg>
  );
}

function PasswordStrength({ password, t }: { password: string; t: FormT }) {
  if (!password) return null;
  const checks = [
    { label: t.char8,   ok: password.length >= 8 },
    { label: t.letter1, ok: /[a-zA-Z]/.test(password) },
    { label: t.digit1,  ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const barColor = score === 3 ? "bg-secondary-500" : score === 2 ? "bg-amber-400" : "bg-red-400";
  const scoreLabel = score === 3 ? t.strong : score === 2 ? t.medium : t.weak;
  const scoreColor = score === 3 ? "text-secondary-600" : score === 2 ? "text-amber-600" : "text-red-500";

  return (
    <div className="mt-2.5">
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? barColor : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((c) => (
            <span key={c.label} className={`text-xs flex items-center gap-0.5 transition-colors ${c.ok ? "text-secondary-600" : "text-slate-500"}`}>
              {c.ok ? (
                <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5" aria-hidden="true" strokeLinecap="round">
                  <path d="M2 5l2 2 4-4"/>
                </svg>
              ) : (
                <span className="w-2.5 h-2.5 rounded-full border border-current inline-block" aria-hidden="true" />
              )}
              {c.label}
            </span>
          ))}
        </div>
        <span className={`text-xs font-semibold ${scoreColor}`}>{scoreLabel}</span>
      </div>
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  if (done) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center shrink-0 ring-4 ring-secondary-100">
        <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round">
          <path d="M2 6l3 3 5-5"/>
        </svg>
      </div>
    );
  }
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-all ${
      active ? "text-white ring-4 ring-primary-100" : "bg-slate-200 text-slate-500"
    }`}
    style={active ? { background: "linear-gradient(135deg, #1d4ed8, #2563eb)", boxShadow: "0 4px 12px 0 rgb(37 99 235 / 0.35)" } : {}}
    >
      {label}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */

export function DoctorRegisterForm({
  specialties,
  cities,
  callbackUrl,
  t,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  // Étape 1 — identité & exercice (faible friction, valorisant : crée l'engagement)
  const [profil, setProfil] = useState({
    civilite: "Dr", prenom: "", nom: "", specialtyId: "", cityId: "",
  });
  // Étape 2 — coordonnées & accès (l'engagement « mot de passe » arrive en dernier)
  const [acces, setAcces] = useState({ adresse: "", phone: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const email = useEmailAvailability();

  const [state, action, pending] = useActionState<DoctorRegisterState, FormData>(
    registerDoctor, undefined,
  );

  // Si le serveur renvoie une erreur sur un champ d'identité (étape 1, non visible
  // à l'étape 2), on ramène l'utilisateur à l'étape 1 pour qu'il puisse la corriger.
  // Ajustement pendant le rendu (pattern React « état dérivé d'un changement ») :
  // se déclenche uniquement quand `state` change, donc pas de boucle.
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state?.errors && STEP1_KEYS.some((k) => state.errors?.[k])) {
      setStep(1);
    }
  }

  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (profil.prenom.trim().length < 2) errs.prenom = t.errPrenom;
    if (profil.nom.trim().length < 2)    errs.nom = t.errNom;
    if (!profil.specialtyId)             errs.specialtyId = t.errSpecialty;
    if (!profil.cityId)                  errs.cityId = t.errCity;
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleContinue() {
    if (validateStep1()) setStep(2);
  }

  /* ── Barre de progression ──────────────────────────────── */
  const progress = (
    <div className="flex items-center gap-2 mb-7">
      <StepDot active={step === 1} done={step > 1} label="1" />
      <div className={`flex-1 h-0.5 rounded-full transition-colors duration-500 ${step > 1 ? "bg-secondary-400" : "bg-slate-200"}`} />
      <StepDot active={step === 2} done={false} label="2" />
      <div className="flex-1 h-0.5 rounded-full bg-slate-200" />
      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-slate-500" aria-hidden="true" strokeLinecap="round">
          <path d="M6 4v4M6 9.5v.5"/>
        </svg>
      </div>
    </div>
  );

  /* ── Étape 1 : Identité & exercice ──────────────────────── */
  if (step === 1) {
    return (
      <div>
        {progress}

        <div className="mb-6">
          <p className="section-eyebrow mb-1">{t.step1of2}</p>
          <h2 className="text-lg font-bold text-slate-900">{t.step1Title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t.step1Subtitle}</p>
        </div>

        <div className="space-y-4">
          {/* Civilité + Prénom + Nom */}
          <div className="grid grid-cols-[88px_1fr_1fr] gap-2.5">
            <div>
              <Label htmlFor="civilite">{t.civilite}</Label>
              <select id="civilite" value={profil.civilite}
                onChange={(e) => setProfil((p) => ({ ...p, civilite: e.target.value }))}
                className="input-field h-11">
                {CIVILITES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="prenom">{t.prenom}</Label>
              <input id="prenom" type="text" autoComplete="given-name"
                value={profil.prenom}
                onChange={(e) => setProfil((p) => ({ ...p, prenom: e.target.value }))}
                placeholder={t.prenomPlaceholder}
                {...errAttrs("prenom-error", !!(step1Errors.prenom || state?.errors?.prenom))}
                className={`input-field h-11 ${(step1Errors.prenom || state?.errors?.prenom) ? "border-red-400 focus-visible:ring-red-300" : ""}`} />
              <FieldError id="prenom-error" msg={step1Errors.prenom || state?.errors?.prenom} />
            </div>
            <div>
              <Label htmlFor="nom">{t.nom}</Label>
              <input id="nom" type="text" autoComplete="family-name"
                value={profil.nom}
                onChange={(e) => setProfil((p) => ({ ...p, nom: e.target.value }))}
                placeholder={t.nomPlaceholder}
                {...errAttrs("nom-error", !!(step1Errors.nom || state?.errors?.nom))}
                className={`input-field h-11 ${(step1Errors.nom || state?.errors?.nom) ? "border-red-400 focus-visible:ring-red-300" : ""}`} />
              <FieldError id="nom-error" msg={step1Errors.nom || state?.errors?.nom} />
            </div>
          </div>

          {/* Spécialité + Ville */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="specialtyId">{t.specialty}</Label>
              <GroupedSelect
                id="specialtyId"
                value={profil.specialtyId}
                onChange={(e) => setProfil((p) => ({ ...p, specialtyId: e.target.value }))}
                items={specialties}
                featuredLabel={t.specialtyFeatured}
                othersLabel={t.specialtyOthers}
                {...errAttrs("specialtyId-error", !!(step1Errors.specialtyId || state?.errors?.specialtyId))}
                className={`input-field h-11 ${(step1Errors.specialtyId || state?.errors?.specialtyId) ? "border-red-400 focus-visible:ring-red-300" : ""}`}
              >
                <option value="" disabled>{t.choose}</option>
              </GroupedSelect>
              <FieldError id="specialtyId-error" msg={step1Errors.specialtyId || state?.errors?.specialtyId} />
            </div>
            <div>
              <Label htmlFor="cityId">{t.city}</Label>
              <GroupedSelect
                id="cityId"
                value={profil.cityId}
                onChange={(e) => setProfil((p) => ({ ...p, cityId: e.target.value }))}
                items={cities}
                featuredLabel={t.cityFeatured}
                othersLabel={t.cityOthers}
                {...errAttrs("cityId-error", !!(step1Errors.cityId || state?.errors?.cityId))}
                className={`input-field h-11 ${(step1Errors.cityId || state?.errors?.cityId) ? "border-red-400 focus-visible:ring-red-300" : ""}`}
              >
                <option value="" disabled>{t.choose}</option>
              </GroupedSelect>
              <FieldError id="cityId-error" msg={step1Errors.cityId || state?.errors?.cityId} />
            </div>
          </div>

          <button type="button" onClick={handleContinue} className="btn-primary w-full py-3 text-sm mt-2">
            {t.continue}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round">
              <path d="M6 12l4-4-4-4"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  /* ── Étape 2 : Coordonnées & accès ──────────────────────── */
  const emailTaken = email.status === "taken";

  return (
    <div>
      {progress}

      <div className="mb-6">
        <p className="section-eyebrow mb-1">{t.step2of2}</p>
        <h2 className="text-lg font-bold text-slate-900">{t.step2Title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {t.greetingPre} {profil.civilite} {profil.nom || profil.prenom || ""} {t.greetingPost}
        </p>
      </div>

      {state?.serverError && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2" role="alert">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 shrink-0 text-red-500" aria-hidden="true">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 11.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm.75-3.5a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 1.5 0v4z"/>
          </svg>
          {state.serverError}
        </div>
      )}

      <form action={action} className="space-y-4">
        {/* Données de l'étape 1 + contexte */}
        <input type="hidden" name="civilite"    value={profil.civilite} />
        <input type="hidden" name="prenom"       value={profil.prenom} />
        <input type="hidden" name="nom"          value={profil.nom} />
        <input type="hidden" name="specialtyId"  value={profil.specialtyId} />
        <input type="hidden" name="cityId"       value={profil.cityId} />
        {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

        {/* Adresse + Téléphone */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="adresse">{t.address}</Label>
            <input id="adresse" name="adresse" type="text" autoComplete="street-address"
              value={acces.adresse}
              onChange={(e) => setAcces((p) => ({ ...p, adresse: e.target.value }))}
              placeholder={t.addressPlaceholder}
              {...errAttrs("adresse-error", !!state?.errors?.adresse)}
              className={`input-field h-11 ${state?.errors?.adresse ? "border-red-400" : ""}`} />
            <FieldError id="adresse-error" msg={state?.errors?.adresse} />
          </div>
          <div>
            <Label htmlFor="phone">{t.phone}</Label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel"
              value={acces.phone}
              onChange={(e) => setAcces((p) => ({ ...p, phone: e.target.value }))}
              placeholder="06 12 34 56 78"
              {...errAttrs("phone-error", !!state?.errors?.phone)}
              className={`input-field h-11 ${state?.errors?.phone ? "border-red-400" : ""}`} />
            <FieldError id="phone-error" msg={state?.errors?.phone} />
          </div>
        </div>

        {/* E-mail (avec vérification de disponibilité) */}
        <div>
          <Label htmlFor="email">{t.email}</Label>
          <div className="relative">
            <input id="email" name="email" type="email" autoComplete="email" inputMode="email"
              value={acces.email}
              onChange={(e) => { setAcces((p) => ({ ...p, email: e.target.value })); email.reset(); }}
              onBlur={(e) => email.check(e.target.value)}
              placeholder={t.emailPlaceholder}
              aria-invalid={emailTaken || !!state?.errors?.email}
              {...(emailTaken || state?.errors?.email ? { "aria-describedby": "email-error" } : {})}
              className={`input-field h-11 pe-10 ${(emailTaken || state?.errors?.email) ? "border-red-400 focus-visible:ring-red-300" : email.status === "available" ? "border-secondary-400" : ""}`} />
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
            <p id="email-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
              <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 shrink-0" aria-hidden="true">
                <circle cx="6" cy="6" r="5.5"/>
                <path d="M6 4v2.5M6 8h.01" stroke="white" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
              {t.emailTaken}{" "}
              <LocaleLink href="/connexion" className="font-semibold underline">{t.login}</LocaleLink>
            </p>
          ) : (
            <FieldError id="email-error" msg={state?.errors?.email} />
          )}
        </div>

        {/* Mot de passe (champ unique + révéler — pas de confirmation) */}
        <div>
          <Label htmlFor="password">{t.password}</Label>
          <div className="relative">
            <input id="password" name="password" type={showPw ? "text" : "password"} autoComplete="new-password"
              value={acces.password}
              onChange={(e) => setAcces((p) => ({ ...p, password: e.target.value }))}
              placeholder={t.passwordPlaceholder}
              {...errAttrs("password-error", !!state?.errors?.password)}
              className={`input-field h-11 pe-10 ${state?.errors?.password ? "border-red-400 focus-visible:ring-red-300" : ""}`} />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1 rounded"
              aria-label={showPw ? t.hidePassword : t.showPassword}>
              <EyeIcon off={showPw} />
            </button>
          </div>
          <FieldError id="password-error" msg={state?.errors?.password} />
          <PasswordStrength password={acces.password} t={t} />
        </div>

        {/* CGU */}
        <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${state?.errors?.cgu ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
          <input id="cgu" name="cgu" type="checkbox"
            {...errAttrs("cgu-error", !!state?.errors?.cgu)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0"
          />
          <label htmlFor="cgu" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
            {t.cguPre}{" "}
            <a href="/conditions-utilisation" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">
              {t.cguTerms}
            </a>{" "}
            {t.cguAnd}{" "}
            <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">
              {t.cguPrivacy}
            </a>
            {t.cguPost}
          </label>
        </div>
        {state?.errors?.cgu && <FieldError id="cgu-error" msg={state.errors.cgu} />}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => setStep(1)} className="btn-outline px-5 py-3 text-sm shrink-0">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round">
              <path d="M10 12L6 8l4-4"/>
            </svg>
            {t.back}
          </button>
          <button type="submit" disabled={pending || emailTaken} className="btn-primary flex-1 py-3 text-sm">
            {pending ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                {t.submitting}
              </>
            ) : (
              <>
                {t.submit}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round">
                  <path d="M6 12l4-4-4-4"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
