"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { useToast } from "@/components/ui/Toast";
import { useHasSession } from "@/components/layout/useHasSession";
import type { Dictionary } from "@/lib/i18n";

type ReviewT = Dictionary["review"];

export type EstabExistingReview = { rating: number; comment: string | null } | null;

type Labels = { leave: string; edit: string; leaveAria: string; editAria: string; firstPrompt: string };

type Props = {
  establishmentId: string;
  slug: string;
  /** Base de route ("/cliniques" | "/pharmacies" | "/laboratoires") pour login + revalidation. */
  basePath: string;
  establishmentName: string;
  variant?: "header" | "empty";
  labels: Labels;
  t: ReviewT;
};

/* ── Icônes du launcher (StarSvg sert aussi au trigger « étoile-first ») ── */

function StarSvg({ filled, className = "w-9 h-9 sm:w-10 sm:h-10" }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className={`${className} transition-colors duration-100`}
      aria-hidden="true">
      <path strokeLinejoin="round"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

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

/* Formulaire lourd chargé au 1ᵉʳ clic (ssr:false) — hors bundle initial des
   fiches établissement. Le launcher (trigger + a11y escape/scroll) reste synchrone. */
const EstablishmentReviewForm = dynamic(
  () => import("./EstablishmentReviewForm").then((m) => m.EstablishmentReviewForm),
  {
    ssr: false,
    loading: () => (
      <div className="px-6 py-14 flex justify-center" aria-busy="true">
        <svg className="animate-spin w-6 h-6 text-secondary-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },
);

/* ── Composant principal (launcher) ─────────────────────────── */

export function EstablishmentReviewDialog({
  establishmentId, slug, basePath, establishmentName,
  variant = "header", labels, t,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialRating, setInitialRating] = useState(0);
  /* Clé de remontage du formulaire (réinitialise useActionState + inputs). En
     STATE (pas ref) : une clé lue en render doit être un state (react-hooks/refs). */
  const [openKey, setOpenKey] = useState(0);
  // Session + avis existant : SORTIS du rendu serveur (la page détail est statique).
  // Lus côté client après hydratation. `isLoggedIn` via le cookie-indice `sm_auth`
  // (useHasSession) ; l'avis existant via l'API, uniquement si connecté.
  const isLoggedIn = useHasSession();
  const [fetchedReview, setFetchedReview] = useState<EstabExistingReview>(null);
  // Déconnecté → aucun avis existant, quelle que soit la dernière donnée chargée
  // (valeur dérivée au rendu, plutôt qu'un setState synchrone dans l'effet).
  const existingReview = isLoggedIn ? fetchedReview : null;
  const isEdit = !!existingReview;
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) return;
    let alive = true;
    fetch(`/api/etablissements/${establishmentId}/my-review`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setFetchedReview(d.existingReview ?? null); })
      .catch(() => {});
    return () => { alive = false; };
  }, [isLoggedIn, establishmentId]);

  const loginUrl = `/connexion?callbackUrl=${encodeURIComponent(`${basePath}/${slug}#avis`)}`;

  const open = (preset = 0) => {
    setInitialRating(preset);
    setOpenKey((k) => k + 1);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  const handleSuccess = (wasEdit: boolean) => {
    toast(wasEdit ? t.successEdit : t.successNew, "success");
    // Rafraîchit le Server Component → le nouvel avis + la note moyenne à jour
    // apparaissent immédiatement (revalidatePath a marqué le cache périmé).
    router.refresh();
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen]);

  /* ── Déclencheurs ── */
  const btnShadow = { boxShadow: "0 1px 2px 0 rgb(5 150 105 / 0.3)" };

  let trigger: React.ReactNode;

  if (variant === "empty") {
    // Entrée « étoile-first » : cliquer une étoile ouvre la modale pré-remplie.
    trigger = (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-semibold text-slate-700">{labels.firstPrompt}</p>
        <div className="flex items-center gap-1" role="group" aria-label={t.rateAria}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star}/5 — ${t.starLabels[star]}`}
              onClick={() => (isLoggedIn ? open(star) : router.push(loginUrl))}
              className="p-1 rounded-lg text-slate-300 hover:text-amber-400 transition-all duration-100 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            >
              <StarSvg filled={false} className="w-8 h-8" />
            </button>
          ))}
        </div>
      </div>
    );
  } else {
    const btnBase = "inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 active:bg-secondary-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shrink-0";
    trigger = isLoggedIn ? (
      <button type="button" onClick={() => open(0)}
        aria-label={isEdit ? labels.editAria : labels.leaveAria}
        className={btnBase} style={btnShadow}>
        {isEdit ? <EditIcon /> : <WriteIcon />}
        {isEdit ? labels.edit : labels.leave}
      </button>
    ) : (
      <Link href={loginUrl} className={btnBase} style={btnShadow}>
        <WriteIcon />
        {labels.leave}
      </Link>
    );
  }

  return (
    <>
      {trigger}

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={close} aria-hidden="true" />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
            role="dialog" aria-modal="true" aria-labelledby="estab-review-dialog-title">
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl overflow-hidden rounded-t-3xl">
              <div className="h-1.5" style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />
              <div className="px-5 sm:px-6 pt-5 pb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 id="estab-review-dialog-title" className="text-base font-bold text-slate-900">
                    {isEdit ? t.titleEdit : t.titleNew}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5 truncate">{establishmentName}</p>
                </div>
                <button type="button" onClick={close} aria-label={t.closeAria}
                  className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors -mt-1 -me-1">
                  <XIcon />
                </button>
              </div>

              <EstablishmentReviewForm
                key={openKey}
                establishmentId={establishmentId}
                slug={slug}
                basePath={basePath}
                initialRating={initialRating}
                existingReview={existingReview}
                onClose={close}
                onSuccess={handleSuccess}
                t={t}
              />

              <div className="h-2 sm:hidden" aria-hidden="true" />
            </div>
          </div>
        </>
      )}
    </>
  );
}
