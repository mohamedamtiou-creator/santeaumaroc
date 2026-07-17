"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitMedicationReview } from "@/features/reviews/actions";
import type { Dictionary } from "@/lib/i18n";
import type { MedExistingReview } from "./MedicationReviewDialog";

/**
 * Formulaire d'avis médicament — extrait de MedicationReviewDialog et chargé en
 * `dynamic(ssr:false)` au 1ᵉʳ clic. Défère le JS du formulaire (useActionState,
 * submitMedicationReview, étoiles) hors du bundle initial des fiches médicament.
 * L'a11y de la modale (escape/scroll) reste au launcher.
 */

type ReviewT = Dictionary["review"];

const STAR_COLOR: Record<number, string> = {
  1: "text-rose-500",
  2: "text-orange-400",
  3: "text-amber-400",
  4: "text-amber-400",
  5: "text-amber-400",
};

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

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-5 h-5 text-secondary-600 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="m6.5 10 2.5 2.5 4.5-5" />
    </svg>
  );
}

function AlertIcon({ cls = "w-4 h-4" }: { cls?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={`${cls} shrink-0 text-rose-500`} aria-hidden="true" strokeLinecap="round">
      <circle cx="8" cy="8" r="7" />
      <path d="M8 5v3M8 11v.5" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ── Sélecteur d'étoiles (radiogroup accessible) ────────────── */

function StarPicker({ value, onChange, t }: { value: number; onChange: (v: number) => void; t: ReviewT }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-0.5" role="radiogroup" aria-label={t.rateAria}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star}/5 — ${t.starLabels[star]}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={[
              "rounded-lg p-1 transition-transform duration-100 hover:scale-110 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
              display >= star ? (STAR_COLOR[display] ?? "text-amber-400") : "text-slate-200",
            ].join(" ")}
          >
            <StarSvg filled={display >= star} />
          </button>
        ))}
      </div>
      <p className={[
        "text-sm font-semibold h-5 transition-colors duration-100",
        display > 0 ? (STAR_COLOR[display] ?? "text-amber-500") : "text-slate-500",
      ].join(" ")}>
        {display > 0 ? t.starLabels[display] : t.selectRating}
      </p>
    </div>
  );
}

/* ── Formulaire (isolé → remonté à chaque ouverture) ────────── */

export function MedicationReviewForm({
  medicationId, slug, initialRating, existingReview, onClose, onSuccess, t,
}: {
  medicationId: string;
  slug: string;
  initialRating: number;
  existingReview: MedExistingReview;
  onClose: () => void;
  onSuccess: (isEdit: boolean) => void;
  t: ReviewT;
}) {
  const [rating, setRating]   = useState(existingReview?.rating ?? initialRating);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [state, formAction, isPending] = useActionState(submitMedicationReview, undefined);
  const isEdit = !!existingReview;
  const firedRef = useRef(false);

  useEffect(() => {
    if (state?.message !== "ok") return;
    if (!firedRef.current) {
      firedRef.current = true;
      onSuccess(isEdit);
    }
    const id = setTimeout(() => onClose(), 2200);
    return () => clearTimeout(id);
  }, [state?.message, onClose, onSuccess, isEdit]);

  const success = state?.message === "ok";
  const globalError = state?.message && state.message !== "ok" ? state.message : null;

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="medicationId" value={medicationId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      <div className="px-5 sm:px-6 py-6 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-center mb-4">
          {t.globalRating}
        </p>
        <StarPicker value={rating} onChange={setRating} t={t} />
        {state?.errors?.rating && (
          <p className="text-xs text-rose-500 text-center mt-2" role="alert">{state.errors.rating[0]}</p>
        )}
      </div>

      <div className="px-5 sm:px-6 pb-5">
        <label htmlFor="med-review-comment" className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          {t.comment}{" "}
          <span className="font-normal text-slate-500 normal-case tracking-normal">{t.optional}</span>
        </label>
        <textarea
          id="med-review-comment"
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={600}
          rows={4}
          placeholder={t.commentPlaceholder}
          className={[
            "w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-800",
            "placeholder:text-slate-500 resize-none transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white",
            state?.errors?.comment ? "border-rose-300" : "border-slate-200",
          ].join(" ")}
        />
        <div className="flex items-start justify-between mt-1.5 gap-2">
          <p className="text-xs text-slate-500 leading-relaxed">{t.minChars}</p>
          <span className={[
            "text-xs tabular-nums shrink-0 font-medium",
            comment.length > 540 ? "text-amber-500" : "text-slate-500",
          ].join(" ")}>
            {comment.length}/600
          </span>
        </div>
        {state?.errors?.comment && (
          <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1.5" role="alert">
            <AlertIcon />
            {state.errors.comment[0]}
          </p>
        )}
      </div>

      {globalError && (
        <div role="alert" className="mx-5 sm:mx-6 mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-700 flex items-center gap-2.5">
          <AlertIcon cls="w-4 h-4" />
          {globalError}
        </div>
      )}

      {success && (
        <div className="mx-5 sm:mx-6 mb-4 px-4 py-3 rounded-xl bg-secondary-50 border border-secondary-100 text-sm text-secondary-700 flex items-center gap-2.5" role="status">
          <CheckCircleIcon />
          {isEdit ? t.successEdit : t.successNew}
        </div>
      )}

      <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col-reverse sm:flex-row items-center gap-3 sm:justify-between">
        <p className="text-xs text-slate-500 leading-relaxed text-center sm:text-start">{t.guidelines}</p>
        <button
          type="submit"
          disabled={isPending || rating === 0 || success}
          aria-disabled={isPending || rating === 0 || success}
          className={[
            "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5",
            "font-semibold text-sm transition-all duration-150 shrink-0",
            isPending || rating === 0 || success
              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
              : "bg-secondary-600 hover:bg-secondary-700 text-white",
          ].join(" ")}
        >
          {isPending ? (<><SpinnerIcon />{t.sending}</>)
            : success ? (<><CheckCircleIcon />{t.published}</>)
            : isEdit ? t.submitEdit : t.submitNew}
        </button>
      </div>
    </form>
  );
}
