"use client";

import { useActionState, useState } from "react";
import { submitReview } from "@/features/reviews/actions";
import type { FormState } from "@/lib/definitions";

type Props = {
  doctorId: string;
  doctorSlug?: string;
  existingRating?: number;
  existingComment?: string | null;
};

function StarIcon({ filled, hovered }: { filled: boolean; hovered: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled || hovered ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      className={`w-6 h-6 transition-colors ${filled || hovered ? "text-amber-400" : "text-slate-300"}`}
      aria-hidden="true"
    >
      <path d="M10 1.5l2.47 5 5.53.8-4 3.9.94 5.5L10 14.25l-4.94 2.6.94-5.5-4-3.9 5.53-.8z" strokeLinejoin="round"/>
    </svg>
  );
}

export function ReviewForm({ doctorId, doctorSlug, existingRating, existingComment }: Props) {
  const [open, setOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(existingRating ?? 0);
  const [state, action, isPending] = useActionState<FormState, FormData>(submitReview, undefined);

  if (state?.message === "ok" && !open) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-secondary-700 font-medium">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="6.5"/>
          <path d="m5 8 2 2 4-4"/>
        </svg>
        Avis publié
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
      >
        {existingRating ? "Modifier mon avis" : "Laisser un avis"}
      </button>
    );
  }

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="doctorId" value={doctorId} />
        <input type="hidden" name="doctorSlug" value={doctorSlug ?? ""} />
        <input type="hidden" name="rating" value={selectedStar} />

        {/* Étoiles */}
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1.5">Note</p>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setSelectedStar(star)}
                className="transition-transform hover:scale-110"
                aria-label={`Note : ${star} sur 5`}
              >
                <StarIcon
                  filled={star <= selectedStar}
                  hovered={star <= hoveredStar && star > selectedStar}
                />
              </button>
            ))}
          </div>
          {state?.errors?.rating && (
            <p className="text-xs text-red-500 mt-1">{state.errors.rating[0]}</p>
          )}
        </div>

        {/* Commentaire */}
        <div>
          <label htmlFor="comment" className="text-xs font-medium text-slate-600 block mb-1.5">
            Commentaire <span className="text-slate-500 font-normal">(facultatif)</span>
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={2}
            defaultValue={existingComment ?? ""}
            placeholder="Votre expérience avec ce praticien…"
            className="input-field text-sm resize-none"
          />
        </div>

        {state?.message && state.message !== "ok" && (
          <p className="text-xs text-red-600">{state.message}</p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending || selectedStar === 0}
            className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
          >
            {isPending ? "Envoi…" : "Publier"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
