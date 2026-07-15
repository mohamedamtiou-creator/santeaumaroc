"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import Image from "next/image";
import { submitClaimFlow, type ClaimFlowState } from "@/features/claims/actions";
import { useEmailAvailability } from "@/components/auth/useEmailAvailability";
import { ProofFields, type ProofLabels } from "@/components/documents/ProofFields";
import type { Dictionary } from "@/lib/i18n";

/* ───────────────────────────────────────────────────────────── */

type Mode = "guest" | "doctor" | "patient";
type ClaimDict = Dictionary["claim"];

type Props = {
  ficheId:   string;
  ficheSlug: string;
  fiche: {
    name:      string;
    specialty: string;
    city:      string;
    adresse:   string;
    avatar:    string | null;
    initials:  string;
  };
  mode:          Mode;
  prevRejection?: string | null;
  t:             ClaimDict;
};

type PickedDoc = { file: File; isPdf: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SIZE = 5 * 1024 * 1024;

/* ── Icônes ───────────────────────────────────────────────── */

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25" className={className}
      aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5l3.5 3.5L13 4" />
    </svg>
  );
}

/* ── Force du mot de passe ─────────────────────────────────── */

function PasswordStrength({ password, t }: { password: string; t: ClaimDict }) {
  if (!password) return null;
  const checks = [
    { label: t.pwChars,  ok: password.length >= 8 },
    { label: t.pwLetter, ok: /[a-zA-Z]/.test(password) },
    { label: t.pwDigit,  ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const bar = score === 3 ? "bg-secondary-500" : score === 2 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="mt-2.5">
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? bar : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-secondary-600" : "text-slate-500"}`}>
            {c.ok
              ? <CheckIcon className="w-2.5 h-2.5" />
              : <span className="w-2.5 h-2.5 rounded-full border border-current inline-block" aria-hidden="true" />}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Récap fiche (lecture seule — zéro ressaisie) ──────────── */

function FicheRecap({ fiche }: { fiche: Props["fiche"] }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4">
      {fiche.avatar ? (
        <Image src={fiche.avatar} alt="" width={56} height={56} className="w-14 h-14 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-primary-600">{fiche.initials}</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="font-bold text-slate-900 leading-tight truncate">{fiche.name}</p>
        <p className="text-sm text-primary-600 mt-0.5">{fiche.specialty}</p>
        <p className="text-xs text-slate-500 truncate">{fiche.city}{fiche.adresse ? ` · ${fiche.adresse}` : ""}</p>
      </div>
    </div>
  );
}

/* ── Composant principal ───────────────────────────────────── */

export function ClaimWizard({ ficheId, ficheSlug, fiche, mode, prevRejection, t }: Props) {
  /* Libellés du bloc justificatifs partagé (dérivés du dictionnaire). */
  const PROOF_LABELS: ProofLabels = {
    cinTitle:           t.proof.cinTitle,
    required:           t.proof.required,
    justifTitle:        t.proof.justifTitle,
    eitherOr:           t.proof.eitherOr,
    optionA:            t.proof.optionA,
    optionAOptional:    t.proof.optionAOptional,
    orSep:              t.proof.orSep,
    optionB:            t.proof.optionB,
    ordrePlaceholder:   t.proof.ordrePlaceholder,
    ordreHint:          t.proof.ordreHint,
    messageLabel:       t.proof.messageLabel,
    messagePlaceholder: t.proof.messagePlaceholder,
    reassurance:        t.proof.reassurance,
    upload:             t.proof.upload,
  };

  const STEP_LABELS: Record<Mode, string[]> = {
    guest:   [t.steps.identity, t.steps.proofs, t.steps.access],
    doctor:  [t.steps.identity, t.steps.proofs],
    patient: [t.steps.identity, t.steps.proofs],
  };

  const labels   = STEP_LABELS[mode];
  const lastStep = labels.length - 1; // index de l'étape de soumission

  const [step, setStep] = useState(0);
  const [cin, setCin]         = useState<PickedDoc | null>(null);
  const [diplome, setDiplome] = useState<PickedDoc | null>(null);
  const [ordre, setOrdre]     = useState("");
  const [message, setMessage] = useState("");

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [cgu, setCgu]           = useState(false);
  const emailCheck = useEmailAvailability();

  const [clientErr, setClientErr] = useState("");
  const [uploadErr, setUploadErr] = useState("");

  const [state, formAction, pending] = useActionState<ClaimFlowState, FormData>(submitClaimFlow, undefined);

  const headingRef = useRef<HTMLHeadingElement>(null);

  /* Renvoie l'utilisateur à la bonne étape si le serveur signale une erreur. */
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state?.errors) {
      if (state.errors.documents) setStep(1);
      else if (state.errors.email || state.errors.password || state.errors.cgu) setStep(lastStep);
    }
  }

  /* Focus sur le titre de l'étape (clavier + lecteur d'écran). */
  useEffect(() => { headingRef.current?.focus(); }, [step, state?.ok]);

  function pick(setter: (d: PickedDoc | null) => void) {
    return (file: File) => {
      if (file.size > MAX_SIZE) { setUploadErr(t.errFileTooBig.replace("{name}", file.name)); return; }
      setUploadErr("");
      setClientErr("");
      setter({ file, isPdf: file.type === "application/pdf" });
    };
  }

  function validateProof(): boolean {
    if (!cin) { setClientErr(t.errCinRequired); return false; }
    if (!diplome && !ordre.trim()) {
      setClientErr(t.errProof);
      return false;
    }
    setClientErr("");
    return true;
  }

  function validateAccess(): boolean {
    if (!EMAIL_RE.test(email.trim())) { setClientErr(t.errEmail); return false; }
    if (emailCheck.status === "taken") { setClientErr(t.errEmailTaken); return false; }
    if (password.length < 8 || !/[0-9]/.test(password)) { setClientErr(t.errPassword); return false; }
    if (!cgu) { setClientErr(t.errCgu); return false; }
    setClientErr("");
    return true;
  }

  function submit() {
    const fd = new FormData();
    fd.set("ficheId", ficheId);
    fd.set("ficheSlug", ficheSlug);
    fd.set("ordreNumber", ordre.trim());
    fd.set("message", message.trim());
    if (cin)     fd.set("cin", cin.file);
    if (diplome) fd.set("diplome", diplome.file);
    if (mode === "guest") {
      fd.set("email", email.trim());
      fd.set("password", password);
      fd.set("cgu", cgu ? "on" : "");
    }
    startTransition(() => formAction(fd));
  }

  function handleNext() {
    if (step === 0) { setStep(1); return; }
    if (step === 1) {
      if (!validateProof()) return;
      if (mode === "guest") { setStep(2); return; }
      submit();
      return;
    }
    if (step === 2) {
      if (!validateAccess()) return;
      submit();
    }
  }

  /* ── Écran de succès ─────────────────────────────────────── */
  if (state?.ok) {
    const timeline = t.timeline.map((s, i) => ({ ...s, done: i === 0 }));
    return (
      <div className="flex flex-col items-center text-center gap-5 py-6">
        <div className="w-16 h-16 rounded-2xl bg-secondary-50 flex items-center justify-center">
          <CheckIcon className="w-8 h-8 text-secondary-500" />
        </div>
        <div>
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-slate-900 outline-none">
            {t.sentTitle}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 max-w-sm leading-relaxed">
            {t.sentText}
          </p>
        </div>

        {/* Chronologie « et après ? » */}
        <ol className="w-full max-w-sm text-start flex flex-col gap-0 mt-1">
          {timeline.map((s, i) => (
            <li key={s.title} className="flex gap-3 pb-4 last:pb-0 relative">
              {i < timeline.length - 1 && (
                <span className="absolute start-[13px] top-7 bottom-0 w-px bg-slate-200" aria-hidden="true" />
              )}
              <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                s.done ? "bg-secondary-500 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                {s.done ? <CheckIcon className="w-3.5 h-3.5" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {mode === "guest" && (
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 max-w-sm leading-relaxed">
            {t.emailSentPre}<strong className="text-slate-700">{email.trim()}</strong>{t.emailSentPost}
          </p>
        )}

        <Link href="/praticien/tableau-de-bord" className="btn-primary px-6 py-2.5">
          {t.goToSpace}
        </Link>
      </div>
    );
  }

  /* ── Wizard ──────────────────────────────────────────────── */
  const serverErr = state?.errors?.form;
  const errorMsg  = clientErr || uploadErr || serverErr
    || (step === 1 ? state?.errors?.documents : undefined)
    || (step === lastStep ? (state?.errors?.email || state?.errors?.password || state?.errors?.cgu) : undefined);

  return (
    <div className="flex flex-col gap-6">

      {/* Progression */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {labels.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                i < step ? "bg-secondary-500 text-white"
                : i === step ? "bg-primary-600 text-white ring-4 ring-primary-100"
                : "bg-slate-200 text-slate-500"}`}>
                {i < step ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-xs font-semibold hidden sm:inline ${i === step ? "text-slate-900" : "text-slate-500"}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full transition-colors ${i < step ? "bg-secondary-400" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Avertissement refus précédent */}
      {prevRejection && step === 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
            className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="7" /><path d="M8 5v4M8 11h.01" />
          </svg>
          <div>
            <p className="font-semibold text-sm text-red-900">{t.prevRejectedTitle}</p>
            <p className="text-sm text-slate-700 mt-0.5">{prevRejection}</p>
            <p className="text-xs text-red-700 mt-1">{t.prevRejectedHint}</p>
          </div>
        </div>
      )}

      {/* ── Étape 1 — Confirmer l'identité ── */}
      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-lg font-bold text-slate-900 outline-none">
              {t.step1Title}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {t.step1Subtitle}
            </p>
          </div>

          <FicheRecap fiche={fiche} />

          {mode === "patient" && (
            <div className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-xs text-primary-800 leading-relaxed">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-500 shrink-0 mt-px" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="7" /><path d="M8 5v4M8 11h.01" />
              </svg>
              <span>{t.patientConvertNote}</span>
            </div>
          )}

          <button type="button" onClick={handleNext} className="btn-primary w-full py-3 mt-1">
            {t.step1Cta}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 12l4-4-4-4" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Étape 2 — Justificatifs ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-lg font-bold text-slate-900 outline-none">
              {t.step2Title}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {t.step2Subtitle}
            </p>
          </div>

          <ProofFields
            idPrefix="claim"
            cin={{
              file: cin ? { name: cin.file.name, size: cin.file.size, isPdf: cin.isPdf } : null,
              onPick: pick(setCin),
              onRemove: () => setCin(null),
            }}
            diplome={{
              file: diplome ? { name: diplome.file.name, size: diplome.file.size, isPdf: diplome.isPdf } : null,
              onPick: pick(setDiplome),
              onRemove: () => setDiplome(null),
            }}
            ordre={ordre}
            onOrdreChange={(v) => { setOrdre(v); if (clientErr) setClientErr(""); }}
            message={message}
            onMessageChange={setMessage}
            labels={PROOF_LABELS}
            cinInvalid={!!clientErr}
          />

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5" role="alert">{errorMsg}</p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => { setClientErr(""); setStep(0); }} className="btn-outline px-5 py-3 text-sm shrink-0">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4" />
              </svg>
              {t.back}
            </button>
            <button type="button" onClick={handleNext} disabled={pending} className="btn-primary flex-1 py-3 disabled:opacity-60">
              {pending ? <><Spinner /> {t.sending}</>
                : mode === "guest"
                  ? <>{t.continue}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12l4-4-4-4" /></svg></>
                  : t.submit}
            </button>
          </div>
        </div>
      )}

      {/* ── Étape 3 — Accès (invité) ── */}
      {step === 2 && mode === "guest" && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-lg font-bold text-slate-900 outline-none">
              {t.step3Title}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {t.step3Subtitle}
            </p>
          </div>

          {/* E-mail */}
          <div>
            <label htmlFor="claim-email" className="block text-sm font-medium text-slate-700 mb-1.5">{t.emailLabel}</label>
            <div className="relative">
              <input id="claim-email" type="email" autoComplete="email" inputMode="email" value={email}
                onChange={(e) => { setEmail(e.target.value); emailCheck.reset(); if (clientErr) setClientErr(""); }}
                onBlur={(e) => emailCheck.check(e.target.value)}
                aria-invalid={emailCheck.status === "taken"}
                placeholder={t.emailPlaceholder}
                className={`input-field h-11 pe-10 ${emailCheck.status === "taken" ? "border-red-400" : emailCheck.status === "available" ? "border-secondary-400" : ""}`} />
              <span className="absolute end-3 top-1/2 -translate-y-1/2" aria-hidden="true">
                {emailCheck.status === "checking" && <Spinner className="w-4 h-4 text-slate-400" />}
                {emailCheck.status === "available" && <CheckIcon className="w-4 h-4 text-secondary-500" />}
              </span>
            </div>
            {emailCheck.status === "taken" && (
              <p className="mt-1.5 text-xs text-red-600" role="alert">
                {t.emailExistsPre}
                <Link href={`/connexion?callbackUrl=${encodeURIComponent(`/praticiens/${ficheSlug}/revendiquer`)}`} className="font-semibold underline">
                  {t.login}
                </Link>{t.emailExistsPost}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="claim-pw" className="block text-sm font-medium text-slate-700 mb-1.5">{t.passwordLabel}</label>
            <div className="relative">
              <input id="claim-pw" type={showPw ? "text" : "password"} autoComplete="new-password" value={password}
                onChange={(e) => { setPassword(e.target.value); if (clientErr) setClientErr(""); }}
                placeholder={t.passwordPlaceholder}
                className="input-field h-11 pe-10" />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute end-2 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                aria-label={showPw ? t.hidePassword : t.showPassword}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 10s3.2-6 8-6 8 6 8 6-3.2 6-8 6-8-6-8-6z" /><circle cx="10" cy="10" r="2.5" />{showPw && <path d="M3 3l14 14" />}
                </svg>
              </button>
            </div>
            <PasswordStrength password={password} t={t} />
          </div>

          {/* CGU */}
          <label htmlFor="claim-cgu" className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${cgu ? "bg-secondary-50/40 border-secondary-200" : "bg-slate-50 border-slate-200"}`}>
            <input id="claim-cgu" type="checkbox" checked={cgu}
              onChange={(e) => { setCgu(e.target.checked); if (clientErr) setClientErr(""); }}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0" />
            <span className="text-xs text-slate-600 leading-relaxed">
              {t.cguPre}
              <a href="/conditions-utilisation" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">{t.cguTerms}</a>
              {t.cguMid}
              <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">{t.cguPrivacy}</a>
              {t.cguPost}
            </span>
          </label>

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5" role="alert">{errorMsg}</p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => { setClientErr(""); setStep(1); }} className="btn-outline px-5 py-3 text-sm shrink-0">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4" />
              </svg>
              {t.back}
            </button>
            <button type="button" onClick={handleNext} disabled={pending || emailCheck.status === "taken"} className="btn-primary flex-1 py-3 disabled:opacity-60">
              {pending ? <><Spinner /> {t.sending}</> : t.submit}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
