"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import Image from "next/image";
import { submitClaimFlow, type ClaimFlowState } from "@/features/claims/actions";
import { useEmailAvailability } from "@/components/auth/useEmailAvailability";
import { ProofFields, type ProofLabels } from "@/components/documents/ProofFields";

/* ───────────────────────────────────────────────────────────── */

type Mode = "guest" | "doctor" | "patient";

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

/* ── Justificatifs : libellés FR du bloc partagé ───────────── */

const PROOF_LABELS: ProofLabels = {
  cinTitle:        "Carte d'identité nationale",
  required:        "obligatoire",
  justifTitle:     "Justificatif médical",
  eitherOr:        "l'un OU l'autre",
  optionA:         "Option A — Diplôme de médecine",
  optionAOptional: "(facultatif si n° Ordre renseigné)",
  orSep:           "OU",
  optionB:         "Option B — N° d'inscription à l'Ordre National des Médecins",
  ordrePlaceholder: "Ex : 12345",
  ordreHint:       "Votre numéro est vérifié par notre équipe auprès de l'Ordre National des Médecins (CNOM).",
  messageLabel:    "Message (facultatif)",
  messagePlaceholder: "Précisez votre situation si nécessaire (cabinet, établissement…)",
  reassurance:     "Vos pièces sont confidentielles, réservées à l'équipe de vérification et supprimées une fois votre fiche validée.",
  upload: { drag: "Glissez ou", browse: "cliquez pour choisir", hint: "JPG, PNG ou PDF · max 5 Mo", removeAria: "Retirer le fichier", uploading: "Envoi…", ko: "Ko" },
};

/* ── Force du mot de passe ─────────────────────────────────── */

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "8 caractères", ok: password.length >= 8 },
    { label: "1 lettre",     ok: /[a-zA-Z]/.test(password) },
    { label: "1 chiffre",    ok: /[0-9]/.test(password) },
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

const STEP_LABELS: Record<Mode, string[]> = {
  guest:   ["Identité", "Justificatifs", "Accès"],
  doctor:  ["Identité", "Justificatifs"],
  patient: ["Identité", "Justificatifs"],
};

export function ClaimWizard({ ficheId, ficheSlug, fiche, mode, prevRejection }: Props) {
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
      if (file.size > MAX_SIZE) { setUploadErr(`« ${file.name} » dépasse 5 Mo.`); return; }
      setUploadErr("");
      setClientErr("");
      setter({ file, isPdf: file.type === "application/pdf" });
    };
  }

  function validateProof(): boolean {
    if (!cin) { setClientErr("La copie de la CIN est obligatoire."); return false; }
    if (!diplome && !ordre.trim()) {
      setClientErr("Fournissez votre diplôme OU votre numéro d'inscription à l'Ordre.");
      return false;
    }
    setClientErr("");
    return true;
  }

  function validateAccess(): boolean {
    if (!EMAIL_RE.test(email.trim())) { setClientErr("Saisissez une adresse e-mail valide."); return false; }
    if (emailCheck.status === "taken") { setClientErr("Un compte existe déjà avec cet e-mail."); return false; }
    if (password.length < 8 || !/[0-9]/.test(password)) { setClientErr("Mot de passe : 8 caractères minimum, dont un chiffre."); return false; }
    if (!cgu) { setClientErr("Vous devez accepter les conditions d'utilisation."); return false; }
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
    const timeline = [
      { title: "Dossier reçu", desc: "Vos pièces nous sont parvenues.", done: true },
      { title: "Vérification par notre équipe", desc: "Sous 24 à 48 h ouvrées.", done: false },
      { title: "La fiche est à vous", desc: "Vous gérez votre profil et vos rendez-vous.", done: false },
    ];
    return (
      <div className="flex flex-col items-center text-center gap-5 py-6">
        <div className="w-16 h-16 rounded-2xl bg-secondary-50 flex items-center justify-center">
          <CheckIcon className="w-8 h-8 text-secondary-500" />
        </div>
        <div>
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-slate-900 outline-none">
            Demande envoyée !
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 max-w-sm leading-relaxed">
            Notre équipe examine votre dossier et vous recevrez un e-mail dès qu&apos;il est traité.
          </p>
        </div>

        {/* Chronologie « et après ? » */}
        <ol className="w-full max-w-sm text-start flex flex-col gap-0 mt-1">
          {timeline.map((t, i) => (
            <li key={t.title} className="flex gap-3 pb-4 last:pb-0 relative">
              {i < timeline.length - 1 && (
                <span className="absolute start-[13px] top-7 bottom-0 w-px bg-slate-200" aria-hidden="true" />
              )}
              <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                t.done ? "bg-secondary-500 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                {t.done ? <CheckIcon className="w-3.5 h-3.5" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {mode === "guest" && (
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 max-w-sm leading-relaxed">
            Un e-mail de confirmation a été envoyé à <strong className="text-slate-700">{email.trim()}</strong>.
            Cliquez le lien pour sécuriser votre compte — ce n&apos;est pas nécessaire pour le traitement de votre dossier.
          </p>
        )}

        <Link href="/praticien/tableau-de-bord" className="btn-primary px-6 py-2.5">
          Accéder à mon espace
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
            <p className="font-semibold text-sm text-red-900">Demande précédente refusée</p>
            <p className="text-sm text-slate-700 mt-0.5">{prevRejection}</p>
            <p className="text-xs text-red-700 mt-1">Vous pouvez soumettre un nouveau dossier ci-dessous.</p>
          </div>
        </div>
      )}

      {/* ── Étape 1 — Confirmer l'identité ── */}
      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-lg font-bold text-slate-900 outline-none">
              C&apos;est bien vous&nbsp;?
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Confirmez la fiche à récupérer. Vos informations y figurent déjà — rien à ressaisir.
            </p>
          </div>

          <FicheRecap fiche={fiche} />

          {mode === "patient" && (
            <div className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-xs text-primary-800 leading-relaxed">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-500 shrink-0 mt-px" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="7" /><path d="M8 5v4M8 11h.01" />
              </svg>
              <span>Votre compte sera converti en compte praticien à l&apos;envoi de la demande.</span>
            </div>
          )}

          <button type="button" onClick={handleNext} className="btn-primary w-full py-3 mt-1">
            Oui, c&apos;est moi — continuer
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
              Prouvez que vous êtes ce médecin
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Deux pièces suffisent. Elles ne servent qu&apos;à la vérification.
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
              Retour
            </button>
            <button type="button" onClick={handleNext} disabled={pending} className="btn-primary flex-1 py-3 disabled:opacity-60">
              {pending ? <><Spinner /> Envoi…</>
                : mode === "guest"
                  ? <>Continuer<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12l4-4-4-4" /></svg></>
                  : "Envoyer ma demande"}
            </button>
          </div>
        </div>
      )}

      {/* ── Étape 3 — Accès (invité) ── */}
      {step === 2 && mode === "guest" && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-lg font-bold text-slate-900 outline-none">
              Créez votre accès
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Dernière étape : de quoi vous reconnecter et suivre votre demande.
            </p>
          </div>

          {/* E-mail */}
          <div>
            <label htmlFor="claim-email" className="block text-sm font-medium text-slate-700 mb-1.5">Adresse e-mail</label>
            <div className="relative">
              <input id="claim-email" type="email" autoComplete="email" inputMode="email" value={email}
                onChange={(e) => { setEmail(e.target.value); emailCheck.reset(); if (clientErr) setClientErr(""); }}
                onBlur={(e) => emailCheck.check(e.target.value)}
                aria-invalid={emailCheck.status === "taken"}
                placeholder="vous@exemple.com"
                className={`input-field h-11 pe-10 ${emailCheck.status === "taken" ? "border-red-400" : emailCheck.status === "available" ? "border-secondary-400" : ""}`} />
              <span className="absolute end-3 top-1/2 -translate-y-1/2" aria-hidden="true">
                {emailCheck.status === "checking" && <Spinner className="w-4 h-4 text-slate-400" />}
                {emailCheck.status === "available" && <CheckIcon className="w-4 h-4 text-secondary-500" />}
              </span>
            </div>
            {emailCheck.status === "taken" && (
              <p className="mt-1.5 text-xs text-red-600" role="alert">
                Un compte existe déjà.{" "}
                <Link href={`/connexion?callbackUrl=${encodeURIComponent(`/praticiens/${ficheSlug}/revendiquer`)}`} className="font-semibold underline">
                  Connectez-vous
                </Link>{" "}pour revendiquer.
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="claim-pw" className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input id="claim-pw" type={showPw ? "text" : "password"} autoComplete="new-password" value={password}
                onChange={(e) => { setPassword(e.target.value); if (clientErr) setClientErr(""); }}
                placeholder="8 caractères minimum"
                className="input-field h-11 pe-10" />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute end-2 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                aria-label={showPw ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 10s3.2-6 8-6 8 6 8 6-3.2 6-8 6-8-6-8-6z" /><circle cx="10" cy="10" r="2.5" />{showPw && <path d="M3 3l14 14" />}
                </svg>
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* CGU */}
          <label htmlFor="claim-cgu" className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${cgu ? "bg-secondary-50/40 border-secondary-200" : "bg-slate-50 border-slate-200"}`}>
            <input id="claim-cgu" type="checkbox" checked={cgu}
              onChange={(e) => { setCgu(e.target.checked); if (clientErr) setClientErr(""); }}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0" />
            <span className="text-xs text-slate-600 leading-relaxed">
              J&apos;accepte les{" "}
              <a href="/conditions-utilisation" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">conditions d&apos;utilisation</a>{" "}et la{" "}
              <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">politique de confidentialité</a>.
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
              Retour
            </button>
            <button type="button" onClick={handleNext} disabled={pending || emailCheck.status === "taken"} className="btn-primary flex-1 py-3 disabled:opacity-60">
              {pending ? <><Spinner /> Envoi…</> : "Envoyer ma demande"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
