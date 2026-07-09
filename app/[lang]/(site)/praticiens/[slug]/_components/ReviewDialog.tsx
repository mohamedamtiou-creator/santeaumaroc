"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { useToast } from "@/components/ui/Toast";
import type { Dictionary } from "@/lib/i18n";

type ReviewT = Dictionary["review"];

/* ── Types ─────────────────────────────────────────────────── */

export type UserStatus = "yes" | "not-logged-in" | "not-patient";

export type ExistingReview = {
  rating: number;
  comment: string | null;
} | null;

type Props = {
  doctorId: string;
  doctorSlug: string;
  doctorName: string;
  existingReview: ExistingReview;
  userStatus: UserStatus;
  variant?: "header" | "empty";
  /** Libellés traduits du bouton déclencheur. */
  labels?: {
    leave: string;
    edit: string;
    leaveAria: string;
    editAria: string;
    onlyPatients: string;
  };
  /** Traductions de la modale d'avis. */
  t: ReviewT;
};

/* ── Icônes du déclencheur / fermeture (légères, restent dans le launcher) ── */

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-5 h-5" aria-hidden="true" strokeLinecap="round">
      <path d="M6 6l8 8M14 6l-8 8" />
    </svg>
  );
}

function WriteIcon({ cls = "w-4 h-4" }: { cls?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={`${cls} shrink-0`} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 3.5a2.121 2.121 0 0 1 3 3L6 17l-4 1 1-4L13.5 3.5z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-7" />
      <path d="M16.5 2.5a2.121 2.121 0 013 3L9 16l-4 1 1-4L16.5 2.5z" />
    </svg>
  );
}

/* Formulaire lourd chargé UNIQUEMENT au 1ᵉʳ clic (ssr:false) — hors bundle
   initial de la fiche praticien. Le launcher (trigger + a11y) reste synchrone. */
const ReviewForm = dynamic(() => import("./ReviewForm").then((m) => m.ReviewForm), {
  ssr: false,
  loading: () => (
    <div className="px-6 py-14 flex justify-center" aria-busy="true">
      <svg className="animate-spin w-6 h-6 text-secondary-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  ),
});

/* ── Composant principal (launcher) ─────────────────────────── */

export function ReviewDialog({
  doctorId,
  doctorSlug,
  doctorName,
  existingReview,
  userStatus,
  variant = "header",
  labels = {
    leave: "Laisser un avis",
    edit: "Modifier mon avis",
    leaveAria: "Laisser un avis sur ce praticien",
    editAria: "Modifier mon avis sur ce praticien",
    onlyPatients: "Seuls les patients peuvent laisser un avis",
  },
  t,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  /* Clé incrémentée à chaque ouverture pour forcer le remontage de ReviewForm
     (réinitialise useActionState et les inputs contrôlés). En STATE (pas ref) :
     une clé lue pendant le rendu doit être un state (règle react-hooks/refs). */
  const [openKey, setOpenKey] = useState(0);
  const isEdit  = !!existingReview;
  const { toast } = useToast();

  const open = () => {
    setOpenKey((k) => k + 1);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  const handleSuccess = (wasEdit: boolean) => {
    toast(wasEdit ? t.successEdit : t.successNew, "success");
  };

  /* Verrou de scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* Touche Échap */
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen]);

  /* ── Styles du bouton déclencheur ── */
  const btnBase = variant === "header"
    ? "inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 active:bg-secondary-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shrink-0"
    : "mt-5 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 active:bg-secondary-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-150";
  const btnShadow = { boxShadow: "0 1px 2px 0 rgb(5 150 105 / 0.3)" };

  /* ── Bouton déclencheur selon l'état de connexion ── */
  const trigger =
    userStatus === "not-logged-in" ? (
      <Link
        href={`/connexion?callbackUrl=/praticiens/${doctorSlug}%23avis`}
        className={btnBase}
        style={btnShadow}
      >
        <WriteIcon />
        {isEdit ? labels.edit : labels.leave}
      </Link>
    ) : userStatus === "not-patient" ? (
      <button
        type="button"
        disabled
        aria-disabled="true"
        title={labels.onlyPatients}
        className={`${btnBase} opacity-50 cursor-not-allowed`}
        style={btnShadow}
      >
        <WriteIcon />
        {labels.leave}
      </button>
    ) : (
      <button
        type="button"
        onClick={open}
        aria-label={isEdit ? labels.editAria : labels.leaveAria}
        className={btnBase}
        style={btnShadow}
      >
        {isEdit ? <EditIcon /> : <WriteIcon />}
        {isEdit ? labels.edit : labels.leave}
      </button>
    );

  return (
    <>
      {trigger}

      {isOpen && (
        <>
          {/* Fond semi-transparent */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={close}
            aria-hidden="true"
          />

          {/* Fenêtre de dialogue */}
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
          >
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl overflow-hidden rounded-t-3xl">

              {/* Bande dégradée */}
              <div className="h-1.5"
                style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />

              {/* En-tête */}
              <div className="px-5 sm:px-6 pt-5 pb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 id="review-dialog-title" className="text-base font-bold text-slate-900">
                    {isEdit ? t.titleEdit : t.titleNew}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5 truncate">{doctorName}</p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t.closeAria}
                  className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors -mt-1 -me-1"
                >
                  <XIcon />
                </button>
              </div>

              {/*
               * ReviewForm est monté avec une key unique à chaque ouverture.
               * Cela force un remontage complet : useActionState repart de undefined,
               * les champs contrôlés sont réinitialisés — aucun état résiduel.
               */}
              <ReviewForm
                key={openKey}
                doctorId={doctorId}
                doctorSlug={doctorSlug}
                existingReview={existingReview}
                onClose={close}
                onSuccess={handleSuccess}
                t={t}
              />

              {/* Espace safe-area iOS */}
              <div className="h-2 sm:hidden" aria-hidden="true" />
            </div>
          </div>
        </>
      )}
    </>
  );
}
